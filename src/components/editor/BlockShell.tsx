import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore } from '../../store/courseStore'
import { deleteBlockWithUndo } from '../../lib/deleteWithUndo'
import type { Block } from '../../types/course'
import BlockRenderer from '../../blocks/BlockRenderer'
import { useT } from '../../i18n/I18nProvider'
import ContextMenu, { type ContextMenuItem } from './ContextMenu'
import { KEYS, isEditableTarget } from '../../lib/keyboard'
import { useBlockWrapper } from '../../blocks/useBlockWrapper'
import BlockStylePopover from './BlockStylePopover'

interface BlockShellProps {
  block: Block
  lessonId: string
  index: number
  total: number
  /** Same background as the previous / next block: render as one panel. */
  joinPrev?: boolean
  joinNext?: boolean
}

// Wrapper for a content block in the editor: selection, toolbar (up/down/
// duplicate/delete). The content itself is rendered by BlockRenderer.
export default function BlockShell({
  block,
  lessonId,
  index,
  total,
  joinPrev,
  joinNext,
}: BlockShellProps) {
  const selectedBlockId = useCourseStore((s) => s.selectedBlockId)
  const selectBlock = useCourseStore((s) => s.selectBlock)
  const moveBlock = useCourseStore((s) => s.moveBlock)
  const duplicateBlock = useCourseStore((s) => s.duplicateBlock)

  const { t } = useT('common')
  const selected = block.id === selectedBlockId
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [styleOpen, setStyleOpen] = useState(false)
  // The style popover floats over the block, anchored to this button.
  const styleButtonRef = useRef<HTMLButtonElement>(null)
  function toggleStyle() {
    setStyleOpen((v) => !v)
  }
  const hasBackground = (block.settings.background ?? 'none') !== 'none'
  const wrapper = useBlockWrapper(block.settings)
  const { t: td } = useT('design')

  const menuItems: ContextMenuItem[] = [
    { label: t('moveUp'), icon: '↑', shortcut: KEYS.moveUp, disabled: index === 0, onClick: () => moveBlock(lessonId, index, index - 1) },
    { label: t('moveDown'), icon: '↓', shortcut: KEYS.moveDown, disabled: index === total - 1, onClick: () => moveBlock(lessonId, index, index + 1) },
    { label: t('duplicate'), icon: '⧉', shortcut: KEYS.duplicate, onClick: () => duplicateBlock(lessonId, block.id) },
    { label: t('delete'), icon: '✕', shortcut: KEYS.delete, danger: true, onClick: () => deleteBlockWithUndo(lessonId, block.id) },
  ]

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })
  const elRef = useRef<HTMLDivElement | null>(null)

  // Bring a newly selected block into view (e.g. one just added or duplicated
  // below the fold). 'nearest' is a no-op for blocks that are already visible.
  useEffect(() => {
    if (selected) elRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    else setStyleOpen(false)
  }, [selected])
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div
      ref={(el) => {
        setNodeRef(el)
        elRef.current = el
      }}
      style={style}
      onClick={() => selectBlock(block.id)}
      onContextMenu={(e) => {
        // Text fields keep the browser menu (cut/copy/paste, spellcheck);
        // children with their own menu (hotspot markers, inline images)
        // prevent the event first.
        if (e.defaultPrevented || isEditableTarget(e.target)) return
        e.preventDefault()
        selectBlock(block.id)
        setMenu({ x: e.clientX, y: e.clientY })
      }}
      className={`group relative rounded-xl px-4 ${joinPrev ? 'pt-0' : 'pt-4'} ${joinNext ? 'pb-0' : 'pb-4'} transition-[box-shadow,background-color] duration-200 ${
        selected
          ? `${hasBackground ? '' : 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.18)]'} ring-2 ring-brand`
          : 'ring-1 ring-transparent hover:bg-white/60 hover:ring-gray-200'
      }`}
    >
      <button
        type="button"
        aria-label={t('drag')}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute -left-1 top-1/2 z-10 flex h-8 w-6 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded text-gray-300 opacity-0 outline-none hover:text-gray-500 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand group-hover:opacity-100 pointer-coarse:opacity-100"
      >
        ⠿
      </button>
      {selected && (
        <div className="absolute -top-3.5 right-3 z-20 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 shadow-md">
          <ToolbarButton
            label={td('blockStyle')}
            active={styleOpen}
            buttonRef={styleButtonRef}
            popup
            onClick={toggleStyle}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
              <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.3-4-7.7-9-7.7Z" />
              <circle cx="7.5" cy="11" r="1" fill="currentColor" />
              <circle cx="10.5" cy="7" r="1" fill="currentColor" />
              <circle cx="15" cy="7.5" r="1" fill="currentColor" />
            </svg>
          </ToolbarButton>
          <span aria-hidden className="mx-0.5 h-4 w-px bg-gray-200" />
          <ToolbarButton
            label={t('moveUp')}
            shortcut={KEYS.moveUp}
            disabled={index === 0}
            onClick={() => moveBlock(lessonId, index, index - 1)}
          >
            ↑
          </ToolbarButton>
          <ToolbarButton
            label={t('moveDown')}
            shortcut={KEYS.moveDown}
            disabled={index === total - 1}
            onClick={() => moveBlock(lessonId, index, index + 1)}
          >
            ↓
          </ToolbarButton>
          <ToolbarButton
            label={t('duplicate')}
            shortcut={KEYS.duplicate}
            onClick={() => duplicateBlock(lessonId, block.id)}
          >
            ⧉
          </ToolbarButton>
          <ToolbarButton
            label={t('delete')}
            shortcut={KEYS.delete}
            danger
            onClick={() => deleteBlockWithUndo(lessonId, block.id)}
          >
            ✕
          </ToolbarButton>
        </div>
      )}
      {selected && styleOpen && (
        <BlockStylePopover
          block={block}
          lessonId={lessonId}
          anchorRef={styleButtonRef}
          onClose={() => setStyleOpen(false)}
        />
      )}
      <div
        {...wrapper}
        className={`${wrapper.className}${joinPrev ? ' blk-join-top' : ''}${joinNext ? ' blk-join-bottom' : ''}`}
      >
        <BlockRenderer block={block} lessonId={lessonId} selected={selected} />
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}

interface ToolbarButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  active?: boolean
  shortcut?: string
  buttonRef?: React.Ref<HTMLButtonElement>
  /** Opens a popover: announced as expanded / collapsed instead of pressed. */
  popup?: boolean
  children: React.ReactNode
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  danger,
  active,
  shortcut,
  buttonRef,
  popup,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={popup ? undefined : active}
      aria-haspopup={popup ? 'dialog' : undefined}
      aria-expanded={popup ? !!active : undefined}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          : active
            ? 'bg-brand/10 text-brand-dark'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}
