import { useMemo } from 'react'
import { useT } from '../../i18n/I18nProvider'
import { isBlankCorrect, parseBlanks, selectOptions } from '../../blocks/fillBlanks'
import { shuffledOrder } from '../../blocks/ordering'
import ResultMark from './ResultMark'

// Text with inline blanks (typed or picked from a list), shared by the
// fill-in-the-blanks block and quiz fill-in questions. `strict` = compare
// case-sensitively; dropdown options are re-shuffled when `attempt` changes.
export default function BlanksText({
  text,
  mode,
  strict,
  responses,
  onChange,
  submitted,
  reveal,
  attempt,
}: {
  text: string
  mode: 'type' | 'select'
  strict: boolean
  responses: string[]
  onChange: (index: number, value: string) => void
  submitted: boolean
  reveal: boolean
  attempt: number
}) {
  const { t } = useT('assessment')
  const segments = useMemo(() => parseBlanks(text), [text])
  const options = useMemo(
    () => shuffledOrder(selectOptions(segments.flatMap((s) => (s.kind === 'blank' ? [s.answers] : [])))),
    [segments, attempt],
  )

  return (
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
                onChange={(e) => onChange(s.index, e.target.value)}
                className={`rounded-md border px-2 py-0.5 text-gray-800 outline-none ${tone}`}
              >
                <option value="">…</option>
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
                onChange={(e) => onChange(s.index, e.target.value)}
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
  )
}
