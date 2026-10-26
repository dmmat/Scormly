import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, ComparisonColumn, ComparisonTone } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { translate, useT } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import { Segmented, SettingsBar } from '../../components/editor/controls'
import ComparisonPreview from '../../preview/components/ComparisonPreview'

const TONES: ComparisonTone[] = ['pro', 'con', 'neutral']
const TONE_MARK: Record<ComparisonTone, string> = { pro: '✓', con: '✕', neutral: '•' }

// Comparison: edited in place on the learner's cards. Enter adds a point
// below; Backspace in an empty point removes it.
export default function ComparisonBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'comparison'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('explainers')
  const { t: td } = useT('design')
  const { columns, versus } = block.data
  const rootRef = useRef<HTMLDivElement>(null)
  // "<columnId>:<index>" of a point input to focus after the next render.
  const [focusKey, setFocusKey] = useState<string | null>(null)

  useEffect(() => {
    if (!focusKey) return
    rootRef.current?.querySelector<HTMLInputElement>(`[data-point="${focusKey}"]`)?.focus()
    setFocusKey(null)
  }, [focusKey])

  if (!selected) return <ComparisonPreview block={block} />

  const setColumns = (next: ComparisonColumn[], key?: string) => update(lessonId, block.id, { columns: next }, key)
  const patch = (id: string, p: Partial<ComparisonColumn>, key?: string) =>
    setColumns(columns.map((c) => (c.id === id ? { ...c, ...p } : c)), key)

  function setCount(n: number) {
    const next = columns.slice(0, n)
    while (next.length < n) {
      next.push({
        id: uid('col'),
        title: translate('content', 'comparisonOption', { n: next.length + 1 }),
        tone: 'neutral',
        items: [1, 2].map((k) => translate('content', 'comparisonPoint', { n: k })),
      })
    }
    setColumns(next)
  }

  function onPointKey(e: KeyboardEvent<HTMLInputElement>, col: ComparisonColumn, k: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const items = [...col.items]
      items.splice(k + 1, 0, '')
      patch(col.id, { items })
      setFocusKey(`${col.id}:${k + 1}`)
    } else if (e.key === 'Backspace' && !col.items[k] && col.items.length > 1) {
      e.preventDefault()
      patch(col.id, { items: col.items.filter((_, j) => j !== k) })
      setFocusKey(`${col.id}:${Math.max(0, k - 1)}`)
    }
  }

  const vs = !!versus && columns.length === 2
  const ghost =
    'w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 outline-none placeholder-gray-300 hover:border-gray-200 focus:border-brand focus:bg-white'
  const iconBtn =
    'flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700'

  return (
    <div ref={rootRef} className="space-y-4">
      <SettingsBar>
        <Segmented<number>
          label={td('columnsCount')}
          value={columns.length}
          onChange={setCount}
          options={[
            [2, '2'],
            [3, '3'],
            [4, '4'],
          ]}
        />
        {columns.length === 2 && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!versus}
              onChange={(e) => update(lessonId, block.id, { versus: e.target.checked })}
              className="h-4 w-4 accent-brand"
            />
            {t('versus')}
          </label>
        )}
      </SettingsBar>

      <div className={`sc-compare${vs ? ' sc-compare-vs' : ''}`} style={{ '--n': columns.length } as CSSProperties}>
        <div className="sc-compare-grid">
          {columns.map((col, i) => (
            <Fragment key={col.id}>
              {vs && i === 1 && <span className="sc-compare-badge" aria-hidden>VS</span>}
              <div className={`sc-compare-col sc-compare-${col.tone} space-y-3`}>
                <input
                  type="text"
                  value={col.title}
                  placeholder={t('columnTitle')}
                  aria-label={t('columnTitle')}
                  onChange={(e) => patch(col.id, { title: e.target.value }, `compare-title-${col.id}`)}
                  style={{ margin: 0 }}
                  className={`${ghost} sc-compare-title`}
                />
                <Segmented<ComparisonTone>
                  label={t('tone')}
                  value={col.tone}
                  onChange={(v) => patch(col.id, { tone: v })}
                  options={TONES.map((tone) => [tone, `${TONE_MARK[tone]} ${t(`tone_${tone}`)}`] as const)}
                />
                <ul className="sc-compare-list">
                  {col.items.map((it, k) => (
                    <li key={k} className="sc-compare-item items-center">
                      <span className="sc-compare-mark" aria-hidden />
                      <input
                        type="text"
                        value={it}
                        data-point={`${col.id}:${k}`}
                        placeholder={t('pointPlaceholder')}
                        aria-label={t('pointPlaceholder')}
                        onChange={(e) =>
                          patch(col.id, { items: col.items.map((x, j) => (j === k ? e.target.value : x)) }, `compare-item-${col.id}-${k}`)
                        }
                        onKeyDown={(e) => onPointKey(e, col, k)}
                        className={ghost}
                      />
                      <button
                        type="button"
                        onClick={() => patch(col.id, { items: col.items.filter((_, j) => j !== k) })}
                        className={iconBtn}
                        aria-label={t('removePoint')}
                        title={t('removePoint')}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      patch(col.id, { items: [...col.items, ''] })
                      setFocusKey(`${col.id}:${col.items.length}`)
                    }}
                    className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {t('addPoint')}
                  </button>
                  {columns.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setColumns(columns.filter((c) => c.id !== col.id))}
                      className="rounded-md px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    >
                      {t('removeColumn')}
                    </button>
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
