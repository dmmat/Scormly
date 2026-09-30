import { useState } from 'react'
import type { PreviewProps } from '../types'
import type { TimelineItem } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'

function ItemBody({ item }: { item: TimelineItem }) {
  return (
    <>
      {item.label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{item.label}</p>
      )}
      {item.title && <p className="mt-0.5 font-semibold text-gray-900">{item.title}</p>}
      {item.text && (
        <p className="mt-1 whitespace-pre-line leading-relaxed text-gray-700">{item.text}</p>
      )}
    </>
  )
}

function VerticalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-gray-200">
      {items.map((item) => (
        <li key={item.id} className="relative pb-6 pl-6 last:pb-0">
          <span aria-hidden className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-brand shadow" />
          <ItemBody item={item} />
        </li>
      ))}
    </ol>
  )
}

function Stepper({ items }: { items: TimelineItem[] }) {
  const { t } = useT('hotspotTimeline')
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]))
  const i = Math.min(index, items.length - 1)
  const item = items[i]

  function go(n: number) {
    setIndex(n)
    setSeen((prev) => new Set(prev).add(n))
  }

  return (
    <div className="interactive-surface border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {items.map((it, n) => (
          <button
            key={it.id}
            type="button"
            onClick={() => go(n)}
            aria-label={t('goToStep', { n: n + 1 })}
            aria-current={n === i ? 'step' : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
              n === i
                ? 'bg-brand text-white'
                : seen.has(n)
                  ? 'border-2 border-brand bg-white text-brand'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {n + 1}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="min-h-[5rem]">
        <ItemBody item={item} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={i === 0}
          onClick={() => go(i - 1)}
        >
          {t('prev')}
        </button>
        <span className="text-sm text-gray-500">
          {t('stepOf', { n: i + 1, total: items.length })}
        </span>
        <button
          type="button"
          className="btn-primary text-sm"
          disabled={i === items.length - 1}
          onClick={() => go(i + 1)}
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
}

export default function TimelinePreview({ block }: PreviewProps<'timeline'>) {
  const { layout, items } = block.data
  if (items.length === 0) return null
  return layout === 'stepper' ? <Stepper items={items} /> : <VerticalTimeline items={items} />
}
