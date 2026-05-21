import { useCourseStore } from '../../store/courseStore'
import type { Block } from '../../types/course'
import BlockRenderer from '../../blocks/BlockRenderer'
import { useT } from '../../i18n/I18nProvider'

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

  return (
    <div
      onClick={() => selectBlock(block.id)}
      className={`group relative rounded-lg transition-shadow ${
        selected
          ? 'ring-2 ring-brand'
          : 'ring-1 ring-transparent hover:ring-gray-200'
      }`}
    >
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
