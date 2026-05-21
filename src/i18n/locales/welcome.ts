import type { LocaleTable } from '../types'

// Welcome screen (project open/create) and project/save UI strings.
const welcome: LocaleTable = {
  en: {
    tagline: 'Local-first course builder with SCORM export',
    createTitle: 'Create a new project',
    createText: 'Choose a folder on your computer. Scormly saves your project and media there.',
    createCta: 'Choose folder',
    openTitle: 'Open a project',
    openText: 'Select a folder that already contains a Scormly project.',
    openCta: 'Open folder',
    privacyNote: 'Everything stays on your device. Nothing is uploaded.',
    noProject: 'No Scormly project was found in that folder. Pick the project folder, or create a new project.',
    cancelled: 'Folder selection was cancelled.',
    genericError: 'Something went wrong. Please try again.',
    unsupportedTitle: 'Your browser can’t save to disk',
    unsupportedText: 'Saving projects to a folder needs the File System Access API (Chrome or Edge). You can still try the builder without saving.',
    tryAnyway: 'Try the builder without saving',

    // Save status (Header)
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    saveError: 'Save failed',
    unsaved: 'Unsaved changes',
    noFolderTitle: 'Not saving to disk',
    reportIssue: 'Report an issue',
  },
  uk: {
    tagline: 'Local-first конструктор курсів з експортом у SCORM',
    createTitle: 'Створити новий проєкт',
    createText: 'Оберіть папку на комп’ютері. Scormly зберігатиме проєкт і медіа в неї.',
    createCta: 'Обрати папку',
    openTitle: 'Відкрити проєкт',
    openText: 'Виберіть папку, що вже містить проєкт Scormly.',
    openCta: 'Відкрити папку',
    privacyNote: 'Усе залишається на вашому пристрої. Нічого не завантажується.',
    noProject: 'У цій папці не знайдено проєкт Scormly. Оберіть папку проєкту або створіть новий.',
    cancelled: 'Вибір папки скасовано.',
    genericError: 'Щось пішло не так. Спробуйте ще раз.',
    unsupportedTitle: 'Ваш браузер не може зберігати на диск',
    unsupportedText: 'Для збереження проєктів у папку потрібен File System Access API (Chrome або Edge). Ви можете спробувати конструктор без збереження.',
    tryAnyway: 'Спробувати без збереження',

    // Save status (Header)
    save: 'Зберегти',
    saving: 'Збереження…',
    saved: 'Збережено',
    saveError: 'Помилка збереження',
    unsaved: 'Незбережені зміни',
    noFolderTitle: 'Без збереження на диск',
    reportIssue: 'Повідомити про проблему',
  },
}

export default welcome
