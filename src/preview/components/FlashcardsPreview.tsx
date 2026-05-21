import { useState } from 'react'
import type { PreviewProps } from '../types'

export default function FlashcardsPreview({ block }: PreviewProps<'flashcards'>) {
  const { cards } = block.data
  const [flipped, setFlipped] = useState<Set<string>>(new Set())

  function flip(id: string) {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const isFlipped = flipped.has(card.id)
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => flip(card.id)}
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
                className="interactive-surface absolute inset-0 flex items-center justify-center bg-brand p-5 text-center font-medium text-white"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {card.front}
              </div>
              <div
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
