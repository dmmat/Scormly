import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useMenu } from '../../hooks/useMenu'

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  /** Keyboard shortcut hint shown on the right. */
  shortcut?: string
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

// A small fixed-position menu shown at a cursor location. Closes on outside
// click, Escape, Tab, scroll, or resize; arrow keys move between items.
export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useMenu({ open: true, onClose, rootRef: ref })

  useEffect(() => {
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  // Keep the menu inside the viewport, using its real rendered size.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const margin = 8
    setPos({
      left: Math.max(margin, Math.min(x, window.innerWidth - el.offsetWidth - margin)),
      top: Math.max(margin, Math.min(y, window.innerHeight - el.offsetHeight - margin)),
    })
  }, [x, y])

  return (
    <div
      ref={ref}
      role="menu"
      style={{ position: 'fixed', left: pos.left, top: pos.top }}
      // Rendered inside the block it acts on: keep clicks from bubbling to the
      // block (which would re-select it, e.g. right after deleting it).
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      className="z-50 w-max min-w-56 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-30 ${
            item.danger
              ? 'text-gray-700 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 focus:outline-none'
              : 'text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
          }`}
        >
          {item.icon && <span className="flex w-4 shrink-0 items-center justify-center text-gray-400">{item.icon}</span>}
          {item.label}
          {item.shortcut && (
            <span className="ml-auto whitespace-nowrap pl-3 text-xs text-gray-400">{item.shortcut}</span>
          )}
        </button>
      ))}
    </div>
  )
}
