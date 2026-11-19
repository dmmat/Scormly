import type { CSSProperties } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, CardItem, CardsData } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { translate, useT } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { Segmented, SettingsBar } from '../../components/editor/controls'
import CardsPreview from '../../preview/components/CardsPreview'

// Cards: edited in place on the learner's cards. Same markup as CardsPreview
// and the player's renderCards.
export default function CardsBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'cards'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { t: tt } = useT('text')
  const { items, layout = 'grid', numbered, perRow, labelStyle = 'pill' } = block.data

  // With no cards there is nothing to preview: keep the bar with “Add card”.
  if (!selected && items.length) return <CardsPreview block={block} />

  const patch = (id: string, p: Partial<CardItem>, key?: string) =>
    update(lessonId, block.id, { items: items.map((it) => (it.id === id ? { ...it, ...p } : it)) }, key)

  function addCard() {
    const item: CardItem = {
      id: uid('card'),
      badge: '',
      title: translate('content', 'cardTitle', { n: items.length + 1 }),
      html: `<p>${translate('content', 'cardText')}</p>`,
    }
    update(lessonId, block.id, { items: [...items, item] })
  }

  const rows = layout === 'rows'
  const ghost = 'min-w-0 bg-transparent outline-none placeholder:text-current placeholder:opacity-40'
  const iconBtn =
    'flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700'

  return (
    <div className="space-y-3">
      <SettingsBar>
        <Segmented<NonNullable<CardsData['layout']>>
          label={t('cardsLayout')}
          value={layout}
          onChange={(v) => update(lessonId, block.id, { layout: v })}
          options={[
            ['grid', t('cardsLayout_grid')],
            ['rows', t('cardsLayout_rows')],
          ]}
        />
        {!rows && (
          <Segmented<number>
            label={t('cardsPerRow')}
            value={perRow ?? 0}
            onChange={(v) => update(lessonId, block.id, { perRow: v ? (v as CardsData['perRow']) : undefined })}
            options={[
              [0, t('cardsPerRow_auto')],
              [2, '2'],
              [3, '3'],
              [4, '4'],
            ]}
          />
        )}
        <Segmented<NonNullable<CardsData['labelStyle']>>
          label={t('cardsLabel')}
          value={labelStyle}
          onChange={(v) => update(lessonId, block.id, { labelStyle: v })}
          options={[
            ['pill', t('cardsLabel_pill')],
            ['text', t('cardsLabel_text')],
          ]}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!numbered}
            onChange={(e) => update(lessonId, block.id, { numbered: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          {t('cardsNumbered')}
        </label>
        <button type="button" onClick={addCard} className="btn-secondary text-sm">
          + {t('addCard')}
        </button>
      </SettingsBar>

      <div
        className={`sc-cards${rows ? ' sc-cards-rows' : ''}${labelStyle === 'text' ? ' sc-cards-text' : ''}`}
        style={perRow && !rows ? ({ '--per': perRow } as CSSProperties) : undefined}
      >
        {items.map((item, i) => (
          <div key={item.id} className={`sc-card${item.highlight ? ' sc-card-hl' : ''}`}>
            <div className="sc-card-top">
              {numbered && <span className="sc-card-num">{i + 1}</span>}
              <input
                type="text"
                value={item.badge}
                placeholder={t('cardBadge')}
                aria-label={t('cardBadge')}
                onChange={(e) => patch(item.id, { badge: e.target.value }, `card-badge-${item.id}`)}
                // Sized to its text, so the pill looks as the learner sees it.
                size={Math.max(item.badge.length, t('cardBadge').length) + 1}
                className={`${ghost} sc-card-badge${item.badge || labelStyle === 'text' ? '' : ' !bg-transparent ring-1 ring-inset ring-gray-200'}`}
              />
              <span className="ml-auto flex items-center">
                <button
                  type="button"
                  onClick={() => patch(item.id, { highlight: !item.highlight })}
                  aria-pressed={!!item.highlight}
                  title={t('cardHighlight')}
                  aria-label={t('cardHighlight')}
                  className={`${iconBtn}${item.highlight ? ' !text-brand' : ''}`}
                >
                  {item.highlight ? '★' : '☆'}
                </button>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update(lessonId, block.id, { items: items.filter((it) => it.id !== item.id) })}
                    className={iconBtn}
                    aria-label={t('removeCard')}
                  >
                    ✕
                  </button>
                )}
              </span>
            </div>
            <h3 className="sc-card-title">
              <input
                type="text"
                value={item.title}
                placeholder={t('cardTitle')}
                aria-label={t('cardTitle')}
                onChange={(e) => patch(item.id, { title: e.target.value }, `card-title-${item.id}`)}
                className={`${ghost} w-full`}
              />
            </h3>
            <RichTextEditor
              html={item.html}
              placeholder={tt('paragraphPlaceholder')}
              className="sc-card-text"
              onChange={(html) => patch(item.id, { html }, `card-html-${item.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
