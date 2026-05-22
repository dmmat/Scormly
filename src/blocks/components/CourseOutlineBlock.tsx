import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

// Lists the course's lessons as navigable links. The lesson list is derived
// live from the store (not stored in the block), so it always stays in sync as
// lessons are added, removed or reordered. In the editor a click jumps to the
// lesson; in the player/preview it navigates the learner there.
export default function CourseOutlineBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'courseOutline'>>) {
  const lessons = useCourseStore((s) => s.course.lessons)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('blocks')
  const { title, numbered } = block.data

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={title}
            onChange={(e) =>
              update(lessonId, block.id, { title: e.target.value }, `outline-title-${block.id}`)
            }
            placeholder={t('outlineTitlePlaceholder')}
            className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={numbered}
              onChange={(e) => update(lessonId, block.id, { numbered: e.target.checked })}
            />
            {t('outlineNumbered')}
          </label>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        {title && (
          <p className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700">
            {title}
          </p>
        )}
        <ol className="divide-y divide-gray-100">
          {/* The current lesson is excluded — it only links to the others. */}
          {lessons
            .filter((lesson) => lesson.id !== lessonId)
            .map((lesson, i) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  // First click selects the block (lets the event bubble to
                  // BlockShell); once selected, a click navigates to the lesson.
                  onClick={() => {
                    if (selected) setActiveLesson(lesson.id)
                  }}
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
    </div>
  )
}
