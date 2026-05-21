import type { LocaleTable } from '../types'

// UI strings for the quiz block.
const quiz: LocaleTable = {
  en: {
    passingScore: 'Passing score, %',
    questionN: 'Question {n}',

    typeSingle: 'Single answer',
    typeMultiple: 'Multiple answers',
    typeMatching: 'Matching',

    promptLabel: 'Question',
    promptPlaceholder: 'Question text…',

    questionFeedback: 'Overall feedback',
    questionFeedbackPlaceholder: 'Explanation shown after answering (optional)',

    optionPlaceholder: 'Option text',
    optionFeedbackPlaceholder: 'Feedback',
    pairLeftPlaceholder: 'Left',
    pairRightPlaceholder: 'Right',

    addOption: '+ Option',
    addPair: '+ Pair',
    addQuestion: '+ Add question',

    removeQuestion: 'Remove question',
    removeOption: 'Remove option',
    removePair: 'Remove pair',
    correctOption: 'Correct option',
  },
  uk: {
    passingScore: 'Прохідний бал, %',
    questionN: 'Питання {n}',

    typeSingle: 'Одна відповідь',
    typeMultiple: 'Декілька відповідей',
    typeMatching: 'Відповідність',

    promptLabel: 'Питання',
    promptPlaceholder: 'Текст питання…',

    questionFeedback: 'Загальний фідбек',
    questionFeedbackPlaceholder: 'Пояснення після відповіді (необов’язково)',

    optionPlaceholder: 'Текст варіанта',
    optionFeedbackPlaceholder: 'Фідбек',
    pairLeftPlaceholder: 'Ліворуч',
    pairRightPlaceholder: 'Праворуч',

    addOption: '+ Варіант',
    addPair: '+ Пара',
    addQuestion: '+ Додати питання',

    removeQuestion: 'Видалити питання',
    removeOption: 'Видалити варіант',
    removePair: 'Видалити пару',
    correctOption: 'Правильний варіант',
  },
}

export default quiz
