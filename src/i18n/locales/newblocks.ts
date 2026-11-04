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

    htmlSourceCode: 'Code',
    htmlSourceFile: 'File',
    htmlSourceLabel: 'Source',
    htmlCodeLabel: 'HTML, CSS and JavaScript',
    htmlUpload: 'Upload .html or .zip',
    htmlReplace: 'Replace file',
    htmlUploadHint: 'A single page, or a .zip of a site with index.html (scripts, styles and images by relative path).',
    htmlUploading: 'Uploading…',
    htmlBadFormat: 'Choose an .html file or a .zip.',
    htmlNoPage: 'The .zip has no .html page.',
    htmlEmpty: 'Write code or upload a page to show it here.',
    htmlMissing: 'The page file is missing from the project.',
    htmlTitleLabel: 'Title (for screen readers)',
    htmlHeightLabel: 'Height',
    htmlHeightAuto: 'Fit content',
    htmlHeightPx: 'px',
    htmlCopyAi: 'Copy instructions for AI',
    htmlCopied: 'Instructions copied — paste them into your AI assistant with what the page should do.',
    htmlPreviewNote: 'In the editor, imports between ES modules (import … from "./file.js") don’t load — they work in the exported course.',
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

    htmlSourceCode: 'Код',
    htmlSourceFile: 'Файл',
    htmlSourceLabel: 'Джерело',
    htmlCodeLabel: 'HTML, CSS і JavaScript',
    htmlUpload: 'Завантажити .html або .zip',
    htmlReplace: 'Замінити файл',
    htmlUploadHint: 'Одна сторінка або .zip сайту з index.html (скрипти, стилі й зображення за відносними шляхами).',
    htmlUploading: 'Завантаження…',
    htmlBadFormat: 'Виберіть файл .html або .zip.',
    htmlNoPage: 'У .zip немає сторінки .html.',
    htmlEmpty: 'Напишіть код або завантажте сторінку, щоб показати її тут.',
    htmlMissing: 'Файлу сторінки немає в проєкті.',
    htmlTitleLabel: 'Назва (для екранних читачів)',
    htmlHeightLabel: 'Висота',
    htmlHeightAuto: 'За вмістом',
    htmlHeightPx: 'пікс.',
    htmlCopyAi: 'Скопіювати інструкцію для AI',
    htmlCopied: 'Інструкцію скопійовано — вставте її в AI-асистента разом з описом того, що має робити сторінка.',
    htmlPreviewNote: 'У редакторі імпорти між ES-модулями (import … from "./file.js") не завантажуються — вони працюють в експортованому курсі.',
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
