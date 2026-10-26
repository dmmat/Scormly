import JSZip from 'jszip'
import { create } from 'zustand'
import type { Course } from '../types/course'
import { useCourseStore } from '../store/courseStore'
import { clearMemoryAssets, mimeForPath, putMemoryAsset } from './assets'
import { markZipSaved, zipEntryTime } from './exportProjectZip'
import { looksLikeCourse, openBrowserProject } from './projectService'
import { reportRepairs } from './repairCourse'
import {
  browserProjectDir,
  isBrowserStorageSupported,
  listBrowserProjects,
  requestPersistentStorage,
} from './browserProjects'
import { readText, writeBlobToSubdir, writeFile } from './fileSystem'
import { getMemoryUserInstructions, setMemoryUserInstructions, USER_INSTRUCTIONS_FILE } from './userInstructions'
import { uid } from './id'
import { translate } from '../i18n/I18nProvider'
import { toast } from '../store/toastStore'

/** Why a .zip couldn't be opened (each has a message in the `welcome` strings). */
export class ZipProjectError extends Error {
  constructor(
    public reason: 'notZip' | 'noProject' | 'badJson',
    public detail = '',
  ) {
    super(detail ? `${reason}: ${detail}` : reason)
    this.name = 'ZipProjectError'
  }
}

// ── "Update or open as new?" ──
// A .zip whose course id matches a project already here (open now, or kept in
// this browser) is most likely a new version of it — e.g. back from a
// colleague or an AI assistant. The author decides; ZipUpdateDialog renders
// the question.

export type ZipChoice = 'update' | 'new' | 'cancel'

export interface ZipMatch {
  /** The project already here. */
  title: string
  where: 'open' | 'browser'
  /** When it last changed, if known (ms). */
  updatedAt: number | null
  /** The course in the .zip, and when its project.json was written. */
  zipTitle: string
  zipDate: number | null
}

export const useZipPrompt = create<{ match: ZipMatch | null; answer: ((c: ZipChoice) => void) | null }>(() => ({
  match: null,
  answer: null,
}))

export function askZipUpdate(match: ZipMatch): Promise<ZipChoice> {
  return new Promise((resolve) =>
    useZipPrompt.setState({
      match,
      answer: (choice) => {
        useZipPrompt.setState({ match: null, answer: null })
        resolve(choice)
      },
    }),
  )
}

// Archive litter from macOS / Windows.
const JUNK = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$)/

/** Where project.json sits: the root, or a folder when the project folder
 *  itself was zipped (the shallowest one wins). Null when there is none. */
export function projectRoot(names: string[]): string | null {
  const hits = names.filter((n) => !JUNK.test(n) && (n === 'project.json' || n.endsWith('/project.json')))
  if (!hits.length) return null
  hits.sort((a, b) => a.split('/').length - b.split('/').length)
  return hits[0].slice(0, -'project.json'.length)
}

type Target = { where: 'open'; title: string; updatedAt: number | null } | { where: 'browser'; id: string; title: string; updatedAt: number }

// The project this course is a version of: the one open now, else one kept in
// this browser (the most recently changed, if there are several).
async function findExisting(courseId: string): Promise<Target | null> {
  if (!courseId) return null
  const s = useCourseStore.getState()
  if (s.course.id === courseId && (s.directoryHandle || s.projectName)) {
    let updatedAt = s.lastSavedAt
    try {
      if (s.directoryHandle) updatedAt = (await (await s.directoryHandle.getFileHandle('project.json')).getFile()).lastModified
    } catch {
      // No project.json yet: keep what the store knows.
    }
    return { where: 'open', title: s.course.title, updatedAt }
  }
  if (!isBrowserStorageSupported()) return null
  const match = (await listBrowserProjects()).find((p) => p.courseId === courseId)
  return match ? { where: 'browser', id: match.id, title: match.title, updatedAt: match.updatedAt } : null
}

/**
 * Open a project from a .zip (project.json + assets/) — no folder access
 * needed. A version of a project already here can update it (one undoable
 * step) or open as a new project with its own id. A new one is kept in this
 * browser (survives reloads), or, where the browser can't store it, lives in
 * this tab and is saved by downloading a .zip again.
 */
export async function openProjectZip(
  file: File,
  { ask = askZipUpdate }: { ask?: (match: ZipMatch) => Promise<ZipChoice> } = {},
): Promise<void> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer())
  } catch {
    throw new ZipProjectError('notZip')
  }
  const entries = Object.values(zip.files).filter((f) => !f.dir && !JUNK.test(f.name))
  const root = projectRoot(entries.map((f) => f.name))
  if (root === null) throw new ZipProjectError('noProject')

  const projectFile = zip.file(`${root}project.json`)!
  let course: unknown
  try {
    course = JSON.parse(await projectFile.async('string'))
  } catch (err) {
    throw new ZipProjectError('badJson', err instanceof Error ? err.message : '')
  }
  if (!looksLikeCourse(course)) throw new ZipProjectError('noProject')
  const media = entries.filter((f) => f.name.startsWith(`${root}assets/`))
  const notesFile = zip.file(`${root}${USER_INSTRUCTIONS_FILE}`)
  const notes = notesFile ? await notesFile.async('string') : null
  const readMedia = async (f: JSZip.JSZipObject) => {
    const path = f.name.slice(root.length)
    return { path, blob: new Blob([await f.async('arraybuffer')], { type: mimeForPath(path) }) }
  }

  const target = await findExisting(typeof course.id === 'string' ? course.id : '')
  if (target) {
    const choice = await ask({
      title: target.title,
      where: target.where,
      updatedAt: target.updatedAt,
      zipTitle: typeof course.title === 'string' ? course.title : '',
      zipDate: projectFile.date ? zipEntryTime(projectFile.date) : null,
    })
    if (choice === 'cancel') return
    if (choice === 'update') {
      await updateExisting(target, course, await Promise.all(media.map(readMedia)), notes)
      return
    }
    // A separate project from now on: its own id, so later .zips of either
    // one are told apart.
    course.id = uid('course')
  }

  if (isBrowserStorageSupported()) {
    const id = uid('p')
    const dir = await browserProjectDir(id, true)
    if (dir) {
      requestPersistentStorage()
      await writeFile(dir, 'project.json', JSON.stringify(course, null, 2))
      if (notes !== null) await writeFile(dir, USER_INSTRUCTIONS_FILE, notes)
      for (const { path, blob } of await Promise.all(media.map(readMedia))) await writeMedia(dir, path, blob)
      await openBrowserProject(id)
      return
    }
  }

  clearMemoryAssets()
  for (const { path, blob } of await Promise.all(media.map(readMedia))) putMemoryAsset(path, blob)
  setMemoryUserInstructions(notes)
  // Leave a folder project, if any: a .zip project has a name but no folder,
  // and no #/app/<name> URL (it can't be reopened from a link).
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#/app/')) window.location.hash = '/app'
  useCourseStore.getState().loadCourse(course)
  useCourseStore.setState({
    directoryHandle: null,
    projectName: file.name.replace(/\.zip$/i, '') || 'project',
    saveState: 'idle',
  })
  markZipSaved(useCourseStore.getState().course)
  // An AI-edited project.json may need small structural fixes; say so.
  reportRepairs(useCourseStore.getState().loadFixes)
}

function writeMedia(dir: FileSystemDirectoryHandle, path: string, blob: Blob): Promise<void> {
  const parts = path.split('/')
  const name = parts.pop()!
  return writeBlobToSubdir(dir, parts, name, blob)
}

// The .zip's course replaces the existing project's as one undo step. Its media
// is added next to the old files (kept, so undo still finds them; exports only
// take what the course references). The author's user-instructions.md stays as
// it is here; the .zip's copy is used only when the project has none.
async function updateExisting(
  target: Target,
  course: Course,
  media: { path: string; blob: Blob }[],
  notes: string | null,
): Promise<void> {
  if (target.where === 'browser') await openBrowserProject(target.id)
  const { directoryHandle } = useCourseStore.getState()
  for (const { path, blob } of media) {
    if (directoryHandle) await writeMedia(directoryHandle, path, blob)
    else putMemoryAsset(path, blob)
  }
  if (notes !== null) {
    if (!directoryHandle) {
      if (getMemoryUserInstructions() === null) setMemoryUserInstructions(notes)
    } else if ((await readText(directoryHandle, USER_INSTRUCTIONS_FILE)) === null) {
      await writeFile(directoryHandle, USER_INSTRUCTIONS_FILE, notes)
    }
  }
  useCourseStore.getState().replaceCourse(course)
  // Without a folder the .zip is the saved state.
  if (!directoryHandle) markZipSaved(useCourseStore.getState().course)
  reportRepairs(useCourseStore.getState().loadFixes)
  toast({ tone: 'success', message: translate('welcome', 'zipUpdated', { title: target.title }) })
}
