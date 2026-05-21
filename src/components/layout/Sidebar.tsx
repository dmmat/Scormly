import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function Sidebar() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const addLesson = useCourseStore((s) => s.addLesson)
  const { t } = useT('common')

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('course')}
        </p>
        <h2 className="truncate text-sm font-semibold text-gray-900">
          {course.title}
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-brand/10 font-medium text-brand-dark'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
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
