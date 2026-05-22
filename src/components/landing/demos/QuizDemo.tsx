import { useState } from 'react'
import { useT } from '../../../i18n/I18nProvider'

// Clickable single-choice quiz with instant feedback. Correct = index 0.
export default function QuizDemo() {
  const { t } = useT('demo')
  const options = [t('quizO1'), t('quizO2'), t('quizO3')]
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-gray-900">{t('quizPrompt')}</p>
      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const isPicked = picked === i
          const correct = i === 0
          const state =
            picked == null ? 'idle' : correct ? 'right' : isPicked ? 'wrong' : 'muted'
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                state === 'idle'
                  ? 'border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm'
                  : state === 'right'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : state === 'wrong'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : state === 'wrong'
                      ? 'border-red-400 bg-red-400 text-white'
                      : 'border-gray-300 text-gray-400'
                }`}
              >
                {state === 'right' ? '✓' : state === 'wrong' ? '✕' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      <div className="min-h-[1.5rem] text-sm">
        {picked == null ? (
          <span className="text-gray-400">{t('quizPick')}</span>
        ) : picked === 0 ? (
          <span className="font-medium text-emerald-700">{t('quizCorrect')}</span>
        ) : (
          <span className="flex flex-wrap items-center gap-3 text-red-600">
            {t('quizWrong')}
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="font-semibold text-brand-dark underline-offset-2 hover:underline"
            >
              {t('quizAgain')}
            </button>
          </span>
        )}
      </div>
    </div>
  )
}
