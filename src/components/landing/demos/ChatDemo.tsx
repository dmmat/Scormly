import { useEffect, useMemo, useRef, useState } from 'react'
import { useT, useLang } from '../../../i18n/I18nProvider'
import { chatScenarios, type ChatScenario } from './chatScenarios'

// A phone-style dialogue trainer that plays itself: the character "types",
// answers appear, one is auto-picked, and the conversation loops. Pure
// CSS + timers (no animation lib). Honors prefers-reduced-motion.
//
// The demo rotates through `chatScenarios` — a shuffled queue, no repeats
// until the whole list is exhausted, then re-shuffled. Texts inside each
// scenario are bilingual (en/uk) and resolved against the current UI language.

type Bubble = { id: number; from: 'bot' | 'user'; text: string }

// Fisher–Yates shuffle (non-mutating).
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Shuffle but always lead with a Ksiu scenario — she's the demo's main face,
// so visitors always meet her first. Within the Ksiu pool the pick is random,
// and everything after position 0 is fully shuffled.
function shuffleWithKsiuFirst(): ChatScenario[] {
  const ksiu = chatScenarios.filter((s) => s.name.en === 'Ksiu')
  if (ksiu.length === 0) return shuffle(chatScenarios)
  const firstKsiu = ksiu[Math.floor(Math.random() * ksiu.length)]
  const rest = chatScenarios.filter((s) => s !== firstKsiu)
  return [firstKsiu, ...shuffle(rest)]
}

export default function ChatDemo() {
  const { t } = useT('demo')
  const { lang } = useLang()
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [typing, setTyping] = useState(false)
  const [choices, setChoices] = useState<{ opts: string[]; picked: number | null } | null>(null)
  const [replay, setReplay] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  // The play queue — a shuffled list of scenarios; we walk through it without
  // repeats, then reshuffle. `queueRef` survives re-renders; the cursor state
  // triggers re-runs of the playback effect when it advances.
  const queueRef = useRef<ChatScenario[]>([])
  const [cursor, setCursor] = useState(0)
  // First-mount setup.
  if (queueRef.current.length === 0) queueRef.current = shuffleWithKsiuFirst()

  const scenario = queueRef.current[cursor % queueRef.current.length]

  // Resolve all texts up-front in the current language. useMemo so the same
  // scenario doesn't get re-resolved on every render tick.
  const resolved = useMemo(() => {
    const pick = <T extends string>(v: { en: T; uk: T }) => (lang === 'uk' ? v.uk : v.en)
    return {
      name: pick(scenario.name),
      status: pick(scenario.status),
      steps: scenario.steps.map((step) =>
        step.kind === 'bot'
          ? { kind: 'bot' as const, text: pick(step.text) }
          : { kind: 'choices' as const, opts: step.opts.map(pick), pick: step.pick },
      ),
    }
  }, [scenario, lang])

  const initial = (resolved.name.trim()[0] ?? '?').toUpperCase()

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [bubbles, typing, choices])

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    const wait = (ms: number) =>
      new Promise<void>((r) => timers.push(window.setTimeout(r, ms)))
    let seq = 0
    const next = () => ++seq

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    async function run() {
      // Reduced motion: render the whole exchange at once, no auto-advance.
      if (reduced) {
        const all: Bubble[] = []
        for (const step of resolved.steps) {
          if (step.kind === 'bot') all.push({ id: next(), from: 'bot', text: step.text })
          else all.push({ id: next(), from: 'user', text: step.opts[step.pick] })
        }
        setBubbles(all)
        return
      }

      setBubbles([])
      setChoices(null)
      await wait(500)
      for (const step of resolved.steps) {
        if (cancelled) return
        if (step.kind === 'bot') {
          setTyping(true)
          await wait(950)
          if (cancelled) return
          setTyping(false)
          setBubbles((b) => [...b, { id: next(), from: 'bot', text: step.text }])
          await wait(700)
        } else {
          setChoices({ opts: step.opts, picked: null })
          await wait(1150)
          if (cancelled) return
          setChoices({ opts: step.opts, picked: step.pick })
          await wait(480)
          if (cancelled) return
          setBubbles((b) => [...b, { id: next(), from: 'user', text: step.opts[step.pick] }])
          setChoices(null)
          await wait(560)
        }
      }
      // Pause on the finished conversation, then move on to the next scenario.
      await wait(2600)
      if (cancelled) return
      setCursor((c) => {
        const nextC = c + 1
        // Reshuffle the queue once we've shown them all — keeps variety high.
        if (nextC >= queueRef.current.length) {
          queueRef.current = shuffleWithKsiuFirst()
          return 0
        }
        return nextC
      })
    }

    void run()
    return () => {
      cancelled = true
      timers.forEach((id) => clearTimeout(id))
    }
  }, [resolved, replay])

  function onReplay() {
    // Jump to a fresh random scenario (not just rerun the current one).
    setCursor((c) => {
      const len = queueRef.current.length
      if (len < 2) return c
      let next
      do {
        next = Math.floor(Math.random() * len)
      } while (next === c % len)
      return next
    })
    setReplay((n) => n + 1)
  }

  return (
    <div className="phone">
      <div className="phone-screen">
        <header className="chatd-header">
          <span className="chatd-ava">{initial}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight">
              {resolved.name}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              <span className="chatd-dot" /> {resolved.status}
            </span>
          </span>
          <button
            type="button"
            onClick={onReplay}
            className="chatd-replay"
          >
            {t('chatReplay')}
          </button>
        </header>

        <div ref={bodyRef} className="chatd-body">
          {bubbles.map((b) =>
            b.from === 'bot' ? (
              <div key={b.id} className="chatd-row chatd-in">
                <span className="chatd-ava chatd-ava-sm">{initial}</span>
                <p className="chatd-bubble chatd-bot">{b.text}</p>
              </div>
            ) : (
              <p key={b.id} className="chatd-bubble chatd-user chatd-in">
                {b.text}
              </p>
            ),
          )}
          {typing && (
            <div className="chatd-row">
              <span className="chatd-ava chatd-ava-sm">{initial}</span>
              <span className="chatd-bubble chatd-bot chatd-typing">
                <i /><i /><i />
              </span>
            </div>
          )}
        </div>

        <div className="chatd-replies">
          {choices?.opts.map((opt, i) => (
            <span
              key={i}
              className={`chatd-chip ${choices.picked === i ? 'chatd-chip-picked' : ''} ${
                choices.picked != null && choices.picked !== i ? 'chatd-chip-dim' : ''
              }`}
            >
              {opt}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
