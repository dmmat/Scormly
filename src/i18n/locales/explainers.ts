import type { LocaleTable } from '../types'

// UI strings for the process diagram, step-by-step guide, comparison,
// before / after and reflection blocks (editor + preview).
const explainers: LocaleTable = {
  en: {
    // Shared editor controls
    layout: 'Layout',
    addStep: '+ Step',
    removeStep: 'Remove step',
    moveUp: 'Move up',
    moveDown: 'Move down',
    stepTitle: 'Title',
    stepText: 'Description',
    noSteps: 'No steps yet.',

    // Process diagram
    layout_flow: 'Arrows',
    layout_chevrons: 'Chevrons',
    layout_cycle: 'Cycle',
    layout_pyramid: 'Pyramid',
    style: 'Style',
    variant_solid: 'Solid',
    variant_soft: 'Soft',
    variant_outline: 'Outline',
    processCycleHint: 'Learners open each step on the ring to read it.',
    processPyramidHint: 'The first step is the top of the pyramid.',
    openStep: 'Step {n}: {title}',
    exploredOf: 'Explored {n} of {total}',

    // Step-by-step guide
    layout_list: 'All steps',
    layout_slides: 'One at a time',
    addImage: 'Add picture',
    replaceImage: 'Replace picture',
    removeImage: 'Remove picture',
    altPlaceholder: 'Describe the picture (alt text)',
    unsupportedImage: 'Unsupported image format. Use PNG, JPG, WebP, GIF or SVG.',
    stepOf: 'Step {n} of {total}',
    back: 'Back',
    next: 'Next',
    startOver: 'Start over',

    // Comparison
    columnTitle: 'Column title',
    tone: 'Marker',
    tone_pro: 'Pro',
    tone_con: 'Con',
    tone_neutral: 'Neutral',
    addPoint: '+ Point',
    removePoint: 'Remove point',
    pointPlaceholder: 'Point',
    addColumn: '+ Column',
    removeColumn: 'Remove column',
    versus: '“VS” badge',

    // Before / after
    uploadBefore: 'Upload the “before” image',
    uploadAfter: 'Upload the “after” image',
    replaceBefore: 'Replace “before”',
    replaceAfter: 'Replace “after”',
    beforeLabel: '“Before” label',
    afterLabel: '“After” label',
    beforeAlt: '“Before” alt text',
    afterAlt: '“After” alt text',
    beforeAfterHint: 'Use two pictures with the same size and framing.',
    sliderLabel: 'Compare: drag to show more of “{before}” or “{after}”',

    // Reflection
    promptPlaceholder: 'Question for the learner',
    sampleLabel: 'Sample answer',
    samplePlaceholder: 'Shown after the learner submits. Leave empty to skip.',
    answerPlaceholder: 'Type your answer…',
    submitAnswer: 'Submit',
    answerSaved: 'Your answer is saved.',
    editAnswer: 'Edit answer',
  },
  uk: {
    // Shared editor controls
    layout: 'Вигляд',
    addStep: '+ Крок',
    removeStep: 'Видалити крок',
    moveUp: 'Вище',
    moveDown: 'Нижче',
    stepTitle: 'Назва',
    stepText: 'Опис',
    noSteps: 'Кроків ще немає.',

    // Process diagram
    layout_flow: 'Стрілки',
    layout_chevrons: 'Шеврони',
    layout_cycle: 'Цикл',
    layout_pyramid: 'Піраміда',
    style: 'Стиль',
    variant_solid: 'Заливка',
    variant_soft: 'Мʼякий',
    variant_outline: 'Контур',
    processCycleHint: 'Студенти відкривають кожен крок на колі, щоб прочитати його.',
    processPyramidHint: 'Перший крок — це вершина піраміди.',
    openStep: 'Крок {n}: {title}',
    exploredOf: 'Переглянуто {n} з {total}',

    // Step-by-step guide
    layout_list: 'Усі кроки',
    layout_slides: 'По одному',
    addImage: 'Додати зображення',
    replaceImage: 'Замінити зображення',
    removeImage: 'Прибрати зображення',
    altPlaceholder: 'Опишіть зображення (альтернативний текст)',
    unsupportedImage: 'Непідтримуваний формат зображення. Використайте PNG, JPG, WebP, GIF або SVG.',
    stepOf: 'Крок {n} з {total}',
    back: 'Назад',
    next: 'Далі',
    startOver: 'Спочатку',

    // Comparison
    columnTitle: 'Назва колонки',
    tone: 'Позначка',
    tone_pro: 'Плюс',
    tone_con: 'Мінус',
    tone_neutral: 'Нейтральна',
    addPoint: '+ Пункт',
    removePoint: 'Видалити пункт',
    pointPlaceholder: 'Пункт',
    addColumn: '+ Колонка',
    removeColumn: 'Видалити колонку',
    versus: 'Позначка «VS»',

    // Before / after
    uploadBefore: 'Завантажте зображення «до»',
    uploadAfter: 'Завантажте зображення «після»',
    replaceBefore: 'Замінити «до»',
    replaceAfter: 'Замінити «після»',
    beforeLabel: 'Підпис «до»',
    afterLabel: 'Підпис «після»',
    beforeAlt: 'Альтернативний текст «до»',
    afterAlt: 'Альтернативний текст «після»',
    beforeAfterHint: 'Використайте два зображення однакового розміру й ракурсу.',
    sliderLabel: 'Порівняння: тягніть, щоб показати більше «{before}» або «{after}»',

    // Reflection
    promptPlaceholder: 'Питання для студента',
    sampleLabel: 'Приклад відповіді',
    samplePlaceholder: 'Показується, коли студент надішле відповідь. Залиште порожнім, щоб не показувати.',
    answerPlaceholder: 'Напишіть свою відповідь…',
    submitAnswer: 'Надіслати',
    answerSaved: 'Вашу відповідь збережено.',
    editAnswer: 'Змінити відповідь',
  },
}

export default explainers
