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
    submitAll: 'Submit answers',
    retry: 'Try again',
    correct: 'Correct',
    incorrect: 'Incorrect',
    selectAnswer: 'Select an answer',
    yourScore: 'Your score: {score}%',
    passed: 'Passed',
    failed: 'Not passed',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Complete the test',
    autoTestHint: 'Preview only: answers the questions and submits, so you can check the result.',
    autoPass: 'Passed',
    autoFail: 'Not passed',
    autoPassOff: 'This test can’t be passed — check its correct answers.',
    autoFailOff: 'This test can’t be failed — check its passing score.',

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
    submitAll: 'Надіслати відповіді',
    retry: 'Спробувати ще раз',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    selectAnswer: 'Оберіть відповідь',
    yourScore: 'Ваш результат: {score}%',
    passed: 'Складено',
    failed: 'Не складено',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Пройти тест',
    autoTestHint: 'Лише в перегляді: відповідає на запитання й надсилає тест, щоб перевірити результат.',
    autoPass: 'Успішно',
    autoFail: 'Неуспішно',
    autoPassOff: 'Цей тест неможливо скласти — перевірте правильні відповіді.',
    autoFailOff: 'Цей тест неможливо не скласти — перевірте прохідний бал.',

    // Scenario
    restart: 'Спочатку',
    end: 'Кінець',

    // Flashcards
    flipHint: 'Клікніть, щоб перевернути',
  },
}

export default preview
