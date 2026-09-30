import { useMemo, useState } from 'react'
import type { PreviewProps } from '../types'
import { useT } from '../../i18n/I18nProvider'
import { isBlankCorrect, parseBlanks, scoreBlanks, selectOptions } from '../../blocks/fillBlanks'
import { shuffledOrder } from '../../blocks/ordering'
import ScoreResult from './ScoreResult'
import ResultMark from './ResultMark'

export default function FillBlanksPreview({ block }: PreviewProps<'fillBlanks'>) {
  const { t } = useT('assessment')
  const { text, mode, passingScore, showAnswers = true, caseSensitive = false } = block.data
  const segments = useMemo(() => parseBlanks(text), [text])
  const blanks = segments.flatMap((s) => (s.kind === 'blank' ? [s.answers] : []))
  const [responses, setResponses] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [attempt, setAttempt] = useState(0)

  // Dropdown options are re-shuffled on every attempt.
  const options = useMemo(
    () => shuffledOrder(selectOptions(blanks)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, attempt],
  )

  // Selected answers are always canonical; typed ones honour caseSensitive.
  const strict = mode === 'type' && caseSensitive
  const score = scoreBlanks(blanks, responses, strict)
  const reveal = submitted && showAnswers

  function setResponse(i: number, value: string) {
    setResponses((prev) => {
      const next = prev.slice()
      next[i] = value
      return next
    })
  }

  function retry() {
    setResponses([])
    setSubmitted(false)
    setAttempt((a) => a + 1)
  }

  return (
    <div className="space-y-4">
      <p className="leading-loose whitespace-pre-wrap text-gray-800">
        {segments.map((s, i) => {
          if (s.kind === 'text') return <span key={i}>{s.text}</span>
          const ok = isBlankCorrect(s.answers, responses[s.index], strict)
          const tone = reveal
            ? ok
              ? 'border-green-400 bg-green-50'
              : 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white focus:border-brand'
          const label = t('blankN', { n: s.index + 1 })
          return (
            <span key={i} className="mx-0.5 inline-flex items-baseline gap-1">
              {mode === 'select' ? (
                <select
                  value={responses[s.index] ?? ''}
                  disabled={submitted}
                  aria-label={label}
                  onChange={(e) => setResponse(s.index, e.target.value)}
                  className={`rounded-md border px-2 py-0.5 text-gray-800 outline-none ${tone}`}
                >
                  <option value="">—</option>
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={responses[s.index] ?? ''}
                  disabled={submitted}
                  aria-label={label}
                  autoComplete="off"
                  spellCheck={false}
                  size={Math.max(6, s.answers[0].length + 2)}
                  onChange={(e) => setResponse(s.index, e.target.value)}
                  className={`rounded-md border px-2 py-0.5 text-gray-800 outline-none ${tone}`}
                />
              )}
              {reveal && <ResultMark ok={ok} />}
              {reveal && !ok && (
                <span className="text-xs text-green-700">{t('correctAnswer', { a: s.answers[0] })}</span>
              )}
            </span>
          )
        })}
      </p>

      <ScoreResult
        submitted={submitted}
        score={score}
        passingScore={passingScore}
        onSubmit={() => setSubmitted(true)}
        onRetry={retry}
      />
    </div>
  )
}
