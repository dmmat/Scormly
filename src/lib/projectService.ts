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

/** Persist the current course and history to the open project's folder. */
export async function saveProject(): Promise<void> {
  const store = useCourseStore.getState()
  const { directoryHandle, course, past, future } = store
  if (!directoryHandle) return

  store.setSaveState('saving')
  try {
    if (!(await ensurePermission(directoryHandle, true))) {
      store.setSaveState('error')
      return
    }
    await writeJson(directoryHandle, PROJECT_FILE, course)
    await writeJson(directoryHandle, HISTORY_FILE, {
      past: past.slice(-PERSISTED_HISTORY),
      future: future.slice(0, PERSISTED_HISTORY),
    })
    store.setSaveState('saved')
  } catch {
    store.setSaveState('error')
  }
}
