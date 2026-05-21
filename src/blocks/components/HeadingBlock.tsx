import type { BlockComponentProps } from '../types'
import type { BlockOfType, HeadingLevel } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

const LEVELS: HeadingLevel[] = [1, 2, 3]

const LEVEL_CLASS: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-bold',
  3: 'text-xl font-semibold',
}

export default function HeadingBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'heading'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const { level, text } = block.data
  const Tag = `h${level}` as const

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex gap-1">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => update(lessonId, block.id, { level: lvl })}
              aria-label={t('headingLevel', { level: lvl })}
              className={`h-8 w-10 rounded-md text-sm font-medium ${
                level === lvl
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>
      )}
      <Tag className={LEVEL_CLASS[level]}>
        <input
          type="text"
          value={text}
          placeholder={t('headingPlaceholder')}
          onChange={(e) =>
            update(
              lessonId,
              block.id,
              { text: e.target.value },
              `heading-text-${block.id}`,
            )
          }
          className="w-full bg-transparent text-gray-900 placeholder-gray-300 outline-none"
        />
      </Tag>
    </div>
  )
}
