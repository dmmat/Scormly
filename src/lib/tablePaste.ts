// Pasting a range copied from a spreadsheet (Excel, Google Sheets) into a
// table block: the clipboard text is tab-separated, one line per row, and a
// cell holding tabs or line breaks is wrapped in double quotes ("" = a quote).

/** The copied cells as rows, or null when the clipboard isn't a range of
 *  cells (plain text, or one cell: those paste into the field as usual). */
export function parseGrid(text: string, html = ''): string[][] | null {
  // One column has no tabs: then the HTML flavour must show several cells
  // (text copied from inside a single cell of some table is just text).
  if (!text.includes('\t') && (html.match(/<t[dh][\s>]/gi)?.length ?? 0) < 2) return null
  const src = text.replace(/\r\n?/g, '\n')
  const rows: string[][] = [[]]
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch !== '"') cell += ch
      else if (src[i + 1] === '"') {
        cell += '"'
        i++
      } else quoted = false
    } else if (ch === '"' && cell === '' && closesCell(src, i)) quoted = true
    else if (ch === '\t' || ch === '\n') {
      rows[rows.length - 1].push(cell)
      cell = ''
      if (ch === '\n') rows.push([])
    } else cell += ch
  }
  rows[rows.length - 1].push(cell)
  // The copied text ends with a line break: drop the empty row it leaves.
  const last = rows[rows.length - 1]
  if (rows.length > 1 && last.length === 1 && last[0] === '') rows.pop()
  if (rows.length === 1 && rows[0].length === 1) return null
  return rows
}

// Spreadsheets quote only cells that hold tabs or line breaks; any other
// cell arrives as typed, quotation marks included. So an opening quote wraps
// the cell only when its closing quote ends the cell.
function closesCell(src: string, open: number): boolean {
  for (let i = open + 1; i < src.length; i++) {
    if (src[i] !== '"') continue
    if (src[i + 1] === '"') i++
    else return i + 1 === src.length || src[i + 1] === '\t' || src[i + 1] === '\n'
  }
  return false
}

/** `rows` with `grid` written from cell (r, c), grown where the grid runs
 *  past the last row or column. */
export function pasteGrid(rows: string[][], r: number, c: number, grid: string[][]): string[][] {
  const width = Math.max(rows[0]?.length ?? 0, c + Math.max(...grid.map((row) => row.length)))
  const height = Math.max(rows.length, r + grid.length)
  return Array.from({ length: height }, (_, ri) =>
    Array.from({ length: width }, (_, ci) => grid[ri - r]?.[ci - c] ?? rows[ri]?.[ci] ?? ''),
  )
}
