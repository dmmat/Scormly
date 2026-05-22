import type { LocaleTable } from '../types'

// Default content seeded when creating courses/lessons/blocks and when adding
// items inside blocks. Localized at creation time to the current UI language;
// afterwards it is plain editable content.
const content: LocaleTable = {
  en: {
    newCourse: 'Untitled course',
    lessonN: 'Lesson {n}',

    // Block creation defaults (registry)
    newHeading: 'New heading',
    newParagraph: 'Enter text…',
    listItem1: 'First item',
    listItem2: 'Second item',
    noteText: 'Important note for the learner.',
    continueLabel: 'Continue',
    tabTitle: 'Tab {n}',
    tabContent: 'Tab {n} content',
    sectionTitle: 'Section {n}',
    sectionContent: 'Section {n} content',
    cardFront: 'Term',
    cardBack: 'Definition',
    scenarioCharacter: 'Character',
    scenarioNodeText: 'Hi! Where do we start?',
    scenarioChoice: 'Answer option',
    quizPrompt: 'Question text?',
    quizCorrect: 'Correct answer',
    quizWrong: 'Wrong answer',

    // In-block "add" seeds
    newTab: 'New tab',
    newSection: 'New section',
    newListItem: 'List item',

    codeSample: 'console.log("Hello, world!")',
    tableHeader: 'Header',
    tableCell: 'Cell',
    quoteText: 'Your quote goes here.',
    outlineTitle: 'Course outline',
  },
  uk: {
    newCourse: 'Новий курс',
    lessonN: 'Урок {n}',

    // Block creation defaults (registry)
    newHeading: 'Новий заголовок',
    newParagraph: 'Введіть текст…',
    listItem1: 'Перший пункт',
    listItem2: 'Другий пункт',
    noteText: 'Важлива примітка для студента.',
    continueLabel: 'Продовжити',
    tabTitle: 'Вкладка {n}',
    tabContent: 'Зміст вкладки {n}',
    sectionTitle: 'Секція {n}',
    sectionContent: 'Зміст секції {n}',
    cardFront: 'Термін',
    cardBack: 'Визначення',
    scenarioCharacter: 'Персонаж',
    scenarioNodeText: 'Привіт! З чого почнемо?',
    scenarioChoice: 'Варіант відповіді',
    quizPrompt: 'Текст питання?',
    quizCorrect: 'Правильна відповідь',
    quizWrong: 'Неправильна відповідь',

    // In-block "add" seeds
    newTab: 'Нова вкладка',
    newSection: 'Нова секція',
    newListItem: 'Пункт списку',

    codeSample: 'console.log("Привіт, світ!")',
    tableHeader: 'Заголовок',
    tableCell: 'Клітинка',
    quoteText: 'Тут ваша цитата.',
    outlineTitle: 'Зміст курсу',
  },
}

export default content
