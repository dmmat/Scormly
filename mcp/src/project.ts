// Disk I/O for a Scormly project folder: project.json (+ AGENTS.md, assets/).
// Every call re-reads project.json, so edits made in the Scormly builder in the
// meantime are never lost; writes are atomic (temp file + rename) so the
// builder's watcher never sees a half-written file. .scormly-history.json (the
// builder's undo history) is never touched.

import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Course } from '../../src/types/course'

export const PROJECT_FILE = 'project.json'

/** Error whose message is shown to the MCP client as-is. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ToolError'
  }
}

/** Mutable server context: the project folder the tools act on. */
export interface Context {
  projectDir: string | null
}

export function requireProject(ctx: Context): string {
  if (!ctx.projectDir) {
    throw new ToolError(
      'No project folder is open. Start the server with --project <folder> (or SCORMLY_PROJECT), or call open_project / create_project.',
    )
  }
  return ctx.projectDir
}

export function isProjectDir(dir: string): boolean {
  return existsSync(path.join(dir, PROJECT_FILE))
}

export async function readCourse(dir: string): Promise<Course> {
  let text: string
  try {
    text = await readFile(path.join(dir, PROJECT_FILE), 'utf8')
  } catch {
    throw new ToolError(`No ${PROJECT_FILE} in ${dir}.`)
  }
  let course: unknown
  try {
    course = JSON.parse(text)
  } catch (err) {
    throw new ToolError(`${PROJECT_FILE} is not valid JSON: ${(err as Error).message}`)
  }
  if (
    typeof course !== 'object' ||
    course === null ||
    !Array.isArray((course as Course).lessons)
  ) {
    throw new ToolError(`${PROJECT_FILE} does not look like a Scormly course (no lessons array).`)
  }
  return course as Course
}

/** Write a file atomically: a temp file in the same folder, then rename. */
export async function writeFileAtomic(file: string, data: string | Uint8Array): Promise<void> {
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`)
  try {
    await writeFile(tmp, data)
    await rename(tmp, file)
  } catch (err) {
    await rm(tmp, { force: true })
    throw err
  }
}

/** Save the course formatted exactly like the app (2-space JSON). */
export async function writeCourse(dir: string, course: Course): Promise<void> {
  await writeFileAtomic(path.join(dir, PROJECT_FILE), JSON.stringify(course, null, 2))
}

/** Read → mutate → write. Returns whatever `fn` returns. */
export async function updateCourse<T>(
  ctx: Context,
  fn: (course: Course) => T,
): Promise<T> {
  const dir = requireProject(ctx)
  const course = await readCourse(dir)
  const result = fn(course)
  await writeCourse(dir, course)
  return result
}

let queue: Promise<unknown> = Promise.resolve()

/**
 * Run tool calls one at a time. Clients may send calls in parallel, and two
 * read → modify → write cycles on project.json must not interleave.
 */
export function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.catch(() => undefined)
  return run
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}
