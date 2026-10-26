import { useId, useRef, useState } from 'react'
import type { PreviewProps } from '../types'
import { useT } from '../../i18n/I18nProvider'
import { useMarkDone } from '../progress'

// Same markup/classes as the player's renderReflection. Not scored; the
// sample answer appears once the learner has submitted their own.
export default function ReflectionPreview({ block }: PreviewProps<'reflection'>) {
  const { t } = useT('explainers')
  const markDone = useMarkDone()
  const { prompt, sample } = block.data
  const id = useId()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function submit() {
    setSaved(true)
    setSubmitted(true)
    markDone(block.id)
  }

  return (
    <div className="sc-reflect">
      <label htmlFor={id} className="sc-reflect-prompt">{prompt}</label>
      <textarea
        ref={inputRef}
        id={id}
        className="sc-reflect-input"
        value={answer}
        readOnly={saved}
        placeholder={t('answerPlaceholder')}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="sc-reflect-actions">
        {saved ? (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => {
              setSaved(false)
              inputRef.current?.focus()
            }}
          >
            {t('editAnswer')}
          </button>
        ) : (
          <button type="button" className="btn-primary text-sm" disabled={!answer.trim()} onClick={submit}>
            {t('submitAnswer')}
          </button>
        )}
        <span role="status" className="sc-reflect-status">{saved ? t('answerSaved') : ''}</span>
      </div>
      {submitted && sample.trim() && (
        <div className="sc-reflect-sample">
          <p className="sc-reflect-sample-label">{t('sampleLabel')}</p>
          <p className="sc-reflect-sample-text">{sample}</p>
        </div>
      )}
    </div>
  )
}
