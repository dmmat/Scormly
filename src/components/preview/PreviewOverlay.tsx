import { useState } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import BlockPreview from '../../preview/BlockPreview'

// Full-screen, learner-facing preview of the course with lesson navigation.
export default function PreviewOverlay() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const { t } = useT('preview')

  const startIndex = Math.max(
    0,
    course.lessons.findIndex((l) => l.id === activeLessonId),
  )
  const [index, setIndex] = useState(startIndex)
  const [finished, setFinished] = useState(false)
  // Passed restricted `continue` gates: blockId → true (cleared on lesson change).
  const [continued, setContinued] = useState<Record<string, boolean>>({})
  const lesson = course.lessons[index]
  const total = course.lessons.length
  const isLast = index >= total - 1

  // Hide blocks after an unpassed restricted `continue` gate, and drop the
  // gate itself once passed — mirroring the SCORM player's gating behaviour.
  const visibleBlocks = (() => {
    if (!lesson) return []
    const out: typeof lesson.blocks = []
    for (const b of lesson.blocks) {
      const isRestricted = b.type === 'continue' && b.data.mode === 'restricted'
      if (isRestricted && continued[b.id]) continue
      out.push(b)
      if (isRestricted && !continued[b.id]) break
    }
    return out
  })()

  function goNext() {
    if (isLast) setFinished(true)
    else {
      setIndex((i) => Math.min(total - 1, i + 1))
      setContinued({})
    }
  }

  function handleContinue(blockId: string, mode: 'restricted' | 'unrestricted') {
    // Both modes advance to the next lesson. Restricted additionally marks the
    // gate as passed so the lesson stays unlocked if the learner navigates
    // back via Previous.
    if (mode === 'restricted') setContinued((c) => ({ ...c, [blockId]: true }))
    goNext()
  }

  return (
    <div
      data-theme={course.theme}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-semibold text-gray-900">
            {course.title}
          </span>
          <span className="hidden shrink-0 text-sm text-gray-400 sm:inline">
            {t('progress', { n: index + 1, total })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {finished ? (
            <button
              type="button"
              onClick={() => setFinished(false)}
              className="btn-secondary text-sm"
            >
              {t('review')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIndex((i) => Math.max(0, i - 1))
                  setContinued({})
                }}
                disabled={index === 0}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                {t('prev')}
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={() => setFinished(true)}
                  className="btn-primary text-sm"
                >
                  {t('finish')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-secondary text-sm"
                >
                  {t('next')}
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label={t('close')}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
          {finished ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-3xl text-brand-dark">
                ✓
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('courseComplete')}
              </h1>
              <p className="mt-3 text-gray-500">{t('courseCompleteText')}</p>
            </div>
          ) : lesson ? (
            <>
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                {lesson.title}
              </h1>
              {lesson.blocks.length === 0 ? (
                <p className="text-gray-400">{t('empty')}</p>
              ) : (
                <div className="space-y-6">
                  {visibleBlocks.map((block) => (
                    <BlockPreview
                      key={block.id}
                      block={block}
                      currentLessonId={lesson.id}
                      onNavigate={(i) => {
                        setIndex(Math.min(total - 1, Math.max(0, i)))
                        setContinued({})
                      }}
                      onContinue={handleContinue}
                    />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
