import { useState } from 'react'
import type { PreviewProps } from '../types'
import type { GuideStep } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import RichHtml from '../RichHtml'

// Same markup/classes as the player's renderSteps (shared CSS in blocks.css).
export default function StepsPreview({ block }: PreviewProps<'steps'>) {
  const { layout, steps } = block.data
  if (!steps.length) return null
  if (layout === 'slides') return <Slides steps={steps} />
  return (
    <ol className="sc-steps sc-steps-list">
      {steps.map((s, i) => (
        <li key={s.id} className="sc-steps-item">
          <span className="sc-steps-num" aria-hidden>{i + 1}</span>
          <StepBody step={s} />
        </li>
      ))}
    </ol>
  )
}

export function StepImage({ src, alt }: { src: string; alt?: string }) {
  const url = useAssetUrl(src)
  return (
    <figure className="sc-steps-media">
      <img src={url || undefined} alt={alt ?? ''} />
    </figure>
  )
}

function StepBody({ step }: { step: GuideStep }) {
  return (
    <div className="sc-steps-body">
      {step.title && <h3 className="sc-steps-title">{step.title}</h3>}
      <RichHtml html={step.html} className="sc-steps-text rich-text" />
      {step.src && <StepImage src={step.src} alt={step.alt} />}
    </div>
  )
}

// One step at a time: progress bars, Back / Next (Start over on the last).
function Slides({ steps }: { steps: GuideStep[] }) {
  const { t } = useT('explainers')
  const [index, setIndex] = useState(0)
  const i = Math.min(index, steps.length - 1)
  const last = i === steps.length - 1
  return (
    <div className="sc-steps sc-steps-slides">
      <div className="sc-steps-bars" aria-hidden>
        {steps.map((s, k) => (
          <span key={s.id} className={k <= i ? 'is-done' : undefined} />
        ))}
      </div>
      <div className="sc-steps-slide" aria-live="polite">
        <span className="sc-steps-num" aria-hidden>{i + 1}</span>
        <StepBody key={steps[i].id} step={steps[i]} />
      </div>
      <div className="sc-steps-nav">
        <button
          type="button"
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={i === 0}
          onClick={() => setIndex(i - 1)}
        >
          {t('back')}
        </button>
        <span className="sc-steps-count">{t('stepOf', { n: i + 1, total: steps.length })}</span>
        <button type="button" className="btn-primary text-sm" onClick={() => setIndex(last ? 0 : i + 1)}>
          {last ? t('startOver') : t('next')}
        </button>
      </div>
    </div>
  )
}
