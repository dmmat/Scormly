import { Fragment, type CSSProperties } from 'react'
import type { PreviewProps } from '../types'

// Same markup/classes as the player's renderComparison (shared CSS in blocks.css).
export default function ComparisonPreview({ block }: PreviewProps<'comparison'>) {
  const { columns, versus } = block.data
  if (!columns.length) return null
  const vs = !!versus && columns.length === 2
  return (
    <div className={`sc-compare${vs ? ' sc-compare-vs' : ''}`} style={{ '--n': columns.length } as CSSProperties}>
      <div className="sc-compare-grid">
        {columns.map((col, i) => (
          <Fragment key={col.id}>
            {vs && i === 1 && <span className="sc-compare-badge" aria-hidden>VS</span>}
            <div className={`sc-compare-col sc-compare-${col.tone}`}>
              {col.title && <h3 className="sc-compare-title">{col.title}</h3>}
              <ul className="sc-compare-list">
                {col.items.filter((it) => it.trim()).map((it, k) => (
                  <li key={k} className="sc-compare-item">
                    <span className="sc-compare-mark" aria-hidden />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
