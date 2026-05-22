import { useState } from 'react'
import { useT } from '../../../i18n/I18nProvider'
import QuizDemo from './QuizDemo'
import FlashcardsDemo from './FlashcardsDemo'
import OutlineDemo from './OutlineDemo'

type TabId = 'quiz' | 'flashcards' | 'outline'

// Tabbed playground hosting the clickable block demos (the chat lives in the
// hero). Each tab swaps in a real, interactive component.
export default function Playground() {
  const { t } = useT('demo')
  const [tab, setTab] = useState<TabId>('quiz')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'quiz', label: t('tabQuiz') },
    { id: 'flashcards', label: t('tabFlashcards') },
    { id: 'outline', label: t('tabOutline') },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              tab === tb.id
                ? 'bg-brand text-white shadow-sm shadow-brand/30'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand/40'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="relative rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div key={tab} className="demo-swap">
          {tab === 'quiz' && <QuizDemo />}
          {tab === 'flashcards' && <FlashcardsDemo />}
          {tab === 'outline' && <OutlineDemo />}
        </div>
      </div>
    </div>
  )
}
