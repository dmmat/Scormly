import { useEffect, useRef, useState } from 'react'
import { useT } from '../../../i18n/I18nProvider'

// A phone-style dialogue trainer that plays itself: the character "types",
// answers appear, one is auto-picked, and the conversation loops. Pure
// CSS + timers (no animation lib). Honors prefers-reduced-motion.

type Bubble = { id: number; from: 'bot' | 'user'; text: string }

export default function ChatDemo() {
  const { t } = useT('demo')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [typing, setTyping] = useState(false)
  const [choices, setChoices] = useState<{ opts: string[]; picked: number | null } | null>(null)
  const [replay, setReplay] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Steps reference i18n keys so the script stays bilingual.
  const script: Array<
    | { kind: 'bot'; key: string }
    | { kind: 'choices'; keys: string[]; pick: number }
  > = [
    { kind: 'bot', key: 'chatM1' },
    { kind: 'choices', keys: ['chatO1a', 'chatO1b'], pick: 0 },
    { kind: 'bot', key: 'chatM2' },
    { kind: 'choices', keys: ['chatO2a', 'chatO2b'], pick: 0 },
    { kind: 'bot', key: 'chatM3' },
  ]

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
      // Reduced motion: render the whole exchange at once, no looping.
      if (reduced) {
        const all: Bubble[] = []
        for (const step of script) {
          if (step.kind === 'bot') all.push({ id: next(), from: 'bot', text: t(step.key) })
          else all.push({ id: next(), from: 'user', text: t(step.keys[step.pick]) })
        }
        setBubbles(all)
        return
      }

      do {
        setBubbles([])
        setChoices(null)
        await wait(500)
        for (const step of script) {
          if (cancelled) return
          if (step.kind === 'bot') {
            setTyping(true)
            await wait(950)
            if (cancelled) return
            setTyping(false)
            setBubbles((b) => [...b, { id: next(), from: 'bot', text: t(step.key) }])
            await wait(700)
          } else {
            setChoices({ opts: step.keys.map((k) => t(k)), picked: null })
            await wait(1150)
            if (cancelled) return
            setChoices({ opts: step.keys.map((k) => t(k)), picked: step.pick })
            await wait(480)
            if (cancelled) return
            setBubbles((b) => [...b, { id: next(), from: 'user', text: t(step.keys[step.pick]) }])
            setChoices(null)
            await wait(560)
          }
        }
        await wait(2600) // pause on the finished conversation, then loop
      } while (!cancelled)
    }

    void run()
    return () => {
      cancelled = true
      timers.forEach((id) => clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replay, t])

  return (
    <div className="phone">
      <div className="phone-notch" aria-hidden />
      <div className="phone-screen">
        <header className="chatd-header">
          <span className="chatd-ava">K</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight">
              {t('chatName')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              <span className="chatd-dot" /> {t('chatStatus')}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="chatd-replay"
          >
            {t('chatReplay')}
          </button>
        </header>

        <div ref={bodyRef} className="chatd-body">
          {bubbles.map((b) =>
            b.from === 'bot' ? (
              <div key={b.id} className="chatd-row chatd-in">
                <span className="chatd-ava chatd-ava-sm">K</span>
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
              <span className="chatd-ava chatd-ava-sm">K</span>
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
