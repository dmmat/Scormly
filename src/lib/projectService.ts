// Orchestrates project lifecycle (create / open / save) on top of the File
// System Access wrapper and the course store. The undo/redo history is persisted
// alongside the project so redo survives reopening.

import type { Course } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { DEFAULT_THEME } from '../theme/themes'
import { uid } from './id'
import { translate } from '../i18n/I18nProvider'
import { useCourseStore, type ProjectHistory } from '../store/courseStore'
import {
  ensurePermission,
  pickDirectory,
  readJson,
  readText,
  writeFile,
  writeJson,
} from './fileSystem'
import { AGENT_GUIDE_FILE, buildAgentGuide } from './agentGuide'
import { rememberRecentProject, listRecentProjects } from './recentProjects'
import { dismissToast, toast } from '../store/toastStore'
import { navigate } from '../hooks/useRoute'

const PROJECT_FILE = 'project.json'
const HISTORY_FILE = '.scormly-history.json'

// Only the most recent steps are persisted, so the history sidecar stays small
// even when the course embeds large data (e.g. inline images as data URLs).
const PERSISTED_HISTORY = 20

/** Thrown when the chosen folder has no project.json. */
export class NoProjectError extends Error {
  constructor() {
    super('No project.json found in the selected folder')
    this.name = 'NoProjectError'
  }
}

function makeEmptyCourse(title: string): Course {
  return {
    id: uid('course'),
    title,
    description: '',
    theme: DEFAULT_THEME,
    settings: { ...DEFAULT_COURSE_SETTINGS },
    lessons: [
      {
        id: uid('lesson'),
        title: translate('content', 'lessonN', { n: 1 }),
        status: 'draft',
        blocks: [],
      },
    ],
  }
}

// Write/refresh the AGENTS.md guide for a project. Rewrites only when missing
// or out of date (e.g. after a Scormly update that changes the block reference),
// so it stays current without needless disk writes. Best-effort: the guide is a
// convenience and must never block create/open.
async function syncAgentGuide(
  handle: FileSystemDirectoryHandle,
  course: Course,
): Promise<void> {
  try {
    const next = buildAgentGuide(course)
    const current = await readText(handle, AGENT_GUIDE_FILE)
    if (current !== next) await writeFile(handle, AGENT_GUIDE_FILE, next)
  } catch {
    // ignore — convenience only.
  }
}

function looksLikeCourse(value: unknown): value is Course {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Course).lessons)
  )
}

/** Pick a folder and start a brand-new project in it. */
export async function createNewProject(): Promise<void> {
  const handle = await pickDirectory('readwrite')
  const course = makeEmptyCourse(handle.name)
  await writeJson(handle, PROJECT_FILE, course)
  await rememberDiskState(handle)
  // Drop an agent guide alongside the project so AI agents / humans can edit
  // project.json directly.
  await syncAgentGuide(handle, course)
  useCourseStore.getState().openProject(handle, handle.name, course)
  await rememberRecentProject(handle)
  navigate('app', handle.name)
}

/** Pick a folder that already contains a project and load it (with history). */
export async function openExistingProject(): Promise<void> {
  const handle = await pickDirectory('readwrite')
  await loadProjectFromHandle(handle)
}

/** Re-open a previously used project from a stored directory handle. */
export async function openRecentProject(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  if (!(await ensurePermission(handle, true))) {
    throw new Error('Permission denied')
  }
  await loadProjectFromHandle(handle)
}

async function loadProjectFromHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const course = await readJson<Course>(handle, PROJECT_FILE)
  if (!looksLikeCourse(course)) throw new NoProjectError()
  // Refresh the agent guide (created if missing, rewritten if out of date).
  await syncAgentGuide(handle, course)
  const history =
    (await readJson<ProjectHistory>(handle, HISTORY_FILE)) ?? undefined
  useCourseStore.getState().openProject(handle, handle.name, course, history)
  await rememberDiskState(handle)
  await rememberRecentProject(handle)
  navigate('app', handle.name)
}

/** Try to silently restore the project named in the URL, if permission persists. */
export async function restoreOpenProject(projectKey: string | null): Promise<boolean> {
  if (useCourseStore.getState().directoryHandle) return true
  if (!projectKey) return false
  const match = (await listRecentProjects()).find((r) => r.name === projectKey)
  if (!match) return false
  // Re-requesting permission needs a user gesture, so only auto-open if the
  // browser still reports the handle as granted.
  const perm = await match.handle.queryPermission?.({ mode: 'readwrite' })
  if (perm !== 'granted') return false
  try {
    await loadProjectFromHandle(match.handle)
    return true
  } catch {
    return false
  }
}

let saveTimer: number | undefined
let inFlight: Promise<void> | null = null

/** Debounced save (autosave). A newer call replaces the pending one. */
export function scheduleSave(delayMs: number): void {
  cancelScheduledSave()
  saveTimer = window.setTimeout(() => {
    saveTimer = undefined
    void saveProject()
  }, delayMs)
}

export function cancelScheduledSave(): void {
  if (saveTimer !== undefined) clearTimeout(saveTimer)
  saveTimer = undefined
  heldForConflict = false
}

/** An autosave is queued, held back by a disk conflict, or a write is running. */
export function hasPendingSave(): boolean {
  return saveTimer !== undefined || heldForConflict || inFlight !== null
}

/**
 * Run any queued autosave now and wait for writes to finish, so switching or
 * closing a project doesn't drop the last edits. Resolves true if the project
 * is saved (or there is no project folder).
 */
export async function flushSave(): Promise<boolean> {
  if (saveTimer !== undefined || heldForConflict) {
    cancelScheduledSave()
    await saveProject()
  } else if (inFlight) {
    await inFlight
  }
  return useCourseStore.getState().saveState !== 'error'
}

/** Persist the current course and history to the open project's folder. */
export function saveProject(): Promise<void> {
  // Chain behind a running write so two saves never interleave on disk.
  const run = (inFlight ?? Promise.resolve()).then(writeProject)
  const tracked = run.finally(() => {
    if (inFlight === tracked) inFlight = null
  })
  inFlight = tracked
  return tracked
}

async function writeProject(): Promise<void> {
  const store = useCourseStore.getState()
  const { directoryHandle, course, past, future } = store
  if (!directoryHandle) return

  store.setSaveState('saving')
  try {
    if (!(await ensurePermission(directoryHandle, true))) {
      saveFailed('savePermission')
      return
    }
    const text = JSON.stringify(course, null, 2)
    await writeFile(directoryHandle, PROJECT_FILE, text)
    await rememberDiskState(directoryHandle, text)
    await writeJson(directoryHandle, HISTORY_FILE, {
      past: past.slice(-PERSISTED_HISTORY),
      future: future.slice(0, PERSISTED_HISTORY),
    })
    store.setSaveState('saved')
    dismissToast(SAVE_TOAST)
  } catch (err) {
    console.error('[save]', err)
    saveFailed('saveFailed')
  }
}

const SAVE_TOAST = 'save-error'

// One sticky-ish toast for save failures (autosave retries on every edit, so
// reuse the id instead of stacking). Retry is a user gesture, which is what the
// browser needs to re-grant folder access.
function saveFailed(messageKey: 'saveFailed' | 'savePermission') {
  useCourseStore.getState().setSaveState('error')
  toast({
    id: SAVE_TOAST,
    tone: 'error',
    message: translate('common', messageKey),
    action: { label: translate('common', 'retry'), onClick: () => void saveProject() },
  })
}

// ── External changes ─────────────────────────────────────────────────────────
// Another tool (the Scormly MCP server, an AI agent, a text editor) may rewrite
// project.json while the project is open. useProjectWatcher calls
// checkExternalChange(): we reload when the builder has nothing unsaved, and
// otherwise offer to via a toast.

const RELOAD_TOAST = 'external-change'

// The project.json we last wrote or loaded. A new lastModified with the same
// text is ignored, so our own saves never count as external changes.
let diskStamp: number | null = null
let diskText: string | null = null
// The course object last applied from disk. useAutosave skips it: writing it
// straight back is pointless and could clobber a newer external write.
let courseFromDisk: Course | null = null
// Local edits whose autosave was held back because the file changed on disk.
let heldForConflict = false
let checking = false

async function rememberDiskState(
  handle: FileSystemDirectoryHandle,
  text?: string,
): Promise<void> {
  try {
    const file = await (await handle.getFileHandle(PROJECT_FILE)).getFile()
    diskStamp = file.lastModified
    diskText = text ?? (await file.text())
  } catch {
    diskStamp = diskText = null
  }
}

/** True for the course object just reloaded from disk (don't autosave it). */
export function isCourseFromDisk(course: Course): boolean {
  return course === courseFromDisk
}

/** Compare project.json on disk with what we know; reload or offer to. */
export async function checkExternalChange(): Promise<void> {
  const handle = useCourseStore.getState().directoryHandle
  // Skip while our own write runs: the file is mid-update and about to be ours.
  if (!handle || inFlight || checking) return
  checking = true
  try {
    const file = await (await handle.getFileHandle(PROJECT_FILE)).getFile()
    if (file.lastModified === diskStamp) return
    const text = await file.text()
    if (inFlight || useCourseStore.getState().directoryHandle !== handle) return
    if (text === diskText) {
      diskStamp = file.lastModified
      return
    }
    // A half-written or hand-broken file: keep the old stamp so we retry.
    let course: unknown
    try {
      course = JSON.parse(text)
    } catch {
      return
    }
    if (!looksLikeCourse(course)) return
    diskStamp = file.lastModified
    diskText = text

    const { saveState } = useCourseStore.getState()
    if (saveTimer === undefined && !heldForConflict && saveState !== 'error') {
      applyFromDisk(course)
      toast({ id: RELOAD_TOAST, message: translate('common', 'externalReloaded') })
      return
    }
    // Unsaved local edits: hold their autosave so it doesn't overwrite the new
    // file a second later. The next edit (or flushSave) saves ours over it.
    cancelScheduledSave()
    heldForConflict = true
    toast({
      id: RELOAD_TOAST,
      message: translate('common', 'externalConflict'),
      action: {
        label: translate('common', 'reloadFromDisk'),
        onClick: () => void reloadFromDisk(),
      },
    })
  } catch {
    // Folder gone or permission lost — the next save reports that.
  } finally {
    checking = false
  }
}

function applyFromDisk(course: Course): void {
  cancelScheduledSave()
  useCourseStore.getState().applyExternalCourse(course)
  courseFromDisk = useCourseStore.getState().course
}

/** Replace the in-app course with project.json from disk (undoable). */
export async function reloadFromDisk(): Promise<void> {
  const handle = useCourseStore.getState().directoryHandle
  if (!handle) return
  try {
    const course = await readJson<Course>(handle, PROJECT_FILE)
    if (!looksLikeCourse(course)) throw new NoProjectError()
    applyFromDisk(course)
    await rememberDiskState(handle)
    dismissToast(RELOAD_TOAST)
  } catch (err) {
    console.error('[reload]', err)
    toast({ tone: 'error', message: translate('common', 'openFailed') })
  }
}
