import type { LocaleTable } from '../types'

// UI strings for the image hotspots and timeline blocks (editor + preview).
const hotspotTimeline: LocaleTable = {
  en: {
    // Image hotspots — editor
    hotspotAddHint: 'Click the image to add a marker. Drag a marker to move it; right-click it (or press Delete) to remove it.',
    hotspotEmptyHint: 'No markers yet — click the image to add one.',
    hotspotTitlePlaceholder: 'Marker title',
    hotspotTextPlaceholder: 'Text shown when the marker is opened',
    hotspotX: 'X, %',
    hotspotY: 'Y, %',
    removeHotspot: 'Remove marker',
    // Image hotspots — learner
    hotspotMarker: 'Marker {n}: {title}',
    hotspotProgress: 'Explored {n} of {total}',
    close: 'Close',

    // Timeline — editor
    layout: 'Layout',
    layoutVertical: 'Vertical timeline',
    layoutStepper: 'Step by step',
    addStep: '+ Item',
    removeStep: 'Remove item',
    moveUp: 'Move up',
    moveDown: 'Move down',
    labelPlaceholder: 'Label (date or "Step 1")',
    stepTitlePlaceholder: 'Title',
    stepTextPlaceholder: 'Description',
    noSteps: 'No items yet.',
    // Timeline — learner
    prev: 'Previous',
    next: 'Next',
    stepOf: 'Step {n} of {total}',
    goToStep: 'Go to step {n}',
  },
  uk: {
    // Image hotspots — editor
    hotspotAddHint: 'Клацніть по зображенню, щоб додати мітку. Перетягніть мітку, щоб перемістити; клацніть правою кнопкою (або Delete), щоб видалити.',
    hotspotEmptyHint: 'Міток ще немає — клацніть по зображенню, щоб додати.',
    hotspotTitlePlaceholder: 'Назва мітки',
    hotspotTextPlaceholder: 'Текст, що з’являється при відкритті мітки',
    hotspotX: 'X, %',
    hotspotY: 'Y, %',
    removeHotspot: 'Видалити мітку',
    // Image hotspots — learner
    hotspotMarker: 'Мітка {n}: {title}',
    hotspotProgress: 'Переглянуто {n} з {total}',
    close: 'Закрити',

    // Timeline — editor
    layout: 'Вигляд',
    layoutVertical: 'Вертикальна хронологія',
    layoutStepper: 'Крок за кроком',
    addStep: '+ Елемент',
    removeStep: 'Видалити елемент',
    moveUp: 'Перемістити вгору',
    moveDown: 'Перемістити вниз',
    labelPlaceholder: 'Мітка (дата або «Крок 1»)',
    stepTitlePlaceholder: 'Заголовок',
    stepTextPlaceholder: 'Опис',
    noSteps: 'Елементів ще немає.',
    // Timeline — learner
    prev: 'Назад',
    next: 'Далі',
    stepOf: 'Крок {n} з {total}',
    goToStep: 'Перейти до кроку {n}',
  },
}

export default hotspotTimeline
