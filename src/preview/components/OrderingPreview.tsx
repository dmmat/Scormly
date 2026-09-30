import { useState, type ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PreviewProps } from '../types'
import type { OrderingItem } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { scoreCategories, scoreSequence, shuffledOrder } from '../../blocks/ordering'
import ScoreResult from './ScoreResult'
import ResultMark from './ResultMark'

// Droppable id of the "not sorted yet" pool in categories mode.
const POOL = '__pool__'

const arrowBtn =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent'

export default function OrderingPreview({ block }: PreviewProps<'ordering'>) {
  const { t } = useT('assessment')
  const { mode, prompt, items, categories, passingScore, showAnswers = true } = block.data
  const ids = items.map((it) => it.id)
  const [order, setOrder] = useState<string[]>(() => shuffledOrder(ids))
  const [assigned, setAssigned] = useState<Record<string, string | undefined>>({})
  const [submitted, setSubmitted] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const byId = new Map(items.map((it) => [it.id, it]))
  // Items added while the preview is open are appended; removed ones dropped.
  const learnerOrder = [
    ...order.filter((id) => byId.has(id)),
    ...ids.filter((id) => !order.includes(id)),
  ]
  const score =
    mode === 'sequence' ? scoreSequence(items, learnerOrder) : scoreCategories(items, assigned)
  const reveal = submitted && showAnswers

  function retry() {
    setOrder(shuffledOrder(ids))
    setAssigned({})
    setSubmitted(false)
  }

  function move(index: number, delta: number) {
    const to = index + delta
    if (to < 0 || to >= learnerOrder.length) return
    setOrder(arrayMove(learnerOrder, index, to))
  }

  function onSortEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const from = learnerOrder.indexOf(String(e.active.id))
    const to = learnerOrder.indexOf(String(e.over.id))
    if (from !== -1 && to !== -1) setOrder(arrayMove(learnerOrder, from, to))
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
    reveal ? (ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-gray-200 bg-white'

  return (
    <div className="space-y-4">
      {prompt && <p className="font-medium text-gray-900">{prompt}</p>}
      {!submitted && (
        <p className="text-sm text-gray-500">
          {t(mode === 'sequence' ? 'sequenceHint' : 'categoriesHint')}
        </p>
      )}

      {mode === 'sequence' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSortEnd}>
          <SortableContext items={learnerOrder} strategy={verticalListSortingStrategy}>
            <ol className="space-y-2">
              {learnerOrder.map((id, i) => {
                const it = byId.get(id)!
                const correctIndex = ids.indexOf(id)
                return (
                  <SortableRow key={id} id={id} disabled={submitted} className={rowTone(correctIndex === i)}>
                    {reveal && <ResultMark ok={correctIndex === i} />}
                    <span className="flex-1 text-gray-800">{it.text}</span>
                    {reveal && correctIndex !== i && (
                      <span className="text-xs text-gray-500">
                        {t('correctPosition', { n: correctIndex + 1 })}
                      </span>
                    )}
                    {!submitted && (
                      <>
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          className={arrowBtn}
                          aria-label={`${t('moveUp')}: ${it.text}`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === learnerOrder.length - 1}
                          className={arrowBtn}
                          aria-label={`${t('moveDown')}: ${it.text}`}
                        >
                          ↓
                        </button>
                      </>
                    )}
                  </SortableRow>
                )
              })}
            </ol>
          </SortableContext>
        </DndContext>
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
            <div className="grid gap-3 sm:grid-cols-2">
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
        onSubmit={() => setSubmitted(true)}
        onRetry={retry}
      />
    </div>
  )
}

function SortableRow({
  id,
  disabled,
  className,
  children,
}: {
  id: string
  disabled: boolean
  className: string
  children: ReactNode
}) {
  const { t } = useT('assessment')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : undefined }}
      className={`flex items-center gap-2 rounded-md border p-2 ${className}`}
    >
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t('dragItem')}
          className="flex h-7 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-gray-400"
        >
          ⠿
        </button>
      )}
      {children}
    </li>
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
      className={`min-h-16 rounded-lg border-2 border-dashed p-3 ${
        isOver ? 'border-brand bg-brand/5' : 'border-gray-200'
      }`}
    >
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">{title}</p>
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
        opacity: isDragging ? 0.6 : undefined,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
      className={`flex flex-wrap items-center gap-2 rounded-md border p-2 ${tone}`}
    >
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t('dragItem')}
          className="flex h-7 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-gray-400"
        >
          ⠿
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
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
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
