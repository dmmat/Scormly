import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore } from '../../store/courseStore'
import type { Block } from '../../types/course'
import BlockRenderer from '../../blocks/BlockRenderer'
import { useT } from '../../i18n/I18nProvider'
import ContextMenu, { type ContextMenuItem } from './ContextMenu'

interface BlockShellProps {
  block: Block
  lessonId: string
  index: number
  total: number
}

// Wrapper for a content block in the editor: selection, toolbar (up/down/
// duplicate/delete). The content itself is rendered by BlockRenderer.
export default function BlockShell({
  block,
  lessonId,
  index,
  total,
}: BlockShellProps) {
  const selectedBlockId = useCourseStore((s) => s.selectedBlockId)
  const selectBlock = useCourseStore((s) => s.selectBlock)
  const moveBlock = useCourseStore((s) => s.moveBlock)
  const duplicateBlock = useCourseStore((s) => s.duplicateBlock)
  const deleteBlock = useCourseStore((s) => s.deleteBlock)

  const { t } = useT('common')
  const selected = block.id === selectedBlockId
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  const menuItems: ContextMenuItem[] = [
    { label: t('moveUp'), icon: '↑', disabled: index === 0, onClick: () => moveBlock(lessonId, index, index - 1) },
    { label: t('moveDown'), icon: '↓', disabled: index === total - 1, onClick: () => moveBlock(lessonId, index, index + 1) },
    { label: t('duplicate'), icon: '⧉', onClick: () => duplicateBlock(lessonId, block.id) },
    { label: t('delete'), icon: '✕', danger: true, onClick: () => deleteBlock(lessonId, block.id) },
  ]

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectBlock(block.id)}
      onContextMenu={(e) => {
        e.preventDefault()
        selectBlock(block.id)
        setMenu({ x: e.clientX, y: e.clientY })
      }}
      className={`group relative rounded-lg p-4 transition-shadow ${
        selected
          ? 'bg-white ring-2 ring-brand'
          : 'ring-1 ring-transparent hover:ring-gray-200'
      }`}
    >
      <button
        type="button"
        aria-label={t('drag')}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute -left-1 top-1/2 z-10 hidden h-8 w-6 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded text-gray-300 hover:text-gray-500 group-hover:flex"
      >
        ⠿
      </button>
      {selected && (
        <div className="absolute -top-3 right-3 z-10 flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
          <ToolbarButton
            label={t('moveUp')}
            disabled={index === 0}
            onClick={() => moveBlock(lessonId, index, index - 1)}
          >
            ↑
          </ToolbarButton>
          <ToolbarButton
            label={t('moveDown')}
            disabled={index === total - 1}
            onClick={() => moveBlock(lessonId, index, index + 1)}
          >
            ↓
          </ToolbarButton>
          <ToolbarButton
            label={t('duplicate')}
            onClick={() => duplicateBlock(lessonId, block.id)}
          >
            ⧉
          </ToolbarButton>
          <ToolbarButton
            label={t('delete')}
            danger
            onClick={() => deleteBlock(lessonId, block.id)}
          >
            ✕
          </ToolbarButton>
        </div>
      )}
      <BlockRenderer block={block} lessonId={lessonId} selected={selected} />

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
  children: React.ReactNode
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}
