// Tool handlers against a temp project folder (no stdio transport involved).

import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import JSZip from 'jszip'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import type { Course } from '../../src/types/course'
import { type Context, PROJECT_FILE } from '../src/project'
import { agentGuideText, runTool } from '../src/tools'

let root: string
let ctx: Context

async function call<T = any>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  return (await runTool(ctx, name, args)) as T
}

async function disk(): Promise<{ text: string; course: Course }> {
  const text = await readFile(path.join(ctx.projectDir!, PROJECT_FILE), 'utf8')
  return { text, course: JSON.parse(text) }
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'scormly-mcp-'))
  ctx = { projectDir: null }
  await call('create_project', { path: path.join(root, 'course'), title: 'Safety 101' })
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('project', () => {
  test('create_project writes project.json (2-space JSON) and AGENTS.md', async () => {
    const { text, course } = await disk()
    expect(text).toBe(JSON.stringify(course, null, 2))
    expect(course.title).toBe('Safety 101')
    expect(course.lessons).toHaveLength(1)
    expect(course.id).toMatch(/^course-[0-9a-f-]{36}$/)
    const files = await readdir(ctx.projectDir!)
    expect(files.sort()).toEqual(['AGENTS.md', 'project.json'])
  })

  test('create_project refuses an existing project; open_project switches', async () => {
    await expect(call('create_project', { path: ctx.projectDir })).rejects.toThrow(/already contains/)
    const dir = ctx.projectDir
    ctx.projectDir = null
    await expect(call('list_lessons')).rejects.toThrow(/No project folder/)
    const summary = await call('open_project', { path: dir })
    expect(summary.title).toBe('Safety 101')
  })

  test('leaves the builder history sidecar alone', async () => {
    const history = path.join(ctx.projectDir!, '.scormly-history.json')
    await writeFile(history, '{"past":[],"future":[]}')
    await call('add_lesson', { title: 'Two' })
    expect(await readFile(history, 'utf8')).toBe('{"past":[],"future":[]}')
    // No temp files left behind by atomic writes.
    expect((await readdir(ctx.projectDir!)).some((f) => f.endsWith('.tmp'))).toBe(false)
  })
})

describe('lessons', () => {
  test('add / update / move / delete', async () => {
    const [first] = await call('list_lessons')
    const { lessonId: b } = await call('add_lesson', { title: 'B' })
    const { lessonId: a, index } = await call('add_lesson', { title: 'A', index: 0 })
    expect(index).toBe(0)
    await call('update_lesson', { lessonId: b, title: 'Bee', status: 'published' })
    await call('move_lesson', { lessonId: a, toIndex: 99 })
    let lessons = await call('list_lessons')
    expect(lessons.map((l: { id: string }) => l.id)).toEqual([first.id, b, a])
    expect(lessons[1]).toMatchObject({ title: 'Bee', status: 'published' })
    await call('delete_lesson', { lessonId: first.id })
    lessons = await call('list_lessons')
    expect(lessons).toHaveLength(2)
    await expect(call('get_lesson', { lessonId: 'nope' })).rejects.toThrow(/No lesson/)
  })
})

describe('blocks', () => {
  let lessonId: string
  beforeEach(async () => {
    lessonId = (await call('list_lessons'))[0].id
  })

  test('add_block fills defaults and generates ids', async () => {
    const { block } = await call('add_block', {
      lessonId,
      type: 'quiz',
      data: {
        questions: [
          { prompt: 'Pick one', options: [{ text: 'Yes', correct: true }, { text: 'No' }] },
        ],
      },
    })
    expect(block.id).toMatch(/^block-/)
    expect(block.settings).toEqual({ spacing: 'normal' })
    expect(block.data.passingScore).toBe(80)
    const q = block.data.questions[0]
    expect(q.type).toBe('single')
    expect(q.id).toMatch(/^q-/)
    expect(q.options[1]).toMatchObject({ text: 'No', correct: false })
    expect(q.options[1].id).toMatch(/^opt-/)
    expect((await disk()).course.lessons[0].blocks[0].id).toBe(block.id)
  })

  test('scenario start node defaults to the first node; tables are padded', async () => {
    const { block: s } = await call('add_block', {
      lessonId,
      type: 'scenario',
      data: { characterName: 'Ann', nodes: [{ text: 'Hi', choices: [{ text: 'Bye' }] }] },
    })
    expect(s.data.startNodeId).toBe(s.data.nodes[0].id)
    expect(s.data.nodes[0].choices[0].nextNodeId).toBeNull()
    const { block: t } = await call('add_block', {
      lessonId,
      type: 'table',
      data: { rows: [['a', 'b', 'c'], ['d']] },
    })
    expect(t.data.rows[1]).toEqual(['d', '', ''])
  })

  test('rejects unknown types, unknown fields and bad values', async () => {
    await expect(call('add_block', { lessonId, type: 'bogus' })).rejects.toThrow()
    await expect(
      call('add_block', { lessonId, type: 'heading', data: { text: 'x', color: 'red' } }),
    ).rejects.toThrow(/Invalid data for a "heading" block/)
    await expect(
      call('add_block', { lessonId, type: 'heading', data: { level: 7 } }),
    ).rejects.toThrow(/Invalid data/)
    expect((await disk()).course.lessons[0].blocks).toHaveLength(0)
  })

  test('update / move / delete', async () => {
    const { block: h } = await call('add_block', { lessonId, type: 'heading', data: { text: 'One' } })
    const { block: p } = await call('add_block', { lessonId, type: 'paragraph', data: { html: '<p>x</p>' } })
    const updated = await call('update_block', {
      blockId: h.id,
      data: { text: 'Title', level: 1 },
      settings: { spacing: 'spacious' },
    })
    expect(updated.data).toEqual({ level: 1, text: 'Title' })
    expect(updated.settings.spacing).toBe('spacious')

    await call('move_block', { blockId: p.id, toIndex: 0 })
    let lesson = await call('get_lesson', { lessonId })
    expect(lesson.blocks.map((b: { id: string }) => b.id)).toEqual([p.id, h.id])

    const { lessonId: other } = await call('add_lesson', { title: 'Other' })
    await call('move_block', { blockId: h.id, toIndex: 0, toLessonId: other })
    expect((await call('get_lesson', { lessonId: other })).blocks[0].id).toBe(h.id)

    await call('delete_block', { blockId: p.id })
    lesson = await call('get_lesson', { lessonId })
    expect(lesson.blocks).toHaveLength(0)
  })

  test('parallel calls do not lose writes', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        call('add_block', { lessonId, type: 'heading', data: { text: `H${i}` } }),
      ),
    )
    expect((await disk()).course.lessons[0].blocks).toHaveLength(10)
  })
})

describe('course, checks, assets, export', () => {
  test('update_course merges settings and validates the theme', async () => {
    const res = await call('update_course', {
      title: 'New',
      theme: 'ocean',
      settings: { navigation: 'linear', passingScore: 70 },
    })
    expect(res).toMatchObject({ title: 'New', theme: 'ocean' })
    const { course } = await disk()
    expect(course.settings).toMatchObject({ completion: 'quiz', navigation: 'linear', passingScore: 70 })
    await expect(call('update_course', { theme: 'neon' })).rejects.toThrow()
  })

  test('check_course reports the builder checks in plain English', async () => {
    let res = await call('check_course')
    expect(res.ok).toBe(false)
    expect(res.issues[0].message).toMatch(/Empty lesson/)
    const lessonId = (await call('list_lessons'))[0].id
    await call('add_block', { lessonId, type: 'quiz', data: { questions: [{ prompt: 'Q', options: [{ text: 'a' }] }] } })
    res = await call('check_course')
    const messages = res.issues.map((i: { message: string }) => i.message).join('\n')
    expect(messages).toMatch(/Quiz question 1 has fewer than 2 options/)
    expect(messages).toMatch(/Quiz question 1 has no correct answer/)
  })

  test('add_asset copies media with the app naming', async () => {
    const src = path.join(root, 'Photo.JPEG')
    await writeFile(src, 'fake')
    const res = await call('add_asset', { sourcePath: src })
    expect(res.path).toMatch(/^assets\/images\/[0-9a-f-]{36}\.jpg$/)
    expect(await readFile(path.join(ctx.projectDir!, res.path), 'utf8')).toBe('fake')
    await writeFile(path.join(root, 'doc.pdf'), 'x')
    await expect(call('add_asset', { sourcePath: path.join(root, 'doc.pdf') })).rejects.toThrow(/Unsupported/)
    await expect(call('add_asset', { sourcePath: src, kind: 'video' })).rejects.toThrow(/Unsupported video/)
  })

  test('export_package builds SCORM 2004 / 1.2 / cmi5 zips', async () => {
    const lessonId = (await call('list_lessons'))[0].id
    const img = path.join(root, 'pic.png')
    await writeFile(img, 'png-bytes')
    const { path: src } = await call('add_asset', { sourcePath: img })
    await call('add_block', { lessonId, type: 'image', data: { src, alt: 'Pic' } })
    await call('add_block', { lessonId, type: 'image', data: { src: 'assets/images/missing.png' } })
    await call('add_block', { lessonId, type: 'paragraph', data: { html: '<p>a </script> b</p>' } })

    const res = await call('export_package', {})
    expect(res.file).toBe(path.join(root, 'Safety-101-scorm2004.zip'))
    expect(res.missingAssets).toEqual(['assets/images/missing.png'])
    const zip = await JSZip.loadAsync(await readFile(res.file))
    const names = Object.keys(zip.files)
    for (const f of ['index.html', 'player.js', 'player.css', 'scorm.js', 'course-data.js', 'imsmanifest.xml', src]) {
      expect(names).toContain(f)
    }
    const manifest = await zip.file('imsmanifest.xml')!.async('string')
    expect(manifest).toContain('2004 4th Edition')
    expect(manifest).toContain(`<file href="${src}" />`)
    const data = await zip.file('course-data.js')!.async('string')
    expect(data.startsWith('window.__SCORMLY_COURSE__ = ')).toBe(true)
    expect(data).not.toContain('</script>')
    expect(await zip.file('index.html')!.async('string')).toContain('<title>Safety 101')

    const s12 = await call('export_package', { format: 'scorm12', outputPath: path.join(root, 'out') })
    expect(s12.file).toBe(path.join(root, 'out', 'Safety-101-scorm12.zip'))
    const z12 = await JSZip.loadAsync(await readFile(s12.file))
    expect(await z12.file('imsmanifest.xml')!.async('string')).toContain('<schemaversion>1.2</schemaversion>')

    const cmi5 = await call('export_package', { format: 'cmi5', outputPath: path.join(root, 'c.zip') })
    const zc = await JSZip.loadAsync(await readFile(cmi5.file))
    expect(Object.keys(zc.files)).toContain('xapi.js')
    expect(Object.keys(zc.files)).toContain('cmi5.xml')
    expect(await zc.file('index.html')!.async('string')).toContain('xapi.js')
  })

  test('agent guide resource uses the open project', async () => {
    const md = await agentGuideText(ctx)
    expect(md).toContain('# Scormly course — agent guide')
    expect(md).toContain('"title": "Safety 101"')
  })
})
