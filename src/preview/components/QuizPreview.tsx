import { useMemo, useState } from 'react'
import type { PreviewProps } from '../types'
import type { Question } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { blankAnswers, isBlankCorrect } from '../../blocks/fillBlanks'
import { shuffledOrder } from '../../blocks/ordering'
import ScoreResult from './ScoreResult'
import { useMarkDone } from '../progress'
import SequenceList, { currentOrder } from './SequenceList'
import BlanksText from './BlanksText'

type Answer = string | string[] | Record<string, string>

// Fisher–Yates shuffle (pure; does not mutate the input array).
function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function QuizPreview({ block }: PreviewProps<'quiz'>) {
  const { t } = useT('preview')
  const { t: ta } = useT('assessment')
  const { questions, passingScore, showAnswers = true } = block.data
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [submitted, setSubmitted] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const markDone = useMarkDone()

  // Per attempt: scramble each matching question's right-column choices (one
  // per distinct answer, so several items can share a category) and each
  // sequence question's starting order. Stable across re-renders.
  const { matchingChoices, startOrders } = useMemo(() => {
    const matchingChoices: Record<string, string[]> = {}
    const startOrders: Record<string, string[]> = {}
    for (const q of questions) {
      if (q.type === 'matching') matchingChoices[q.id] = shuffle([...new Set(q.pairs.map((p) => p.right))])
      if (q.type === 'sequence') startOrders[q.id] = shuffledOrder(q.items.map((it) => it.id))
    }
    return { matchingChoices, startOrders }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, attempt])

  function setAnswer(qId: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  function sequenceOrder(q: Extract<Question, { type: 'sequence' }>): string[] {
    const ids = q.items.map((it) => it.id)
    return currentOrder((answers[q.id] as string[] | undefined) ?? startOrders[q.id] ?? ids, ids)
  }

  function isCorrect(q: Question): boolean {
    const a = answers[q.id]
    if (q.type === 'sequence') {
      const order = sequenceOrder(q)
      return q.items.every((it, i) => order[i] === it.id)
    }
    if (q.type === 'fillBlanks') {
      const responses = (a as string[] | undefined) ?? []
      const strict = q.mode === 'type' && !!q.caseSensitive
      const blanks = blankAnswers(q.text)
      return blanks.length > 0 && blanks.every((ans, i) => isBlankCorrect(ans, responses[i], strict))
    }
    if (q.type === 'single') {
      const opt = q.options.find((o) => o.id === a)
      return !!opt?.correct
    }
    if (q.type === 'multiple') {
      const chosen = new Set(Array.isArray(a) ? a : [])
      const correct = q.options.filter((o) => o.correct).map((o) => o.id)
      return (
        chosen.size === correct.length && correct.every((id) => chosen.has(id))
      )
    }
    const map = (a as Record<string, string>) ?? {}
    return q.pairs.every((p) => map[p.id] === p.right)
  }

  const correctCount = questions.filter(isCorrect).length
  const score = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0

  function reset() {
    setAnswers({})
    setSubmitted(false)
    setAttempt((n) => n + 1)
  }

  // Reveal correctness only when the quiz is configured to show answers.
  const reveal = submitted && showAnswers

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const ok = reveal && isCorrect(q)
        const bad = reveal && !isCorrect(q)
        return (
          <div
            key={q.id}
            className={`rounded-lg border p-5 ${
              ok
                ? 'border-green-300 bg-green-50'
                : bad
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
            }`}
          >
            <p id={`${block.id}-${q.id}-prompt`} className="mb-3 font-medium text-gray-900">
              {qi + 1}. {q.prompt}
            </p>

            {(q.type === 'single' || q.type === 'multiple') && (
              <div
                role={q.type === 'single' ? 'radiogroup' : 'group'}
                aria-labelledby={`${block.id}-${q.id}-prompt`}
                className="space-y-2"
              >
                {q.options.map((o) => {
                  const selected =
                    q.type === 'single'
                      ? answers[q.id] === o.id
                      : Array.isArray(answers[q.id]) &&
                        (answers[q.id] as string[]).includes(o.id)
                  return (
                    <label
                      key={o.id}
                      className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3"
                    >
                      <input
                        type={q.type === 'single' ? 'radio' : 'checkbox'}
                        name={q.id}
                        checked={selected}
                        disabled={submitted}
                        className="accent-brand"
                        onChange={() => {
                          if (q.type === 'single') setAnswer(q.id, o.id)
                          else {
                            const cur = new Set(
                              Array.isArray(answers[q.id])
                                ? (answers[q.id] as string[])
                                : [],
                            )
                            if (cur.has(o.id)) cur.delete(o.id)
                            else cur.add(o.id)
                            setAnswer(q.id, [...cur])
                          }
                        }}
                      />
                      <span className="text-gray-800">{o.text}</span>
                      {reveal && o.feedback && selected && (
                        <span className="text-xs text-gray-500">— {o.feedback}</span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}

            {q.type === 'matching' && (
              <div className="space-y-2">
                {q.pairs.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="flex-1 text-gray-800">{p.left}</span>
                    <select
                      aria-label={p.left}
                      disabled={submitted}
                      value={((answers[q.id] as Record<string, string>) ?? {})[p.id] ?? ''}
                      onChange={(e) => {
                        const map = {
                          ...((answers[q.id] as Record<string, string>) ?? {}),
                          [p.id]: e.target.value,
                        }
                        setAnswer(q.id, map)
                      }}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">—</option>
                      {(matchingChoices[q.id] ?? q.pairs.map((x) => x.right)).map((right) => (
                        <option key={right} value={right}>
                          {right}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {q.type === 'sequence' && !submitted && (
              <p className="mb-2 text-sm text-gray-500">{ta('sequenceHint')}</p>
            )}
            {q.type === 'sequence' && (
              <SequenceList
                items={q.items}
                order={sequenceOrder(q)}
                onChange={(order) => setAnswer(q.id, order)}
                submitted={submitted}
                reveal={reveal}
              />
            )}

            {q.type === 'fillBlanks' && (
              <BlanksText
                text={q.text}
                mode={q.mode}
                strict={q.mode === 'type' && !!q.caseSensitive}
                responses={(answers[q.id] as string[] | undefined) ?? []}
                onChange={(i, value) => {
                  const next = ((answers[q.id] as string[] | undefined) ?? []).slice()
                  next[i] = value
                  setAnswer(q.id, next)
                }}
                submitted={submitted}
                reveal={reveal}
                attempt={attempt}
              />
            )}

            {reveal && (
              <p
                className={`mt-3 text-sm font-medium ${ok ? 'text-green-700' : 'text-red-700'}`}
              >
                <span aria-hidden>{ok ? '✓ ' : '✗ '}</span>
                {ok ? t('correct') : t('incorrect')}
                {q.feedback ? ` — ${q.feedback}` : ''}
              </p>
            )}
          </div>
        )
      })}

      <ScoreResult
        submitted={submitted}
        score={score}
        passingScore={passingScore}
        submitLabel={questions.length > 1 ? t('submitAll') : undefined}
        onSubmit={() => {
          setSubmitted(true)
          markDone(block.id)
        }}
        onRetry={reset}
      />
    </div>
  )
}
