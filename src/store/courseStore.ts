import { create } from 'zustand'
import type {
  Block,
  BlockType,
  Course,
  CourseSettings,
  Lesson,
  LessonStatus,
  ThemeId,
} from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { createBlock } from '../blocks/registry'
import { DEFAULT_THEME, THEMES } from '../theme/themes'
import { uid } from '../lib/id'
import { translate } from '../i18n/I18nProvider'

const HISTORY_LIMIT = 50

// Build the in-memory demo course used by the "try without saving" flow.
// Localized to the current UI language at call time (not module load), so it
// must be created when the user actually enters the builder.
function makeInitialCourse(): Course {
  return {
    id: 'course-1',
    title: translate('content', 'demoCourseTitle'),
    description: translate('content', 'demoCourseDescription'),
    theme: DEFAULT_THEME,
    settings: { ...DEFAULT_COURSE_SETTINGS },
    lessons: [
      { id: 'lesson-1', title: translate('content', 'demoLesson1'), status: 'draft', blocks: [] },
      { id: 'lesson-2', title: translate('content', 'demoLesson2'), status: 'draft', blocks: [] },
      { id: 'lesson-3', title: translate('content', 'demoLesson3'), status: 'draft', blocks: [] },
    ],
  }
}

const initialCourse: Course = makeInitialCourse()

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export interface ProjectHistory {
  past: Course[]
  future: Course[]
}

export interface CourseState {
  course: Course
  activeLessonId: string | null
  selectedBlockId: string | null
  past: Course[]
  future: Course[]
  /** Key of the last edit, used to coalesce text typing into a single undo step. */
  lastCoalesceKey: string | null

  // Project persistence (File System Access)
  directoryHandle: FileSystemDirectoryHandle | null
  projectName: string | null
  saveState: SaveState

  // Learner preview overlay
  previewOpen: boolean
  setPreviewOpen: (open: boolean) => void

  // Project settings modal
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Mobile lessons drawer
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // ── Selection / navigation ──
  setActiveLesson: (lessonId: string) => void
  selectBlock: (blockId: string | null) => void

  // ── Course ──
  updateCourseMeta: (
    patch: Partial<Pick<Course, 'title' | 'description' | 'coverImage'>>,
  ) => void
  setTheme: (theme: ThemeId) => void
  updateSettings: (patch: Partial<CourseSettings>) => void
  loadCourse: (course: Course) => void
  /** Reset to a fresh in-memory demo course, localized to the current UI language. */
  newDemoCourse: () => void

  // ── Project ──
  openProject: (
    handle: FileSystemDirectoryHandle,
    name: string,
    course: Course,
    history?: ProjectHistory,
  ) => void
  closeProject: () => void
  setSaveState: (state: SaveState) => void

  // ── Lessons ──
  addLesson: () => void
  renameLesson: (lessonId: string, title: string) => void
  deleteLesson: (lessonId: string) => void
  moveLesson: (fromIndex: number, toIndex: number) => void
  setLessonStatus: (lessonId: string, status: LessonStatus) => void

  // ── Blocks ──
  addBlock: (lessonId: string, type: BlockType, atIndex?: number) => void
  updateBlockData: <T extends Block>(
    lessonId: string,
    blockId: string,
    data: Partial<T['data']>,
    coalesceKey?: string,
  ) => void
  updateBlockSettings: (
    lessonId: string,
    blockId: string,
    settings: Partial<Block['settings']>,
  ) => void
  deleteBlock: (lessonId: string, blockId: string) => void
  duplicateBlock: (lessonId: string, blockId: string) => void
  moveBlock: (lessonId: string, fromIndex: number, toIndex: number) => void

  // ── History ──
  undo: () => void
  redo: () => void
}

function findLesson(course: Course, lessonId: string): Lesson | undefined {
  return course.lessons.find((l) => l.id === lessonId)
}

// Coerce a loaded course to current invariants: migrate a renamed/legacy theme
// id to the default, and backfill completion/scoring settings for older projects.
function migrateCourse(course: Course): Course {
  const theme = THEMES[course.theme] ? course.theme : DEFAULT_THEME
  const settings = { ...DEFAULT_COURSE_SETTINGS, ...course.settings }
  return { ...course, theme, settings }
}

export const useCourseStore = create<CourseState>((set, get) => {
  /**
   * Applies a mutation to a deep copy of the course and maintains the history stack.
   * coalesceKey: if it matches the previous one, the edit is merged into the same
   * undo step (for text typing). Structural actions pass undefined.
   */
  function mutate(fn: (draft: Course) => void, coalesceKey?: string) {
    const state = get()
    const draft = structuredClone(state.course)
    fn(draft)

    const coalesce =
      coalesceKey != null && coalesceKey === state.lastCoalesceKey
    const past = coalesce
      ? state.past
      : [...state.past, state.course].slice(-HISTORY_LIMIT)

    set({
      course: draft,
      past,
      future: [],
      lastCoalesceKey: coalesceKey ?? null,
    })
  }

  return {
    course: initialCourse,
    activeLessonId: initialCourse.lessons[0]?.id ?? null,
    selectedBlockId: null,
    past: [],
    future: [],
    lastCoalesceKey: null,

    directoryHandle: null,
    projectName: null,
    saveState: 'idle',

    previewOpen: false,
    setPreviewOpen: (open) => set({ previewOpen: open }),

    settingsOpen: false,
    setSettingsOpen: (open) => set({ settingsOpen: open }),

    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setActiveLesson: (lessonId) =>
      set({ activeLessonId: lessonId, selectedBlockId: null }),
    selectBlock: (blockId) => set({ selectedBlockId: blockId }),

    updateCourseMeta: (patch) =>
      mutate((c) => {
        Object.assign(c, patch)
      }, `course-meta`),

    setTheme: (theme) =>
      mutate((c) => {
        c.theme = theme
      }),

    updateSettings: (patch) =>
      mutate((c) => {
        c.settings = { ...DEFAULT_COURSE_SETTINGS, ...c.settings, ...patch }
      }),

    loadCourse: (input) => {
      const course = migrateCourse(input)
      set({
        course,
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: [],
        future: [],
        lastCoalesceKey: null,
      })
    },

    newDemoCourse: () => {
      const course = makeInitialCourse()
      set({
        course,
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: [],
        future: [],
        lastCoalesceKey: null,
      })
    },

    openProject: (handle, name, input, history) => {
      const course = migrateCourse(input)
      set({
        directoryHandle: handle,
        projectName: name,
        saveState: 'saved',
        course,
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: history?.past ?? [],
        future: history?.future ?? [],
        lastCoalesceKey: null,
      })
    },

    closeProject: () => {
      // Drop the project key from the URL.
      if (window.location.hash.startsWith('#/app/')) window.location.hash = '/app'
      set({ directoryHandle: null, projectName: null, saveState: 'idle' })
    },

    setSaveState: (saveState) => set({ saveState }),

    addLesson: () => {
      const id = uid('lesson')
      mutate((c) => {
        c.lessons.push({
          id,
          title: translate('content', 'lessonN', { n: c.lessons.length + 1 }),
          status: 'draft',
          blocks: [],
        })
      })
      set({ activeLessonId: id })
    },

    renameLesson: (lessonId, title) =>
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (lesson) lesson.title = title
      }, `lesson-title-${lessonId}`),

    deleteLesson: (lessonId) => {
      const state = get()
      mutate((c) => {
        c.lessons = c.lessons.filter((l) => l.id !== lessonId)
      })
      if (state.activeLessonId === lessonId) {
        const remaining = get().course.lessons
        set({ activeLessonId: remaining[0]?.id ?? null, selectedBlockId: null })
      }
    },

    moveLesson: (fromIndex, toIndex) =>
      mutate((c) => {
        const [moved] = c.lessons.splice(fromIndex, 1)
        if (moved) c.lessons.splice(toIndex, 0, moved)
      }),

    setLessonStatus: (lessonId, status) =>
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (lesson) lesson.status = status
      }),

    addBlock: (lessonId, type, atIndex) => {
      const block = createBlock(type)
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (!lesson) return
        if (atIndex == null || atIndex >= lesson.blocks.length) {
          lesson.blocks.push(block)
        } else {
          lesson.blocks.splice(Math.max(0, atIndex), 0, block)
        }
      })
      set({ selectedBlockId: block.id })
    },

    updateBlockData: (lessonId, blockId, data, coalesceKey) =>
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        const block = lesson?.blocks.find((b) => b.id === blockId)
        if (block) Object.assign(block.data, data)
      }, coalesceKey),

    updateBlockSettings: (lessonId, blockId, settings) =>
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        const block = lesson?.blocks.find((b) => b.id === blockId)
        if (block) Object.assign(block.settings, settings)
      }),

    deleteBlock: (lessonId, blockId) => {
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (lesson) lesson.blocks = lesson.blocks.filter((b) => b.id !== blockId)
      })
      if (get().selectedBlockId === blockId) set({ selectedBlockId: null })
    },

    duplicateBlock: (lessonId, blockId) => {
      const clonedId = uid('block')
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (!lesson) return
        const index = lesson.blocks.findIndex((b) => b.id === blockId)
        if (index === -1) return
        const copy = structuredClone(lesson.blocks[index]) as Block
        copy.id = clonedId
        lesson.blocks.splice(index + 1, 0, copy)
      })
      set({ selectedBlockId: clonedId })
    },

    moveBlock: (lessonId, fromIndex, toIndex) =>
      mutate((c) => {
        const lesson = findLesson(c, lessonId)
        if (!lesson) return
        const [moved] = lesson.blocks.splice(fromIndex, 1)
        if (moved) lesson.blocks.splice(toIndex, 0, moved)
      }),

    undo: () => {
      const state = get()
      if (state.past.length === 0) return
      const previous = state.past[state.past.length - 1]
      set({
        course: previous,
        past: state.past.slice(0, -1),
        future: [state.course, ...state.future],
        lastCoalesceKey: null,
      })
    },

    redo: () => {
      const state = get()
      if (state.future.length === 0) return
      const next = state.future[0]
      set({
        course: next,
        past: [...state.past, state.course],
        future: state.future.slice(1),
        lastCoalesceKey: null,
      })
    },
  }
})

// Convenience selectors.
export const selectActiveLesson = (s: CourseState): Lesson | undefined =>
  s.course.lessons.find((l) => l.id === s.activeLessonId)
