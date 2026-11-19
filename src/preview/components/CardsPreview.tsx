import type { CSSProperties } from 'react'
import type { PreviewProps } from '../types'
import RichHtml from '../RichHtml'

// Same markup/classes as the player's renderCards (shared CSS in blocks.css).
export default function CardsPreview({ block }: PreviewProps<'cards'>) {
  const { items, layout, numbered, perRow, labelStyle } = block.data
  if (!items.length) return null
  const rows = layout === 'rows'
  return (
    <div
      className={`sc-cards${rows ? ' sc-cards-rows' : ''}${labelStyle === 'text' ? ' sc-cards-text' : ''}`}
      style={perRow && !rows ? ({ '--per': perRow } as CSSProperties) : undefined}
    >
      {items.map((item, i) => (
        <div key={item.id} className={`sc-card${item.highlight ? ' sc-card-hl' : ''}`}>
          {(numbered || item.badge) && (
            <div className="sc-card-top">
              {numbered && <span className="sc-card-num">{i + 1}</span>}
              {item.badge && <span className="sc-card-badge">{item.badge}</span>}
            </div>
          )}
          {item.title && <h3 className="sc-card-title">{item.title}</h3>}
          {item.html && <RichHtml html={item.html} className="sc-card-text rich-text" />}
        </div>
      ))}
    </div>
  )
}
