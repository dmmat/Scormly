import { useEffect, useRef, useState } from 'react'
import type { BlockType } from '../../types/course'
import {
  BLOCK_CATEGORIES,
  BLOCK_REGISTRY,
  type BlockCategory,
} from '../../blocks/registry'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

interface AddBlockMenuProps {
  lessonId: string
  /** Insertion position; defaults to the end of the lesson. */
  atIndex?: number
}

const CATEGORY_KEY: Record<BlockCategory, string> = {
  text: 'catText',
  media: 'catMedia',
  interactive: 'catInteractive',
  navigation: 'catNavigation',
}

export default function AddBlockMenu({ lessonId, atIndex }: AddBlockMenuProps) {
  const addBlock = useCourseStore((s) => s.addBlock)
  const { t } = useT('common')
  const { t: tb } = useT('blocks')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function handleAdd(type: BlockType) {
    addBlock(lessonId, type, atIndex)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand"
      >
        <span className="text-base leading-none">+</span> {t('addBlock')}
      </button>

      {open && (
        <div className="absolute top-full z-20 mt-2 max-h-[28rem] w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {BLOCK_CATEGORIES.map(({ category }) => {
            const items = Object.values(BLOCK_REGISTRY).filter(
              (m) => m.category === category,
            )
            if (items.length === 0) return null
            return (
              <div key={category} className="mb-3 last:mb-1">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t(CATEGORY_KEY[category])}
                </p>
                <div className="grid grid-cols-1 gap-0.5">
                  {items.map((meta) => (
                    <button
                      key={meta.type}
                      type="button"
                      onClick={() => handleAdd(meta.type)}
                      className="flex items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-sm text-brand">
                        {meta.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800">
                          {tb(meta.type)}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {tb(`${meta.type}Desc`)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
