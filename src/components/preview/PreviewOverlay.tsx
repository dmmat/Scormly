import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useDialog } from '../../hooks/useDialog'
import { useCourseStore, INTRO_ID } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import BlockPreview from '../../preview/BlockPreview'
import IntroView from '../../preview/IntroView'
import A11yMenu from '../../preview/A11yMenu'
import { A11yContext, a11yClasses, useA11yPrefs } from '../../preview/a11y'
import { PreviewProgress } from '../../preview/progress'
import { useBlockWrapper } from '../../blocks/useBlockWrapper'
import { usePageWidthVar } from '../../hooks/usePageWidthVar'
import { themeStyle } from '../../theme/customTheme'
import { CONTENT_WIDTH_PX, DEFAULT_CONTENT_WIDTH, isTaskBlock, type BlockAnimation, type Block } from '../../types/course'

// Full-screen, learner-facing preview of the course with lesson navigation.
// Mirrors the SCORM player: optional cover page, lesson menu with progress,
// block entrance animations, lesson transitions and a "next lesson" card.
export default function PreviewOverlay() {
  const course = useCourseStore((s) => s.course)
  const activeLessonId = useCourseStore((s) => s.activeLessonId)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const { t } = useT('preview')
  const { t: td } = useT('design')
  const { t: ta } = useT('a11y')
  const { prefs, reduceMotion, update: updatePrefs } = useA11yPrefs()
  const settings = course.settings
  const contentLanguage = settings?.contentLanguage?.trim() || undefined
  const showProgress = settings?.showProgress !== false
  const finishMessage = settings?.finishMessage?.trim() ?? ''
  const contentWidth = CONTENT_WIDTH_PX[settings?.contentWidth ?? DEFAULT_CONTENT_WIDTH]
  const blockAnimation: BlockAnimation = reduceMotion ? 'none' : settings?.blockAnimation ?? 'fade'
  const transition = reduceMotion ? 'none' : settings?.lessonTransition ?? 'fade'
  const typography = settings?.typography ?? 'modern'
  const introEnabled = !!course.intro?.enabled

  const startIndex = Math.max(
    0,
    course.lessons.findIndex((l) => l.id === activeLessonId),
  )
  const [index, setIndex] = useState(startIndex)
  const [onIntro, setOnIntro] = useState(introEnabled && activeLessonId === INTRO_ID)
  const [finished, setFinished] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visited, setVisited] = useState<Record<number, boolean>>({})
  // Direction of the last lesson change, for the slide transition.
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  // Clicked `continue` gates: blockId → true (cleared on lesson change).
  const [continued, setContinued] = useState<Record<string, boolean>>({})
  // Finished tasks (answered quizzes, reflections…), for restricted gates.
  const [done, setDone] = useState<Record<string, boolean>>({})
  const markDone = useCallback((id: string) => setDone((d) => (d[id] ? d : { ...d, [id]: true })), [])
  // First block a Continue just revealed, brought into view after render.
  const [revealed, setRevealed] = useState<string | null>(null)
  const lesson = course.lessons[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const [announcement, setAnnouncement] = useState('')
  usePageWidthVar(bodyRef)

  useEffect(() => {
    if (!onIntro && !finished) setVisited((v) => (v[index] ? v : { ...v, [index]: true }))
  }, [index, onIntro, finished])

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
        : onIntro
          ? course.title
          : current
            ? ta('lessonAnnounce', { n: index + 1, total: course.lessons.length, title: current.title })
            : '',
    )
    // Only lesson changes should move focus, not edits to the course.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished, onIntro])

  // Esc closes the lesson menu first, then the preview; focus moves into it
  // (so keys don't land in the editor field underneath) and stays trapped.
  useDialog(rootRef, () => (menuOpen ? setMenuOpen(false) : setPreviewOpen(false)), {
    focusContainer: true,
  })
  const total = course.lessons.length
  const isLast = index >= total - 1
  const progress = total ? Math.round((Object.keys(visited).length / total) * 100) : 0

  // Hide blocks after a `continue` gate until it is clicked, then drop the gate
  // itself — mirroring the SCORM player. A Continue at the very end is no gate:
  // it leads on.
  const { visibleBlocks, gated } = (() => {
    const out: Block[] = []
    const blocks = lesson?.blocks ?? []
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      const isGate = b.type === 'continue' && i < blocks.length - 1
      if (isGate && continued[b.id]) continue
      out.push(b)
      if (isGate) return { visibleBlocks: out, gated: true }
    }
    return { visibleBlocks: out, gated: false }
  })()
  // A Continue button at the very end already leads on; the card would repeat it.
  const lastShown = visibleBlocks[visibleBlocks.length - 1]
  const endsWithContinue = lastShown?.type === 'continue' && !lastShown.data.nextCard

  function goTo(i: number) {
    setDirection(!onIntro && i < index ? 'prev' : 'next')
    setOnIntro(false)
    setFinished(false)
    setMenuOpen(false)
    setIndex(Math.min(total - 1, Math.max(0, i)))
    setContinued({})
    setDone({})
  }

  function goIntro() {
    setDirection('prev')
    setFinished(false)
    setMenuOpen(false)
    setOnIntro(true)
  }

  function goNext() {
    setDirection('next')
    if (isLast) setFinished(true)
    else goTo(index + 1)
  }

  function goPrev() {
    if (index === 0) {
      if (introEnabled) goIntro()
      return
    }
    setDirection('prev')
    setIndex((i) => Math.max(0, i - 1))
    setContinued({})
    setDone({})
  }

  // A restricted Continue stays locked until every task above it is done.
  function continueLocked(block: Block): boolean {
    if (block.type !== 'continue' || block.data.mode !== 'restricted' || !lesson) return false
    const above = lesson.blocks.slice(0, lesson.blocks.indexOf(block))
    return above.some((b) => isTaskBlock(b) && !done[b.id])
  }

  function handleContinue(blockId: string) {
    const blocks = lesson?.blocks ?? []
    const at = blocks.findIndex((b) => b.id === blockId)
    if (at < 0 || at === blocks.length - 1) return goNext()
    setContinued((c) => ({ ...c, [blockId]: true }))
    setRevealed(blocks[at + 1].id)
  }

  // Scroll to the content a Continue revealed and move focus there (the
  // clicked button is gone).
  useEffect(() => {
    if (!revealed) return
    setRevealed(null)
    const el = bodyRef.current?.querySelector<HTMLElement>(`[data-block="${revealed}"]`)
    if (!el) return
    el.tabIndex = -1
    el.focus({ preventScroll: true })
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [revealed, reduceMotion])

  const transitionClass =
    transition === 'none'
      ? ''
      : transition === 'slide'
        ? `lesson-enter-slide-${direction}`
        : 'lesson-enter-fade'
  const screenKey = finished ? 'finished' : onIntro ? 'intro' : `lesson-${index}`

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={course.title}
      tabIndex={-1}
      data-theme={course.theme}
      style={themeStyle(course)}
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
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-200/70 bg-white/85 px-3 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={td('lessonsMenu')}
            title={td('lessonsMenu')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </button>
          <span className="truncate font-semibold text-gray-900">{course.title}</span>
          {showProgress && !onIntro && !finished && (
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
            <button type="button" onClick={() => setFinished(false)} className="btn-secondary text-sm">
              {t('review')}
            </button>
          ) : onIntro ? null : (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0 && !introEnabled}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                {t('prev')}
              </button>
              <button
                type="button"
                onClick={goNext}
                className={`${isLast ? 'btn-primary' : 'btn-secondary'} text-sm`}
              >
                {isLast ? t('finish') : t('next')}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label={t('close')}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
        {showProgress && (
          <div
            className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100"
            role="progressbar"
            aria-label={td('progressPct', { n: progress })}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1">
        {menuOpen && (
          <LessonMenu
            course={course}
            index={onIntro || finished ? -1 : index}
            onIntro={onIntro}
            visited={visited}
            progress={progress}
            onClose={() => setMenuOpen(false)}
            onPick={goTo}
            onPickIntro={introEnabled ? goIntro : undefined}
          />
        )}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#fafafb]"
          style={{ '--col-w': `${contentWidth}px` } as React.CSSProperties}
        >
          <main
            ref={mainRef}
            id="scormly-preview-content"
            tabIndex={-1}
            lang={contentLanguage}
            className={`a11y-content typo-${typography} mx-auto px-4 py-8 outline-none sm:px-6 sm:py-14`}
            style={{ maxWidth: contentWidth + 48 }}
          >
            <A11yContext.Provider value={{ captions: prefs.captions }}>
            <PreviewProgress.Provider value={markDone}>
              <div key={screenKey} className={transitionClass}>
                {finished ? (
                  <div className="py-10 text-center">
                    <div
                      aria-hidden
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-4xl text-white shadow-lg shadow-brand/30"
                    >
                      ✓
                    </div>
                    <h1
                      ref={headingRef}
                      tabIndex={-1}
                      className="text-3xl font-bold tracking-tight text-gray-900 outline-none"
                    >
                      {t('courseComplete')}
                    </h1>
                    <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-gray-500">
                      {finishMessage || t('courseCompleteText')}
                    </p>
                  </div>
                ) : onIntro ? (
                  <IntroView
                    course={course}
                    headingRef={headingRef}
                    onStart={() => goTo(0)}
                    onOpenLesson={goTo}
                  >
                    {course.intro?.blocks?.length
                      ? course.intro.blocks.map((block) => (
                          <Reveal key={block.id} block={block} animation={blockAnimation}>
                            <BlockPreview block={block} currentLessonId={INTRO_ID} onNavigate={goTo} />
                          </Reveal>
                        ))
                      : null}
                  </IntroView>
                ) : lesson ? (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">
                      {t('progress', { n: index + 1, total })}
                    </p>
                    <h1
                      ref={headingRef}
                      tabIndex={-1}
                      className="mb-10 text-4xl font-bold tracking-tight text-gray-900 outline-none"
                    >
                      {lesson.title}
                    </h1>
                    {lesson.blocks.length === 0 ? (
                      <p className="text-gray-400">{t('empty')}</p>
                    ) : (
                      <div className="space-y-7">
                        {visibleBlocks.map((block) => (
                          <Reveal key={block.id} block={block} animation={blockAnimation}>
                            <BlockPreview
                              block={block}
                              currentLessonId={lesson.id}
                              onNavigate={goTo}
                              onContinue={handleContinue}
                              continueLocked={continueLocked(block)}
                            />
                          </Reveal>
                        ))}
                      </div>
                    )}
                    {!gated && !endsWithContinue && (
                      <NextCard
                        label={isLast ? t('finish') : td('nextLesson')}
                        title={isLast ? '' : course.lessons[index + 1]?.title ?? ''}
                        onClick={goNext}
                      />
                    )}
                  </>
                ) : null}
              </div>
            </PreviewProgress.Provider>
            </A11yContext.Provider>
          </main>
        </div>
      </div>
    </div>
  )
}

// Block wrapper: panel styling + entrance animation when scrolled into view.
// Blocks entering together are staggered slightly.
let lastReveal = 0
let revealStep = 0
function Reveal({ block, animation, children }: { block: Block; animation: BlockAnimation; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(animation === 'none')

  useEffect(() => {
    const el = ref.current
    if (!el || shown || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        const now = performance.now()
        revealStep = now - lastReveal < 120 ? revealStep + 1 : 0
        lastReveal = now
        el.style.animationDelay = `${Math.min(revealStep, 5) * 80}ms`
        setShown(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  const wrapper = useBlockWrapper(block.settings)
  const anim = animation === 'none' ? '' : ` anim-${animation}${shown ? ' is-in' : ''}`
  return (
    <div ref={ref} {...wrapper} data-block={block.id} className={`${wrapper.className}${anim} outline-none`}>
      {children}
    </div>
  )
}

function NextCard({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mt-16 flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">{label}</span>
        {title && <span className="mt-1 block truncate text-lg font-semibold text-gray-900">{title}</span>}
      </span>
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  )
}

function LessonMenu({
  course,
  index,
  onIntro,
  visited,
  progress,
  onClose,
  onPick,
  onPickIntro,
}: {
  course: ReturnType<typeof useCourseStore.getState>['course']
  index: number
  onIntro: boolean
  visited: Record<number, boolean>
  progress: number
  onClose: () => void
  onPick: (i: number) => void
  onPickIntro?: () => void
}) {
  const { t } = useT('design')
  return (
    <>
      <div className="absolute inset-0 z-10 bg-gray-900/20 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <nav
        aria-label={t('lessonsMenu')}
        className="drawer-in absolute inset-y-0 left-0 z-10 flex w-80 max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-2xl"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="truncate font-semibold text-gray-900">{course.title}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums text-gray-500">{t('progressPct', { n: progress })}</span>
          </div>
        </div>
        <ol className="flex-1 overflow-y-auto p-2">
          {onPickIntro && (
            <li>
              <MenuRow active={onIntro} done={false} num="•" title={t('courseHome')} onClick={onPickIntro} />
            </li>
          )}
          {course.lessons.map((l, i) => (
            <li key={l.id}>
              <MenuRow
                active={i === index}
                done={!!visited[i] && i !== index}
                num={String(i + 1)}
                title={l.title}
                onClick={() => onPick(i)}
              />
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

function MenuRow({
  active,
  done,
  num,
  title,
  onClick,
}: {
  active: boolean
  done: boolean
  num: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        active ? 'bg-brand/10 font-semibold text-brand-dark' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          done ? 'bg-emerald-500 text-white' : active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {done ? '✓' : num}
      </span>
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </button>
  )
}
