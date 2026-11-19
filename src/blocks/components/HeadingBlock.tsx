import type { BlockComponentProps } from '../types'
import type { BlockOfType, HeadingLevel, TextAlign } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { AutoTextarea } from '../../components/editor/controls'
import RichTextEditor from '../../components/editor/RichTextEditor'

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
  const { level, text, align = 'left', eyebrow = '', subtitle = '' } = block.data
  const Tag = `h${level}` as const

  // The eyebrow and the subtitle are optional: their fields show while the
  // block is selected, or once they have text.
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
      <div className={`sc-head sc-head-${align}${!selected && (eyebrow || subtitle) ? ' sc-head-open' : ''}`} style={{ textAlign: align }}>
      {(selected || eyebrow) && (
        // The wrapper carries the look (and the hairline after the text), the
        // field is as wide as its text.
        <div className="sc-head-eyebrow">
          {/* The hidden copy gives the field the exact width of its text. */}
          <span className={`relative ${align === 'left' ? 'inline-grid max-w-full flex-none' : 'grid'}`}>
            <span aria-hidden className="invisible whitespace-pre">
              {eyebrow || t('eyebrowPlaceholder')}
            </span>
            <input
              type="text"
              value={eyebrow}
              placeholder={t('eyebrowPlaceholder')}
              aria-label={t('eyebrowPlaceholder')}
              onChange={(e) => update(lessonId, block.id, { eyebrow: e.target.value }, `heading-eyebrow-${block.id}`)}
              className="absolute inset-0 h-full w-full bg-transparent p-0 outline-none placeholder:text-current placeholder:opacity-40"
              style={{ textAlign: align, font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}
            />
          </span>
        </div>
      )}
      <Tag className={LEVEL_CLASS[level]} style={{ textAlign: align }}>
        <AutoTextarea
          value={text}
          placeholder={t('headingPlaceholder')}
          onChange={(e) =>
            update(
              lessonId,
              block.id,
              { text: e.target.value.replace(/\n/g, ' ') },
              `heading-text-${block.id}`,
            )
          }
          className="block w-full bg-transparent text-gray-900 placeholder-gray-300 outline-none"
          style={{ textAlign: align }}
        />
      </Tag>
      {(selected || subtitle) && (
        <RichTextEditor
          inline
          html={subtitle}
          placeholder={t('subtitlePlaceholder')}
          className="sc-head-sub"
          onChange={(html) => update(lessonId, block.id, { subtitle: html }, `heading-subtitle-${block.id}`)}
        />
      )}
      </div>
    </div>
  )
}
