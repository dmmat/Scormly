import type { BlockComponentProps } from '../types'
import type { BlockOfType, NoteVariant } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

const VARIANT_STYLE: Record<
  NoteVariant,
  { box: string; icon: string; text: string }
> = {
  note: {
    box: 'bg-blue-50 border-blue-200',
    icon: 'ℹ',
    text: 'text-blue-900',
  },
  warning: {
    box: 'bg-amber-50 border-amber-200',
    icon: '⚠',
    text: 'text-amber-900',
  },
}

export default function NoteBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'note'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const { variant, text } = block.data
  const style = VARIANT_STYLE[variant]

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => update(lessonId, block.id, { variant: 'note' })}
            className={`h-8 rounded-md px-3 text-sm font-medium ${
              variant === 'note'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('note')}
          </button>
          <button
            type="button"
            onClick={() => update(lessonId, block.id, { variant: 'warning' })}
            className={`h-8 rounded-md px-3 text-sm font-medium ${
              variant === 'warning'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('warning')}
          </button>
        </div>
      )}
      <div className={`flex gap-3 rounded-lg border p-4 ${style.box}`}>
        <span className={`shrink-0 text-lg leading-6 ${style.text}`}>
          {style.icon}
        </span>
        <textarea
          value={text}
          rows={2}
          placeholder={
            variant === 'warning' ? t('warningPlaceholder') : t('notePlaceholder')
          }
          onChange={(e) =>
            update(
              lessonId,
              block.id,
              { text: e.target.value },
              `note-text-${block.id}`,
            )
          }
          className={`w-full resize-none bg-transparent leading-6 outline-none placeholder-current/40 ${style.text}`}
        />
      </div>
    </div>
  )
}
