import { create } from 'zustand'
import type {
  Block,
  BlockType,
  Course,
  CourseIntro,
  CustomTheme,
  CourseSettings,
  Lesson,
  LessonStatus,
  ThemeId,
} from '../types/course'
import { DEFAULT_COURSE_SETTINGS, DEFAULT_INTRO, INTRO_ID } from '../types/course'
import { createBlock } from '../blocks/registry'
import { DEFAULT_THEME, THEMES, isThemeId } from '../theme/themes'
import { uid } from '../lib/id'
import { translate } from '../i18n/I18nProvider'
import type { Language } from '../i18n/types'
import { makeSampleCourse } from '../lib/sampleCourse'
import { repairCourse, type RepairFix } from '../lib/repairCourse'

const HISTORY_LIMIT = 50

/** `activeLessonId` value while the course cover page (intro) is being edited.
 *  Block actions given this id act on the cover page's own blocks. */
export { INTRO_ID }

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
    intro: { ...DEFAULT_INTRO },
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
  /** Repairs made to the last loaded / opened course (see repairCourse);
   *  empty for courses created in the app. */
  loadFixes: RepairFix[]

  // Learner preview overlay
  previewOpen: boolean
  setPreviewOpen: (open: boolean) => void

  // Project settings modal
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Keyboard shortcuts help
  shortcutsOpen: boolean
  setShortcutsOpen: (open: boolean) => void

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
  /** Edits the custom theme and switches the course to it. */
  updateCustomTheme: (patch: Partial<CustomTheme>, coalesceKey?: string) => void
  /** `coalesceKey` merges consecutive edits (typing, slider drags) into one undo step. */
  updateSettings: (patch: Partial<CourseSettings>, coalesceKey?: string) => void
  /** Patch the cover page (created with defaults on first edit). */
  updateIntro: (patch: Partial<CourseIntro>, coalesceKey?: string) => void
  loadCourse: (course: Course) => void
  /** Swap in a whole new version of the course (e.g. from a .zip) as one
   *  undoable step — Ctrl+Z brings the previous version back. */
  replaceCourse: (course: Course) => void
  /** Reset to a fresh in-memory demo course, localized to the current UI language. */
  newDemoCourse: () => void
  /** Load the built-in sample course (in memory) in the given language. */
  loadSampleCourse: (lang: Language) => void

  // ── Project ──
  openProject: (
    handle: FileSystemDirectoryHandle,
    name: string,
    course: Course,
    history?: ProjectHistory,
  ) => void
  closeProject: () => void
  setSaveState: (state: SaveState) => void
  /** Time of the last successful save (ms since epoch). */
  lastSavedAt: number | null

  // ── Lessons ──
  addLesson: () => void
  renameLesson: (lessonId: string, title: string) => void
  deleteLesson: (lessonId: string) => void
  moveLesson: (fromIndex: number, toIndex: number) => void
  setLessonStatus: (lessonId: string, status: LessonStatus) => void

  // ── Blocks ──
  addBlock: (lessonId: string, type: BlockType, atIndex?: number) => void
  /** Insert ready-made blocks (a template) as one undo step; selects the first. */
  insertBlocks: (lessonId: string, blocks: Block[], atIndex?: number) => void
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

// A first custom theme starts from the current preset's color and shape.
function seedCustomTheme(course: Course): CustomTheme {
  const preset = course.theme === 'custom' ? THEMES[DEFAULT_THEME] : THEMES[course.theme] ?? THEMES[DEFAULT_THEME]
  return { accent: preset.accent, shape: preset.shape }
}

function findLesson(course: Course, lessonId: string): Lesson | undefined {
  return course.lessons.find((l) => l.id === lessonId)
}

/** The blocks behind a lesson id (the cover page's for INTRO_ID). */
export function blocksOf(course: Course, lessonId: string | null): Block[] | undefined {
  if (lessonId === INTRO_ID) return course.intro?.blocks ?? []
  return course.lessons.find((l) => l.id === lessonId)?.blocks
}

// Draft-side counterpart of blocksOf for mutations: creates the cover page's
// block list on first use (a legacy course gets a disabled intro).
function findContainer(course: Course, lessonId: string): { blocks: Block[] } | undefined {
  if (lessonId !== INTRO_ID) return findLesson(course, lessonId)
  const intro = (course.intro ??= { ...DEFAULT_INTRO, enabled: false })
  intro.blocks ??= []
  return intro as { blocks: Block[] }
}

// Coerce a loaded course to current invariants: repair its structure (hand- or
// AI-edited project.json), migrate a renamed/legacy theme id to the default,
// and backfill completion/scoring settings for older projects.
function migrateCourse(input: Course): { course: Course; fixes: RepairFix[] } {
  const { course, fixes } = repairCourse(input)
  const theme = isThemeId(course.theme) ? course.theme : DEFAULT_THEME
  const settings = { ...DEFAULT_COURSE_SETTINGS, ...course.settings }
  return { course: { ...course, theme, settings }, fixes }
}

// Undo snapshots saved with a project get the same repair, so undo can't bring
// a broken structure back.
const repairHistory = (list: Course[] | undefined): Course[] =>
  (Array.isArray(list) ? list : [])
    .filter((c) => c && typeof c === 'object' && Array.isArray(c.lessons))
    .map((c) => migrateCourse(c).course)

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
    loadFixes: [],

    previewOpen: false,
    setPreviewOpen: (open) => set({ previewOpen: open }),

    settingsOpen: false,
    setSettingsOpen: (open) => set({ settingsOpen: open }),

    shortcutsOpen: false,
    setShortcutsOpen: (open) => set({ shortcutsOpen: open }),

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
        if (theme === 'custom') c.customTheme ??= seedCustomTheme(c)
        c.theme = theme
      }),

    updateCustomTheme: (patch, coalesceKey) =>
      mutate((c) => {
        c.customTheme = { ...(c.customTheme ?? seedCustomTheme(c)), ...patch }
        c.theme = 'custom'
      }, coalesceKey),

    updateSettings: (patch, coalesceKey) =>
      mutate((c) => {
        c.settings = { ...DEFAULT_COURSE_SETTINGS, ...c.settings, ...patch }
      }, coalesceKey),

    updateIntro: (patch, coalesceKey) =>
      mutate((c) => {
        c.intro = { ...DEFAULT_INTRO, ...c.intro, ...patch }
      }, coalesceKey),

    loadCourse: (input) => {
      const { course, fixes } = migrateCourse(input)
      set({
        course,
        loadFixes: fixes,
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: [],
        future: [],
        lastCoalesceKey: null,
      })
    },

    replaceCourse: (input) => {
      const { course, fixes } = migrateCourse(input)
      mutate((draft) => {
        for (const key of Object.keys(draft)) delete (draft as unknown as Record<string, unknown>)[key]
        Object.assign(draft, structuredClone(course))
      })
      const { activeLessonId } = get()
      const keep = activeLessonId === INTRO_ID || course.lessons.some((l) => l.id === activeLessonId)
      set({
        loadFixes: fixes,
        selectedBlockId: null,
        activeLessonId: keep ? activeLessonId : course.lessons[0]?.id ?? null,
      })
    },

    loadSampleCourse: (lang) => {
      const course = makeSampleCourse(lang)
      set({
        course,
        loadFixes: [],
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
        loadFixes: [],
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: [],
        future: [],
        lastCoalesceKey: null,
      })
    },

    openProject: (handle, name, input, history) => {
      const { course, fixes } = migrateCourse(input)
      set({
        directoryHandle: handle,
        projectName: name,
        saveState: 'saved',
        course,
        loadFixes: fixes,
        activeLessonId: course.lessons[0]?.id ?? null,
        selectedBlockId: null,
        past: repairHistory(history?.past),
        future: repairHistory(history?.future),
        lastCoalesceKey: null,
      })
    },

    closeProject: () => {
      // Drop the project key from the URL.
      if (window.location.hash.startsWith('#/app/')) window.location.hash = '/app'
      set({ directoryHandle: null, projectName: null, saveState: 'idle' })
    },

    setSaveState: (saveState) =>
      set(saveState === 'saved' ? { saveState, lastSavedAt: Date.now() } : { saveState }),
    lastSavedAt: null,

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
        const lesson = findContainer(c, lessonId)
        if (!lesson) return
        if (atIndex == null || atIndex >= lesson.blocks.length) {
          lesson.blocks.push(block)
        } else {
          lesson.blocks.splice(Math.max(0, atIndex), 0, block)
        }
      })
      set({ selectedBlockId: block.id })
    },

    insertBlocks: (lessonId, blocks, atIndex) => {
      if (blocks.length === 0) return
      mutate((c) => {
        const lesson = findContainer(c, lessonId)
        if (!lesson) return
        const at = atIndex == null ? lesson.blocks.length : Math.max(0, Math.min(atIndex, lesson.blocks.length))
        lesson.blocks.splice(at, 0, ...blocks)
      })
      set({ selectedBlockId: blocks[0].id })
    },

    updateBlockData: (lessonId, blockId, data, coalesceKey) =>
      mutate((c) => {
        const lesson = findContainer(c, lessonId)
        const block = lesson?.blocks.find((b) => b.id === blockId)
        if (block) Object.assign(block.data, data)
      }, coalesceKey),

    updateBlockSettings: (lessonId, blockId, settings) =>
      mutate((c) => {
        const lesson = findContainer(c, lessonId)
        const block = lesson?.blocks.find((b) => b.id === blockId)
        if (block) Object.assign(block.settings, settings)
      }),

    deleteBlock: (lessonId, blockId) => {
      mutate((c) => {
        const lesson = findContainer(c, lessonId)
        if (lesson) lesson.blocks = lesson.blocks.filter((b) => b.id !== blockId)
      })
      if (get().selectedBlockId === blockId) set({ selectedBlockId: null })
    },

    duplicateBlock: (lessonId, blockId) => {
      const clonedId = uid('block')
      mutate((c) => {
        const lesson = findContainer(c, lessonId)
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
        const lesson = findContainer(c, lessonId)
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
