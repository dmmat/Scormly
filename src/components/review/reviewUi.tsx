import { useCourseStore } from '../../store/courseStore'
import { useReviewStore } from '../../store/reviewStore'
import { useT } from '../../i18n/I18nProvider'

// Small pieces of the review UI shared by the panel, the block shell, the
// header and the lessons list.

export function CommentIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12a9 9 0 0 1-13 8.1L3 21l.9-5A9 9 0 1 1 21 12Z" />
      <path d="M8 10.5h8M8 14h5" />
    </svg>
  )
}

// Soft tints with dark text (AA contrast), picked from the name so a person
// keeps the same color everywhere.
const TONES = [
  'bg-rose-100 text-rose-800',
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-900',
  'bg-emerald-100 text-emerald-800',
  'bg-violet-100 text-violet-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-900',
  'bg-indigo-100 text-indigo-800',
]

export function Avatar({ name, small }: { name: string; small?: boolean }) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) | 0
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => [...w][0] ?? '')
      .join('')
      .toUpperCase() || '?'
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        small ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 text-[11px]'
      } ${TONES[Math.abs(hash) % TONES.length]}`}
    >
      {initials}
    </span>
  )
}

/** Open (unresolved) threads, in the whole course or on the given blocks. */
export function useOpenComments(blockIds?: string[]): number {
  return useReviewStore((s) => {
    const ids = blockIds && new Set(blockIds)
    return s.threads.filter((t) => !t.resolved && (!ids || ids.has(t.blockId))).length
  })
}

/** The count of a block's open comments, on its right edge; opens them. */
export function CommentBadge({ blockId }: { blockId: string }) {
  const n = useReviewStore((s) => s.threads.filter((t) => t.blockId === blockId && !t.resolved).length)
  const { t } = useT('review')
  if (!n) return null
  return (
    <button
      type="button"
      title={t('badge', { n })}
      aria-label={t('badge', { n })}
      onClick={(e) => {
        e.stopPropagation()
        useCourseStore.getState().selectBlock(blockId)
        useReviewStore.getState().showBlockThreads(blockId)
      }}
      className="absolute -right-3 top-6 z-10 flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold tabular-nums text-amber-900 shadow-sm ring-1 ring-amber-300 transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <CommentIcon className="h-3 w-3" />
      {n}
    </button>
  )
}
