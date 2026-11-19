import type { ClipboardEvent, CSSProperties, KeyboardEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, TableData, TableRowMark, TableStyle, TextAlign } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { MOD } from '../../lib/keyboard'
import { parseGrid, pasteGrid } from '../../lib/tablePaste'
import { AutoTextarea, Segmented } from '../../components/editor/controls'
import TablePreview from '../../preview/components/TablePreview'
import { normalizeHex } from '../../theme/customTheme'
import { TABLE_STYLES, rowMarkClass, tableCards, tableClass, tableHeadStyle } from '../styleClasses'

// Where the color picker starts when the author asks for their own color.
const CUSTOM_HEAD = '#0f766e'

const MARKS: TableRowMark[] = ['', 'highlight', 'muted']

/** `value` with the selection a..b made bold (wrapped in ** **), or plain
 *  again when it already is: the markers may sit inside the selection or
 *  just around it. */
export function toggleBold(value: string, a: number, b: number): string {
  const picked = value.slice(a, b)
  if (picked.length > 4 && picked.startsWith('**') && picked.endsWith('**')) {
    return value.slice(0, a) + picked.slice(2, -2) + value.slice(b)
  }
  if (value.slice(a - 2, a) === '**' && value.slice(b, b + 2) === '**') {
    return value.slice(0, a - 2) + picked + value.slice(b + 2)
  }
  return value.slice(0, a) + `**${picked}**` + value.slice(b)
}

const iconBtn =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700'

export default function TableBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'table'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { t: td } = useT('design')
  const { header, rows, width = 'full', align = 'left', style = 'grid', layout = 'table', headerColor, rowMarks, highlightColumn } = block.data
  const head = tableHeadStyle(headerColor)
  const headMode = headerColor === 'dark' ? 'dark' : head ? 'custom' : 'theme'
  const columnCount = rows[0]?.length ?? 0
  const cards = layout === 'cards' ? tableCards(rows) : null

  function setCell(r: number, c: number, value: string) {
    const next = rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
    )
    update(lessonId, block.id, { rows: next }, `table-${block.id}-${r}-${c}`)
  }

  // Ctrl/Cmd+B wraps the selected text in ** ** (bold), or unwraps it.
  function onCellKey(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, r: number, c: number) {
    if (!(e.ctrlKey || e.metaKey) || e.code !== 'KeyB') return
    e.preventDefault()
    e.stopPropagation()
    const { selectionStart: a, selectionEnd: b, value } = e.currentTarget
    if (a == null || b == null || a === b) return
    setCell(r, c, toggleBold(value, a, b))
  }

  function addRow() {
    const newRow = Array.from({ length: columnCount || 1 }, () => '')
    update(lessonId, block.id, { rows: [...rows, newRow] })
  }

  function removeRow(r: number) {
    update(lessonId, block.id, {
      rows: rows.filter((_, i) => i !== r),
      rowMarks: rowMarks?.filter((_, i) => i !== r),
    })
  }

  // none → highlight → muted → none
  function cycleMark(r: number) {
    const next: TableRowMark = MARKS[(MARKS.indexOf(rowMarks?.[r] ?? '') + 1) % MARKS.length]
    update(lessonId, block.id, { rowMarks: rows.map((_, i) => (i === r ? next : rowMarks?.[i] ?? '')) })
  }

  // A range copied from a spreadsheet fills the cells from this one on.
  function onCellPaste(e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, r: number, c: number) {
    const grid = parseGrid(e.clipboardData.getData('text/plain'), e.clipboardData.getData('text/html'))
    if (!grid) return
    e.preventDefault()
    update(lessonId, block.id, { rows: pasteGrid(rows, r, c, grid) })
  }

  const markButton = (r: number) => {
    const mark = rowMarks?.[r] || 'none'
    return (
      <button
        type="button"
        onClick={() => cycleMark(r)}
        title={`${t('rowMark')}: ${t(`rowMark_${mark}`)}`}
        aria-label={`${t('rowMark')}: ${t(`rowMark_${mark}`)}`}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-gray-100"
      >
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full border ${
            mark === 'highlight' ? 'border-brand bg-brand' : mark === 'muted' ? 'border-gray-300 bg-gray-300' : 'border-gray-400'
          }`}
        />
      </button>
    )
  }

  function addColumn() {
    update(lessonId, block.id, { rows: rows.map((row) => [...row, '']) })
  }

  function removeColumn(c: number) {
    update(lessonId, block.id, {
      rows: rows.map((row) => row.filter((_, i) => i !== c)),
      // The highlighted card follows its column.
      highlightColumn: !highlightColumn || highlightColumn === c ? undefined : highlightColumn - (c < highlightColumn ? 1 : 0),
    })
  }

  // Cards need a label column plus one card, and a title row plus one line.
  function setLayout(next: NonNullable<TableData['layout']>) {
    let grid = rows.length ? rows : [['']]
    if (next === 'cards') {
      if (grid[0].length < 2) grid = grid.map((row) => [...row, ''])
      if (grid.length < 2) grid = [...grid, grid[0].map(() => '')]
    }
    update(lessonId, block.id, { layout: next, rows: grid })
  }

  // Unselected, the block is exactly what the learner sees.
  if (!selected) return <TablePreview block={block} />

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented<NonNullable<TableData['layout']>>
        label={t('tableLayout')}
        value={cards ? 'cards' : 'table'}
        onChange={setLayout}
        options={[
          ['table', t('tableLayout_table')],
          ['cards', t('tableLayout_cards')],
        ]}
      />
      {!cards && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={header}
            onChange={(e) =>
              update(lessonId, block.id, { header: e.target.checked })
            }
          />
          {t('headerRow')}
        </label>
      )}
      {(cards || style === 'panel') && (
        <>
          <Segmented<'theme' | 'dark' | 'custom'>
            label={t('tableHead')}
            value={headMode}
            onChange={(v) =>
              update(lessonId, block.id, { headerColor: v === 'custom' ? CUSTOM_HEAD : v === 'dark' ? 'dark' : undefined })
            }
            options={(['theme', 'dark', 'custom'] as const).map((m) => [m, t(`tableHead_${m}`)] as const)}
          />
          {headMode === 'custom' && (
            <input
              type="color"
              value={normalizeHex(headerColor ?? '') ?? CUSTOM_HEAD}
              aria-label={t('tableHead')}
              onChange={(e) => update(lessonId, block.id, { headerColor: e.target.value }, `table-head-${block.id}`)}
              className="h-8 w-10 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
            />
          )}
        </>
      )}
      <button type="button" onClick={addRow} className="btn-secondary text-sm">
        + {t('addRow')}
      </button>
      <button type="button" onClick={addColumn} className="btn-secondary text-sm">
        + {t('addColumn')}
      </button>
      {!cards && (
        <>
          <Segmented<TableStyle>
            label={t('tableStyle')}
            value={style}
            onChange={(v) => update(lessonId, block.id, { style: v })}
            options={TABLE_STYLES.map((s) => [s, t(`tableStyle_${s}`)] as const)}
          />
          <Segmented<NonNullable<TableData['width']>>
            label={td('tableWidth')}
            value={width}
            onChange={(v) => update(lessonId, block.id, { width: v })}
            options={[
              ['full', td('tableWidth_full')],
              ['auto', td('tableWidth_auto')],
            ]}
          />
          {width === 'auto' && (
            <Segmented<TextAlign>
              label={td('imageAlign')}
              value={align}
              onChange={(v) => update(lessonId, block.id, { align: v })}
              options={(['left', 'center', 'right'] as const).map((a) => [a, td(`align_${a}`)] as const)}
            />
          )}
        </>
      )}
      <span className="text-xs text-gray-500">{t('cellBoldHint', { key: `${MOD}+B` })}</span>
    </div>
  )

  if (cards) {
    const ghost = 'w-full min-w-0 bg-transparent outline-none placeholder:opacity-50'
    return (
      <div className="space-y-3">
        {toolbar}
        <div className="sc-tcards" style={{ '--rows': cards.labels.length + 1, ...head } as CSSProperties}>
          {cards.cards.map((card, i) => (
            <div key={i} className={`sc-tcard${highlightColumn === i + 1 ? ' sc-tcard-hl' : ''}`}>
              <div className="sc-tcard-title gap-2">
                <input
                  type="text"
                  value={card.title}
                  placeholder={t('cardTitle')}
                  aria-label={t('cardTitle')}
                  onChange={(e) => setCell(0, i + 1, e.target.value)}
                  onKeyDown={(e) => onCellKey(e, 0, i + 1)}
                  onPaste={(e) => onCellPaste(e, 0, i + 1)}
                  className={ghost}
                />
                <button
                  type="button"
                  onClick={() => update(lessonId, block.id, { highlightColumn: highlightColumn === i + 1 ? undefined : i + 1 })}
                  aria-pressed={highlightColumn === i + 1}
                  title={t('cardHighlight')}
                  aria-label={t('cardHighlight')}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-black/15 ${highlightColumn === i + 1 ? '' : 'opacity-60 hover:opacity-100'}`}
                >
                  {highlightColumn === i + 1 ? '★' : '☆'}
                </button>
                {cards.cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColumn(i + 1)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 hover:bg-black/15 hover:opacity-100"
                    aria-label={t('removeColumn')}
                  >
                    ✕
                  </button>
                )}
              </div>
              {card.values.map((value, r) => (
                <div key={r} className={`sc-tcard-cell ${rowMarkClass(rowMarks, r + 1)}`}>
                  <div className="flex items-start gap-2">
                    {/* One label per line, shared by every card. */}
                    <input
                      type="text"
                      value={cards.labels[r]}
                      placeholder={t('cardLabel')}
                      aria-label={t('cardLabel')}
                      onChange={(e) => setCell(r + 1, 0, e.target.value)}
                      onKeyDown={(e) => onCellKey(e, r + 1, 0)}
                      onPaste={(e) => onCellPaste(e, r + 1, 0)}
                      className={`${ghost} sc-tcard-label`}
                    />
                    {i === 0 && <span className="-my-1">{markButton(r + 1)}</span>}
                    {i === 0 && cards.labels.length > 1 && (
                      // Small, so the first card's lines stay level with the others.
                      <button
                        type="button"
                        onClick={() => removeRow(r + 1)}
                        className="-my-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label={t('removeRow')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <AutoTextarea
                    value={value}
                    placeholder={t('cardValue')}
                    aria-label={t('cardValue')}
                    onChange={(e) => setCell(r + 1, i + 1, e.target.value)}
                    onKeyDown={(e) => onCellKey(e, r + 1, i + 1)}
                    onPaste={(e) => onCellPaste(e, r + 1, i + 1)}
                    className={`${ghost} sc-tcard-value`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {toolbar}
      <div className="overflow-x-auto">
        <table className={`${tableClass(width, align, style)}${head ? ' sc-thead-set' : ''} border border-gray-200`} style={head}>
          <tbody>
            {columnCount > 1 && (
              <tr className="sc-table-tools">
                {rows[0].map((_, c) => (
                  <td key={c} className="sc-table-tool border border-gray-200 px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeColumn(c)}
                      className={`${iconBtn} mx-auto`}
                      aria-label={t('removeColumn')}
                    >
                      ✕
                    </button>
                  </td>
                ))}
                <td className="sc-table-tool border-none" />
              </tr>
            )}
            {rows.map((row, r) => {
              const isHeader = header && r === 0
              const body = header ? r - 1 : r
              return (
                <tr
                  key={r}
                  className={isHeader ? 'sc-table-head bg-gray-50 font-semibold' : `${body % 2 ? 'sc-table-alt' : ''} ${rowMarkClass(rowMarks, r)}`}
                >
                  {row.map((cell, c) => (
                    <td key={c} className="border border-gray-200 px-3 py-2">
                      {/* Wraps like the learner's cell instead of cutting long text off. */}
                      <AutoTextarea
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        onKeyDown={(e) => onCellKey(e, r, c)}
                        onPaste={(e) => onCellPaste(e, r, c)}
                        // A fitted table sizes its columns to the text, as learners see it.
                        cols={width === 'auto' ? Math.max(4, ...cell.split('\n').map((line) => line.length + 1)) : undefined}
                        className={`block bg-transparent outline-none${width === 'auto' ? '' : ' w-full'}`}
                      />
                    </td>
                  ))}
                  {rows.length > 1 && (
                    <td className="sc-table-tool border-none px-1 align-middle">
                      <span className="flex items-center gap-0.5">
                      {!isHeader && markButton(r)}
                      <button
                        type="button"
                        onClick={() => removeRow(r)}
                        className={iconBtn}
                        aria-label={t('removeRow')}
                      >
                        ✕
                      </button>
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
