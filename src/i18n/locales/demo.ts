import type { LocaleTable } from '../types'

// Copy for the interactive landing demos (auto-playing chat, quiz, flashcards,
// course outline). Kept separate from the marketing `landing` namespace.
const demo: LocaleTable = {
  en: {
    badge: 'Live demo',
    title: 'Play with the real building blocks',
    subtitle:
      'These are the very same interactive blocks your learners get. No video, no mock-up — try them right here.',

    tabChat: 'Dialogue trainer',
    tabQuiz: 'Quiz',
    tabFlashcards: 'Flashcards',
    tabOutline: 'Course outline',

    // Chat (auto-playing scenario)
    chatName: 'Anna · onboarding buddy',
    chatStatus: 'online',
    chatM1: "Hi! I'm Anna. Ready for a 2-minute onboarding?",
    chatO1a: "Let's do it",
    chatO1b: 'What will we cover?',
    chatM2: 'Great. Where do you log your work hours?',
    chatO2a: 'In the HR portal',
    chatO2b: 'By email',
    chatM3: "Spot on. You're a natural at this — see you inside!",
    chatReplay: 'Replay',

    // Quiz
    quizPrompt: 'What does Scormly hand you when the course is done?',
    quizO1: 'A SCORM / cmi5 package',
    quizO2: 'A printed PDF',
    quizO3: 'A link to our servers',
    quizCorrect: 'Correct — one click, ready for any LMS.',
    quizWrong: 'Not quite. Scormly always exports a standards package.',
    quizPick: 'Pick an answer',
    quizAgain: 'Try again',

    // Flashcards
    flipHint: 'Tap a card to flip it',
    fc1Front: 'SCORM',
    fc1Back: 'A package format every major LMS can import.',
    fc2Front: 'cmi5',
    fc2Back: 'A modern xAPI profile for richer tracking.',
    fc3Front: 'Local-first',
    fc3Back: 'Your data lives on your device — no server.',

    // Outline
    outlineTitle: 'Onboarding course',
    outlineHint: 'Click a lesson — like a learner would',
    ol1: 'Welcome aboard',
    ol2: 'Core concepts',
    ol3: 'Hands-on practice',
    ol4: 'Final quiz',
    olVisited: 'visited',
  },
  uk: {
    badge: 'Жива демонстрація',
    title: 'Пограйте з реальними блоками',
    subtitle:
      'Це ті самі інтерактивні блоки, які отримають ваші студенти. Без відео й макетів — спробуйте просто тут.',

    tabChat: 'Діалоговий тренажер',
    tabQuiz: 'Квіз',
    tabFlashcards: 'Картки',
    tabOutline: 'Зміст курсу',

    // Chat
    chatName: 'Анна · твій онбординг-бадді',
    chatStatus: 'онлайн',
    chatM1: 'Привіт! Я Анна. Готові до 2-хвилинного онбордингу?',
    chatO1a: 'Поїхали',
    chatO1b: 'Що будемо проходити?',
    chatM2: 'Чудово. Де ви фіксуєте робочі години?',
    chatO2a: 'У HR-порталі',
    chatO2b: 'Електронною поштою',
    chatM3: 'Саме так. У вас чудово виходить — до зустрічі всередині!',
    chatReplay: 'Спочатку',

    // Quiz
    quizPrompt: 'Що ви отримуєте, коли курс готовий?',
    quizO1: 'Пакет SCORM / cmi5',
    quizO2: 'Роздрукований PDF',
    quizO3: 'Посилання на наші сервери',
    quizCorrect: 'Правильно — один клік, і готово для будь-якої LMS.',
    quizWrong: 'Не зовсім. Scormly завжди експортує стандартний пакет.',
    quizPick: 'Оберіть відповідь',
    quizAgain: 'Спробувати ще раз',

    // Flashcards
    flipHint: 'Торкніться картки, щоб перевернути',
    fc1Front: 'SCORM',
    fc1Back: 'Формат пакета, який імпортує будь-яка LMS.',
    fc2Front: 'cmi5',
    fc2Back: 'Сучасний xAPI-профіль для детальнішого трекінгу.',
    fc3Front: 'Local-first',
    fc3Back: 'Ваші дані — на вашому пристрої, без сервера.',

    // Outline
    outlineTitle: 'Курс онбордингу',
    outlineHint: 'Клікніть урок — як це робив би студент',
    ol1: 'Ласкаво просимо',
    ol2: 'Основні поняття',
    ol3: 'Практика',
    ol4: 'Підсумковий квіз',
    olVisited: 'переглянуто',
  },
}

export default demo
