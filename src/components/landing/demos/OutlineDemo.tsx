import { useState } from 'react'
import { useT } from '../../../i18n/I18nProvider'

// Clickable course outline — click a lesson to mark it visited & active.
export default function OutlineDemo() {
  const { t } = useT('demo')
  const lessons = [t('ol1'), t('ol2'), t('ol3'), t('ol4')]
  const [active, setActive] = useState(0)
  const [visited, setVisited] = useState<boolean[]>([true, false, false, false])

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <p className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
          {t('outlineTitle')}
        </p>
        <ol className="divide-y divide-gray-100">
          {lessons.map((title, i) => {
            const isActive = active === i
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i)
                    setVisited((v) => v.map((x, j) => (j === i ? true : x)))
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    isActive ? 'bg-brand/5 font-medium text-brand-dark' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      visited[i] ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {visited[i] ? '✓' : i + 1}
                  </span>
                  <span className="flex-1 truncate">{title}</span>
                  {isActive && <span aria-hidden className="text-brand">→</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      <p className="text-center text-sm text-gray-400">{t('outlineHint')}</p>
    </div>
  )
}
