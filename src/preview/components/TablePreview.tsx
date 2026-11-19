import type { CSSProperties } from 'react'
import type { PreviewProps } from '../types'
import { cellRuns, rowMarkClass, tableCards, tableClass, tableHeadStyle } from '../../blocks/styleClasses'

function Cell({ text }: { text: string }) {
  return <>{cellRuns(text).map((run, i) => (run.bold ? <strong key={i}>{run.text}</strong> : run.text))}</>
}

// Same markup/classes as the player's renderTable (shared CSS in blocks.css).
export default function TablePreview({ block }: PreviewProps<'table'>) {
  const { header, rows, width, align, layout, style, headerColor, rowMarks, highlightColumn } = block.data
  const head = tableHeadStyle(headerColor)
  const cards = layout === 'cards' ? tableCards(rows) : null
  if (cards) {
    return (
      <div className="sc-tcards" style={{ '--rows': cards.labels.length + 1, ...head } as CSSProperties}>
        {cards.cards.map((card, i) => (
          <div key={i} className={`sc-tcard${highlightColumn === i + 1 ? ' sc-tcard-hl' : ''}`}>
            <h3 className="sc-tcard-title"><Cell text={card.title} /></h3>
            {card.values.map((value, r) => (
              <div key={r} className={`sc-tcard-cell ${rowMarkClass(rowMarks, r + 1)}`}>
                {cards.labels[r] && <span className="sc-tcard-label"><Cell text={cards.labels[r]} /></span>}
                <span className="sc-tcard-value"><Cell text={value} /></span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const bodyRows = header ? rows.slice(1) : rows
  const headerRow = header ? rows[0] : undefined

  return (
    <div className="overflow-x-auto">
      <table className={`${tableClass(width, align, style)}${head ? ' sc-thead-set' : ''} border border-gray-200`} style={head}>
        {headerRow && (
          <thead>
            <tr className="sc-table-head bg-gray-50 font-semibold">
              {headerRow.map((cell, c) => (
                <th key={c} className="border border-gray-200 px-3 py-2 text-left">
                  <Cell text={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, r) => (
            <tr key={r} className={`${r % 2 ? 'sc-table-alt' : ''} ${rowMarkClass(rowMarks, header ? r + 1 : r)}`}>
              {row.map((cell, c) => (
                <td key={c} className="border border-gray-200 px-3 py-2">
                  <Cell text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
