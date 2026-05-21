import type { BlockComponentProps } from '../types'
import type { BlockOfType, DividerStyle } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

const STYLES: { value: DividerStyle; key: string }[] = [
  { value: 'solid', key: 'dividerSolid' },
  { value: 'dashed', key: 'dividerDashed' },
  { value: 'dotted', key: 'dividerDotted' },
]

export default function DividerBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'divider'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('blocks')
  const { style } = block.data

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex flex-wrap gap-1">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update(lessonId, block.id, { style: s.value })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                style === s.value
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(s.key)}
            </button>
          ))}
        </div>
      )}
      <hr
        className="my-2 border-0 border-t-2 border-gray-300"
        style={{ borderTopStyle: style }}
      />
    </div>
  )
}
