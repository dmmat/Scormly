import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore, INTRO_ID } from '../../store/courseStore'
import { deleteLessonWithUndo, deleteUnitWithUndo } from '../../lib/deleteWithUndo'
import type { Lesson, Unit } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { CommentIcon, useOpenComments } from '../review/reviewUi'
import ContextMenu, { type ContextMenuItem } from '../editor/ContextMenu'
import { hasUnits, lessonGroups, lessonNumber, unitTitle } from '../../lib/units'

// Sortable ids of unit headers (lessons can be dropped on them).
const UNIT_PREFIX = 'unit:'

export default function Sidebar() {
  const course = useCourseStore((s) => s.course)
  const addLesson = useCourseStore((s) => s.addLesson)
  const addUnit = useCourseStore((s) => s.addUnit)
  const dropLesson = useCourseStore((s) => s.dropLesson)
  const setLessonUnit = useCourseStore((s) => s.setLessonUnit)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const sidebarOpen = useCourseStore((s) => s.sidebarOpen)
  const setSidebarOpen = useCourseStore((s) => s.setSidebarOpen)
  const setSettingsOpen = useCourseStore((s) => s.setSettingsOpen)
  const { t } = useT('common')
  const { t: ts } = useT('settings')
  // The lesson or unit whose title is being edited.
  const [editingId, setEditingId] = useState<string | null>(null)
  const grouped = hasUnits(course)
  const groups = lessonGroups(course)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Focus a drag handle, Space to pick up, arrows to move, Space to drop.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!sidebarOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, setSidebarOpen])

  // Sortable ids in display order (unit headers before their lessons).
  const items = groups.flatMap((g) => [
    ...(g.unit ? [UNIT_PREFIX + g.unit.id] : []),
    ...g.lessons.map((e) => e.lesson.id),
  ])

  // Dropped on a lesson: its place (and unit). On a unit header, where the
  // list showed it: coming from above, the unit's first lesson; from below
  // (the header slid down past it), the last lesson of the group above.
  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const lessonId = String(e.active.id)
    const over = String(e.over.id)
    if (!over.startsWith(UNIT_PREFIX)) return dropLesson(lessonId, { lessonId: over })
    const unitId = over.slice(UNIT_PREFIX.length)
    if (items.indexOf(lessonId) < items.indexOf(over)) return dropLesson(lessonId, { unitId })
    const k = course.units?.findIndex((u) => u.id === unitId) ?? -1
    if (k >= 0) setLessonUnit(lessonId, k > 0 ? course.units![k - 1].id : null)
  }

  function lessonRow(lesson: Lesson, index: number) {
    return (
      <SortableLesson
        key={lesson.id}
        lesson={lesson}
        index={index}
        editing={editingId === lesson.id}
        onStartEdit={() => setEditingId(lesson.id)}
        onStopEdit={() => setEditingId(null)}
      />
    )
  }

  return (
    <>
      {/* Backdrop for the mobile drawer. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        data-tour="lessons"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200/80 bg-[#fbfbfc] transition-transform md:static md:z-auto md:w-64 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('course')}
        </p>
        <input
          value={course.title}
          aria-label={t('courseTitle')}
          placeholder={ts('titlePlaceholder')}
          onChange={(e) => updateCourseMeta({ title: e.target.value })}
          className="w-full truncate rounded bg-transparent text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:ring-1 focus:ring-brand"
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <IntroRow />
        <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          {t('lessons')}
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {course.lessons.length === 0 && !grouped && (
              <p className="px-2 py-6 text-center text-xs text-gray-400">{t('noLessons')}</p>
            )}
            <ul className="space-y-1">
              {groups.map((g) =>
                g.unit ? (
                  <Fragment key={g.unit.id}>
                    <UnitHeader
                      unit={g.unit}
                      number={g.number}
                      empty={g.lessons.length === 0}
                      editing={editingId === g.unit.id}
                      onStartEdit={() => setEditingId(g.unit!.id)}
                      onStopEdit={() => setEditingId(null)}
                      onAddLesson={() => {
                        addLesson(g.unit!.id)
                        setEditingId(useCourseStore.getState().activeLessonId)
                      }}
                    />
                    {g.lessons.map((e) => lessonRow(e.lesson, e.index))}
                  </Fragment>
                ) : (
                  g.lessons.map((e) => lessonRow(e.lesson, e.index))
                ),
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </nav>

      <div className="space-y-1 border-t border-gray-200 p-2">
        <button
          type="button"
          onClick={() => {
            addLesson()
            // Name the new lesson right away instead of leaving "Lesson N".
            setEditingId(useCourseStore.getState().activeLessonId)
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:border-brand hover:text-brand"
        >
          + {t('addLesson')}
        </button>
        <button
          type="button"
          title={t('addUnitHelp')}
          onClick={() => setEditingId(addUnit())}
          className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          + {t('addUnit')}
        </button>
        <button
          type="button"
          data-tour="settings"
          onClick={() => {
            setSettingsOpen(true)
            setSidebarOpen(false)
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <span aria-hidden className="text-base leading-none">⚙</span>
          {ts('open')}
        </button>
      </div>
      </aside>
    </>
  )
}

interface SortableLessonProps {
  lesson: Lesson
  index: number
  editing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
}

function SortableLesson({
  lesson,
  index,
  editing,
  onStartEdit,
  onStopEdit,
}: SortableLessonProps) {
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const setSidebarOpen = useCourseStore((s) => s.setSidebarOpen)
  const renameLesson = useCourseStore((s) => s.renameLesson)
  const moveLessonStep = useCourseStore((s) => s.moveLessonStep)
  const course = useCourseStore((s) => s.course)
  const setLessonUnit = useCourseStore((s) => s.setLessonUnit)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const { t } = useT('common')
  const { t: td } = useT('design')
  const grouped = hasUnits(course)
  const { t: tr } = useT('review')
  const isActive = lesson.id === activeLessonId
  const blockCount = lesson.blocks.length
  const openComments = useOpenComments(lesson.blocks.map((b) => b.id))

  function open() {
    setActiveLesson(lesson.id)
    setSidebarOpen(false)
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <li ref={setNodeRef} style={style} className="group relative">
      <div
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
        onClick={open}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          } else if (e.key === 'F2') {
            e.preventDefault()
            onStartEdit()
          } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault()
            moveLessonStep(lesson.id, e.key === 'ArrowUp' ? -1 : 1)
            // The row re-renders in its new slot; keep keyboard focus on it.
            const row = e.currentTarget
            requestAnimationFrame(() => row.focus())
          }
        }}
        onContextMenu={(e) => {
          if (!grouped || editing) return
          e.preventDefault()
          setMenu({ x: e.clientX, y: e.clientY })
        }}
        className={`flex w-full outline-none focus-visible:ring-2 focus-visible:ring-brand items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
          isActive
            ? 'bg-white font-medium text-brand-dark shadow-sm ring-1 ring-gray-200/80'
            : 'text-gray-700 hover:bg-gray-100/80'
        }`}
      >
        <button
          type="button"
          aria-label={t('drag')}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className={`flex h-5 min-w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded px-0.5 text-xs ${
            isActive ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {lessonNumber(course, index)}
        </button>

        {editing ? (
          <input
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            value={lesson.title}
            onChange={(e) => renameLesson(lesson.id, e.target.value)}
            onBlur={onStopEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') onStopEdit()
            }}
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 flex-1 rounded bg-white px-1 text-sm outline-none ring-1 ring-brand"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
            className="min-w-0 flex-1 truncate"
          >
            {lesson.title}
          </span>
        )}

        {!editing && openComments > 0 && (
          <span
            title={tr('lessonOpen', { n: openComments })}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold tabular-nums text-amber-900"
          >
            <CommentIcon className="h-3 w-3" />
            <span aria-hidden>{openComments}</span>
            <span className="sr-only">{tr('lessonOpen', { n: openComments })}</span>
          </span>
        )}
        {!editing && (
          // Count and actions share one grid cell and only toggle visibility,
          // so hovering a row doesn't change its size (no jumping).
          <span className="grid shrink-0 items-center justify-items-end">
            <span
              title={t('blockCount', { n: blockCount })}
              className={`col-start-1 row-start-1 rounded-full px-1.5 text-xs tabular-nums group-hover:invisible group-focus-within:invisible pointer-coarse:invisible ${
                blockCount === 0 ? 'text-gray-300' : isActive ? 'text-brand-dark/60' : 'text-gray-400'
              }`}
            >
              {blockCount === 0 ? t('emptyLessonShort') : blockCount}
            </span>
            <span className="invisible col-start-1 row-start-1 flex items-center group-hover:visible group-focus-within:visible pointer-coarse:visible">
              {grouped && (
                <button
                  type="button"
                  title={t('moveToUnit')}
                  aria-label={t('moveToUnit')}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    const r = e.currentTarget.getBoundingClientRect()
                    setMenu({ x: r.left, y: r.bottom + 4 })
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700"
                >
                  <FolderIcon />
                </button>
              )}
              <button
                type="button"
                title={t('renameLesson')}
                aria-label={t('renameLesson')}
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit()
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700"
              >
                ✎
              </button>
              <button
                type="button"
                title={t('deleteLesson')}
                aria-label={t('deleteLesson')}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteLessonWithUndo(lesson.id)
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          </span>
        )}
      </div>
      {/* In a portal: the drawer's translate would offset a fixed menu. */}
      {menu &&
        createPortal(
          <ContextMenu
            x={menu.x}
            y={menu.y}
            onClose={() => setMenu(null)}
            items={[
              { id: null, label: t('noUnit') },
              ...(course.units ?? []).map((u, k) => ({
                id: u.id,
                label: unitTitle(course, u, k + 1, td),
              })),
            ].map(({ id, label }): ContextMenuItem => ({
              label,
              icon: (lesson.unitId ?? null) === id ? '✓' : undefined,
              disabled: (lesson.unitId ?? null) === id,
              onClick: () => setLessonUnit(lesson.id, id),
            }))}
          />,
          document.body,
        )}
    </li>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" strokeLinejoin="round" />
    </svg>
  )
}

// A unit's header in the lessons list: its label and title (double-click or
// ✎ to rename) and actions. Lessons can be dropped on it (they become its
// first lesson); the header itself is moved with ↑ / ↓.
function UnitHeader({
  unit,
  number,
  empty,
  editing,
  onStartEdit,
  onStopEdit,
  onAddLesson,
}: {
  unit: Unit
  number: number
  empty: boolean
  editing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onAddLesson: () => void
}) {
  const course = useCourseStore((s) => s.course)
  const renameUnit = useCourseStore((s) => s.renameUnit)
  const moveUnit = useCourseStore((s) => s.moveUnit)
  const unitCount = course.units?.length ?? 0
  const { t } = useT('common')
  const { t: td } = useT('design')
  const { setNodeRef, transform, transition, isOver } = useSortable({
    id: UNIT_PREFIX + unit.id,
    disabled: { draggable: true, droppable: false },
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const action = 'flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400'

  return (
    <li ref={setNodeRef} style={style} className="group pt-2">
      <div
        className={`relative flex items-center gap-1 rounded-lg px-2 py-1 ${isOver ? 'bg-brand/10 ring-1 ring-brand/40' : ''}`}
        onDoubleClick={onStartEdit}
      >
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              aria-label={t('unitTitle')}
              onFocus={(e) => e.currentTarget.select()}
              value={unit.title}
              onChange={(e) => renameUnit(unit.id, e.target.value)}
              onBlur={onStopEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') onStopEdit()
              }}
              className="w-full rounded bg-white px-1 text-sm font-semibold outline-none ring-1 ring-brand"
            />
          ) : (
            // Only the title; "Unit 2" in gray while it has none.
            <p className={`truncate text-sm font-semibold ${unit.title.trim() ? 'text-gray-900' : 'text-gray-400'}`}>
              {unitTitle(course, unit, number, td)}
            </p>
          )}
        </div>
        {!editing && (
          // Over the title's end on hover, so a long title isn't cut short.
          <span className="invisible absolute inset-y-0 right-1 flex items-center rounded-lg bg-[#fbfbfc] pl-1 group-hover:visible group-focus-within:visible pointer-coarse:visible">
            <button type="button" title={t('addLessonToUnit')} aria-label={t('addLessonToUnit')} onClick={onAddLesson} className={action}>
              +
            </button>
            <button type="button" title={t('moveUnitUp')} aria-label={t('moveUnitUp')} disabled={number <= 1} onClick={() => moveUnit(unit.id, -1)} className={action}>
              ↑
            </button>
            <button type="button" title={t('moveUnitDown')} aria-label={t('moveUnitDown')} disabled={number >= unitCount} onClick={() => moveUnit(unit.id, 1)} className={action}>
              ↓
            </button>
            <button type="button" title={t('renameUnit')} aria-label={t('renameUnit')} onClick={onStartEdit} className={action}>
              ✎
            </button>
            <button type="button" title={t('deleteUnit')} aria-label={t('deleteUnit')} onClick={() => deleteUnitWithUndo(unit.id)} className={`${action} hover:text-red-600`}>
              ✕
            </button>
          </span>
        )}
      </div>
      {empty && <p className="px-2 pb-1 pt-0.5 text-xs text-gray-400">{t('emptyUnit')}</p>}
    </li>
  )
}

// The course cover page: a separate item above the lessons (not a lesson,
// not draggable, not counted in progress).
function IntroRow() {
  const active = useCourseStore((s) => s.activeLessonId === INTRO_ID)
  const enabled = useCourseStore((s) => s.course.intro?.enabled ?? false)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const setSidebarOpen = useCourseStore((s) => s.setSidebarOpen)
  const { t } = useT('design')
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => {
        setActiveLesson(INTRO_ID)
        setSidebarOpen(false)
      }}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
        active ? 'bg-white font-medium text-brand-dark shadow-sm ring-1 ring-gray-200/80' : 'text-gray-700 hover:bg-gray-100/80'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
          active ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
          <path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-8-4-8 4Z" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1 truncate">{t('introLabel')}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {enabled ? t('on') : t('off')}
      </span>
    </button>
  )
}
