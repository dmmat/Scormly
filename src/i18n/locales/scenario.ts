import type { LocaleTable } from '../types'

// UI strings for the continue and scenario blocks.
const scenario: LocaleTable = {
  en: {
    // ── ContinueBlock ──
    continueDefault: 'Continue',
    continueLocked: 'Locked until tasks are completed',
    continueLockedHint: 'Complete the tasks above to continue.',
    buttonLabel: 'Button label',
    mode: 'Mode',
    modeUnrestricted: 'Free',
    modeRestricted: 'Blocking',
    restrictedHelp:
      'The button is locked until the learner answers the quizzes, exercises and reflections above and watches the required videos. They must click it before moving on.',
    gateHelp: 'The blocks below stay hidden until the learner clicks the button.',
    nextCard: 'Also show the “Next lesson” card',
    nextCardHelp: 'This button already takes the learner on, so the card under it is hidden.',

    // ── ScenarioBlock ──
    characterName: 'Character name',
    characterDefault: 'Character',
    characterLine: 'Character line…',
    characterImages: 'Character image by emotion',
    layout: 'Layout',
    layoutClassic: 'Classic',
    layoutChat: 'Chat (messenger)',
    userAvatar: 'Your avatar (chat replies)',
    emptyScenario: 'Scenario is empty',
    choiceDefault: 'Answer option',

    emotionNeutral: 'neutral',
    emotionHappy: 'happy',
    emotionConcerned: 'concerned',

    nodeN: 'Node {n}',
    unknownNode: 'Unknown node',
    finish: '— Finish —',
    startNode: 'Start',
    makeStart: 'Make start node',
    deleteNode: 'Delete node',

    choiceTextPlaceholder: 'Option text',
    transition: 'Transition',
    emotion: 'Emotion',
    addChoice: '+ Answer option',
    deleteChoice: 'Delete option',
    addNode: '+ Add node',
  },
  uk: {
    // ── ContinueBlock ──
    continueDefault: 'Продовжити',
    continueLocked: 'Заблоковано до виконання завдань',
    continueLockedHint: 'Виконайте завдання вище, щоб продовжити.',
    buttonLabel: 'Напис на кнопці',
    mode: 'Режим',
    modeUnrestricted: 'Вільний',
    modeRestricted: 'Блокуючий',
    restrictedHelp:
      'Кнопка заблокована, доки студент не відповість на квізи, вправи й рефлексії вище та не перегляне обовʼязкові відео. Натиснути її треба, щоб перейти далі.',
    gateHelp: 'Блоки нижче приховані, доки студент не натисне кнопку.',
    nextCard: 'Також показувати картку «Наступний урок»',
    nextCardHelp: 'Ця кнопка вже веде студента далі, тому картку під нею приховано.',

    // ── ScenarioBlock ──
    characterName: 'Імʼя персонажа',
    characterDefault: 'Персонаж',
    characterLine: 'Репліка персонажа…',
    characterImages: 'Зображення персонажа за емоцією',
    layout: 'Вигляд',
    layoutClassic: 'Класичний',
    layoutChat: 'Чат (месенджер)',
    userAvatar: 'Ваш аватар (відповіді в чаті)',
    emptyScenario: 'Сценарій порожній',
    choiceDefault: 'Варіант відповіді',

    emotionNeutral: 'нейтральна',
    emotionHappy: 'радісна',
    emotionConcerned: 'занепокоєна',

    nodeN: 'Вузол {n}',
    unknownNode: 'Невідомий вузол',
    finish: '— Завершити —',
    startNode: 'Початковий',
    makeStart: 'Зробити початковим',
    deleteNode: 'Видалити вузол',

    choiceTextPlaceholder: 'Текст варіанту',
    transition: 'Перехід',
    emotion: 'Емоція',
    addChoice: '+ Варіант відповіді',
    deleteChoice: 'Видалити варіант',
    addNode: '+ Додати вузол',
  },
}

export default scenario
