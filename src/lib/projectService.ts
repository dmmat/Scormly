// Orchestrates project lifecycle (create / open / save) on top of the File
// System Access wrapper and the course store. The undo/redo history is persisted
// alongside the project so redo survives reopening.

import type { Course } from '../types/course'
import { DEFAULT_THEME } from '../theme/themes'
import { uid } from './id'
import { useCourseStore, type ProjectHistory } from '../store/courseStore'
import {
  ensurePermission,
  pickDirectory,
  readJson,
  writeJson,
} from './fileSystem'

const PROJECT_FILE = 'project.json'
const HISTORY_FILE = '.scormly-history.json'

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
    lessons: [{ id: uid('lesson'), title: 'Lesson 1', status: 'draft', blocks: [] }],
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
  useCourseStore.getState().openProject(handle, handle.name, course)
}

/** Pick a folder that already contains a project and load it (with history). */
export async function openExistingProject(): Promise<void> {
  const handle = await pickDirectory('readwrite')
  const course = await readJson<Course>(handle, PROJECT_FILE)
  if (!looksLikeCourse(course)) throw new NoProjectError()
  const history =
    (await readJson<ProjectHistory>(handle, HISTORY_FILE)) ?? undefined
  useCourseStore.getState().openProject(handle, handle.name, course, history)
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
    await writeJson(directoryHandle, HISTORY_FILE, { past, future })
    store.setSaveState('saved')
  } catch {
    store.setSaveState('error')
  }
}
