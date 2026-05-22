import { useState } from 'react'
import { useT } from '../../../i18n/I18nProvider'

// Three flip cards (CSS 3D). Click toggles each independently.
export default function FlashcardsDemo() {
  const { t } = useT('demo')
  const cards = [
    { front: t('fc1Front'), back: t('fc1Back') },
    { front: t('fc2Front'), back: t('fc2Back') },
    { front: t('fc3Front'), back: t('fc3Back') },
  ]
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setFlipped((f) => f.map((v, j) => (j === i ? !v : v)))}
            className="fcard"
            aria-pressed={flipped[i]}
          >
            <span className={`fcard-inner ${flipped[i] ? 'is-flipped' : ''}`}>
              <span className="fcard-face fcard-front">{c.front}</span>
              <span className="fcard-face fcard-back">{c.back}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400">{t('flipHint')}</p>
    </div>
  )
}
