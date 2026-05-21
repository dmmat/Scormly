import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function CodeBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'code'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { code, language } = block.data

  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-gray-900 p-4 text-gray-100">
        <textarea
          value={code}
          rows={6}
          placeholder={t('codePlaceholder')}
          onChange={(e) =>
            update(lessonId, block.id, { code: e.target.value }, `code-${block.id}`)
          }
          className="w-full resize-y bg-transparent font-mono text-sm text-gray-100 placeholder-gray-500 outline-none"
        />
      </div>
      {selected && (
        <input
          type="text"
          value={language ?? ''}
          placeholder={t('languagePlaceholder')}
          onChange={(e) =>
            update(
              lessonId,
              block.id,
              { language: e.target.value },
              `code-lang-${block.id}`,
            )
          }
          className="h-8 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-brand"
        />
      )}
    </div>
  )
}
