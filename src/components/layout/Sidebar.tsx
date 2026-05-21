import { useState } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function Sidebar() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const addLesson = useCourseStore((s) => s.addLesson)
  const renameLesson = useCourseStore((s) => s.renameLesson)
  const deleteLesson = useCourseStore((s) => s.deleteLesson)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const { t } = useT('common')
  const [editingId, setEditingId] = useState<string | null>(null)

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
        <ul className="space-y-1">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId
            const isEditing = editingId === lesson.id
            return (
              <li key={lesson.id} className="group relative">
                <div
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-brand/10 font-medium text-brand-dark'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${
                      isActive ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>

                  {isEditing ? (
                    <input
                      autoFocus
                      value={lesson.title}
                      onChange={(e) => renameLesson(lesson.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          setEditingId(null)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 rounded bg-white px-1 text-sm outline-none ring-1 ring-brand"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingId(lesson.id)
                      }}
                      className="min-w-0 flex-1 truncate"
                    >
                      {lesson.title}
                    </span>
                  )}

                  {!isEditing && (
                    <span className="flex shrink-0 items-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        title={t('renameLesson')}
                        aria-label={t('renameLesson')}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(lesson.id)
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
