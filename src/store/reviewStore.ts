import { create } from 'zustand'
import type { ReviewComment, ReviewThread } from '../types/review'
import { uid } from '../lib/id'
import { toast } from './toastStore'
import { translate } from '../i18n/I18nProvider'

// Review comments of the open project and the comments panel. Kept out of the
// course store on purpose: comments are saved in their own file
// (lib/comments.ts) and aren't part of the course's undo history — deleting
// one offers its own Undo instead.

const REVIEWER_KEY = 'scormly.reviewer'
const EMPTY: ReviewThread[] = []

function readReviewer(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(REVIEWER_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

/** The panel lists the comments of the open page (lesson or cover) or of the whole course. */
export type ReviewScope = 'page' | 'course'

export interface ReviewState {
  threads: ReviewThread[]
  /** The threads as last written to the project's folder / browser storage;
   *  autosave writes comments.json while they differ. */
  savedThreads: ReviewThread[]
  /** Who is commenting. There are no accounts: it's a name typed (or picked
   *  from the project's commenters) once and kept in this browser. */
  reviewer: string
  panelOpen: boolean
  scope: ReviewScope
  showResolved: boolean
  /** Block a new comment is being written for (the panel shows the editor). */
  draftBlockId: string | null
  /** Thread to bring into view in the panel. */
  focusThreadId: string | null

  /** Another project was opened: no comments until its file is read. */
  reset: () => void
  /** Comments read from the project (they count as saved). */
  loadThreads: (threads: ReviewThread[]) => void
  setThreads: (threads: ReviewThread[]) => void
  markSaved: (threads: ReviewThread[]) => void
  setReviewer: (name: string) => void
  setPanelOpen: (open: boolean) => void
  setScope: (scope: ReviewScope) => void
  setShowResolved: (show: boolean) => void
  /** Open the panel with a new comment for this block. */
  startComment: (blockId: string) => void
  cancelDraft: () => void
  /** Open the panel at this block's first open thread. */
  showBlockThreads: (blockId: string) => void
  addThread: (blockId: string, text: string) => string | null
  reply: (threadId: string, text: string) => void
  editComment: (threadId: string, commentId: string, text: string) => void
  setResolved: (threadId: string, resolved: boolean) => void
}

const now = () => new Date().toISOString()

export const useReviewStore = create<ReviewState>((set, get) => {
  function update(threadId: string, fn: (t: ReviewThread) => ReviewThread) {
    set((s) => ({ threads: s.threads.map((t) => (t.id === threadId ? fn(t) : t)) }))
  }
  function comment(text: string): ReviewComment | null {
    const author = get().reviewer
    const body = text.trim()
    if (!author || !body) return null
    return { id: uid('m'), author, text: body, createdAt: now() }
  }

  return {
    threads: EMPTY,
    savedThreads: EMPTY,
    reviewer: readReviewer(),
    panelOpen: false,
    scope: 'page',
    showResolved: false,
    draftBlockId: null,
    focusThreadId: null,

    reset: () => set({ threads: EMPTY, savedThreads: EMPTY, draftBlockId: null, focusThreadId: null }),
    loadThreads: (threads) => set({ threads, savedThreads: threads }),
    setThreads: (threads) => set({ threads }),
    markSaved: (threads) => set({ savedThreads: threads }),

    setReviewer: (name) => {
      const reviewer = name.trim()
      try {
        if (typeof window !== 'undefined') localStorage.setItem(REVIEWER_KEY, reviewer)
      } catch {
        // Kept for this session only.
      }
      set({ reviewer })
    },
    setPanelOpen: (panelOpen) => set(panelOpen ? { panelOpen } : { panelOpen, draftBlockId: null, focusThreadId: null }),
    setScope: (scope) => set({ scope }),
    setShowResolved: (showResolved) => set({ showResolved }),

    startComment: (blockId) => set({ panelOpen: true, draftBlockId: blockId, focusThreadId: null }),
    cancelDraft: () => set({ draftBlockId: null }),
    showBlockThreads: (blockId) => {
      const threads = get().threads.filter((t) => t.blockId === blockId)
      const first = threads.find((t) => !t.resolved) ?? threads[0]
      set({ panelOpen: true, focusThreadId: first?.id ?? null, ...(first?.resolved ? { showResolved: true } : {}) })
    },

    addThread: (blockId, text) => {
      const c = comment(text)
      if (!c) return null
      const thread: ReviewThread = { id: uid('c'), blockId, resolved: false, updatedAt: c.createdAt, comments: [c] }
      set((s) => ({ threads: [...s.threads, thread], draftBlockId: null, focusThreadId: thread.id }))
      return thread.id
    },
    reply: (threadId, text) => {
      const c = comment(text)
      if (!c) return
      // Answering a resolved discussion opens it again.
      update(threadId, (t) => ({ ...t, resolved: false, resolvedBy: undefined, resolvedAt: undefined, updatedAt: c.createdAt, comments: [...t.comments, c] }))
    },
    editComment: (threadId, commentId, text) => {
      const body = text.trim()
      if (!body) return
      const at = now()
      update(threadId, (t) => ({
        ...t,
        updatedAt: at,
        comments: t.comments.map((c) => (c.id === commentId && c.text !== body ? { ...c, text: body, editedAt: at } : c)),
      }))
    },
    setResolved: (threadId, resolved) => {
      const at = now()
      update(threadId, (t) =>
        resolved
          ? { ...t, resolved, resolvedBy: get().reviewer || undefined, resolvedAt: at, updatedAt: at }
          : { ...t, resolved, resolvedBy: undefined, resolvedAt: undefined, updatedAt: at },
      )
    },
  }
})

// Deleting asks for no confirmation; the toast offers Undo instead (only while
// nothing else changed the comments since).
function removeWithUndo(next: ReviewThread[], messageKey: string) {
  const before = useReviewStore.getState().threads
  useReviewStore.getState().setThreads(next)
  toast({
    message: translate('review', messageKey),
    action: {
      label: translate('common', 'undoAction'),
      onClick: () => {
        const s = useReviewStore.getState()
        if (s.threads === next) s.setThreads(before)
      },
    },
  })
}

export function deleteThreadWithUndo(threadId: string): void {
  const { threads } = useReviewStore.getState()
  removeWithUndo(threads.filter((t) => t.id !== threadId), 'threadDeleted')
}

/** A reply; the first comment goes with its whole thread (deleteThreadWithUndo). */
export function deleteReplyWithUndo(threadId: string, commentId: string): void {
  const { threads } = useReviewStore.getState()
  const at = now()
  removeWithUndo(
    threads.map((t) =>
      t.id === threadId ? { ...t, updatedAt: at, comments: t.comments.filter((c) => c.id !== commentId) } : t,
    ),
    'commentDeleted',
  )
}
