import { useState } from 'react'
import type { PreviewProps } from '../types'

export default function TabsPreview({ block }: PreviewProps<'tabs'>) {
  const { tabs } = block.data
  const [active, setActive] = useState(0)
  const activeIndex = Math.min(active, Math.max(0, tabs.length - 1))
  const activeTab = tabs[activeIndex]
  if (!activeTab) return null

  return (
    <div className="interactive-surface border border-gray-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(i)}
            className={`interactive-surface px-4 py-2 text-sm font-medium transition-colors ${
              i === activeIndex
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div
        className="rich-text p-5 leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{ __html: activeTab.html }}
      />
    </div>
  )
}
