// Pasting a spreadsheet range into a table block (src/lib/tablePaste.ts).

import { describe, test, expect } from 'vitest'
import { parseGrid, pasteGrid } from '../src/lib/tablePaste'

describe('parseGrid', () => {
  test('reads tab-separated rows and drops the trailing line break', () => {
    expect(parseGrid('a\tb\r\nc\td\r\n')).toEqual([['a', 'b'], ['c', 'd']])
  })

  test('keeps tabs, line breaks and quotes inside a quoted cell', () => {
    expect(parseGrid('"line 1\nline 2"\t"say ""hi"""\nx\t5" pipe\n')).toEqual([
      ['line 1\nline 2', 'say "hi"'],
      ['x', '5" pipe'],
    ])
  })

  test('one column copied from a spreadsheet is a grid, plain text is not', () => {
    expect(parseGrid('a\nb\n', '<table><tr><td>a</td></tr><tr><td>b</td></tr></table>')).toEqual([['a'], ['b']])
    expect(parseGrid('a\nb\n')).toBeNull()
    // Lines copied from inside one cell of some table are text, not rows.
    expect(parseGrid('a\nb\n', '<table><tr><td>a<br>b</td></tr></table>')).toBeNull()
    // A single cell pastes into the field like any text.
    expect(parseGrid('a\n', '<table><tr><td>a</td></tr></table>')).toBeNull()
  })

  test('keeps quotation marks a cell was typed with', () => {
    expect(parseGrid('"Best" plan\t$10\n')).toEqual([['"Best" plan', '$10']])
    expect(parseGrid('"Draft\tA\nB\tC')).toEqual([['"Draft', 'A'], ['B', 'C']])
  })
})

describe('pasteGrid', () => {
  test('writes from the given cell and grows the table as needed', () => {
    const rows = [['h1', 'h2'], ['a', 'b']]
    expect(pasteGrid(rows, 1, 1, [['X', 'Y'], ['Z', 'W']])).toEqual([
      ['h1', 'h2', ''],
      ['a', 'X', 'Y'],
      ['', 'Z', 'W'],
    ])
    expect(rows).toEqual([['h1', 'h2'], ['a', 'b']])
  })
})
