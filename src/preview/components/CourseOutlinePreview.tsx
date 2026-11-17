import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import GroupedLessons from '../GroupedLessons'
import { outlineNumbers } from '../../lib/units'

// Learner-facing course outline: lists lessons as links. A click navigates the
// preview to that lesson via the callback provided by PreviewOverlay.
export default function CourseOutlinePreview({
  block,
  currentLessonId,
  onNavigate,
}: {
  block: BlockOfType<'courseOutline'>
  /** Lesson the outline sits in; excluded from the list. */
  currentLessonId?: string
  onNavigate?: (lessonIndex: number) => void
}) {
  const course = useCourseStore((s) => s.course)
  const { title, numbered } = block.data
  const numbers = outlineNumbers(course, currentLessonId)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {title && (
        <p className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700">
          {title}
        </p>
      )}
      <GroupedLessons
        course={course}
        className="divide-y divide-gray-100"
        headClassName="bg-gray-50/60 px-4 pb-1.5 pt-3"
        filter={({ lesson }) => lesson.id !== currentLessonId}
      >
        {({ lesson, index }) => (
          <li key={lesson.id}>
            <button
              type="button"
              onClick={() => onNavigate?.(index)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-brand/5"
            >
              {numbered && (
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 px-1 text-xs font-semibold text-brand">
                  {numbers.get(lesson.id)}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
              <span aria-hidden className="shrink-0 text-gray-300">
                →
              </span>
            </button>
          </li>
        )}
      </GroupedLessons>
    </div>
  )
}
