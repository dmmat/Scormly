import type { LocaleTable } from '../types'

// UI strings for media blocks (image, gallery, video).
const media: LocaleTable = {
  en: {
    uploadImage: 'Upload image',
    replaceImage: 'Replace image',
    captionPlaceholder: 'Caption (optional)',
    altLabel: 'Alt text',
    altPlaceholder: 'Image description for accessibility',

    addImages: 'Add images',
    removeImage: 'Remove image',

    uploadVideo: 'Upload video',
    replaceVideo: 'Replace video',
    addPoster: 'Add poster',
    replacePoster: 'Replace poster',
    requireWatch: 'Require watching',
    requireWatchHelp: 'The learner must watch the video before they can continue.',

    unsupportedImage: 'Unsupported image format. Use PNG, JPEG, WebP, GIF or SVG.',
    unsupportedVideo: 'Unsupported video format. Use MP4 (H.264) or WebM.',
  },
  uk: {
    uploadImage: 'Завантажити зображення',
    replaceImage: 'Замінити зображення',
    captionPlaceholder: "Підпис (необов'язково)",
    altLabel: 'Alt-текст',
    altPlaceholder: 'Опис зображення для доступності',

    addImages: 'Додати зображення',
    removeImage: 'Видалити зображення',

    uploadVideo: 'Завантажити відео',
    replaceVideo: 'Замінити відео',
    addPoster: 'Додати постер',
    replacePoster: 'Замінити постер',
    requireWatch: 'Вимагати перегляд',
    requireWatchHelp: 'Студент має переглянути відео, перш ніж продовжити.',

    unsupportedImage: 'Непідтримуваний формат зображення. Використайте PNG, JPEG, WebP, GIF або SVG.',
    unsupportedVideo: 'Непідтримуваний формат відео. Використайте MP4 (H.264) або WebM.',
  },
}

export default media
