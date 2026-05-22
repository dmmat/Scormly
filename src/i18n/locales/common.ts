import type { LocaleTable } from '../types'

// General editor shell strings: header, sidebar, workspace, toolbar,
// add-block menu.
const common: LocaleTable = {
  en: {
    save: 'Save',
    export: 'Export to SCORM',
    exporting: 'Exporting…',
    export12: 'SCORM 1.2',
    export2004: 'SCORM 2004',
    exportCmi5: 'cmi5 (xAPI)',
    undo: 'Undo',
    redo: 'Redo',
    theme: 'Theme',
    projectTheme: 'Project theme',
    language: 'Language',

    course: 'Course',
    lesson: 'Lesson',
    addLesson: 'Add lesson',
    chooseLesson: 'Select a lesson on the left',

    empty: 'Nothing here yet',
    emptyHint: 'Add your first block to start filling the lesson with content.',
    addBlock: 'Add block',
    searchBlocks: 'Search blocks…',
    noBlocks: 'No matching blocks',

    moveUp: 'Move up',
    moveDown: 'Move down',
    duplicate: 'Duplicate',
    delete: 'Delete',
    drag: 'Drag to reorder',

    catText: 'Text',
    catMedia: 'Media',
    catInteractive: 'Interactive',
    catNavigation: 'Navigation',

    newProject: 'New project…',
    openProject: 'Open project…',
    closeProject: 'Close project',
    downloadProject: 'Download project (.zip)',
    renameLesson: 'Rename',
    deleteLesson: 'Delete lesson',
    courseTitle: 'Course title',
    lessonTitle: 'Lesson title',
  },
  uk: {
    save: 'Зберегти',
    export: 'Експорт у SCORM',
    exporting: 'Експортування…',
    export12: 'SCORM 1.2',
    export2004: 'SCORM 2004',
    exportCmi5: 'cmi5 (xAPI)',
    undo: 'Скасувати',
    redo: 'Повторити',
    theme: 'Тема',
    projectTheme: 'Тема проєкту',
    language: 'Мова',

    course: 'Курс',
    lesson: 'Урок',
    addLesson: 'Додати урок',
    chooseLesson: 'Оберіть урок зліва',

    empty: 'Поки що порожньо',
    emptyHint: 'Додайте перший блок, щоб почати наповнювати урок контентом.',
    addBlock: 'Додати блок',
    searchBlocks: 'Пошук блоків…',
    noBlocks: 'Нічого не знайдено',

    moveUp: 'Вгору',
    moveDown: 'Вниз',
    duplicate: 'Дублювати',
    delete: 'Видалити',
    drag: 'Перетягнути',

    catText: 'Текст',
    catMedia: 'Медіа',
    catInteractive: 'Інтерактив',
    catNavigation: 'Навігація',

    newProject: 'Новий проєкт…',
    openProject: 'Відкрити проєкт…',
    closeProject: 'Закрити проєкт',
    downloadProject: 'Завантажити проєкт (.zip)',
    renameLesson: 'Перейменувати',
    deleteLesson: 'Видалити урок',
    courseTitle: 'Назва курсу',
    lessonTitle: 'Назва уроку',
  },
}

export default common
