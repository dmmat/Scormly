import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function TableBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'table'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { header, rows } = block.data
  const columnCount = rows[0]?.length ?? 0

  function setCell(r: number, c: number, value: string) {
    const next = rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
    )
    update(lessonId, block.id, { rows: next }, `table-${block.id}-${r}-${c}`)
  }

  function addRow() {
    const newRow = Array.from({ length: columnCount || 1 }, () => '')
    update(lessonId, block.id, { rows: [...rows, newRow] })
  }

  function removeRow(r: number) {
    update(lessonId, block.id, { rows: rows.filter((_, i) => i !== r) })
  }

  function addColumn() {
    update(lessonId, block.id, { rows: rows.map((row) => [...row, '']) })
  }

  function removeColumn(c: number) {
    update(lessonId, block.id, {
      rows: rows.map((row) => row.filter((_, i) => i !== c)),
    })
  }

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex flex-wrap items-center gap-3">
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
          <button type="button" onClick={addRow} className="btn-secondary text-sm">
            + {t('addRow')}
          </button>
          <button type="button" onClick={addColumn} className="btn-secondary text-sm">
            + {t('addColumn')}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-200">
          <tbody>
            {selected && columnCount > 1 && (
              <tr>
                <td className="border border-gray-200" />
                {rows[0].map((_, c) => (
                  <td key={c} className="border border-gray-200 px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeColumn(c)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={t('removeColumn')}
                    >
                      ✕
                    </button>
                  </td>
                ))}
              </tr>
            )}
            {rows.map((row, r) => {
              const isHeader = header && r === 0
              return (
                <tr key={r} className={isHeader ? 'bg-gray-50 font-semibold' : ''}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-gray-200 px-3 py-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        className="w-full bg-transparent outline-none"
                      />
                    </td>
                  ))}
                  {selected && rows.length > 1 && (
                    <td className="border-none px-1 align-middle">
                      <button
                        type="button"
                        onClick={() => removeRow(r)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label={t('removeRow')}
                      >
                        ✕
                      </button>
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
