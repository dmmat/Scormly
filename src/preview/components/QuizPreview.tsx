import { useState } from 'react'
import type { PreviewProps } from '../types'
import type { Question } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'

type Answer = string | string[] | Record<string, string>

export default function QuizPreview({ block }: PreviewProps<'quiz'>) {
  const { t } = useT('preview')
  const { questions, passingScore } = block.data
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [submitted, setSubmitted] = useState(false)

  function setAnswer(qId: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  function isCorrect(q: Question): boolean {
    const a = answers[q.id]
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
  const passed = score >= passingScore

  function reset() {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const ok = submitted && isCorrect(q)
        const bad = submitted && !isCorrect(q)
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
            <p className="mb-3 font-medium text-gray-900">
              {qi + 1}. {q.prompt}
            </p>

            {(q.type === 'single' || q.type === 'multiple') && (
              <div className="space-y-2">
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
                      {submitted && o.feedback && selected && (
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
                      {q.pairs.map((opt) => (
                        <option key={opt.id} value={opt.right}>
                          {opt.right}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {submitted && (
              <p
                className={`mt-3 text-sm font-medium ${ok ? 'text-green-700' : 'text-red-700'}`}
              >
                {ok ? t('correct') : t('incorrect')}
                {q.feedback ? ` — ${q.feedback}` : ''}
              </p>
            )}
          </div>
        )
      })}

      {submitted ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="text-lg font-semibold text-gray-900">
            {t('yourScore', { score })}
          </p>
          <p
            className={`mt-1 font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}
          >
            {passed ? t('passed') : t('failed')}
          </p>
          <button type="button" onClick={reset} className="btn-secondary mt-4 text-sm">
            {t('retry')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="btn-primary text-sm"
        >
          {t('submit')}
        </button>
      )}
    </div>
  )
}
