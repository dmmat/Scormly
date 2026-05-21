import { useState } from 'react'
import type { PreviewProps } from '../types'
import RichHtml from '../RichHtml'

export default function AccordionPreview({ block }: PreviewProps<'accordion'>) {
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

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = open.has(item.id)
        return (
          <div
            key={item.id}
            className="interactive-surface overflow-hidden border border-gray-200 bg-white"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium text-gray-800"
            >
              <span className="text-brand">{isOpen ? '▾' : '▸'}</span>
              {item.title}
            </button>
            {isOpen && (
              <RichHtml
                html={item.html}
                className="rich-text border-t border-gray-200 px-4 py-3 leading-relaxed text-gray-800"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
