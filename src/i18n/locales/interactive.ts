import type { LocaleTable } from '../types'

// UI strings for interactive blocks (tabs, accordion, flashcards).
const interactive: LocaleTable = {
  en: {
    // Tabs
    addTab: '+ Tab',
    tabTitlePlaceholder: 'Title',
    tabFallback: 'Tab',
    removeTab: 'Remove tab',
    tabContentPlaceholder: 'Tab content…',
    noTabs: 'No tabs',

    // Accordion
    addSection: '+ Section',
    sectionTitlePlaceholder: 'Section title',
    sectionFallback: 'Section',
    removeSection: 'Remove section',
    sectionContentPlaceholder: 'Section content…',
    collapse: 'Collapse',
    expand: 'Expand',

    // Flashcards
    addCard: '+ Card',
    removeCard: '✕ Remove',
    front: 'Front',
    back: 'Back',
    frontPlaceholder: 'Front side',
    backPlaceholder: 'Back side',
  },
  uk: {
    // Tabs
    addTab: '+ Вкладка',
    tabTitlePlaceholder: 'Назва',
    tabFallback: 'Вкладка',
    removeTab: 'Видалити вкладку',
    tabContentPlaceholder: 'Вміст вкладки…',
    noTabs: 'Немає вкладок',

    // Accordion
    addSection: '+ Секція',
    sectionTitlePlaceholder: 'Заголовок секції',
    sectionFallback: 'Секція',
    removeSection: 'Видалити секцію',
    sectionContentPlaceholder: 'Вміст секції…',
    collapse: 'Згорнути',
    expand: 'Розгорнути',

    // Flashcards
    addCard: '+ Картка',
    removeCard: '✕ Видалити',
    front: 'Лицьова сторона',
    back: 'Зворотна сторона',
    frontPlaceholder: 'Лицьова сторона',
    backPlaceholder: 'Зворотна сторона',
  },
}

export default interactive
