import { useState } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, TabItem } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT, translate } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import RichTextEditor from '../../components/editor/RichTextEditor'

export default function TabsBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'tabs'>>) {
  const { t } = useT('interactive')
  const update = useCourseStore((s) => s.updateBlockData)
  const { tabs } = block.data
  const [active, setActive] = useState(0)

  // The active index may have gone out of range after a tab was removed.
  const activeIndex = Math.min(active, Math.max(0, tabs.length - 1))
  const activeTab: TabItem | undefined = tabs[activeIndex]

  function setTitle(tabId: string, title: string) {
    const next = tabs.map((t) => (t.id === tabId ? { ...t, title } : t))
    update(lessonId, block.id, { tabs: next }, `tab-title-${tabId}`)
  }

  function setHtml(tabId: string, html: string) {
    const next = tabs.map((t) => (t.id === tabId ? { ...t, html } : t))
    update(lessonId, block.id, { tabs: next }, `tab-html-${tabId}`)
  }

  function addTab() {
    const next = [
      ...tabs,
      { id: uid('tab'), title: translate('content', 'newTab'), html: '' },
    ]
    update(lessonId, block.id, { tabs: next })
    setActive(next.length - 1)
  }

  function removeTab(tabId: string) {
    const next = tabs.filter((t) => t.id !== tabId)
    update(lessonId, block.id, { tabs: next })
    setActive((i) => Math.max(0, Math.min(i, next.length - 1)))
  }

  return (
    <div className="interactive-surface border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={tab.id}
              className={`interactive-surface flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {selected ? (
                <input
                  type="text"
                  value={tab.title}
                  placeholder={t('tabTitlePlaceholder')}
                  onFocus={() => setActive(i)}
                  onChange={(e) => setTitle(tab.id, e.target.value)}
                  className="w-24 bg-transparent outline-none placeholder-gray-300"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="bg-transparent"
                >
                  {tab.title || t('tabFallback')}
                </button>
              )}
              {selected && (
                <button
                  type="button"
                  onClick={() => removeTab(tab.id)}
                  className={`flex h-4 w-4 items-center justify-center rounded text-xs ${
                    isActive ? 'hover:bg-white/30' : 'hover:bg-gray-300'
                  }`}
                  aria-label={t('removeTab')}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
        {selected && (
          <button
            type="button"
            onClick={addTab}
            className="interactive-surface px-4 py-2 text-sm font-medium text-brand hover:bg-brand/10"
          >
            {t('addTab')}
          </button>
        )}
      </div>

      <div className="p-5">
        {activeTab ? (
          <RichTextEditor
            key={activeTab.id}
            html={activeTab.html}
            placeholder={t('tabContentPlaceholder')}
            onChange={(html) => setHtml(activeTab.id, html)}
          />
        ) : (
          <p className="text-sm text-gray-400">{t('noTabs')}</p>
        )}
      </div>
    </div>
  )
}
