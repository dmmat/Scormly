import { useState } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT, translate } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'

export default function FlashcardsBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'flashcards'>>) {
  const { t } = useT('interactive')
  const update = useCourseStore((s) => s.updateBlockData)
  const { cards } = block.data
  const [flipped, setFlipped] = useState<Set<string>>(new Set())

  function toggleFlip(id: string) {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setField(id: string, field: 'front' | 'back', value: string) {
    const next = cards.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    update(lessonId, block.id, { cards: next }, `flashcard-${field}-${id}`)
  }

  function addCard() {
    update(lessonId, block.id, {
      cards: [
        ...cards,
        {
          id: uid('card'),
          front: translate('content', 'cardFront'),
          back: translate('content', 'cardBack'),
        },
      ],
    })
  }

  function removeCard(id: string) {
    update(lessonId, block.id, { cards: cards.filter((c) => c.id !== id) })
    setFlipped((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id)
          return (
            <div key={card.id} className="space-y-3">
              <div
                onClick={() => toggleFlip(card.id)}
                className="relative h-44 cursor-pointer"
                style={{ perspective: 1000 }}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s',
                    transform: isFlipped ? 'rotateY(180deg)' : undefined,
                  }}
                >
                  <div
                    className="interactive-surface absolute inset-0 flex items-center justify-center bg-brand p-5 text-center font-medium text-white"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {card.front || t('frontPlaceholder')}
                  </div>
                  <div
                    className="interactive-surface absolute inset-0 flex items-center justify-center border border-gray-200 bg-white p-5 text-center text-gray-800"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {card.back || t('backPlaceholder')}
                  </div>
                </div>
              </div>

              {selected && (
                // Editing fields placed below the card to avoid conflicting with
                // the flip-on-click interaction.
                <div className="space-y-2">
                  <input
                    type="text"
                    value={card.front}
                    placeholder={t('frontPlaceholder')}
                    aria-label={t('front')}
                    onChange={(e) => setField(card.id, 'front', e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none placeholder-gray-300 focus:border-brand"
                  />
                  <input
                    type="text"
                    value={card.back}
                    placeholder={t('backPlaceholder')}
                    aria-label={t('back')}
                    onChange={(e) => setField(card.id, 'back', e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none placeholder-gray-300 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    {t('removeCard')}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selected && (
        <button type="button" onClick={addCard} className="btn-secondary mt-4 text-sm">
          {t('addCard')}
        </button>
      )}
    </div>
  )
}
