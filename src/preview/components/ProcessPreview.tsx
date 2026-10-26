import { useId, useState, type CSSProperties } from 'react'
import type { PreviewProps } from '../types'
import type { ProcessStep } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import RichHtml from '../RichHtml'
import { flowCols, processClass, pyramidVars, ringPoint, stepHtml } from '../../blocks/process'

// Same markup/classes as the player's renderProcess (shared CSS in blocks.css).
export default function ProcessPreview({ block }: PreviewProps<'process'>) {
  const { layout, variant, steps } = block.data
  if (!steps.length) return null
  const n = steps.length
  return (
    <div className={processClass(layout, n, variant)} style={{ '--n': n, '--cols': flowCols(n) } as CSSProperties}>
      {layout === 'cycle' ? (
        <Cycle steps={steps} />
      ) : (
        <ol className="sc-process-list">
          {steps.map((s, i) => (
            <li
              key={s.id}
              className="sc-process-step"
              style={layout === 'pyramid' ? pyramidVars(i, n) : undefined}
            >
              {layout === 'flow' ? (
                <>
                  <span className="sc-process-num" aria-hidden>{i + 1}</span>
                  <p className="sc-process-title">{s.title}</p>
                </>
              ) : (
                <div className="sc-process-head">
                  <span className="sc-process-num" aria-hidden>{i + 1}</span>
                  <p className="sc-process-title">{s.title}</p>
                </div>
              )}
              <RichHtml html={stepHtml(s)} className="sc-process-text rich-text" />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// Steps on a ring; the open step's text shows in the middle.
function Cycle({ steps }: { steps: ProcessStep[] }) {
  const { t } = useT('explainers')
  const panelId = useId()
  const [open, setOpen] = useState(0)
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]))
  const n = steps.length
  const i = Math.min(open, n - 1)

  function show(k: number) {
    setOpen(k)
    setSeen((prev) => new Set(prev).add(k))
  }

  return (
    <>
      <div className="sc-cycle-ring">
        {steps.map((s, k) => {
          const p = ringPoint(k, n)
          return (
            <button
              key={s.id}
              type="button"
              className={`sc-cycle-node${k === i ? ' is-active' : ''}${seen.has(k) ? ' is-seen' : ''}`}
              style={{ '--x': `${p.x}%`, '--y': `${p.y}%` } as CSSProperties}
              aria-pressed={k === i}
              aria-controls={panelId}
              aria-label={t('openStep', { n: k + 1, title: s.title })}
              onClick={() => show(k)}
            >
              <span className="sc-cycle-node-num">{k + 1}</span>
              <span className="sc-cycle-node-title">{s.title}</span>
            </button>
          )
        })}
        {steps.map((s, k) => {
          const p = ringPoint(k + 0.5, n)
          return (
            <span
              key={s.id}
              aria-hidden
              className="sc-cycle-arrow"
              style={{ '--x': `${p.x}%`, '--y': `${p.y}%`, '--r': `${p.deg + 135}deg` } as CSSProperties}
            />
          )
        })}
        <div id={panelId} className="sc-cycle-panel" aria-live="polite">
          <p className="sc-process-title">{steps[i].title}</p>
          <RichHtml key={steps[i].id} html={stepHtml(steps[i])} className="sc-process-text rich-text" />
        </div>
      </div>
      <p className="sc-cycle-progress">{t('exploredOf', { n: Math.min(seen.size, n), total: n })}</p>
    </>
  )
}
