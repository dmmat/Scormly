import { useEffect, useId, useRef, useState } from 'react'
import { useT } from '../../i18n/I18nProvider'

// Submit button / score panel shared by the scored exercise previews
// (quiz, ordering, fill in the blanks). The result sits in a persistent live
// region so it is announced; focus follows the swapped button so keyboard
// users aren't dropped to the top of the page.
export default function ScoreResult({
  submitted,
  score,
  passingScore,
  submitLabel,
  onSubmit,
  onRetry,
  onSimulate,
  canPass = false,
  canFail = false,
}: {
  submitted: boolean
  score: number
  passingScore: number
  /** Defaults to "Submit answer". */
  submitLabel?: string
  onSubmit: () => void
  onRetry: () => void
  /** Author shortcut in the preview: answer so it passes / fails and submit. */
  onSimulate?: (outcome: 'pass' | 'fail') => void
  canPass?: boolean
  canFail?: boolean
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            ref={submitRef}
            type="button"
            onClick={() => {
              interacted.current = true
              onSubmit()
            }}
            className="btn-primary text-sm"
          >
            {submitLabel ?? t('submit')}
          </button>
          {onSimulate && (
            <CompleteTest
              canPass={canPass}
              canFail={canFail}
              onPick={(outcome) => {
                interacted.current = true
                onSimulate(outcome)
              }}
            />
          )}
        </div>
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

const chip =
  'inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

// "Complete the test" → Passed / Not passed: the author's shortcut, styled
// as a dashed tool chip so it doesn't read as part of the course.
function CompleteTest({
  canPass,
  canFail,
  onPick,
}: {
  canPass: boolean
  canFail: boolean
  onPick: (outcome: 'pass' | 'fail') => void
}) {
  const { t } = useT('preview')
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="ml-auto flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-describedby={`${id}-hint`}
        title={t('autoTestHint')}
        onClick={() => setOpen((o) => !o)}
        className={`${chip} border-gray-300 text-gray-600 hover:border-brand hover:text-brand-dark`}
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M3 5.5v13L12 12zM12 5.5v13l9-6.5z" />
        </svg>
        {t('autoTest')}
      </button>
      <span id={`${id}-hint`} className="sr-only">
        {t('autoTestHint')}
      </span>
      <span id={`${id}-options`} hidden={!open} className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canPass}
          title={canPass ? undefined : t('autoPassOff')}
          onClick={() => onPick('pass')}
          className={`${chip} border-green-300 text-green-700 enabled:hover:bg-green-50`}
        >
          <span aria-hidden>✓</span>
          {t('autoPass')}
        </button>
        <button
          type="button"
          disabled={!canFail}
          title={canFail ? undefined : t('autoFailOff')}
          onClick={() => onPick('fail')}
          className={`${chip} border-red-300 text-red-700 enabled:hover:bg-red-50`}
        >
          <span aria-hidden>✗</span>
          {t('autoFail')}
        </button>
      </span>
    </div>
  )
}
