import { useId, useRef, useState, type KeyboardEvent } from 'react'
import type { PreviewProps } from '../types'
import RichHtml from '../RichHtml'

// WAI-ARIA tabs pattern: one tab in the Tab order (roving tabindex), arrow
// keys / Home / End move between tabs and activate them.
export default function TabsPreview({ block }: PreviewProps<'tabs'>) {
  const { tabs } = block.data
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.min(active, Math.max(0, tabs.length - 1))
  const activeTab = tabs[activeIndex]
  if (!activeTab) return null

  function select(i: number) {
    setActive(i)
    tabRefs.current[i]?.focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    const last = tabs.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = activeIndex >= last ? 0 : activeIndex + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = activeIndex <= 0 ? last : activeIndex - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    select(next)
  }

  return (
    <div className="interactive-surface border border-gray-200 bg-white">
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 border-b border-gray-200 p-3"
      >
        {tabs.map((tab, i) => {
          const selected = i === activeIndex
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`interactive-surface px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.title}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        tabIndex={0}
      >
        <RichHtml
          html={activeTab.html}
          className="rich-text p-5 leading-relaxed text-gray-800"
        />
      </div>
    </div>
  )
}
