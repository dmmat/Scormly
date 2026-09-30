import { useEffect, useRef } from 'react'
import { useT } from '../../i18n/I18nProvider'

// Submit button / score panel shared by the scored exercise previews
// (quiz, ordering, fill in the blanks). The result sits in a persistent live
// region so it is announced; focus follows the swapped button so keyboard
// users aren't dropped to the top of the page.
export default function ScoreResult({
  submitted,
  score,
  passingScore,
  onSubmit,
  onRetry,
}: {
  submitted: boolean
  score: number
  passingScore: number
  onSubmit: () => void
  onRetry: () => void
}) {
  const { t } = useT('preview')
  const submitRef = useRef<HTMLButtonElement>(null)
  const retryRef = useRef<HTMLButtonElement>(null)
  const interacted = useRef(false)

  useEffect(() => {
    if (!interacted.current) return
    if (submitted) retryRef.current?.focus()
    else submitRef.current?.focus()
  }, [submitted])

  const passed = score >= passingScore
  return (
    <>
      {!submitted && (
        <button
          ref={submitRef}
          type="button"
          onClick={() => {
            interacted.current = true
            onSubmit()
          }}
          className="btn-primary text-sm"
        >
          {t('submit')}
        </button>
      )}
      <div role="status" aria-live="polite">
        {submitted && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <p className="text-lg font-semibold text-gray-900">{t('yourScore', { score })}</p>
            <p className={`mt-1 font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>
              <span aria-hidden>{passed ? '✓ ' : '✗ '}</span>
              {passed ? t('passed') : t('failed')}
            </p>
            <button
              ref={retryRef}
              type="button"
              onClick={() => {
                interacted.current = true
                onRetry()
              }}
              className="btn-secondary mt-4 text-sm"
            >
              {t('retry')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
