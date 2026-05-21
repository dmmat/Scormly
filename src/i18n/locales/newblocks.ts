import type { LocaleTable } from '../types'

// UI strings for the newer blocks (audio, embed, code, table, quote).
const newblocks: LocaleTable = {
  en: {
    uploadAudio: 'Upload audio',
    replaceAudio: 'Replace audio',
    unsupportedAudio: 'Unsupported audio format. Use MP3, OGG or WAV.',

    embedUrlPlaceholder: 'Paste a URL (YouTube, Vimeo, …)',
    embedTitlePlaceholder: 'Title (optional)',
    embedHint: 'Paste a video or page URL to embed it.',
    embedInvalid: 'Enter a valid https URL.',

    codePlaceholder: 'Your code…',
    languagePlaceholder: 'Language (optional)',

    addRow: 'Add row',
    addColumn: 'Add column',
    removeRow: 'Remove row',
    removeColumn: 'Remove column',
    headerRow: 'Header row',

    quotePlaceholder: 'Quotation text',
    authorPlaceholder: 'Author (optional)',
  },
  uk: {
    uploadAudio: 'Завантажити аудіо',
    replaceAudio: 'Замінити аудіо',
    unsupportedAudio: 'Непідтримуваний формат аудіо. Використайте MP3, OGG або WAV.',

    embedUrlPlaceholder: 'Вставте URL (YouTube, Vimeo, …)',
    embedTitlePlaceholder: 'Назва (необов’язково)',
    embedHint: 'Вставте URL відео чи сторінки для вбудовування.',
    embedInvalid: 'Введіть коректний https-URL.',

    codePlaceholder: 'Ваш код…',
    languagePlaceholder: 'Мова (необов’язково)',

    addRow: 'Додати рядок',
    addColumn: 'Додати стовпець',
    removeRow: 'Видалити рядок',
    removeColumn: 'Видалити стовпець',
    headerRow: 'Рядок-заголовок',

    quotePlaceholder: 'Текст цитати',
    authorPlaceholder: 'Автор (необов’язково)',
  },
}

export default newblocks
