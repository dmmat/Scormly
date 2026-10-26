// Tables inside the rich-text editor (contentEditable): plain DOM operations
// on <table class="rt-table rt-table-<style>"> with an optional one-row
// <thead>. No merged cells, so every row has the same number of cells. The
// look lives in src/styles/blocks.css (.rich-text table), shared with the
// preview and the SCORM player, which render the stored HTML as is.

export type RtTableStyle = 'grid' | 'stripes' | 'lines'
export const RT_TABLE_STYLES: RtTableStyle[] = ['grid', 'stripes', 'lines']

function newCell(tag: 'td' | 'th'): HTMLTableCellElement {
  const c = document.createElement(tag)
  if (tag === 'th') c.setAttribute('scope', 'col')
  c.appendChild(document.createElement('br'))
  return c
}

const tableOf = (c: HTMLTableCellElement) => c.closest('table') as HTMLTableElement
const inHead = (tr: HTMLTableRowElement) => tr.parentElement?.tagName === 'THEAD'

/** cols × rows, rows counting the header row. */
export function createTable(cols: number, rows: number): HTMLTableElement {
  const table = document.createElement('table')
  table.className = 'rt-table rt-table-grid'
  const head = table.createTHead().insertRow()
  for (let i = 0; i < cols; i++) head.appendChild(newCell('th'))
  const body = table.createTBody()
  for (let r = 1; r < Math.max(2, rows); r++) {
    const tr = body.insertRow()
    for (let i = 0; i < cols; i++) tr.appendChild(newCell('td'))
  }
  return table
}

/** Tables are blocks: one goes after the top-level block holding the caret,
 *  or replaces it when that block is empty. A paragraph follows it, so the
 *  author can keep typing below. */
export function insertTable(root: HTMLElement, range: Range | null, table: HTMLTableElement) {
  let block: Node | null = range && root.contains(range.startContainer) ? range.startContainer : null
  while (block && block.parentNode !== root) block = block.parentNode
  const empty = block instanceof HTMLElement && !block.textContent?.trim() && !block.querySelector('img, table')
  if (block && empty) root.replaceChild(table, block)
  else root.insertBefore(table, block ? block.nextSibling : null)
  if (!table.nextElementSibling) {
    const p = document.createElement('p')
    p.appendChild(document.createElement('br'))
    root.insertBefore(p, table.nextSibling)
  }
}

/** The table cell holding `node`, if it is inside `root`. */
export function cellAt(node: Node | null, root: HTMLElement): HTMLTableCellElement | null {
  const el = node instanceof Element ? node : node?.parentElement
  const c = el?.closest('td, th') as HTMLTableCellElement | null
  return c && root.contains(c) ? c : null
}

/** Put the caret at the start of a cell. */
export function placeCaret(c: HTMLTableCellElement) {
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  r.selectNodeContents(c)
  r.collapse(true)
  sel.removeAllRanges()
  sel.addRange(r)
}

/** The next (or previous) cell in reading order, header included. */
export function adjacentCell(c: HTMLTableCellElement, back: boolean): HTMLTableCellElement | null {
  const cells = Array.from(tableOf(c).querySelectorAll<HTMLTableCellElement>('th, td'))
  return cells[cells.indexOf(c) + (back ? -1 : 1)] ?? null
}

/** New body row above / below the cell's row (the header stays one row:
 *  "below" the header is the top of the body). Returns the cell under `c`. */
export function insertRow(c: HTMLTableCellElement, below: boolean): HTMLTableCellElement {
  const tr = c.parentElement as HTMLTableRowElement
  const table = tableOf(c)
  const row = document.createElement('tr')
  for (let i = 0; i < tr.cells.length; i++) row.appendChild(newCell('td'))
  if (inHead(tr)) {
    const body = table.tBodies[0] ?? table.createTBody()
    body.insertBefore(row, body.firstChild)
  } else {
    tr.parentElement!.insertBefore(row, below ? tr.nextSibling : tr)
  }
  return row.cells[c.cellIndex]
}

/** New column left / right of the cell. Returns the new cell in its row. */
export function insertColumn(c: HTMLTableCellElement, right: boolean): HTMLTableCellElement {
  const at = c.cellIndex + (right ? 1 : 0)
  for (const tr of Array.from(tableOf(c).rows)) {
    tr.insertBefore(newCell(inHead(tr) ? 'th' : 'td'), tr.cells[at] ?? null)
  }
  return (c.parentElement as HTMLTableRowElement).cells[at]
}

/** Removes the cell's row (the whole table when it is the last one). Returns
 *  the cell to continue in, or null when the table is gone. */
export function deleteRow(c: HTMLTableCellElement): HTMLTableCellElement | null {
  const table = tableOf(c)
  const tr = c.parentElement as HTMLTableRowElement
  const rows = Array.from(table.rows)
  if (rows.length <= 1) return deleteTable(table)
  const at = rows.indexOf(tr)
  const col = c.cellIndex
  const section = tr.parentElement!
  tr.remove()
  if (!section.children.length) section.remove()
  const left = Array.from(table.rows)
  const next = left[Math.min(at, left.length - 1)]
  return next.cells[Math.min(col, next.cells.length - 1)]
}

/** Removes the cell's column (the whole table when it is the last one). */
export function deleteColumn(c: HTMLTableCellElement): HTMLTableCellElement | null {
  const table = tableOf(c)
  const tr = c.parentElement as HTMLTableRowElement
  if (tr.cells.length <= 1) return deleteTable(table)
  const col = c.cellIndex
  for (const row of Array.from(table.rows)) row.cells[col]?.remove()
  return tr.cells[Math.min(col, tr.cells.length - 1)]
}

export function deleteTable(table: HTMLTableElement): null {
  table.remove()
  return null
}

// A row with its cells re-created as td / th (contents moved over).
function retagRow(tr: HTMLTableRowElement, tag: 'td' | 'th'): HTMLTableRowElement {
  const row = document.createElement('tr')
  for (const cell of Array.from(tr.cells)) {
    const n = document.createElement(tag)
    if (tag === 'th') n.setAttribute('scope', 'col')
    while (cell.firstChild) n.appendChild(cell.firstChild)
    row.appendChild(n)
  }
  tr.remove()
  return row
}

export const hasHeader = (table: HTMLTableElement) => !!table.tHead?.rows.length

/** Header row on: the first row becomes column headings; off: back to a
 *  normal first row. */
export function setHeaderRow(table: HTMLTableElement, on: boolean) {
  if (on === hasHeader(table)) return
  if (on) {
    const body = table.tBodies[0]
    const first = body?.rows[0]
    if (!first) return
    // Keep at least one body row under the header.
    if (body.rows.length === 1) {
      const extra = body.insertRow()
      for (let i = 0; i < first.cells.length; i++) extra.appendChild(newCell('td'))
    }
    table.createTHead().appendChild(retagRow(first, 'th'))
  } else {
    const head = table.tHead!
    const body = table.tBodies[0] ?? table.createTBody()
    body.insertBefore(retagRow(head.rows[0], 'td'), body.firstChild)
    head.remove()
  }
}

export function tableStyle(table: HTMLTableElement): RtTableStyle {
  return RT_TABLE_STYLES.find((s) => table.classList.contains(`rt-table-${s}`)) ?? 'grid'
}

export function setTableStyle(table: HTMLTableElement, style: RtTableStyle) {
  for (const s of RT_TABLE_STYLES) table.classList.remove(`rt-table-${s}`)
  table.classList.add('rt-table', `rt-table-${style}`)
}

export const isFit = (table: HTMLTableElement) => table.classList.contains('rt-table-fit')

/** Full width of the text, or as narrow as the content allows. */
export function setFit(table: HTMLTableElement, fit: boolean) {
  table.classList.toggle('rt-table-fit', fit)
}
