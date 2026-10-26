import type { ReactNode } from 'react'
import { useT } from '../../i18n/I18nProvider'

const ICON_BTN =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent'

// Editor row for a numbered list item (process / guide steps): number badge,
// the item's fields, and move up / down / remove buttons.
export default function ItemRow({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number
  count: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  children: ReactNode
}) {
  const { t } = useT('explainers')
  return (
    <li className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
      <div className="flex shrink-0 flex-col gap-1">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={ICON_BTN} aria-label={t('moveUp')} title={t('moveUp')}>
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className={ICON_BTN} aria-label={t('moveDown')} title={t('moveDown')}>
          ↓
        </button>
        <button type="button" onClick={onRemove} className={ICON_BTN} aria-label={t('removeStep')} title={t('removeStep')}>
          ✕
        </button>
      </div>
    </li>
  )
}

/** Copy of `list` with item `index` moved by `dir`. */
export function moved<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list]
  const [it] = next.splice(index, 1)
  next.splice(index + dir, 0, it)
  return next
}
