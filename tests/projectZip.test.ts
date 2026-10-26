// Project .zip round trip (src/lib/exportProjectZip.ts, importProjectZip.ts):
// what a no-folder project saves, what "Open .zip" accepts.

import { describe, test, expect } from 'vitest'
import JSZip from 'jszip'
import { buildProjectZip, extractDataUrls, zipEntryTime } from '../src/lib/exportProjectZip'
import { openProjectZip, projectRoot, ZipProjectError } from '../src/lib/importProjectZip'
import { getMemoryAsset, putMemoryAsset } from '../src/lib/assets'
import { readUserInstructions, setMemoryUserInstructions } from '../src/lib/userInstructions'
import { useCourseStore } from '../src/store/courseStore'
import type { Course } from '../src/types/course'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function course(blocks: unknown[]): Course {
  return {
    id: 'c1',
    title: 'Zip test',
    description: '',
    theme: 'rose',
    settings: {},
    lessons: [{ id: 'l1', title: 'L1', status: 'draft', blocks }],
  } as unknown as Course
}

async function zipFile(files: Record<string, string | Uint8Array>, name = 'project.zip'): Promise<File> {
  const zip = new JSZip()
  for (const [path, data] of Object.entries(files)) zip.file(path, data)
  return new File([await zip.generateAsync({ type: 'arraybuffer' })], name)
}

describe('projectRoot', () => {
  test('finds project.json at the root or in a zipped folder, ignoring archive litter', () => {
    expect(projectRoot(['project.json', 'assets/images/a.png'])).toBe('')
    expect(projectRoot(['My course/project.json', 'My course/assets/x.png'])).toBe('My course/')
    expect(projectRoot(['__MACOSX/x/project.json', 'x/project.json'])).toBe('x/')
    expect(projectRoot(['a/b/project.json', 'a/project.json'])).toBe('a/')
    expect(projectRoot(['notes.txt'])).toBeNull()
  })
})

describe('extractDataUrls', () => {
  test('base64 media becomes files under assets/, identical ones shared', () => {
    const url = `data:image/png;base64,${PNG}`
    const json = JSON.stringify({ a: url, b: `<img src="${url}">`, c: 'data:image/svg+xml,%3Csvg%3E' })
    const { json: out, files } = extractDataUrls(json)
    const parsed = JSON.parse(out)
    expect(parsed.a).toBe('assets/images/embedded-1.png')
    expect(parsed.b).toBe('<img src="assets/images/embedded-1.png">')
    expect(parsed.c).toBe('data:image/svg+xml,%3Csvg%3E') // not base64: left inline
    expect([...files.keys()]).toEqual(['assets/images/embedded-1.png'])
    expect(files.get('assets/images/embedded-1.png')!.slice(1, 4)).toEqual(new Uint8Array([80, 78, 71])) // "PNG"
  })
})

describe('project .zip round trip', () => {
  test('save → open keeps the course and its in-memory media', async () => {
    const bytes = Uint8Array.from(atob(PNG), (ch) => ch.charCodeAt(0))
    putMemoryAsset('assets/images/pic.png', new Blob([bytes], { type: 'image/png' }))
    const c = course([{ id: 'b1', type: 'image', settings: {}, data: { src: 'assets/images/pic.png', alt: 'Pic' } }])
    const zip = await buildProjectZip(c, null)
    expect(Object.keys(zip.files).sort()).toEqual(['AGENTS.md', 'assets/', 'assets/images/', 'assets/images/pic.png', 'project.json', 'user-instructions.md'])

    const file = new File([await zip.generateAsync({ type: 'arraybuffer' })], 'Zip test-project.zip')
    await openProjectZip(file)
    const s = useCourseStore.getState()
    expect(s.directoryHandle).toBeNull()
    expect(s.projectName).toBe('Zip test-project')
    expect(s.course.lessons[0].blocks[0]).toMatchObject({ type: 'image', data: { src: 'assets/images/pic.png' } })
    const media = getMemoryAsset('assets/images/pic.png')!
    expect(media.type).toBe('image/png')
    expect(new Uint8Array(await media.arrayBuffer())).toEqual(bytes)
  })

  test('a zipped project folder opens too', async () => {
    const file = await zipFile({
      'Course/project.json': JSON.stringify(course([])),
      'Course/assets/audio/a.mp3': new Uint8Array([1, 2, 3]),
      '__MACOSX/Course/._project.json': 'junk',
    })
    // Same course id as the project the previous test opened: open it as new.
    await openProjectZip(file, { ask: async () => 'new' })
    expect(useCourseStore.getState().course.title).toBe('Zip test')
    expect(getMemoryAsset('assets/audio/a.mp3')?.type).toBe('audio/mpeg')
  })

  test('clear errors for a non-zip, a zip without a project and broken JSON', async () => {
    const reason = (p: Promise<unknown>) => p.then(() => 'ok', (e) => (e instanceof ZipProjectError ? e.reason : String(e)))
    expect(await reason(openProjectZip(new File(['hello'], 'x.zip')))).toBe('notZip')
    expect(await reason(openProjectZip(await zipFile({ 'readme.txt': 'hi' })))).toBe('noProject')
    expect(await reason(openProjectZip(await zipFile({ 'project.json': '{"lessons": [' })))).toBe('badJson')
    expect(await reason(openProjectZip(await zipFile({ 'project.json': '{"title": "no lessons"}' })))).toBe('noProject')
  })
})

describe('a .zip of a project that is already here', () => {
  async function openAsMemoryProject() {
    // A project open in this tab (no folder), id c1.
    await openProjectZip(await zipFile({ 'project.json': JSON.stringify(course([])) }, 'mine.zip'), { ask: async () => 'cancel' })
  }
  const newer = (title: string) =>
    zipFile({
      'project.json': JSON.stringify({ ...course([{ id: 'h', type: 'heading', settings: {}, data: { level: 2, text: 'v2' } }]), title }),
      'assets/images/new.png': new Uint8Array([9, 9]),
    })

  test('update: asks, replaces the course as one undo step, adds the media', async () => {
    await openAsMemoryProject()
    const asked: unknown[] = []
    await openProjectZip(await newer('Zip test v2'), { ask: async (m) => (asked.push(m), 'update') })
    expect(asked).toMatchObject([{ where: 'open', title: 'Zip test', zipTitle: 'Zip test v2' }])
    const s = useCourseStore.getState()
    expect(s.course).toMatchObject({ id: 'c1', title: 'Zip test v2' })
    expect(s.course.lessons[0].blocks.map((b) => b.type)).toEqual(['heading'])
    expect(getMemoryAsset('assets/images/new.png')).toBeDefined()
    s.undo()
    expect(useCourseStore.getState().course.title).toBe('Zip test')
  })

  test('open as new: a separate project with a fresh id', async () => {
    await openAsMemoryProject()
    await openProjectZip(await newer('Copy'), { ask: async () => 'new' })
    const c = useCourseStore.getState().course
    expect(c.title).toBe('Copy')
    expect(c.id).not.toBe('c1')
    expect(c.id).toMatch(/^course-/)
  })

  test('cancel leaves everything as it was', async () => {
    await openAsMemoryProject()
    const before = useCourseStore.getState().course
    await openProjectZip(await newer('Ignored'), { ask: async () => 'cancel' })
    expect(useCourseStore.getState().course).toBe(before)
  })
})

test('zip times are local wall-clock time, like other zip tools write them', async () => {
  const zip = await buildProjectZip(course([]), null)
  const back = await JSZip.loadAsync(await zip.generateAsync({ type: 'arraybuffer' }))
  const stored = back.file('project.json')!.date
  // JSZip exposes the stored fields as UTC; they must hold the local time.
  expect(Math.abs(zipEntryTime(stored) - Date.now())).toBeLessThan(5000)
})

test('user-instructions.md travels in the .zip: the template first, then the author text', async () => {
  setMemoryUserInstructions(null)
  let zip = await buildProjectZip(course([]), null)
  const template = await zip.file('user-instructions.md')!.async('string')
  expect(template).toMatch(/^# /) // the starting template

  setMemoryUserInstructions('# Notes\n- Learners are nurses.')
  zip = await buildProjectZip(course([]), null)
  expect(await zip.file('user-instructions.md')!.async('string')).toBe('# Notes\n- Learners are nurses.')

  // Opening a .zip (as a new project, here in memory) brings its notes along.
  const file = new File([await zip.generateAsync({ type: 'arraybuffer' })], 'notes.zip')
  setMemoryUserInstructions(null)
  await openProjectZip(file, { ask: async () => 'new' })
  expect(await readUserInstructions(null)).toBe('# Notes\n- Learners are nurses.')
})


test('review.md goes into the .zip when given, and is ignored on open', async () => {
  expect((await buildProjectZip(course([]), null)).file('review.md')).toBeNull()
  const zip = await buildProjectZip(course([]), null, '# Scormly review\n')
  expect(await zip.file('review.md')!.async('string')).toBe('# Scormly review\n')
  const file = new File([await zip.generateAsync({ type: 'arraybuffer' })], 'review.zip')
  await openProjectZip(file, { ask: async () => 'new' })
  expect(useCourseStore.getState().course.title).toBe(course([]).title)
})
