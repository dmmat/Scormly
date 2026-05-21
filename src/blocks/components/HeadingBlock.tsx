import type { BlockComponentProps } from '../types'
import type { BlockOfType, HeadingLevel, TextAlign } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

const LEVELS: HeadingLevel[] = [1, 2, 3]

const LEVEL_CLASS: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-bold',
  3: 'text-xl font-semibold',
}

const ALIGNS: { value: TextAlign; icon: string; key: string }[] = [
  { value: 'left', icon: '⇤', key: 'alignLeft' },
  { value: 'center', icon: '↔', key: 'alignCenter' },
  { value: 'right', icon: '⇥', key: 'alignRight' },
]

export default function HeadingBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'heading'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const { t: tr } = useT('richtext')
  const { level, text, align = 'left' } = block.data
  const Tag = `h${level}` as const

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex flex-wrap items-center gap-1">
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
          <span className="mx-1 h-5 w-px bg-gray-200" />
          {ALIGNS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => update(lessonId, block.id, { align: a.value })}
              aria-label={tr(a.key)}
              className={`h-8 w-9 rounded-md text-sm ${
                align === a.value
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a.icon}
            </button>
          ))}
        </div>
      )}
      <Tag className={LEVEL_CLASS[level]} style={{ textAlign: align }}>
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
          style={{ textAlign: align }}
        />
      </Tag>
    </div>
  )
}
