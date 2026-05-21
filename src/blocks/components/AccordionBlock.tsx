import { useState } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT, translate } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import RichTextEditor from '../../components/editor/RichTextEditor'

export default function AccordionBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'accordion'>>) {
  const { t } = useT('interactive')
  const update = useCourseStore((s) => s.updateBlockData)
  const { items } = block.data
  const [open, setOpen] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setTitle(id: string, title: string) {
    const next = items.map((it) => (it.id === id ? { ...it, title } : it))
    update(lessonId, block.id, { items: next }, `accordion-title-${id}`)
  }

  function setHtml(id: string, html: string) {
    const next = items.map((it) => (it.id === id ? { ...it, html } : it))
    update(lessonId, block.id, { items: next }, `accordion-html-${id}`)
  }

  function addItem() {
    const id = uid('acc')
    update(lessonId, block.id, {
      items: [
        ...items,
        { id, title: translate('content', 'newSection'), html: '' },
      ],
    })
    setOpen((prev) => new Set(prev).add(id))
  }

  function removeItem(id: string) {
    update(lessonId, block.id, { items: items.filter((it) => it.id !== id) })
    setOpen((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = open.has(item.id)
        return (
          <div
            key={item.id}
            className="interactive-surface overflow-hidden border border-gray-200 bg-white"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="text-brand"
                aria-label={isOpen ? t('collapse') : t('expand')}
                aria-expanded={isOpen}
              >
                {isOpen ? '▾' : '▸'}
              </button>
              {selected ? (
                <input
                  type="text"
                  value={item.title}
                  placeholder={t('sectionTitlePlaceholder')}
                  onChange={(e) => setTitle(item.id, e.target.value)}
                  className="flex-1 bg-transparent font-medium text-gray-800 outline-none placeholder-gray-300"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex-1 bg-transparent text-left font-medium text-gray-800"
                >
                  {item.title || t('sectionFallback')}
                </button>
              )}
              {selected && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('removeSection')}
                >
                  ✕
                </button>
              )}
            </div>
            {isOpen && (
              <div className="border-t border-gray-200 px-4 py-3">
                <RichTextEditor
                  html={item.html}
                  placeholder={t('sectionContentPlaceholder')}
                  onChange={(html) => setHtml(item.id, html)}
                />
              </div>
            )}
          </div>
        )
      })}
      {selected && (
        <button type="button" onClick={addItem} className="btn-secondary text-sm">
          {t('addSection')}
        </button>
      )}
    </div>
  )
}
