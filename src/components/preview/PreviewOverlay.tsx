import { useEffect, useRef, useState } from 'react'
import { useDialog } from '../../hooks/useDialog'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import BlockPreview from '../../preview/BlockPreview'
import A11yMenu from '../../preview/A11yMenu'
import { A11yContext, a11yClasses, useA11yPrefs } from '../../preview/a11y'

// Full-screen, learner-facing preview of the course with lesson navigation.
export default function PreviewOverlay() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const { t } = useT('preview')
  const { t: ta } = useT('a11y')
  const { prefs, reduceMotion, update: updatePrefs } = useA11yPrefs()
  const contentLanguage = course.settings?.contentLanguage?.trim() || undefined
  const showProgress = course.settings?.showProgress !== false
  const finishMessage = course.settings?.finishMessage?.trim() ?? ''

  const startIndex = Math.max(
    0,
    course.lessons.findIndex((l) => l.id === activeLessonId),
  )
  const [index, setIndex] = useState(startIndex)
  const [finished, setFinished] = useState(false)
  // Passed restricted `continue` gates: blockId → true (cleared on lesson change).
  const [continued, setContinued] = useState<Record<string, boolean>>({})
  const lesson = course.lessons[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const [announcement, setAnnouncement] = useState('')

  // Start each lesson (and the completion screen) at the top, like the player.
  // Revealing blocks past a passed gate keeps the scroll position. After the
  // first render, also move focus to the new <h1> and announce the lesson so
  // screen-reader and keyboard users land at the start of the new content.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    const current = course.lessons[index]
    setAnnouncement(
      finished
        ? t('courseComplete')
        : current
          ? ta('lessonAnnounce', { n: index + 1, total: course.lessons.length, title: current.title })
          : '',
    )
    // Only lesson changes should move focus, not edits to the course.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished])

  // Esc closes the preview; focus moves into it (so keys don't land in the
  // editor field underneath) and stays trapped until it closes.
  useDialog(rootRef, () => setPreviewOpen(false), { focusContainer: true })
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
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={course.title}
      tabIndex={-1}
      data-theme={course.theme}
      className={`fixed inset-0 z-50 flex flex-col bg-white outline-none ${a11yClasses(prefs, reduceMotion)}`}
    >
      <a
        href="#scormly-preview-content"
        onClick={(e) => {
          // Hash links would change the app route; move focus directly.
          e.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-30 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-gray-900 focus:shadow-lg"
      >
        {ta('skip')}
      </a>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-semibold text-gray-900">
            {course.title}
          </span>
          {showProgress && (
            <>
              <span className="hidden shrink-0 text-sm text-gray-400 sm:inline">
                {t('progress', { n: index + 1, total })}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-gray-400 sm:hidden">
                {index + 1}/{total}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <A11yMenu prefs={prefs} reduceMotion={reduceMotion} onChange={updatePrefs} />
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
            <span aria-hidden>✕</span>
          </button>
        </div>
      </header>

      <div ref={bodyRef} className="flex-1 overflow-y-auto bg-gray-50">
        <main
          ref={mainRef}
          id="scormly-preview-content"
          tabIndex={-1}
          lang={contentLanguage}
          className="a11y-content mx-auto max-w-3xl px-4 py-6 outline-none sm:px-6 sm:py-10"
        >
          <A11yContext.Provider value={{ captions: prefs.captions }}>
            {finished ? (
              <div className="py-8 text-center">
                <div
                  aria-hidden
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-3xl text-brand-dark"
                >
                  ✓
                </div>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl font-bold text-gray-900 outline-none"
                >
                  {t('courseComplete')}
                </h1>
                <p className="mt-3 whitespace-pre-line text-gray-500">
                  {finishMessage || t('courseCompleteText')}
                </p>
              </div>
            ) : lesson ? (
              <>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="mb-8 text-3xl font-bold text-gray-900 outline-none"
                >
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
          </A11yContext.Provider>
        </main>
      </div>
    </div>
  )
}
