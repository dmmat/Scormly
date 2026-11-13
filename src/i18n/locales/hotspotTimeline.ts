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
  fr: {
    // Image hotspots — editor
    hotspotAddHint: 'Cliquez sur l’image pour ajouter un repère. Faites glisser un repère pour le déplacer ; faites un clic droit dessus (ou appuyez sur Delete) pour le supprimer.',
    hotspotEmptyHint: 'Aucun repère pour l’instant — cliquez sur l’image pour en ajouter un.',
    hotspotTitlePlaceholder: 'Titre du repère',
    hotspotTextPlaceholder: 'Texte affiché à l’ouverture du repère',
    hotspotX: 'X, %',
    hotspotY: 'Y, %',
    removeHotspot: 'Supprimer le repère',
    // Image hotspots — learner
    hotspotMarker: 'Repère {n} : {title}',
    hotspotProgress: 'Explorés : {n} sur {total}',
    close: 'Fermer',

    // Timeline — editor
    layout: 'Disposition',
    layoutVertical: 'Chronologie verticale',
    layoutStepper: 'Étape par étape',
    addStep: '+ Élément',
    removeStep: 'Supprimer l’élément',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    labelPlaceholder: 'Libellé (date ou « Étape 1 »)',
    stepTitlePlaceholder: 'Titre',
    stepTextPlaceholder: 'Description',
    noSteps: 'Aucun élément pour l’instant.',
    // Timeline — learner
    prev: 'Précédent',
    next: 'Suivant',
    stepOf: 'Étape {n} sur {total}',
    goToStep: 'Aller à l’étape {n}',
  },
  es: {
    // Image hotspots — editor
    hotspotAddHint: 'Haz clic en la imagen para añadir un marcador. Arrastra un marcador para moverlo; haz clic derecho en él (o pulsa Delete) para eliminarlo.',
    hotspotEmptyHint: 'Aún no hay marcadores: haz clic en la imagen para añadir uno.',
    hotspotTitlePlaceholder: 'Título del marcador',
    hotspotTextPlaceholder: 'Texto que se muestra al abrir el marcador',
    hotspotX: 'X, %',
    hotspotY: 'Y, %',
    removeHotspot: 'Eliminar el marcador',
    // Image hotspots — learner
    hotspotMarker: 'Marcador {n}: {title}',
    hotspotProgress: 'Explorados: {n} de {total}',
    close: 'Cerrar',

    // Timeline — editor
    layout: 'Diseño',
    layoutVertical: 'Línea de tiempo vertical',
    layoutStepper: 'Paso a paso',
    addStep: '+ Elemento',
    removeStep: 'Eliminar el elemento',
    moveUp: 'Subir',
    moveDown: 'Bajar',
    labelPlaceholder: 'Etiqueta (fecha o “Paso 1”)',
    stepTitlePlaceholder: 'Título',
    stepTextPlaceholder: 'Descripción',
    noSteps: 'Aún no hay elementos.',
    // Timeline — learner
    prev: 'Anterior',
    next: 'Siguiente',
    stepOf: 'Paso {n} de {total}',
    goToStep: 'Ir al paso {n}',
  },
  de: {
    // Image hotspots — editor
    hotspotAddHint: 'Klicken Sie auf das Bild, um eine Markierung hinzuzufügen. Ziehen Sie eine Markierung, um sie zu verschieben; klicken Sie mit der rechten Maustaste darauf (oder drücken Sie Entf), um sie zu entfernen.',
    hotspotEmptyHint: 'Noch keine Markierungen – klicken Sie auf das Bild, um eine hinzuzufügen.',
    hotspotTitlePlaceholder: 'Titel der Markierung',
    hotspotTextPlaceholder: 'Text, der beim Öffnen der Markierung angezeigt wird',
    hotspotX: 'X, %',
    hotspotY: 'Y, %',
    removeHotspot: 'Markierung entfernen',
    // Image hotspots — learner
    hotspotMarker: 'Markierung {n}: {title}',
    hotspotProgress: '{n} von {total} erkundet',
    close: 'Schließen',

    // Timeline — editor
    layout: 'Layout',
    layoutVertical: 'Vertikale Zeitleiste',
    layoutStepper: 'Schritt für Schritt',
    addStep: '+ Eintrag',
    removeStep: 'Eintrag entfernen',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    labelPlaceholder: 'Beschriftung (Datum oder „Schritt 1“)',
    stepTitlePlaceholder: 'Titel',
    stepTextPlaceholder: 'Beschreibung',
    noSteps: 'Noch keine Einträge.',
    // Timeline — learner
    prev: 'Zurück',
    next: 'Weiter',
    stepOf: 'Schritt {n} von {total}',
    goToStep: 'Zu Schritt {n}',
  },
}

export default hotspotTimeline
