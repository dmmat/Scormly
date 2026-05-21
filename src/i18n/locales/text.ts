import type { LocaleTable } from '../types'

// UI strings for text blocks (heading, paragraph, list, note).
const text: LocaleTable = {
  en: {
    // Heading
    headingPlaceholder: 'Heading',
    headingLevel: 'Heading level {level}',

    // Paragraph
    bold: 'Bold',
    italic: 'Italic',
    paragraphPlaceholder: 'Enter text…',

    // List
    bulleted: 'Bulleted',
    numbered: 'Numbered',
    listItemPlaceholder: 'List item',
    removeItem: 'Remove item',
    addItem: 'Add item',

    // Note
    note: 'Note',
    warning: 'Warning',
    notePlaceholder: 'Note text',
    warningPlaceholder: 'Warning text',
  },
  uk: {
    // Heading
    headingPlaceholder: 'Заголовок',
    headingLevel: 'Рівень заголовка {level}',

    // Paragraph
    bold: 'Жирний',
    italic: 'Курсив',
    paragraphPlaceholder: 'Введіть текст…',

    // List
    bulleted: 'Маркований',
    numbered: 'Нумерований',
    listItemPlaceholder: 'Пункт списку',
    removeItem: 'Видалити пункт',
    addItem: 'Додати пункт',

    // Note
    note: 'Примітка',
    warning: 'Попередження',
    notePlaceholder: 'Текст примітки',
    warningPlaceholder: 'Текст попередження',
  },
}

export default text
