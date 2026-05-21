import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function QuoteBlock({
  block,
  lessonId,
}: BlockComponentProps<BlockOfType<'quote'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { text, author } = block.data

  return (
    <blockquote className="border-l-4 border-brand pl-4 italic text-gray-700">
      <textarea
        value={text}
        rows={3}
        placeholder={t('quotePlaceholder')}
        onChange={(e) =>
          update(lessonId, block.id, { text: e.target.value }, `quote-${block.id}`)
        }
        className="w-full resize-y bg-transparent placeholder-gray-300 outline-none"
      />
      <div className="mt-2 flex items-center gap-1 text-sm not-italic text-gray-500">
        <span>—</span>
        <input
          type="text"
          value={author ?? ''}
          placeholder={t('authorPlaceholder')}
          onChange={(e) =>
            update(
              lessonId,
              block.id,
              { author: e.target.value },
              `quote-author-${block.id}`,
            )
          }
          className="w-full bg-transparent placeholder-gray-300 outline-none"
        />
      </div>
    </blockquote>
  )
}
