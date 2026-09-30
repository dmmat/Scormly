import { useEffect, useRef, useState } from 'react'
import type { BlockType } from '../../types/course'
import {
  BLOCK_CATEGORIES,
  BLOCK_REGISTRY,
  type BlockCategory,
} from '../../blocks/registry'
import { useCourseStore } from '../../store/courseStore'
import { useMenu } from '../../hooks/useMenu'
import { useT } from '../../i18n/I18nProvider'
import BlockIcon from '../../blocks/BlockIcon'

interface AddBlockMenuProps {
  lessonId: string
  /** Insertion position; defaults to the end of the lesson. */
  atIndex?: number
  /** 'inline' = a hover-revealed "+" on a divider line between blocks. */
  variant?: 'button' | 'inline'
}

const CATEGORY_KEY: Record<BlockCategory, string> = {
  text: 'catText',
  media: 'catMedia',
  interactive: 'catInteractive',
  navigation: 'catNavigation',
}

export default function AddBlockMenu({
  lessonId,
  atIndex,
  variant = 'button',
}: AddBlockMenuProps) {
  const addBlock = useCourseStore((s) => s.addBlock)
  const { t } = useT('common')
  const { t: tb } = useT('blocks')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [placement, setPlacement] = useState<'down' | 'up'>('down')
  const [maxHeight, setMaxHeight] = useState(448)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Match the search query against each block's translated name + description.
  const q = query.trim().toLowerCase()
  const matches = (type: BlockType) =>
    !q ||
    tb(type).toLowerCase().includes(q) ||
    tb(`${type}Desc`).toLowerCase().includes(q)
  // First match in display order (category by category), picked by Enter.
  const firstMatch = BLOCK_CATEGORIES.flatMap(({ category }) =>
    Object.values(BLOCK_REGISTRY).filter(
      (m) => m.category === category && matches(m.type),
    ),
  )[0]

  // Open toward whichever side has more room, and cap the height to the space
  // actually available there (minus a margin) so the menu never overflows the
  // viewport — the list scrolls instead of being clipped behind the header.
  function toggle() {
    if (!open) {
      setQuery('')
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) {
        const margin = 16
        // Space above is bounded by the fixed app header (h-14 = 56px), not the
        // viewport top, or an upward menu gets clipped behind it.
        const headerBottom = 56
        const below = window.innerHeight - rect.bottom - margin
        const above = rect.top - headerBottom - margin
        const up = above > below
        setPlacement(up ? 'up' : 'down')
        setMaxHeight(Math.max(220, Math.min(448, up ? above : below)))
      }
    }
    setOpen((v) => !v)
  }

  // Focus the search field when the menu opens (desktop convenience).
  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  // Search keeps focus on open; ↓ moves into the block list.
  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef, focusFirst: false })

  function handleAdd(type: BlockType) {
    addBlock(lessonId, type, atIndex)
    setOpen(false)
    setQuery('')
  }

  const inline = variant === 'inline'
  // Inline trigger stays hidden until hovered/focused (always faintly visible
  // on touch screens, which have no hover) and while its menu is open.
  const reveal = open
    ? 'opacity-100'
    : 'opacity-0 group-hover/gap:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-60'

  return (
    <div
      ref={rootRef}
      data-tour={inline ? undefined : 'add-block'}
      className={
        inline
          ? 'group/gap relative flex h-5 items-center justify-center'
          : 'relative flex justify-center'
      }
    >
      {inline ? (
        <>
          <div
            aria-hidden
            className={`absolute inset-x-4 top-1/2 h-px bg-brand/40 transition-opacity ${
              open ? 'opacity-100' : 'opacity-0 group-hover/gap:opacity-100'
            }`}
          />
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            title={t('insertBlock')}
            aria-label={t('insertBlock')}
            className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-brand/40 bg-white text-sm leading-none text-brand shadow-sm transition-opacity hover:bg-brand hover:text-white ${reveal}`}
          >
            +
          </button>
        </>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand"
        >
          <span className="text-base leading-none">+</span> {t('addBlock')}
        </button>
      )}

      {open && (
        <div
          style={{ maxHeight }}
          className={`absolute left-1/2 z-20 flex w-[22rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ${
            placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="border-b border-gray-100 p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && firstMatch) {
                  e.preventDefault()
                  handleAdd(firstMatch.type)
                }
              }}
              placeholder={t('searchBlocks')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div role="menu" className="overflow-y-auto p-3">
          {BLOCK_CATEGORIES.map(({ category }) => {
            const items = Object.values(BLOCK_REGISTRY).filter(
              (m) => m.category === category && matches(m.type),
            )
            if (items.length === 0) return null
            return (
              <div key={category} className="mb-3 last:mb-0">
                <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t(CATEGORY_KEY[category])}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((meta) => (
                    <button
                      key={meta.type}
                      type="button"
                      role="menuitem"
                      onClick={() => handleAdd(meta.type)}
                      className="flex flex-col gap-1 rounded-lg border border-gray-100 p-2.5 text-left transition-colors hover:border-brand/40 hover:bg-brand/5 focus:border-brand/40 focus:bg-brand/5 focus:outline-none"
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                          <BlockIcon type={meta.type} />
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {tb(meta.type)}
                        </span>
                      </span>
                      <span className="text-xs leading-tight text-gray-500">
                        {tb(`${meta.type}Desc`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {Object.values(BLOCK_REGISTRY).every((m) => !matches(m.type)) && (
            <p className="px-1 py-6 text-center text-sm text-gray-400">
              {t('noBlocks')}
            </p>
          )}
          </div>
        </div>
      )}
    </div>
  )
}
