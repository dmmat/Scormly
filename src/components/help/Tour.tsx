import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useHelpStore } from '../../help/helpStore'
import { useDialog } from '../../hooks/useDialog'
import { useT } from '../../i18n/I18nProvider'

// Steps point at elements marked with data-tour="…". A step whose target is
// missing or hidden (e.g. the sidebar on phones) is shown as a centred card.
const STEPS: { target: string | null; key: string }[] = [
  { target: null, key: 'Welcome' },
  { target: 'lessons', key: 'Lessons' },
  { target: 'canvas', key: 'Canvas' },
  { target: 'add-block', key: 'Add' },
  { target: 'settings', key: 'Settings' },
  { target: 'preview', key: 'Preview' },
  { target: 'comments', key: 'Comments' },
  { target: 'export', key: 'Export' },
  { target: 'save', key: 'Save' },
  { target: 'help', key: 'Help' },
]

const PAD = 6 // spotlight padding around the target
const GAP = 12 // space between the target and the card
const MARGIN = 12 // keep the card this far from the viewport edge

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function findTarget(name: string | null): HTMLElement | null {
  if (!name) return null
  const el = document.querySelector<HTMLElement>(`[data-tour="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const visible =
    r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth
  return visible ? el : null
}

function spotlightRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  // Clip tall targets (sidebar, canvas) to the viewport.
  const top = Math.max(r.top, 0)
  const bottom = Math.min(r.bottom, window.innerHeight)
  return {
    top: top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: bottom - top + PAD * 2,
  }
}

// Place the card below, above, right or left of the target — whichever fits
// first — then clamp it into the viewport.
function placeCard(target: Rect | null, w: number, h: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const clampX = (x: number) => Math.max(MARGIN, Math.min(x, vw - w - MARGIN))
  const clampY = (y: number) => Math.max(MARGIN, Math.min(y, vh - h - MARGIN))
  if (!target) return { left: (vw - w) / 2, top: (vh - h) / 2 }
  const cx = target.left + target.width / 2 - w / 2
  const cy = target.top + target.height / 2 - h / 2
  const below = target.top + target.height + GAP
  const above = target.top - GAP - h
  const right = target.left + target.width + GAP
  const left = target.left - GAP - w
  if (below + h <= vh - MARGIN) return { left: clampX(cx), top: below }
  if (above >= MARGIN) return { left: clampX(cx), top: above }
  if (right + w <= vw - MARGIN) return { left: right, top: clampY(cy) }
  if (left >= MARGIN) return { left, top: clampY(cy) }
  return { left: (vw - w) / 2, top: (vh - h) / 2 }
}

// First-run guided tour of the builder. Skip/finish is remembered (helpStore).
export default function Tour() {
  const { t } = useT('help')
  const endTour = useHelpStore((s) => s.endTour)
  const [step, setStep] = useState(0)
  const [spot, setSpot] = useState<Rect | null>(null)
  const [card, setCard] = useState<{ left: number; top: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  useDialog(cardRef, endTour)

  const { target, key } = STEPS[step]
  const last = step === STEPS.length - 1

  // Measure the target and the card, and re-measure on resize / scroll.
  useLayoutEffect(() => {
    function measure() {
      const el = findTarget(target)
      const rect = el ? spotlightRect(el) : null
      setSpot(rect)
      const c = cardRef.current
      if (c) setCard(placeCard(rect, c.offsetWidth, c.offsetHeight))
    }
    findTarget(target)?.scrollIntoView({ block: 'nearest' })
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target])

  // Move focus to the primary button on every step (Enter continues).
  useEffect(() => {
    cardRef.current?.querySelector<HTMLElement>('[data-primary]')?.focus()
  }, [step])

  function next() {
    if (last) endTour()
    else setStep((s) => s + 1)
  }
  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') back()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Dim everything except the spotlight (one huge shadow). Without a
          target, a plain backdrop. Clicks on the dimmed page are swallowed. */}
      {spot ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl ring-2 ring-white/80 transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ ...spot, boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)' }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-slate-900/55" />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        className="absolute w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-white p-5 shadow-2xl transition-[top,left] duration-300 ease-out motion-reduce:transition-none"
        // Off-screen (not visibility:hidden, which can't take focus) until measured.
        style={card ?? { left: -9999, top: 0 }}
      >
        <p className="text-xs font-medium text-brand">
          {t('tourStep', { n: step + 1, total: STEPS.length })}
        </p>
        <h2 id="tour-title" className="mt-1 text-base font-semibold text-gray-900">
          {t(`tour${key}Title`)}
        </h2>
        <p id="tour-text" className="mt-1.5 text-sm leading-relaxed text-gray-600">
          {t(`tour${key}Text`)}
        </p>

        <div className="mt-4 flex items-center gap-1" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-4 bg-brand' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {last ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={endTour}
              className="rounded-md px-2 py-1.5 text-sm text-gray-500 outline-none hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t('tourSkip')}
            </button>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={back} className="btn-secondary text-sm">
                {t('tourBack')}
              </button>
            )}
            <button type="button" data-primary onClick={next} className="btn-primary text-sm">
              {last ? t('tourDone') : t('tourNext')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
