// MCP tool definitions. Each tool is a zod input shape + a handler that works on
// the project folder in `ctx`; handlers are plain async functions (no MCP SDK
// here) so tests can call them directly via runTool().

import { randomUUID } from 'node:crypto'
import { copyFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type { Block, Course, Lesson, ThemeId } from '../../src/types/course'
import { DEFAULT_COURSE_SETTINGS } from '../../src/types/course'
import { DEFAULT_THEME, THEMES } from '../../src/theme/themes'
import { uid } from '../../src/lib/id'
import { checkCourse } from '../../src/export/courseCheck'
import { AGENT_GUIDE_FILE, buildAgentGuide } from '../../src/lib/agentGuide'
import common from '../../src/i18n/locales/common'
import { BLOCK_TYPES, makeBlock, parseBlockData, settingsSchema } from './blocks'
import { defaultPackageName, exportPackage } from './exportPackage'
import {
  type Context,
  PROJECT_FILE,
  ToolError,
  ensureDir,
  isProjectDir,
  readCourse,
  requireProject,
  serialized,
  updateCourse,
  writeCourse,
  writeFileAtomic,
} from './project'

export interface ToolDef {
  name: string
  description: string
  input: z.ZodRawShape
  // Args are validated against `input` before the handler runs.
  handler: (ctx: Context, args: any) => Promise<unknown>
}

// Typed helper: infers handler args from the input shape.
function tool<S extends z.ZodRawShape>(def: {
  name: string
  description: string
  input: S
  handler: (ctx: Context, args: z.infer<z.ZodObject<S>>) => Promise<unknown>
}): ToolDef {
  return def
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]]
const lessonId = z.string().describe('Lesson id (see list_lessons)')
const blockId = z.string().describe('Block id (see get_lesson)')
const index = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('0-based position; omit to append at the end')

function findLesson(course: Course, id: string): Lesson {
  const lesson = course.lessons.find((l) => l.id === id)
  if (!lesson) throw new ToolError(`No lesson with id "${id}".`)
  return lesson
}

function findBlock(course: Course, id: string): { lesson: Lesson; index: number; block: Block } {
  for (const lesson of course.lessons) {
    const i = lesson.blocks.findIndex((b) => b.id === id)
    if (i !== -1) return { lesson, index: i, block: lesson.blocks[i] }
  }
  throw new ToolError(`No block with id "${id}".`)
}

function insertAt<T>(list: T[], item: T, at?: number): number {
  const i = at == null ? list.length : Math.min(at, list.length)
  list.splice(i, 0, item)
  return i
}

const stripTags = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const clip = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

// A one-line hint of what a block contains, for outlines.
function blockPreview(block: Block): string {
  const d = block.data as unknown as Record<string, unknown>
  switch (block.type) {
    case 'quiz':
      return `${block.data.questions.length} question(s)`
    case 'tabs':
      return block.data.tabs.map((t) => t.title).join(' | ')
    case 'accordion':
      return block.data.items.map((t) => t.title).join(' | ')
    case 'flashcards':
      return `${block.data.cards.length} card(s)`
    case 'gallery':
      return `${block.data.images.length} image(s)`
    case 'list':
      return block.data.items.join('; ')
    case 'scenario':
      return `${block.data.characterName} — ${block.data.nodes.length} node(s)`
    default: {
      const key = ['text', 'html', 'label', 'title', 'url', 'src', 'code'].find(
        (k) => typeof d[k] === 'string' && d[k],
      )
      return key ? stripTags(String(d[key])) : ''
    }
  }
}

function lessonOutline(lesson: Lesson, i: number) {
  return { index: i, id: lesson.id, title: lesson.title, status: lesson.status, blocks: lesson.blocks.length }
}

function courseSummary(course: Course) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    theme: course.theme,
    settings: course.settings,
    lessons: course.lessons.map((l, i) => ({
      ...lessonOutline(l, i),
      blocks: l.blocks.map((b) => ({ id: b.id, type: b.type, preview: clip(blockPreview(b)) })),
    })),
  }
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (vars && k in vars ? String(vars[k]) : m))
}

/** The same checks the builder runs before exporting, in plain English. */
export function courseIssues(course: Course) {
  return checkCourse(course).map((issue) => {
    const text = interpolate(common.en[issue.key] ?? issue.key, issue.vars)
    const block = issue.blockId
      ? course.lessons.find((l) => l.id === issue.lessonId)?.blocks.find((b) => b.id === issue.blockId)
      : undefined
    const where = [
      issue.lessonId ? `lesson "${issue.lessonTitle}" (${issue.lessonId})` : '',
      block ? `${block.type} block ${block.id}` : '',
    ]
      .filter(Boolean)
      .join(', ')
    return {
      message: where ? `${where}: ${text}` : text,
      lessonId: issue.lessonId,
      blockId: issue.blockId,
    }
  })
}

function newCourse(title: string): Course {
  return {
    id: uid('course'),
    title,
    description: '',
    theme: DEFAULT_THEME,
    settings: { ...DEFAULT_COURSE_SETTINGS },
    lessons: [{ id: uid('lesson'), title: 'Lesson 1', status: 'draft', blocks: [] }],
  }
}

// Media formats the app accepts (mirrors the MIME maps in src/lib/assets.ts).
const ASSET_EXT: Record<'image' | 'video' | 'audio', Record<string, string>> = {
  image: { png: 'png', jpg: 'jpg', jpeg: 'jpg', webp: 'webp', gif: 'gif', svg: 'svg' },
  video: { mp4: 'mp4', webm: 'webm' },
  audio: { mp3: 'mp3', ogg: 'ogg', wav: 'wav', m4a: 'm4a' },
}
const ASSET_DIR = { image: 'images', video: 'videos', audio: 'audio' } as const

// ── Tools ────────────────────────────────────────────────────────────────────

export const TOOLS: ToolDef[] = [
  tool({
    name: 'open_project',
    description: 'Switch to an existing Scormly project folder (one that contains project.json).',
    input: { path: z.string().describe('Absolute path to the project folder') },
    handler: async (ctx, { path: dir }) => {
      const abs = path.resolve(dir)
      if (!isProjectDir(abs)) throw new ToolError(`No ${PROJECT_FILE} in ${abs}.`)
      ctx.projectDir = abs
      return courseSummary(await readCourse(abs))
    },
  }),
  tool({
    name: 'create_project',
    description:
      'Create a new Scormly project folder (project.json with one empty lesson + AGENTS.md) and switch to it. The folder may exist but must not already contain a project.',
    input: {
      path: z.string().describe('Absolute path of the folder to create/use'),
      title: z.string().optional().describe('Course title (default: the folder name)'),
    },
    handler: async (ctx, args) => {
      const abs = path.resolve(args.path)
      if (isProjectDir(abs)) throw new ToolError(`${abs} already contains a project; use open_project.`)
      await ensureDir(abs)
      const course = newCourse(args.title ?? path.basename(abs))
      await writeCourse(abs, course)
      await writeFileAtomic(path.join(abs, AGENT_GUIDE_FILE), buildAgentGuide(course))
      ctx.projectDir = abs
      return { projectDir: abs, course: courseSummary(course) }
    },
  }),
  tool({
    name: 'get_course',
    description:
      'Read the course. By default returns the full project.json; with summary=true returns an outline (lessons + block ids/types/previews).',
    input: { summary: z.boolean().optional().describe('Return an outline instead of the full JSON') },
    handler: async (ctx, { summary }) => {
      const course = await readCourse(requireProject(ctx))
      return summary ? courseSummary(course) : course
    },
  }),
  tool({
    name: 'list_lessons',
    description: 'List lessons in order with their ids, titles, status and block counts.',
    input: {},
    handler: async (ctx) => (await readCourse(requireProject(ctx))).lessons.map(lessonOutline),
  }),
  tool({
    name: 'get_lesson',
    description: 'Get one lesson with all its blocks (full data).',
    input: { lessonId },
    handler: async (ctx, args) => findLesson(await readCourse(requireProject(ctx)), args.lessonId),
  }),
  tool({
    name: 'add_lesson',
    description: 'Add a lesson (empty unless you add blocks afterwards). Returns its id.',
    input: {
      title: z.string(),
      index,
      status: z.enum(['draft', 'published']).optional(),
    },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const lesson: Lesson = { id: uid('lesson'), title: args.title, status: args.status ?? 'draft', blocks: [] }
        const at = insertAt(course.lessons, lesson, args.index)
        return { lessonId: lesson.id, index: at }
      }),
  }),
  tool({
    name: 'update_lesson',
    description: "Rename a lesson and/or change its status ('draft' | 'published').",
    input: {
      lessonId,
      title: z.string().optional(),
      status: z.enum(['draft', 'published']).optional(),
    },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const lesson = findLesson(course, args.lessonId)
        if (args.title !== undefined) lesson.title = args.title
        if (args.status !== undefined) lesson.status = args.status
        return lessonOutline(lesson, course.lessons.indexOf(lesson))
      }),
  }),
  tool({
    name: 'delete_lesson',
    description: 'Delete a lesson and all its blocks.',
    input: { lessonId },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const lesson = findLesson(course, args.lessonId)
        course.lessons = course.lessons.filter((l) => l !== lesson)
        return { deleted: lesson.id, lessons: course.lessons.length }
      }),
  }),
  tool({
    name: 'move_lesson',
    description: 'Move a lesson to a new 0-based position.',
    input: { lessonId, toIndex: z.number().int().min(0) },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const lesson = findLesson(course, args.lessonId)
        course.lessons.splice(course.lessons.indexOf(lesson), 1)
        const at = insertAt(course.lessons, lesson, args.toIndex)
        return { lessonId: lesson.id, index: at }
      }),
  }),
  tool({
    name: 'add_block',
    description:
      'Add a block to a lesson. `data` follows the block type\'s shape (see the scormly://agent-guide resource); missing fields get defaults and missing nested ids (quiz questions/options, tabs, scenario nodes…) are generated. Returns the created block.',
    input: {
      lessonId,
      type: z.enum(BLOCK_TYPES),
      data: z.record(z.string(), z.unknown()).optional().describe('Block data for this type'),
      settings: settingsSchema.optional(),
      index,
    },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const lesson = findLesson(course, args.lessonId)
        const block = makeBlock(args.type, args.data, args.settings)
        const at = insertAt(lesson.blocks, block, args.index)
        return { index: at, block }
      }),
  }),
  tool({
    name: 'update_block',
    description:
      'Update a block. `data` is shallow-merged into the existing data (arrays such as quiz questions are replaced as a whole) and re-validated; `settings` is merged too. Returns the updated block.',
    input: {
      blockId,
      data: z.record(z.string(), z.unknown()).optional(),
      settings: settingsSchema.optional(),
    },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const { block } = findBlock(course, args.blockId)
        if (args.data) block.data = parseBlockData(block.type, { ...block.data, ...args.data })
        if (args.settings) block.settings = { ...block.settings, ...args.settings }
        return block
      }),
  }),
  tool({
    name: 'delete_block',
    description: 'Delete a block.',
    input: { blockId },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const { lesson, index: i } = findBlock(course, args.blockId)
        lesson.blocks.splice(i, 1)
        return { deleted: args.blockId, lessonId: lesson.id }
      }),
  }),
  tool({
    name: 'move_block',
    description: 'Move a block to a new 0-based position, optionally into another lesson.',
    input: {
      blockId,
      toIndex: z.number().int().min(0),
      toLessonId: z.string().optional().describe('Target lesson (default: the same lesson)'),
    },
    handler: (ctx, args) =>
      updateCourse(ctx, (course) => {
        const { lesson, index: i, block } = findBlock(course, args.blockId)
        const target = args.toLessonId ? findLesson(course, args.toLessonId) : lesson
        lesson.blocks.splice(i, 1)
        const at = insertAt(target.blocks, block, args.toIndex)
        return { blockId: block.id, lessonId: target.id, index: at }
      }),
  }),
  tool({
    name: 'update_course',
    description: 'Update course metadata, theme and/or completion/scoring/player settings (merged).',
    input: {
      title: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().optional().describe('assets/images/... path'),
      theme: z.enum(THEME_IDS).optional(),
      settings: z
        .strictObject({
          completion: z.enum(['view', 'quiz']).optional(),
          scored: z.boolean().optional(),
          passingScore: z.number().min(0).max(100).optional(),
          navigation: z.enum(['free', 'linear']).optional(),
          playerLanguage: z.enum(['auto', 'en', 'uk']).optional(),
          showProgress: z.boolean().optional(),
          finishMessage: z.string().optional(),
        })
        .optional(),
    },
    handler: (ctx, { settings, ...meta }) =>
      updateCourse(ctx, (course) => {
        for (const [k, v] of Object.entries(meta)) {
          if (v !== undefined) (course as unknown as Record<string, unknown>)[k] = v
        }
        if (settings) course.settings = { ...DEFAULT_COURSE_SETTINGS, ...course.settings, ...settings }
        const { lessons, ...rest } = course
        return { ...rest, lessons: lessons.length }
      }),
  }),
  tool({
    name: 'check_course',
    description:
      'Run the same pre-export checks as the Scormly builder (empty lessons, media blocks without files, unanswerable quizzes, broken scenario links…).',
    input: {},
    handler: async (ctx) => {
      const issues = courseIssues(await readCourse(requireProject(ctx)))
      return { ok: issues.length === 0, issues }
    },
  }),
  tool({
    name: 'add_asset',
    description:
      'Copy a local media file into the project (assets/images | videos | audio) and return the relative path to use in blocks (e.g. image `src`). Images: PNG/JPEG/WebP/GIF/SVG; video: MP4/WebM; audio: MP3/OGG/WAV/M4A.',
    input: {
      sourcePath: z.string().describe('Path of the file to copy'),
      kind: z.enum(['image', 'video', 'audio']).optional().describe('Default: inferred from the extension'),
    },
    handler: async (ctx, args) => {
      const dir = requireProject(ctx)
      const src = path.resolve(args.sourcePath)
      const info = await stat(src).catch(() => null)
      if (!info?.isFile()) throw new ToolError(`Not a file: ${src}`)
      const extIn = path.extname(src).slice(1).toLowerCase()
      const kind =
        args.kind ?? (Object.keys(ASSET_EXT) as (keyof typeof ASSET_EXT)[]).find((k) => extIn in ASSET_EXT[k])
      const ext = kind && ASSET_EXT[kind][extIn]
      if (!kind || !ext) throw new ToolError(`Unsupported ${args.kind ?? 'media'} format: .${extIn}`)
      const sub = ASSET_DIR[kind]
      // Same naming as the app: assets/<kind dir>/<uuid>.<ext>
      const rel = `assets/${sub}/${randomUUID()}.${ext}`
      await ensureDir(path.join(dir, 'assets', sub))
      await copyFile(src, path.join(dir, rel))
      return { path: rel, kind, bytes: info.size }
    },
  }),
  tool({
    name: 'export_package',
    description:
      'Build an LMS package (SCORM 2004, SCORM 1.2 or cmi5) as a .zip, the same as the builder\'s export. Written next to the project folder unless outputPath is given. Also reports check_course issues.',
    input: {
      format: z.enum(['scorm2004', 'scorm12', 'cmi5']).default('scorm2004'),
      outputPath: z.string().optional().describe('A .zip file path, or a folder to write into'),
    },
    handler: async (ctx, args) => {
      const dir = requireProject(ctx)
      const course = await readCourse(dir)
      const name = defaultPackageName(course, args.format)
      let out = path.join(path.dirname(dir), name)
      if (args.outputPath) {
        const target = path.resolve(args.outputPath)
        out = target.toLowerCase().endsWith('.zip') ? target : path.join(target, name)
      }
      const result = await exportPackage(dir, course, args.format, out)
      return { ...result, format: args.format, issues: courseIssues(course).map((i) => i.message) }
    },
  }),
]

/** Validate args and run a tool by name (used by the server and the tests). */
export async function runTool(ctx: Context, name: string, args: unknown = {}): Promise<unknown> {
  const def = TOOLS.find((t) => t.name === name)
  if (!def) throw new ToolError(`Unknown tool "${name}".`)
  const parsed = z.object(def.input).safeParse(args)
  if (!parsed.success) throw new ToolError(z.prettifyError(parsed.error))
  return serialized(() => def.handler(ctx, parsed.data))
}

/** AGENTS.md text for the open project (or a generic one without a project). */
export async function agentGuideText(ctx: Context): Promise<string> {
  const course = ctx.projectDir ? await readCourse(ctx.projectDir).catch(() => null) : null
  return buildAgentGuide(course ?? newCourse('My course'))
}
