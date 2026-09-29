// Builder picks up external edits to project.json (src/lib/projectService.ts),
// using an in-memory stand-in for a File System Access directory handle.

import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { Course } from '../src/types/course'

// The service schedules timers via window.setTimeout.
;(globalThis as { window?: unknown }).window = globalThis

type Svc = typeof import('../src/lib/projectService')
type Store = typeof import('../src/store/courseStore')
type Toasts = typeof import('../src/store/toastStore')
let svc: Svc
let store: Store['useCourseStore']
let toasts: Toasts['useToastStore']

beforeAll(async () => {
  svc = await import('../src/lib/projectService')
  store = (await import('../src/store/courseStore')).useCourseStore
  toasts = (await import('../src/store/toastStore')).useToastStore
})

let clock = 1000
const files = new Map<string, { text: string; lastModified: number }>()

function writeDisk(name: string, text: string) {
  files.set(name, { text, lastModified: ++clock })
}

const handle = {
  name: 'demo',
  kind: 'directory',
  queryPermission: async () => 'granted',
  async getFileHandle(name: string) {
    return {
      async getFile() {
        const f = files.get(name)
        if (!f) throw new DOMException('missing', 'NotFoundError')
        return { lastModified: f.lastModified, text: async () => f.text }
      },
      async createWritable() {
        let buf = ''
        return {
          write: async (c: string) => void (buf = c),
          close: async () => writeDisk(name, buf),
        }
      },
    }
  },
} as unknown as FileSystemDirectoryHandle

function course(title: string): Course {
  return {
    id: 'course-1',
    title,
    description: '',
    theme: 'rose',
    settings: { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' },
    lessons: [{ id: 'lesson-1', title: 'L1', status: 'draft', blocks: [] }],
  }
}

const json = (c: Course) => JSON.stringify(c, null, 2)

beforeEach(async () => {
  svc.cancelScheduledSave()
  writeDisk('project.json', json(course('Start')))
  store.getState().openProject(handle, 'demo', course('Start'))
  // Establish the "known disk state" the way opening a project does.
  await svc.reloadFromDisk()
  store.setState({ past: [], future: [] })
  toasts.setState({ toasts: [] })
})

describe('external project.json changes', () => {
  test('reloads when there are no unsaved edits (undoable, no autosave)', async () => {
    writeDisk('project.json', json(course('From MCP')))
    await svc.checkExternalChange()
    const s = store.getState()
    expect(s.course.title).toBe('From MCP')
    expect(s.past.map((c) => c.title)).toEqual(['Start'])
    expect(svc.isCourseFromDisk(s.course)).toBe(true)
    expect(svc.hasPendingSave()).toBe(false)
  })

  test('ignores our own saves', async () => {
    store.getState().updateCourseMeta({ title: 'Mine' })
    await svc.saveProject()
    const before = store.getState().course
    await svc.checkExternalChange()
    expect(store.getState().course).toBe(before)
    expect(JSON.parse(files.get('project.json')!.text).title).toBe('Mine')
    expect(toasts.getState().toasts).toHaveLength(0)
  })

  test('asks before replacing unsaved local edits', async () => {
    store.getState().updateCourseMeta({ title: 'Local edit' })
    svc.scheduleSave(60_000)
    writeDisk('project.json', json(course('From MCP')))
    await svc.checkExternalChange()

    expect(store.getState().course.title).toBe('Local edit')
    // The autosave is held (not dropped) so it doesn't clobber the new file.
    expect(svc.hasPendingSave()).toBe(true)
    expect(JSON.parse(files.get('project.json')!.text).title).toBe('From MCP')
    const [t] = toasts.getState().toasts
    expect(t.action).toBeDefined()

    t.action!.onClick()
    await new Promise((r) => setTimeout(r, 0))
    expect(store.getState().course.title).toBe('From MCP')
    expect(svc.hasPendingSave()).toBe(false)
  })

  test('skips a half-written (invalid) file and retries later', async () => {
    writeDisk('project.json', '{"title": ')
    await svc.checkExternalChange()
    expect(store.getState().course.title).toBe('Start')
    writeDisk('project.json', json(course('Fixed')))
    await svc.checkExternalChange()
    expect(store.getState().course.title).toBe('Fixed')
  })
})
