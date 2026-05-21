import type { PreviewProps } from '../types'

export default function TablePreview({ block }: PreviewProps<'table'>) {
  const { header, rows } = block.data
  const bodyRows = header ? rows.slice(1) : rows
  const headerRow = header ? rows[0] : undefined

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse border border-gray-200">
        {headerRow && (
          <thead>
            <tr className="bg-gray-50 font-semibold">
              {headerRow.map((cell, c) => (
                <th key={c} className="border border-gray-200 px-3 py-2 text-left">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border border-gray-200 px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
