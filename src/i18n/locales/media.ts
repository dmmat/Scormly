import type { LocaleTable } from '../types'

// UI strings for media blocks (image, gallery, video).
const media: LocaleTable = {
  en: {
    uploadImage: 'Upload image',
    replaceImage: 'Replace image',
    captionPlaceholder: 'Caption (optional)',
    altLabel: 'Alt text',
    altPlaceholder: 'Image description for accessibility',
    decorative: 'Decorative image',
    decorativeHelp: 'Screen readers skip it (empty alt). Use only when the image adds no information.',
    imageAlt: 'Alt text for image {n}',

    addImages: 'Add images',
    removeImage: 'Remove image',

    uploadVideo: 'Upload video',
    replaceVideo: 'Replace video',
    addPoster: 'Add poster',
    replacePoster: 'Replace poster',
    requireWatch: 'Require watching',
    requireWatchHelp: 'The learner must watch the video before they can continue.',
    addCaptions: 'Add captions (.vtt)',
    replaceCaptions: 'Replace captions',
    removeCaptions: 'Remove captions',
    captionsAttached: 'Captions: {name}',
    captionsHelp: 'A WebVTT subtitle file, shown as closed captions in the player.',
    transcriptLabel: 'Transcript',
    transcriptPlaceholder: 'Full text of what is said (and important sounds) for learners who cannot hear or play the media',

    unsupportedImage: 'Unsupported image format. Use PNG, JPEG, WebP, GIF or SVG.',
    unsupportedVideo: 'Unsupported video format. Use MP4 (H.264) or WebM.',
    unsupportedCaptions: 'Unsupported captions format. Use a WebVTT (.vtt) file.',
  },
  uk: {
    uploadImage: 'Завантажити зображення',
    replaceImage: 'Замінити зображення',
    captionPlaceholder: "Підпис (необов'язково)",
    altLabel: 'Alt-текст',
    altPlaceholder: 'Опис зображення для доступності',
    decorative: 'Декоративне зображення',
    decorativeHelp: 'Екранні читачі його пропускають (порожній alt). Лише якщо зображення не несе інформації.',
    imageAlt: 'Alt-текст для зображення {n}',

    addImages: 'Додати зображення',
    removeImage: 'Видалити зображення',

    uploadVideo: 'Завантажити відео',
    replaceVideo: 'Замінити відео',
    addPoster: 'Додати постер',
    replacePoster: 'Замінити постер',
    requireWatch: 'Вимагати перегляд',
    requireWatchHelp: 'Студент має переглянути відео, перш ніж продовжити.',
    addCaptions: 'Додати субтитри (.vtt)',
    replaceCaptions: 'Замінити субтитри',
    removeCaptions: 'Прибрати субтитри',
    captionsAttached: 'Субтитри: {name}',
    captionsHelp: 'Файл субтитрів WebVTT; у плеєрі показується як закриті субтитри.',
    transcriptLabel: 'Текстова розшифровка',
    transcriptPlaceholder: 'Повний текст сказаного (і важливих звуків) для тих, хто не може слухати чи відтворити медіа',

    unsupportedImage: 'Непідтримуваний формат зображення. Використайте PNG, JPEG, WebP, GIF або SVG.',
    unsupportedVideo: 'Непідтримуваний формат відео. Використайте MP4 (H.264) або WebM.',
    unsupportedCaptions: 'Непідтримуваний формат субтитрів. Використайте файл WebVTT (.vtt).',
  },
}

export default media
