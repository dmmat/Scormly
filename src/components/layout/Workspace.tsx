import { useCourseStore } from '../../store/courseStore'

export default function Workspace() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const activeLesson = course.lessons.find((l) => l.id === activeLessonId)

  return (
    <main className="flex-1 overflow-y-auto bg-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {activeLesson ? (
          <>
            <header className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Урок
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeLesson.title}
              </h1>
            </header>

            {activeLesson.blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-20 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl text-brand">
                  +
                </div>
                <p className="text-base font-medium text-gray-700">
                  Поки що порожньо
                </p>
                <p className="mt-1 max-w-xs text-sm text-gray-500">
                  Додайте перший блок, щоб почати наповнювати урок контентом.
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-center text-gray-500">Оберіть урок зліва</p>
        )}
      </div>
    </main>
  )
}
