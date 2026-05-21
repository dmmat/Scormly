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
  },
}

export default media
