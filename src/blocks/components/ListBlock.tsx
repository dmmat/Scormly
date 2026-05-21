import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function ListBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'list'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const { ordered, items } = block.data

  function setItem(index: number, value: string) {
    const next = items.map((it, i) => (i === index ? value : it))
    update(lessonId, block.id, { items: next }, `list-item-${block.id}-${index}`)
  }

  function addItem() {
    update(lessonId, block.id, { items: [...items, ''] })
  }

  function removeItem(index: number) {
    update(lessonId, block.id, { items: items.filter((_, i) => i !== index) })
  }

  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => update(lessonId, block.id, { ordered: false })}
            className={`h-8 rounded-md px-3 text-sm font-medium ${
              !ordered
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('bulleted')}
          </button>
          <button
            type="button"
            onClick={() => update(lessonId, block.id, { ordered: true })}
            className={`h-8 rounded-md px-3 text-sm font-medium ${
              ordered
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('numbered')}
          </button>
        </div>
      )}
      <ListTag
        className={`space-y-2 pl-6 text-gray-800 ${
          ordered ? 'list-decimal' : 'list-disc'
        }`}
      >
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                placeholder={t('listItemPlaceholder')}
                onChange={(e) => setItem(i, e.target.value)}
                className="w-full bg-transparent placeholder-gray-300 outline-none"
              />
              {selected && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('removeItem')}
                >
                  ✕
                </button>
              )}
            </div>
          </li>
        ))}
      </ListTag>
      {selected && (
        <button type="button" onClick={addItem} className="btn-secondary text-sm">
          + {t('addItem')}
        </button>
      )}
    </div>
  )
}
