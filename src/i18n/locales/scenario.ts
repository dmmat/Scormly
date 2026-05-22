import type { LocaleTable } from '../types'

// UI strings for the continue and scenario blocks.
const scenario: LocaleTable = {
  en: {
    // ── ContinueBlock ──
    continueDefault: 'Continue',
    continueLocked: 'Locked until tasks are completed',
    buttonLabel: 'Button label',
    mode: 'Mode',
    modeUnrestricted: 'Free',
    modeRestricted: 'Blocking',
    restrictedHelp:
      'The button is locked until the learner completes all interactive tasks above.',

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
    buttonLabel: 'Напис на кнопці',
    mode: 'Режим',
    modeUnrestricted: 'Вільний',
    modeRestricted: 'Блокуючий',
    restrictedHelp:
      'Кнопка заблокована, доки студент не виконає всі інтерактивні завдання вище.',

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
