import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore } from '../../store/courseStore'
import type { Lesson } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'

export default function Sidebar() {
  const course = useCourseStore((s) => s.course)
  const addLesson = useCourseStore((s) => s.addLesson)
  const moveLesson = useCourseStore((s) => s.moveLesson)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const { t } = useT('common')
  const [editingId, setEditingId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const from = course.lessons.findIndex((l) => l.id === e.active.id)
    const to = course.lessons.findIndex((l) => l.id === e.over!.id)
    if (from !== -1 && to !== -1) moveLesson(from, to)
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('course')}
        </p>
        <input
          value={course.title}
          aria-label={t('courseTitle')}
          onChange={(e) => updateCourseMeta({ title: e.target.value })}
          className="w-full truncate rounded bg-transparent text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:ring-1 focus:ring-brand"
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={course.lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {course.lessons.map((lesson, index) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  editing={editingId === lesson.id}
                  onStartEdit={() => setEditingId(lesson.id)}
                  onStopEdit={() => setEditingId(null)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </nav>

      <div className="border-t border-gray-200 p-2">
        <button
          type="button"
          onClick={addLesson}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:border-brand hover:text-brand"
        >
          + {t('addLesson')}
        </button>
      </div>
    </aside>
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
  const renameLesson = useCourseStore((s) => s.renameLesson)
  const deleteLesson = useCourseStore((s) => s.deleteLesson)
  const { t } = useT('common')
  const isActive = lesson.id === activeLessonId

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
        onClick={() => setActiveLesson(lesson.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
          isActive
            ? 'bg-brand/10 font-medium text-brand-dark'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <button
          type="button"
          aria-label={t('drag')}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className={`flex h-5 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-xs ${
            isActive ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {index + 1}
        </button>

        {editing ? (
          <input
            autoFocus
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

        {!editing && (
          <span className="flex shrink-0 items-center opacity-0 group-hover:opacity-100">
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
                deleteLesson(lesson.id)
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </span>
        )}
      </div>
    </li>
  )
}
