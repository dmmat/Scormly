import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface HowStep {
  title: string
  text: string
}

// "How it works" as a small self-playing walkthrough: the three steps on one
// side, a mock of what each one looks like on the other. It advances by itself
// (the progress line under the active step is the timer) until the visitor
// picks a step; hovering or focusing pauses it, and with reduced motion it
// doesn't play at all.
export default function HowSteps({ steps }: { steps: HowStep[] }) {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  // The timer runs only while the walkthrough is on screen.
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Narrow screens have no room for the mock beside the steps, and a mock
  // under all three reads as unrelated to them. So there every step carries
  // its own mock, always open, with nothing switching by itself.
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)
  useEffect(() => {
    const query = window.matchMedia(WIDE)
    const onChange = () => setWide(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => setInView(!!entries[0]?.isIntersecting), {
      root: el.closest('[data-landing-scroll]'),
      threshold: 0.4,
    })
    observer.observe(el)
    return () => observer.disconnect()
    // The walkthrough exists only in the wide layout.
  }, [wide])

  const visuals = [<ProjectVisual key="project" />, <BuildVisual key="build" />, <ExportVisual key="export" />]

  if (!wide) {
    return (
      <ol className="mx-auto grid max-w-md gap-5">
        {steps.map((s, i) => (
          <li key={s.title} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-gray-900/5">
            <div className="flex gap-4 p-4 sm:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white shadow-md shadow-brand/30">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold text-gray-900">{s.title}</span>
                <span className="mt-1 block leading-relaxed text-gray-600">{s.text}</span>
              </span>
            </div>
            {/* Decorative: the step says the same in words. */}
            <div aria-hidden className="flex justify-center border-t border-gray-100 bg-gray-50/70 px-4 py-6">
              <WhenSeen minHeight={i === 1 ? 232 : 220}>{visuals[i]}</WhenSeen>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div ref={rootRef} className="how-steps grid items-center gap-8 lg:grid-cols-[5fr_6fr] lg:gap-12">
      <ol className="grid gap-3">
        {steps.map((s, i) => {
          const on = i === active
          return (
            <li key={s.title}>
              <button
                type="button"
                aria-current={on ? 'step' : undefined}
                onClick={() => {
                  setActive(i)
                  setAuto(false)
                }}
                className={`relative flex w-full gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
                  on
                    ? 'border-brand/40 bg-white shadow-lg shadow-brand/10'
                    : 'border-transparent hover:border-gray-200 hover:bg-white/70'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-colors duration-300 ${
                    on ? 'bg-brand text-white shadow-md shadow-brand/30' : 'bg-brand/10 text-brand-dark'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold text-gray-900">{s.title}</span>
                  <span className="mt-1 block leading-relaxed text-gray-600">{s.text}</span>
                </span>
                {on && auto && (
                  <span
                    aria-hidden
                    className="how-progress absolute bottom-0 left-0 h-0.5 bg-brand"
                    style={{ animationPlayState: inView ? undefined : 'paused' }}
                    onAnimationEnd={() => setActive((a) => (a + 1) % steps.length)}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ol>

      {/* Decorative: the steps above say the same in words. */}
      <div aria-hidden className="relative">
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand/10 blur-3xl" />
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10">
          <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span className="ml-3 flex gap-1.5">
              {steps.map((s, i) => (
                <span
                  key={s.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-brand' : 'w-1.5 bg-gray-300'}`}
                />
              ))}
            </span>
          </div>
          <div key={active} className="how-swap flex h-[19rem] items-center justify-center p-5 sm:h-[21rem] sm:p-8">
            {visuals[active]}
          </div>
        </div>
      </div>
    </div>
  )
}

const WIDE = '(min-width: 1024px)'

// Mounts its content when it scrolls into view, so the mock's entrance
// animation plays in front of the reader and not off screen.
function WhenSeen({ minHeight, children }: { minHeight: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { root: el.closest('[data-landing-scroll]'), threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="flex w-full items-center justify-center" style={{ minHeight }}>
      {seen && children}
    </div>
  )
}

// A row that appears a moment after the one before it.
function Line({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
  return (
    <div className={`ws-line ${className ?? ''}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function Svg({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4 shrink-0'}
    >
      <path d={d} />
    </svg>
  )
}

const FOLDER = 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'
const FILE = 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5'
const CHECK = 'M20 6 9 17l-5-5'

// Step 1: a project folder filling up with its files.
function ProjectVisual() {
  const files: [string, string, boolean][] = [
    ['project.json', FILE, false],
    ['assets/', FOLDER, false],
    ['AGENTS.md', FILE, false],
    ['saved', CHECK, true],
  ]
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-4 py-3.5 text-white shadow-lg shadow-brand/30">
        <Svg d={FOLDER} className="h-6 w-6 shrink-0" />
        <span className="font-mono text-sm font-semibold">my-course/</span>
      </div>
      <div className="ml-6 mt-1 space-y-2 border-l-2 border-dashed border-brand/25 py-3 pl-5">
        {files.map(([name, icon, done], i) => (
          <Line
            key={name}
            delay={250 + i * 220}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 font-mono text-[13px] ${
              done ? 'border-brand/30 bg-brand/5 font-semibold text-brand-dark' : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <Svg d={icon} />
            {name}
          </Line>
        ))}
      </div>
    </div>
  )
}

// Step 2: a lesson assembling from blocks, with the theme dots on top.
function BuildVisual() {
  return (
    <div className="flex w-full max-w-sm gap-3">
      <div className="hidden w-16 shrink-0 space-y-2 sm:block">
        {[0, 1, 2].map((i) => (
          <Line key={i} delay={i * 120} className={`h-7 rounded-lg ${i === 0 ? 'bg-brand/20 ring-1 ring-brand/30' : 'bg-gray-100'}`}>
            {null}
          </Line>
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <Line delay={150} className="flex items-center justify-between">
          <span className="h-4 w-28 rounded-full bg-gray-900" />
          <span className="flex gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-brand ring-2 ring-brand/30 ring-offset-1" />
            <span className="h-3.5 w-3.5 rounded-full bg-sky-600" />
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-600" />
            <span className="h-3.5 w-3.5 rounded-full bg-gray-800" />
          </span>
        </Line>
        <Line delay={350} className="space-y-1.5 rounded-xl border border-gray-200 p-3">
          <span className="block h-2 w-full rounded-full bg-gray-200" />
          <span className="block h-2 w-4/5 rounded-full bg-gray-200" />
        </Line>
        <Line delay={550} className="flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
          <Svg d="M3 16l5-5 4 4 3-3 6 6M3 5h18v14H3zM9 9h.01" className="h-6 w-6 text-brand-dark" />
        </Line>
        <Line delay={750} className="space-y-1.5 rounded-xl border border-gray-200 p-3">
          {[false, true, false].map((picked, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                  picked ? 'border-brand bg-brand text-white' : 'border-gray-300'
                }`}
              >
                {picked && <Svg d={CHECK} className="h-2.5 w-2.5" />}
              </span>
              <span className={`h-2 rounded-full ${picked ? 'w-2/3 bg-brand/40' : 'w-1/2 bg-gray-200'}`} />
            </span>
          ))}
        </Line>
        <Line delay={950} className="flex justify-center">
          <span className="ws-pulse flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
            <Svg d="M12 5v14M5 12h14" />
          </span>
        </Line>
      </div>
    </div>
  )
}

// Step 3: one package going into the LMS.
function ExportVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <Line delay={100} className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md shadow-brand/30">
            <Svg d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7 12 12l8.7-5M12 22V12" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-sm font-semibold text-gray-900">my-course.zip</span>
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {['SCORM 1.2', 'SCORM 2004', 'cmi5'].map((f) => (
                <span key={f} className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
                  {f}
                </span>
              ))}
            </span>
          </span>
        </div>
      </Line>
      <Line delay={450} className="text-brand">
        <span className="ws-bounce block">
          <Svg d="M12 4v15M6 13l6 6 6-6" className="h-6 w-6" />
        </span>
      </Line>
      <Line delay={750} className="w-full rounded-2xl bg-gray-900 p-4 text-white shadow-xl shadow-gray-900/20">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold tracking-wide">LMS</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <Svg d={CHECK} className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="how-upload h-full rounded-full bg-brand-light" />
        </div>
      </Line>
    </div>
  )
}
