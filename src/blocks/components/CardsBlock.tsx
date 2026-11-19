import type { CSSProperties } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, CardItem, CardsData } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { translate, useT } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { AutoTextarea, Segmented, SettingsBar } from '../../components/editor/controls'
import CardsPreview from '../../preview/components/CardsPreview'
import { normalizeHex } from '../../theme/customTheme'
import { badgeStyle } from '../styleClasses'

type Look = 'plain' | 'highlight' | 'positive' | 'negative'
const LOOKS: { key: Look; patch: Partial<CardItem> }[] = [
  { key: 'plain', patch: { highlight: false, tone: undefined } },
  { key: 'highlight', patch: { highlight: true, tone: undefined } },
  { key: 'positive', patch: { highlight: false, tone: 'positive' } },
  { key: 'negative', patch: { highlight: false, tone: 'negative' } },
]
const SWATCH: Record<Look, string> = {
  plain: 'border-gray-400 bg-white',
  highlight: 'border-brand bg-brand',
  positive: 'border-green-600 bg-green-500',
  negative: 'border-red-600 bg-red-500',
}
const lookOf = (item: CardItem): Look => item.tone ?? (item.highlight ? 'highlight' : 'plain')

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
  const { items, layout = 'grid', numbered, perRow, labelStyle = 'pill', titleStyle = 'plain' } = block.data

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
        {!rows && (
          <Segmented<NonNullable<CardsData['titleStyle']>>
            label={t('cardsTitle')}
            value={titleStyle}
            onChange={(v) => update(lessonId, block.id, { titleStyle: v })}
            options={[
              ['plain', t('cardsTitle_plain')],
              ['band', t('cardsTitle_band')],
            ]}
          />
        )}
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
        className={`sc-cards${rows ? ' sc-cards-rows' : ''}${labelStyle === 'text' ? ' sc-cards-text' : ''}${titleStyle === 'band' && !rows ? ' sc-cards-band' : ''}`}
        style={perRow && !rows ? ({ '--per': perRow } as CSSProperties) : undefined}
      >
        {items.map((item, i) => (
          <div key={item.id} className={`sc-card relative${rows ? ' !pr-32' : ''}${item.highlight ? ' sc-card-hl' : ''}${item.tone === 'positive' ? ' sc-card-pos' : item.tone === 'negative' ? ' sc-card-neg' : ''}`}>
            {/* Out of the flow, so the card's own lines sit where the learner sees them. */}
            <span className="absolute right-1.5 top-1.5 flex items-center">
              {/* The card's look: plain, highlighted, green or red. */}
              <span role="radiogroup" aria-label={t('cardLook')} className="mr-1 flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-1 ring-1 ring-gray-200">
                {LOOKS.map((look) => {
                  const on = lookOf(item) === look.key
                  return (
                    <button
                      key={look.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => patch(item.id, look.patch)}
                      title={`${t('cardLook')}: ${t(`cardLook_${look.key}`)}`}
                      aria-label={t(`cardLook_${look.key}`)}
                      className={`h-3.5 w-3.5 rounded-full border ${SWATCH[look.key]} ${on ? 'ring-2 ring-gray-900/70 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
                    />
                  )
                })}
              </span>
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
            <div className={`sc-card-top${rows ? '' : ' pt-7'}`}>
              {numbered && <span className="sc-card-num">{i + 1}</span>}
              {labelStyle === 'text' ? (
                // Wraps like the learner's label.
                <AutoTextarea
                  value={item.badge}
                  placeholder={t('cardBadge')}
                  aria-label={t('cardBadge')}
                  onChange={(e) => patch(item.id, { badge: e.target.value.replace(/\n/g, ' ') }, `card-badge-${item.id}`)}
                  className={`${ghost} sc-card-badge block w-full`}
                  style={badgeStyle(item.badgeColor)}
                />
              ) : (
                <input
                  type="text"
                  value={item.badge}
                  placeholder={t('cardBadge')}
                  aria-label={t('cardBadge')}
                  onChange={(e) => patch(item.id, { badge: e.target.value }, `card-badge-${item.id}`)}
                  // Sized to its text, so the pill looks as the learner sees it.
                  size={Math.max(item.badge.length, t('cardBadge').length) + 1}
                  className={`${ghost} sc-card-badge max-w-full${item.badge ? '' : ' !bg-transparent ring-1 ring-inset ring-gray-200'}`}
                  style={badgeStyle(item.badgeColor)}
                />
              )}
              {item.badge && (
                // The label's own color; the small cross goes back to the theme's.
                <span className="flex shrink-0 items-center gap-0.5">
                  <input
                    type="color"
                    value={normalizeHex(item.badgeColor ?? '') ?? '#6b7280'}
                    title={t('cardBadgeColor')}
                    aria-label={t('cardBadgeColor')}
                    onChange={(e) => patch(item.id, { badgeColor: e.target.value }, `card-badge-color-${item.id}`)}
                    className="h-5 w-5 cursor-pointer rounded-full border border-gray-300 bg-white p-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                  />
                  {item.badgeColor && (
                    <button
                      type="button"
                      onClick={() => patch(item.id, { badgeColor: undefined })}
                      title={t('cardBadgeColorReset')}
                      aria-label={t('cardBadgeColorReset')}
                      className="flex h-4 w-4 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  )}
                </span>
              )}
            </div>
            <h3 className="sc-card-title">
              <AutoTextarea
                value={item.title}
                placeholder={t('cardTitle')}
                aria-label={t('cardTitle')}
                onChange={(e) => patch(item.id, { title: e.target.value.replace(/\n/g, ' ') }, `card-title-${item.id}`)}
                className={`${ghost} block w-full`}
              />
            </h3>
            <RichTextEditor
              tools="basic"
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
