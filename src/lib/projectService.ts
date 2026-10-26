// Orchestrates project lifecycle (create / open / save) on top of the File
// System Access wrapper and the course store. The undo/redo history is persisted
// alongside the project so redo survives reopening.

import type { Course } from '../types/course'
import { DEFAULT_COURSE_SETTINGS, DEFAULT_INTRO } from '../types/course'
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
import { reportRepairs } from './repairCourse'
import { ensureUserInstructions } from './userInstructions'
import {
  BROWSER_KEY_PREFIX,
  browserProjectDir,
  requestPersistentStorage,
} from './browserProjects'
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
    intro: { ...DEFAULT_INTRO },
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

export function looksLikeCourse(value: unknown): value is Course {
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
  // Drop an agent guide alongside the project so AI agents / humans can edit
  // project.json directly, and the author's own notes for them.
  await syncAgentGuide(handle, course)
  await ensureUserInstructions(handle)
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

/** Start a new project kept in this browser (no folder access needed). */
export async function createBrowserProject(): Promise<void> {
  const id = uid('p')
  const handle = await browserProjectDir(id, true)
  if (!handle) throw new Error('Browser storage is unavailable')
  requestPersistentStorage()
  const course = makeEmptyCourse(translate('welcome', 'untitledCourse'))
  await writeJson(handle, PROJECT_FILE, course)
  await syncAgentGuide(handle, course)
  await ensureUserInstructions(handle)
  useCourseStore.getState().openProject(handle, course.title, course)
  navigate('app', BROWSER_KEY_PREFIX + id)
}

/** Open a project kept in this browser. */
export async function openBrowserProject(id: string): Promise<void> {
  const handle = await browserProjectDir(id)
  if (!handle) throw new NoProjectError()
  await loadProjectFromHandle(handle, { key: BROWSER_KEY_PREFIX + id })
}

// Folder projects are named after the folder and remembered among the recent
// projects; projects in this browser are named after the course and listed
// from the browser's storage instead.
async function loadProjectFromHandle(
  handle: FileSystemDirectoryHandle,
  browser?: { key: string },
): Promise<void> {
  const course = await readJson<Course>(handle, PROJECT_FILE)
  if (!looksLikeCourse(course)) throw new NoProjectError()
  // Refresh the agent guide (created if missing, rewritten if out of date);
  // the author's instructions are only created when missing.
  await syncAgentGuide(handle, course)
  await ensureUserInstructions(handle)
  const history =
    (await readJson<ProjectHistory>(handle, HISTORY_FILE)) ?? undefined
  const name = browser ? course.title || handle.name : handle.name
  useCourseStore.getState().openProject(handle, name, course, history)
  // A hand- or AI-edited project.json may have needed structural fixes:
  // report them and write the repaired file back (so they're reported once).
  const fixes = useCourseStore.getState().loadFixes
  if (fixes.length) {
    reportRepairs(fixes)
    void saveProject()
  }
  if (browser) {
    navigate('app', browser.key)
    return
  }
  await rememberRecentProject(handle)
  navigate('app', handle.name)
}

/** Try to silently restore the project named in the URL, if permission persists. */
export async function restoreOpenProject(projectKey: string | null): Promise<boolean> {
  if (useCourseStore.getState().directoryHandle) return true
  if (!projectKey) return false
  // A project in this browser needs no permission: just open it.
  if (projectKey.startsWith(BROWSER_KEY_PREFIX)) {
    try {
      await openBrowserProject(projectKey.slice(BROWSER_KEY_PREFIX.length))
      return true
    } catch {
      return false
    }
  }
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
}

/** An autosave is queued or a write is running. */
export function hasPendingSave(): boolean {
  return saveTimer !== undefined || inFlight !== null
}

/**
 * Run any queued autosave now and wait for writes to finish, so switching or
 * closing a project doesn't drop the last edits. Resolves true if the project
 * is saved (or there is no project folder).
 */
export async function flushSave(): Promise<boolean> {
  if (saveTimer !== undefined) {
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
    await writeJson(directoryHandle, PROJECT_FILE, course)
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
