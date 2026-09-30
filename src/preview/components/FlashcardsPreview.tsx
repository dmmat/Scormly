import { useState } from 'react'
import type { PreviewProps } from '../types'
import { useT } from '../../i18n/I18nProvider'

export default function FlashcardsPreview({ block }: PreviewProps<'flashcards'>) {
  const { t } = useT('a11y')
  const { cards } = block.data
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  // Screen readers don't reliably announce content swaps inside a focused
  // button, so the newly shown side is also sent to a polite live region.
  const [announcement, setAnnouncement] = useState('')

  function flip(id: string) {
    const card = cards.find((c) => c.id === id)
    const nowFlipped = !flipped.has(id)
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (card) {
      setAnnouncement(
        nowFlipped ? t('cardBack', { text: card.back }) : t('cardFront', { text: card.front }),
      )
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {cards.map((card) => {
        const isFlipped = flipped.has(card.id)
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => flip(card.id)}
            aria-pressed={isFlipped}
            className="h-44 w-full"
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
                aria-hidden={isFlipped}
                className="interactive-surface absolute inset-0 flex items-center justify-center bg-brand p-5 text-center font-medium text-white"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {card.front}
              </div>
              <div
                aria-hidden={!isFlipped}
                className="interactive-surface absolute inset-0 flex items-center justify-center border border-gray-200 bg-white p-5 text-center text-gray-800"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {card.back}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
