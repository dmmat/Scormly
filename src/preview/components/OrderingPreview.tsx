import { Children, useState, type ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PreviewProps } from '../types'
import type { OrderingItem } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { scoreCategories, scoreSequence, shuffledOrder } from '../../blocks/ordering'
import ScoreResult from './ScoreResult'
import { useMarkDone } from '../progress'
import ResultMark from './ResultMark'
import SequenceList, { currentOrder } from './SequenceList'

// Droppable id of the "not sorted yet" pool in categories mode.
const POOL = '__pool__'

export default function OrderingPreview({ block }: PreviewProps<'ordering'>) {
  const { t } = useT('assessment')
  const { mode, prompt, items, categories, passingScore, showAnswers = true } = block.data
  const ids = items.map((it) => it.id)
  const [order, setOrder] = useState<string[]>(() => shuffledOrder(ids))
  const [assigned, setAssigned] = useState<Record<string, string | undefined>>({})
  const [submitted, setSubmitted] = useState(false)
  const markDone = useMarkDone()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const byId = new Map(items.map((it) => [it.id, it]))
  const learnerOrder = currentOrder(order, ids)
  const score =
    mode === 'sequence' ? scoreSequence(items, learnerOrder) : scoreCategories(items, assigned)
  const reveal = submitted && showAnswers

  function retry() {
    setOrder(shuffledOrder(ids))
    setAssigned({})
    setSubmitted(false)
  }

  function onCategoryDrop(e: DragEndEvent) {
    if (!e.over) return
    const target = String(e.over.id)
    setAssigned((a) => ({ ...a, [String(e.active.id)]: target === POOL ? undefined : target }))
  }

  function correctNote(it: OrderingItem): string | undefined {
    const right = categories.find((c) => c.id === it.categoryId)
    return right ? t('correctCategory', { c: right.title }) : undefined
  }

  const rowTone = (ok: boolean) =>
    reveal ? (ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-gray-200/90 bg-white'

  return (
    <div className="space-y-4">
      {prompt && <p className="font-medium text-gray-900">{prompt}</p>}
      {!submitted && (
        <p className="text-sm text-gray-500">
          {t(mode === 'sequence' ? 'sequenceHint' : 'categoriesHint')}
        </p>
      )}

      {mode === 'sequence' ? (
        <SequenceList items={items} order={learnerOrder} onChange={setOrder} submitted={submitted} reveal={reveal} />
      ) : (
        <DndContext sensors={sensors} onDragEnd={onCategoryDrop}>
          <div className="space-y-3">
            <Bin id={POOL} title={t('unsorted')} disabled={submitted}>
              {learnerOrder
                .filter((id) => !categories.some((c) => c.id === assigned[id]))
                .map((id) => {
                  const it = byId.get(id)!
                  return (
                    <ItemChip
                      key={id}
                      item={it}
                      categories={categories}
                      value={undefined}
                      disabled={submitted}
                      tone={rowTone(false)}
                      ok={reveal ? false : undefined}
                      note={reveal ? correctNote(it) : undefined}
                      onChange={(c) => setAssigned((a) => ({ ...a, [id]: c }))}
                    />
                  )
                })}
            </Bin>
            <div className={`grid gap-3 sm:grid-cols-2 ${categories.length > 2 ? 'lg:grid-cols-3' : ''}`}>
              {categories.map((cat) => (
                <Bin key={cat.id} id={cat.id} title={cat.title} disabled={submitted}>
                  {learnerOrder
                    .filter((id) => assigned[id] === cat.id)
                    .map((id) => {
                      const it = byId.get(id)!
                      const ok = it.categoryId === cat.id
                      return (
                        <ItemChip
                          key={id}
                          item={it}
                          categories={categories}
                          value={cat.id}
                          disabled={submitted}
                          tone={rowTone(ok)}
                          ok={reveal ? ok : undefined}
                          note={reveal && !ok ? correctNote(it) : undefined}
                          onChange={(c) => setAssigned((a) => ({ ...a, [id]: c }))}
                        />
                      )
                    })}
                </Bin>
              ))}
            </div>
          </div>
        </DndContext>
      )}

      <ScoreResult
        submitted={submitted}
        score={score}
        passingScore={passingScore}
        onSubmit={() => {
          setSubmitted(true)
          markDone(block.id)
        }}
        onRetry={retry}
      />
    </div>
  )
}

function Bin({
  id,
  title,
  disabled,
  children,
}: {
  id: string
  title: string
  disabled: boolean
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled })
  return (
    <div
      ref={setNodeRef}
      role="group"
      aria-label={title}
      className={`min-h-24 rounded-2xl border-2 p-3 transition-all duration-200 ${
        isOver
          ? 'scale-[1.01] border-brand bg-brand/5 shadow-lg shadow-brand/10'
          : 'border-dashed border-gray-200 bg-gray-50/70'
      }`}
    >
      <p className="mb-2.5 flex items-center justify-between gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>{title}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tabular-nums text-gray-500 ring-1 ring-gray-200">
          {Children.count(children)}
        </span>
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function ItemChip({
  item,
  categories,
  value,
  disabled,
  tone,
  ok,
  note,
  onChange,
}: {
  item: OrderingItem
  categories: { id: string; title: string }[]
  value: string | undefined
  disabled: boolean
  tone: string
  /** Revealed correctness (undefined = not revealed). */
  ok?: boolean
  note?: string
  onChange: (categoryId: string | undefined) => void
}) {
  const { t } = useT('assessment')
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled,
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
      className={`flex flex-wrap items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-shadow ${tone} ${
        isDragging ? 'rotate-1 shadow-2xl ring-2 ring-brand/40' : 'shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:shadow-md'
      }`}
    >
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t('dragItem')}
          className="flex h-8 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
      )}
      {ok !== undefined && <ResultMark ok={ok} />}
      <span className="min-w-0 flex-1 text-gray-800">{item.text}</span>
      {note && <span className="text-xs text-gray-500">{note}</span>}
      <select
        value={value ?? ''}
        disabled={disabled}
        aria-label={`${t('chooseCategory')}: ${item.text}`}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="sc-select max-w-full text-sm"
      >
        <option value="">—</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  )
}
