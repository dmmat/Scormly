import type { BlockComponentProps } from '../types'
import type {
  BlockOfType,
  ChoiceOption,
  MatchingPair,
  Question,
  QuestionType,
} from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { uid } from '../../lib/id'
import { useT, translate } from '../../i18n/I18nProvider'

const TYPE_LABEL_KEYS: Record<QuestionType, string> = {
  single: 'typeSingle',
  multiple: 'typeMultiple',
  matching: 'typeMatching',
}

function newOption(correct = false): ChoiceOption {
  return {
    id: uid('opt'),
    text: translate('content', correct ? 'quizCorrect' : 'quizWrong'),
    correct,
  }
}

function newPair(): MatchingPair {
  return { id: uid('pair'), left: '', right: '' }
}

function newQuestion(): Question {
  return {
    id: uid('q'),
    type: 'single',
    prompt: translate('content', 'quizPrompt'),
    options: [newOption(true), newOption()],
  }
}

// Safely converts a question to another type, preserving id/prompt/feedback.
function convertQuestion(q: Question, type: QuestionType): Question {
  const base = { id: q.id, prompt: q.prompt, feedback: q.feedback }
  if (type === 'matching') {
    const pairs = q.type === 'matching' ? q.pairs : [newPair(), newPair()]
    return { ...base, type, pairs }
  }
  const options =
    q.type === 'matching' || q.options.length === 0
      ? [newOption(), newOption()]
      : q.options
  // Single allows only one correct option.
  const normalized =
    type === 'single' ? ensureSingleCorrect(options) : options
  return { ...base, type, options: normalized }
}

// Guarantees exactly one correct option for the single type.
function ensureSingleCorrect(options: ChoiceOption[]): ChoiceOption[] {
  const firstCorrect = options.findIndex((o) => o.correct)
  const target = firstCorrect === -1 ? 0 : firstCorrect
  return options.map((o, i) => ({ ...o, correct: i === target }))
}

export default function QuizBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'quiz'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('quiz')
  const { questions, passingScore, showAnswers = true } = block.data

  function setQuestions(next: Question[], coalesceKey?: string) {
    update(lessonId, block.id, { questions: next }, coalesceKey)
  }

  // Replaces a single question while preserving the union member type.
  function replaceQuestion(qId: string, next: Question, coalesceKey?: string) {
    setQuestions(
      questions.map((q) => (q.id === qId ? next : q)),
      coalesceKey,
    )
  }

  function setPrompt(q: Question, prompt: string) {
    replaceQuestion(q.id, { ...q, prompt }, `quiz-prompt-${q.id}`)
  }

  function setQuestionFeedback(q: Question, feedback: string) {
    replaceQuestion(q.id, { ...q, feedback }, `quiz-qfb-${q.id}`)
  }

  function changeType(q: Question, type: QuestionType) {
    if (q.type === type) return
    replaceQuestion(q.id, convertQuestion(q, type))
  }

  function addQuestion() {
    setQuestions([...questions, newQuestion()])
  }

  function removeQuestion(qId: string) {
    setQuestions(questions.filter((q) => q.id !== qId))
  }

  // ── Options (single / multiple) ──
  function setOptions(
    q: SingleOrMultiple,
    options: ChoiceOption[],
    coalesceKey?: string,
  ) {
    replaceQuestion(q.id, { ...q, options }, coalesceKey)
  }

  function setOptionText(q: SingleOrMultiple, optId: string, text: string) {
    setOptions(
      q,
      q.options.map((o) => (o.id === optId ? { ...o, text } : o)),
      `quiz-opt-${optId}`,
    )
  }

  function setOptionFeedback(q: SingleOrMultiple, optId: string, feedback: string) {
    setOptions(
      q,
      q.options.map((o) => (o.id === optId ? { ...o, feedback } : o)),
      `quiz-optfb-${optId}`,
    )
  }

  function toggleCorrect(q: SingleOrMultiple, optId: string) {
    if (q.type === 'single') {
      setOptions(
        q,
        q.options.map((o) => ({ ...o, correct: o.id === optId })),
      )
    } else {
      setOptions(
        q,
        q.options.map((o) =>
          o.id === optId ? { ...o, correct: !o.correct } : o,
        ),
      )
    }
  }

  function addOption(q: SingleOrMultiple) {
    setOptions(q, [...q.options, newOption()])
  }

  function removeOption(q: SingleOrMultiple, optId: string) {
    setOptions(
      q,
      q.options.filter((o) => o.id !== optId),
    )
  }

  // ── Pairs (matching) ──
  function setPairs(q: MatchingQ, pairs: MatchingPair[], coalesceKey?: string) {
    replaceQuestion(q.id, { ...q, pairs }, coalesceKey)
  }

  function setPairField(
    q: MatchingQ,
    pairId: string,
    field: 'left' | 'right',
    value: string,
  ) {
    setPairs(
      q,
      q.pairs.map((p) => (p.id === pairId ? { ...p, [field]: value } : p)),
      `quiz-pair-${pairId}-${field}`,
    )
  }

  function addPair(q: MatchingQ) {
    setPairs(q, [...q.pairs, newPair()])
  }

  function removePair(q: MatchingQ, pairId: string) {
    setPairs(
      q,
      q.pairs.filter((p) => p.id !== pairId),
    )
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <span className="text-xs font-medium text-gray-500">
          {t('passingScore')}
        </span>
        <input
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(e) => {
            const raw = Number(e.target.value)
            const clamped = Number.isNaN(raw)
              ? 0
              : Math.min(100, Math.max(0, Math.round(raw)))
            update(
              lessonId,
              block.id,
              { passingScore: clamped },
              `quiz-pass-${block.id}`,
            )
          }}
          className="w-20 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand"
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={showAnswers}
          onChange={(e) =>
            update(lessonId, block.id, { showAnswers: e.target.checked })
          }
          className="mt-0.5 h-4 w-4 accent-brand"
        />
        <span>
          <span className="block font-medium text-gray-700">
            {t('showAnswers')}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {t('showAnswersHelp')}
          </span>
        </span>
      </label>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="space-y-4 rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('questionN', { n: index + 1 })}
              </span>
              {selected && (
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('removeQuestion')}
                >
                  ✕
                </button>
              )}
            </div>

            {selected && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_LABEL_KEYS) as QuestionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => changeType(q, type)}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      q.type === type
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t(TYPE_LABEL_KEYS[type])}
                  </button>
                ))}
              </div>
            )}

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-gray-500">
                {t('promptLabel')}
              </span>
              <textarea
                value={q.prompt}
                placeholder={t('promptPlaceholder')}
                rows={2}
                onChange={(e) => setPrompt(q, e.target.value)}
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-gray-800 outline-none placeholder-gray-300 focus:border-brand"
              />
            </label>

            <div className="space-y-2">
              {q.type === 'matching'
                ? renderPairs(q)
                : renderOptions(q)}
            </div>

            {selected && (
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t('questionFeedback')}
                </span>
                <textarea
                  value={q.feedback ?? ''}
                  placeholder={t('questionFeedbackPlaceholder')}
                  rows={2}
                  onChange={(e) => setQuestionFeedback(q, e.target.value)}
                  className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-gray-800 outline-none placeholder-gray-300 focus:border-brand"
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <button
          type="button"
          onClick={addQuestion}
          className="btn-secondary text-sm"
        >
          {t('addQuestion')}
        </button>
      )}
    </div>
  )

  function renderOptions(q: SingleOrMultiple) {
    const isSingle = q.type === 'single'
    return (
      <>
        {q.options.map((o) => (
          <div
            key={o.id}
            className={`space-y-2 rounded-lg border p-3 ${
              o.correct ? 'border-brand bg-brand/10' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type={isSingle ? 'radio' : 'checkbox'}
                name={`correct-${q.id}`}
                checked={o.correct}
                onChange={() => toggleCorrect(q, o.id)}
                className="accent-brand"
                aria-label={t('correctOption')}
              />
              <input
                type="text"
                value={o.text}
                placeholder={t('optionPlaceholder')}
                onChange={(e) => setOptionText(q, o.id, e.target.value)}
                className="flex-1 bg-transparent text-gray-800 outline-none placeholder-gray-300"
              />
              {selected && (
                <button
                  type="button"
                  onClick={() => removeOption(q, o.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('removeOption')}
                >
                  ✕
                </button>
              )}
            </div>
            {selected && (
              <input
                type="text"
                value={o.feedback ?? ''}
                placeholder={t('optionFeedbackPlaceholder')}
                onChange={(e) => setOptionFeedback(q, o.id, e.target.value)}
                className="ml-7 w-[calc(100%-1.75rem)] rounded-md border border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-500 outline-none placeholder-gray-300 focus:border-brand"
              />
            )}
          </div>
        ))}
        {selected && (
          <button
            type="button"
            onClick={() => addOption(q)}
            className="btn-secondary text-sm"
          >
            {t('addOption')}
          </button>
        )}
      </>
    )
  }

  function renderPairs(q: MatchingQ) {
    return (
      <>
        {q.pairs.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <input
              type="text"
              value={p.left}
              placeholder={t('pairLeftPlaceholder')}
              onChange={(e) => setPairField(q, p.id, 'left', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-800 outline-none placeholder-gray-300 focus:border-brand"
            />
            <span className="text-gray-400">↔</span>
            <input
              type="text"
              value={p.right}
              placeholder={t('pairRightPlaceholder')}
              onChange={(e) => setPairField(q, p.id, 'right', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-800 outline-none placeholder-gray-300 focus:border-brand"
            />
            {selected && (
              <button
                type="button"
                onClick={() => removePair(q, p.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label={t('removePair')}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {selected && (
          <button
            type="button"
            onClick={() => addPair(q)}
            className="btn-secondary text-sm"
          >
            {t('addPair')}
          </button>
        )}
      </>
    )
  }
}

type SingleOrMultiple = Extract<Question, { type: 'single' | 'multiple' }>
type MatchingQ = Extract<Question, { type: 'matching' }>
