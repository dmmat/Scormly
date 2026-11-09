import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useCourseStore, INTRO_ID } from '../../store/courseStore'
import { deleteReplyWithUndo, deleteThreadWithUndo, useReviewStore } from '../../store/reviewStore'
import { commentAuthors } from '../../lib/comments'
import type { Block, Course } from '../../types/course'
import type { ReviewComment, ReviewThread } from '../../types/review'
import { useLang, useT } from '../../i18n/I18nProvider'
import BlockIcon from '../../blocks/BlockIcon'
import { KEYS, MOD } from '../../lib/keyboard'
import { Avatar, CommentIcon } from './reviewUi'
import { FAQ_AI_COMMENTS, useHelpStore } from '../../help/helpStore'

// The comments panel (review mode): threads on the blocks of the open page or
// of the whole course, replies, resolve / reopen, and who is commenting. Sits
// right of the canvas; on a phone it slides over it.

interface BlockPlace {
  block: Block
  pageId: string
  pageTitle: string
  /** Order of pages (-1: the cover page) and of the block on its page. */
  pageIndex: number
  index: number
}

function placeBlocks(course: Course, introTitle: string): Map<string, BlockPlace> {
  const map = new Map<string, BlockPlace>()
  for (const [index, block] of (course.intro?.blocks ?? []).entries()) {
    map.set(block.id, { block, pageId: INTRO_ID, pageTitle: introTitle, pageIndex: -1, index })
  }
  course.lessons.forEach((lesson, pageIndex) =>
    lesson.blocks.forEach((block, index) =>
      map.set(block.id, { block, pageId: lesson.id, pageTitle: lesson.title, pageIndex, index }),
    ),
  )
  return map
}

// A line of the block's own text, to tell blocks of the same type apart.
const TEXT_KEYS = ['text', 'html', 'title', 'prompt', 'question', 'caption', 'alt', 'label', 'name']

function plain(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstText(value: unknown, depth = 0): string {
  if (depth > 4 || !value || typeof value !== 'object') return ''
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = typeof item === 'string' ? plain(item) : firstText(item, depth + 1)
      if (text) return text
    }
    return ''
  }
  const obj = value as Record<string, unknown>
  for (const key of TEXT_KEYS) {
    const v = obj[key]
    if (typeof v === 'string' && plain(v)) return plain(v)
  }
  for (const v of Object.values(obj)) {
    const text = firstText(v, depth + 1)
    if (text) return text
  }
  return ''
}

function relativeTime(iso: string, lang: string): string {
  const diff = (Date.parse(iso) - Date.now()) / 1000
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  if (abs < 45) return rtf.format(0, 'second')
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), 'day')
  const date = new Date(iso)
  return date.toLocaleDateString(lang, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

const fullTime = (iso: string, lang: string) =>
  new Date(iso).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' })

function goToBlock(place: BlockPlace) {
  const s = useCourseStore.getState()
  if (s.activeLessonId !== place.pageId) s.setActiveLesson(place.pageId)
  s.selectBlock(place.block.id)
  // The panel covers the page on a phone: get out of the way.
  if (window.matchMedia('(max-width: 767px)').matches) useReviewStore.getState().setPanelOpen(false)
  requestAnimationFrame(() =>
    document
      .querySelector(`[data-block-id="${CSS.escape(place.block.id)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
  )
}

export default function ReviewPanel() {
  const open = useReviewStore((s) => s.panelOpen)
  return open ? <Panel /> : null
}

function Panel() {
  const { t } = useT('review')
  const { t: td } = useT('design')
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const selectedBlockId = useCourseStore((s) => s.selectedBlockId)
  const threads = useReviewStore((s) => s.threads)
  const reviewer = useReviewStore((s) => s.reviewer)
  const scope = useReviewStore((s) => s.scope)
  const showResolved = useReviewStore((s) => s.showResolved)
  const draftBlockId = useReviewStore((s) => s.draftBlockId)
  const focusThreadId = useReviewStore((s) => s.focusThreadId)
  const { setPanelOpen, setScope, setShowResolved, addThread, cancelDraft } = useReviewStore.getState()
  const introTitle = td('introLabel')
  const places = useMemo(() => placeBlocks(course, introTitle), [course, introTitle])

  const inScope = threads.filter((th) => scope === 'course' || places.get(th.blockId)?.pageId === activeLessonId)
  const resolvedCount = inScope.filter((th) => th.resolved).length
  const openTotal = threads.filter((th) => !th.resolved).length
  const visible = inScope
    .filter((th) => showResolved || !th.resolved)
    .sort((a, b) => {
      const pa = places.get(a.blockId)
      const pb = places.get(b.blockId)
      if (!pa || !pb) return pa ? -1 : pb ? 1 : 0
      return pa.pageIndex - pb.pageIndex || pa.index - pb.index || a.comments[0].createdAt.localeCompare(b.comments[0].createdAt)
    })

  // Whole course: a heading per page, deleted blocks last.
  const groups: { key: string; title: string; items: ReviewThread[] }[] = []
  for (const th of visible) {
    const place = places.get(th.blockId)
    const key = scope === 'page' ? 'page' : (place?.pageId ?? '')
    let group = groups[groups.length - 1]
    if (group?.key !== key) {
      group = { key, title: place ? place.pageTitle : t('deletedBlocks'), items: [] }
      groups.push(group)
    }
    group.items.push(th)
  }

  // Bring the thread asked for (a block's badge) or the selected block's
  // first thread into view.
  useEffect(() => {
    const id = focusThreadId ?? visible.find((th) => th.blockId === selectedBlockId)?.id
    if (id) document.getElementById(`thread-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    // Only when the target changes, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusThreadId, selectedBlockId])

  const segment = (on: boolean) =>
    `rounded-md px-2.5 py-1 transition-colors ${on ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setPanelOpen(false)} />
      <aside
        data-review-panel
        aria-labelledby="review-title"
        className="fixed inset-y-0 right-0 z-40 flex w-[min(24rem,100vw)] flex-col border-l border-gray-200/80 bg-[#fbfbfc] shadow-xl md:static md:z-auto md:w-80 md:shadow-none xl:w-96"
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5">
          <CommentIcon className="h-4 w-4 text-gray-500" />
          <h2 id="review-title" className="text-sm font-semibold text-gray-900">
            {t('title')}
          </h2>
          {openTotal > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 text-xs font-semibold tabular-nums text-amber-900">
              {openTotal}
            </span>
          )}
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label={t('close')}
            title={t('close')}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <Identity />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 px-3 py-2">
          <div role="group" aria-label={t('scope')} className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
            <button type="button" aria-pressed={scope === 'page'} onClick={() => setScope('page')} className={segment(scope === 'page')}>
              {activeLessonId === INTRO_ID ? introTitle : t('scopePage')}
            </button>
            <button type="button" aria-pressed={scope === 'course'} onClick={() => setScope('course')} className={segment(scope === 'course')}>
              {t('scopeCourse')}
            </button>
          </div>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--color-brand)]"
            />
            {t('showResolved', { n: resolvedCount })}
          </label>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {draftBlockId &&
            (reviewer ? (
              <section
                aria-label={t('newComment')}
                className="rounded-xl border border-brand/40 bg-white p-3 shadow-sm ring-2 ring-brand/15"
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-dark">{t('newComment')}</p>
                <BlockChip place={places.get(draftBlockId)} />
                <Composer
                  key={draftBlockId}
                  autoFocus
                  placeholder={t('placeholder')}
                  submitLabel={t('post')}
                  onSubmit={(text) => addThread(draftBlockId, text)}
                  onCancel={cancelDraft}
                />
              </section>
            ) : (
              <p className="px-1 text-xs text-gray-500">{t('nameFirst')}</p>
            ))}

          {groups.map((group) => (
            <section key={group.key} aria-label={scope === 'course' ? group.title : undefined} className="space-y-3">
              {scope === 'course' && (
                <h3 className="truncate px-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  {group.title}
                </h3>
              )}
              {group.items.map((th) => (
                <ThreadCard
                  key={th.id}
                  thread={th}
                  place={places.get(th.blockId)}
                  highlighted={th.id === focusThreadId || th.blockId === selectedBlockId}
                />
              ))}
            </section>
          ))}

          {!visible.length && !draftBlockId && (
            <div className="px-3 py-8 text-center">
              <CommentIcon className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                {inScope.length ? t('emptyResolved') : t('empty')}
              </p>
              {!inScope.length && (
                <p className="mx-auto mt-1.5 max-w-[16rem] text-xs leading-relaxed text-gray-500">
                  {t('emptyHint', { key: KEYS.comment })}
                </p>
              )}
            </div>
          )}
        </div>

        {openTotal > 0 && (
          <p className="border-t border-gray-200 px-4 py-2.5 text-xs leading-relaxed text-gray-500">
            {t('aiHint')}{' '}
            <button
              type="button"
              onClick={() => useHelpStore.getState().openDialog('faq', FAQ_AI_COMMENTS)}
              className="font-medium text-brand-dark underline-offset-2 hover:underline"
            >
              {t('aiHintLink')}
            </button>
          </p>
        )}
      </aside>
    </>
  )
}

// "Commenting as …" — or, until there is a name, the form asking for one.
function Identity() {
  const { t } = useT('review')
  const reviewer = useReviewStore((s) => s.reviewer)
  const [editing, setEditing] = useState(false)
  if (!reviewer || editing) return <NameForm canCancel={!!reviewer} onDone={() => setEditing(false)} />
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2 text-sm">
      <Avatar name={reviewer} small />
      <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
        {t('commentingAs')} <strong className="font-semibold text-gray-900">{reviewer}</strong>
      </span>
      <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-dark hover:underline">
        {t('change')}
      </button>
    </div>
  )
}

function NameForm({ canCancel, onDone }: { canCancel: boolean; onDone: () => void }) {
  const { t } = useT('review')
  const reviewer = useReviewStore((s) => s.reviewer)
  const threads = useReviewStore((s) => s.threads)
  const setReviewer = useReviewStore((s) => s.setReviewer)
  const [name, setName] = useState(reviewer)
  const inputId = useId()
  const authors = commentAuthors(threads).filter((a) => a !== reviewer)
  const choose = (value: string) => {
    if (!value.trim()) return
    setReviewer(value)
    onDone()
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        choose(name)
      }}
      className="m-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4"
    >
      <h3 className="text-sm font-semibold text-gray-900">{t('whoTitle')}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{t('whoHint')}</p>
      <label htmlFor={inputId} className="mt-3 block text-xs font-medium text-gray-700">
        {t('nameLabel')}
      </label>
      <input
        id={inputId}
        autoFocus
        value={name}
        maxLength={60}
        autoComplete="name"
        placeholder={t('namePlaceholder')}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      {authors.length > 0 && (
        <>
          <p className="mt-3 text-xs text-gray-600">{t('pickName')}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {authors.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => choose(a)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-white py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-gray-700 hover:border-brand/50 hover:text-gray-900"
              >
                <Avatar name={a} small />
                <span className="truncate">{a}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="mt-4 flex justify-end gap-2">
        {canCancel && (
          <button type="button" onClick={onDone} className="rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-white">
            {t('cancel')}
          </button>
        )}
        <button type="submit" disabled={!name.trim()} className="btn-primary px-3 py-1 text-xs">
          {t('continue')}
        </button>
      </div>
    </form>
  )
}

function BlockChip({ place }: { place: BlockPlace | undefined }) {
  const { t } = useT('review')
  const { t: tb } = useT('blocks')
  if (!place) {
    return (
      <p className="mb-2 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500" title={t('deletedHint')}>
        {t('deletedBlock')}
        <span className="sr-only">. {t('deletedHint')}</span>
      </p>
    )
  }
  const snippet = firstText(place.block.data)
  return (
    <button
      type="button"
      onClick={() => goToBlock(place)}
      title={t('showBlock')}
      className="mb-2 flex w-full min-w-0 items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-left text-xs text-gray-600 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand"
    >
      <BlockIcon type={place.block.type} className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className="shrink-0 font-medium text-gray-700">{tb(place.block.type)}</span>
      {snippet && <span className="min-w-0 truncate text-gray-500">· {snippet}</span>}
    </button>
  )
}

function ThreadCard({ thread, place, highlighted }: { thread: ReviewThread; place: BlockPlace | undefined; highlighted: boolean }) {
  const { t } = useT('review')
  const reviewer = useReviewStore((s) => s.reviewer)
  const { reply, setResolved, editComment } = useReviewStore.getState()
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <article
      id={`thread-${thread.id}`}
      aria-label={`${thread.comments[0].author}: ${thread.comments[0].text.slice(0, 80)}`}
      className={`scroll-my-3 rounded-xl border bg-white p-3 shadow-sm transition-shadow ${
        highlighted ? 'border-amber-300 ring-2 ring-amber-200' : 'border-gray-200'
      }`}
    >
      <BlockChip place={place} />
      {thread.resolved && (
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
          ✓ {thread.resolvedBy ? t('resolvedBy', { name: thread.resolvedBy }) : t('resolved')}
        </p>
      )}
      <ol className={`space-y-3 ${thread.resolved ? 'opacity-70' : ''}`}>
        {thread.comments.map((c, i) => (
          <li key={c.id}>
            <CommentView
              comment={c}
              own={!!reviewer && c.author === reviewer}
              editing={editingId === c.id}
              onStartEdit={() => setEditingId(c.id)}
              onStopEdit={() => setEditingId(null)}
              onSave={(text) => {
                editComment(thread.id, c.id, text)
                setEditingId(null)
              }}
              onDelete={i === 0 ? undefined : () => deleteReplyWithUndo(thread.id, c.id)}
            />
          </li>
        ))}
      </ol>
      {reviewer && !thread.resolved && (
        <div className="mt-3">
          <Composer collapsible placeholder={t('replyPlaceholder')} submitLabel={t('reply')} onSubmit={(text) => reply(thread.id, text)} />
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-1 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => setResolved(thread.id, !thread.resolved)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            thread.resolved ? 'text-gray-600 hover:bg-gray-100' : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {thread.resolved ? t('reopen') : `✓ ${t('resolve')}`}
        </button>
        <button
          type="button"
          onClick={() => deleteThreadWithUndo(thread.id)}
          aria-label={t('deleteThread')}
          title={t('deleteThread')}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
          </svg>
        </button>
      </div>
    </article>
  )
}

interface CommentViewProps {
  comment: ReviewComment
  own: boolean
  editing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onSave: (text: string) => void
  /** Replies only: the first comment goes with its whole thread. */
  onDelete?: () => void
}

function CommentView({ comment, own, editing, onStartEdit, onStopEdit, onSave, onDelete }: CommentViewProps) {
  const { t } = useT('review')
  const { lang } = useLang()
  return (
    <div className="flex gap-2.5">
      <Avatar name={comment.author} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
          <span className="font-semibold text-gray-900">{comment.author || '—'}</span>
          {own && <span className="text-gray-400">({t('you')})</span>}
          <time dateTime={comment.createdAt} title={fullTime(comment.createdAt, lang)} className="text-gray-400">
            {relativeTime(comment.createdAt, lang)}
          </time>
          {comment.editedAt && (
            <span className="text-gray-400" title={fullTime(comment.editedAt, lang)}>
              · {t('edited')}
            </span>
          )}
        </p>
        {editing ? (
          <div className="mt-1">
            <Composer autoFocus initial={comment.text} placeholder={t('placeholder')} submitLabel={t('save')} onSubmit={onSave} onCancel={onStopEdit} />
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-snug text-gray-800">{comment.text}</p>
        )}
        {own && !editing && (
          <div className="mt-1 flex gap-3 text-[11px] font-medium text-gray-500">
            <button type="button" onClick={onStartEdit} className="hover:text-gray-800">
              {t('edit')}
            </button>
            {onDelete && (
              <button type="button" onClick={onDelete} className="hover:text-red-600">
                {t('delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface ComposerProps {
  placeholder: string
  submitLabel: string
  onSubmit: (text: string) => void
  onCancel?: () => void
  initial?: string
  autoFocus?: boolean
  /** A reply box: its buttons show once it's in use. */
  collapsible?: boolean
}

// A growing text box; Ctrl/⌘+Enter sends, Esc cancels.
function Composer({ placeholder, submitLabel, onSubmit, onCancel, initial = '', autoFocus, collapsible }: ComposerProps) {
  const { t } = useT('review')
  const [text, setText] = useState(initial)
  const [active, setActive] = useState(!collapsible)
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    // scrollHeight leaves out the border: add it, or a scrollbar shows up.
    const full = el.scrollHeight + el.offsetHeight - el.clientHeight
    el.style.height = `${Math.min(full, 240)}px`
    el.style.overflowY = full > 240 ? 'auto' : 'hidden'
  }, [text])

  useEffect(() => {
    // Editing: start at the end of the text.
    const el = ref.current
    if (autoFocus && el) el.setSelectionRange(el.value.length, el.value.length)
  }, [autoFocus])

  function cancel() {
    setText(initial)
    if (collapsible) setActive(false)
    onCancel?.()
  }
  function submit() {
    if (!text.trim()) return
    onSubmit(text)
    setText('')
    if (collapsible) setActive(false)
  }

  return (
    <div>
      <textarea
        ref={ref}
        rows={1}
        autoFocus={autoFocus}
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onFocus={() => setActive(true)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
            if (collapsible) e.currentTarget.blur()
          }
        }}
        className="block w-full resize-none rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm leading-snug text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      {active && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="mr-auto text-[11px] text-gray-400">{t('sendHint', { key: `${MOD}+Enter` })}</span>
          <button type="button" onClick={cancel} className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
            {t('cancel')}
          </button>
          <button type="button" disabled={!text.trim()} onClick={submit} className="btn-primary px-2.5 py-1 text-xs">
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  )
}
