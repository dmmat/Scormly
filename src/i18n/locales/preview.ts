import type { LocaleTable } from '../types'

// Learner preview (read-only course view) strings.
const preview: LocaleTable = {
  en: {
    title: 'Preview',
    open: 'Preview',
    close: 'Close preview',
    prev: 'Previous',
    next: 'Next',
    progress: 'Lesson {n} of {total}',
    empty: 'This lesson has no content yet.',
    finish: 'Finish',
    courseComplete: 'Course complete',
    courseCompleteText: 'You have reached the end of the course.',
    review: 'Review the course',

    // Quiz
    submit: 'Submit answer',
    retry: 'Try again',
    correct: 'Correct',
    incorrect: 'Incorrect',
    selectAnswer: 'Select an answer',
    yourScore: 'Your score: {score}%',
    passed: 'Passed',
    failed: 'Not passed',

    // Scenario
    restart: 'Restart',
    end: 'The end',

    // Flashcards
    flipHint: 'Click to flip',
  },
  uk: {
    title: 'Перегляд',
    open: 'Перегляд',
    close: 'Закрити перегляд',
    prev: 'Назад',
    next: 'Далі',
    progress: 'Урок {n} з {total}',
    empty: 'У цьому уроці ще немає контенту.',
    finish: 'Завершити',
    courseComplete: 'Курс завершено',
    courseCompleteText: 'Ви пройшли курс до кінця.',
    review: 'Переглянути курс',

    // Quiz
    submit: 'Відповісти',
    retry: 'Спробувати ще раз',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    selectAnswer: 'Оберіть відповідь',
    yourScore: 'Ваш результат: {score}%',
    passed: 'Складено',
    failed: 'Не складено',

    // Scenario
    restart: 'Спочатку',
    end: 'Кінець',

    // Flashcards
    flipHint: 'Клікніть, щоб перевернути',
  },
}

export default preview
