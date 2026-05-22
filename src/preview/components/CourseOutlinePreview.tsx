import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'

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
  const lessons = useCourseStore((s) => s.course.lessons)
  const { title, numbered } = block.data
  // Keep the original index for navigation, then drop the current lesson.
  const items = lessons
    .map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => lesson.id !== currentLessonId)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      {title && (
        <p className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700">
          {title}
        </p>
      )}
      <ol className="divide-y divide-gray-100">
        {items.map(({ lesson, index }, i) => (
          <li key={lesson.id}>
            <button
              type="button"
              onClick={() => onNavigate?.(index)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-brand/5"
            >
              {numbered && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                  {i + 1}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
              <span aria-hidden className="shrink-0 text-gray-300">
                →
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
