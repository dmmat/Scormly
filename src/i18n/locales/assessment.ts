import type { LocaleTable } from '../types'

// UI strings for the scored exercise blocks other than the quiz: ordering
// ("Sort / order") and fill in the blanks — editor and learner preview.
// Passing score / show answers labels are shared with the `quiz` namespace.
const assessment: LocaleTable = {
  en: {
    // Ordering — editor
    modeSequence: 'Put in order',
    modeCategories: 'Sort into categories',
    promptLabel: 'Task',
    promptPlaceholder: 'Instruction for the learner…',
    itemsSequence: 'Items, in the correct order',
    itemsSequenceHelp: 'Learners see them shuffled and put them back in this order.',
    itemsCategories: 'Items',
    itemPlaceholder: 'Item text',
    addItem: '+ Item',
    removeItem: 'Remove item',
    moveUp: 'Move up',
    moveDown: 'Move down',
    categoriesLabel: 'Categories',
    categoryPlaceholder: 'Category name',
    addCategory: '+ Category',
    removeCategory: 'Remove category',
    itemCategory: 'Correct category',
    noCategory: '— Category —',

    // Ordering — learner
    sequenceHint: 'Drag the items, or use the arrows, to put them in the right order.',
    categoriesHint: 'Drag each item into a category, or pick one from its list.',
    unsorted: 'Not sorted yet',
    chooseCategory: 'Choose a category',
    correctPosition: 'Correct position: {n}',
    correctCategory: 'Correct: {c}',
    dragItem: 'Drag to reorder',

    // Fill in the blanks — editor
    textLabel: 'Text with blanks',
    textPlaceholder: 'The capital of France is [Paris].',
    textHelp: 'Wrap each answer in square brackets: [Paris]. Separate other accepted answers with |, e.g. [Paris|Paname] — the first one is the correct answer.',
    fbModeType: 'Type the answer',
    fbModeSelect: 'Choose from a list',
    caseSensitive: 'Case-sensitive answers',
    caseSensitiveHelp: 'Off: "paris" also counts as "Paris". Applies to typed answers.',
    blanksCount: 'Blanks: {n}',
    noBlanks: 'No blanks yet — wrap an answer in [square brackets].',

    // Fill in the blanks — learner
    blankN: 'Blank {n}',
    correctAnswer: 'Answer: {a}',
  },
  uk: {
    // Ordering — editor
    modeSequence: 'Упорядкувати',
    modeCategories: 'Розсортувати за категоріями',
    promptLabel: 'Завдання',
    promptPlaceholder: 'Інструкція для слухача…',
    itemsSequence: 'Елементи в правильному порядку',
    itemsSequenceHelp: 'Слухач бачить їх перемішаними й відновлює цей порядок.',
    itemsCategories: 'Елементи',
    itemPlaceholder: 'Текст елемента',
    addItem: '+ Елемент',
    removeItem: 'Видалити елемент',
    moveUp: 'Вище',
    moveDown: 'Нижче',
    categoriesLabel: 'Категорії',
    categoryPlaceholder: 'Назва категорії',
    addCategory: '+ Категорія',
    removeCategory: 'Видалити категорію',
    itemCategory: 'Правильна категорія',
    noCategory: '— Категорія —',

    // Ordering — learner
    sequenceHint: 'Перетягніть елементи або скористайтеся стрілками, щоб розставити їх у правильному порядку.',
    categoriesHint: 'Перетягніть кожен елемент у категорію або оберіть її зі списку.',
    unsorted: 'Ще не розсортовано',
    chooseCategory: 'Оберіть категорію',
    correctPosition: 'Правильна позиція: {n}',
    correctCategory: 'Правильно: {c}',
    dragItem: 'Перетягніть, щоб змінити порядок',

    // Fill in the blanks — editor
    textLabel: 'Текст із пропусками',
    textPlaceholder: 'Столиця Франції — [Париж].',
    textHelp: 'Візьміть кожну відповідь у квадратні дужки: [Париж]. Інші прийнятні відповіді відокремте |, напр. [Париж|Paris] — перша з них правильна.',
    fbModeType: 'Ввести відповідь',
    fbModeSelect: 'Обрати зі списку',
    caseSensitive: 'Враховувати регістр',
    caseSensitiveHelp: 'Вимкнено: «париж» теж зараховується як «Париж». Стосується введених відповідей.',
    blanksCount: 'Пропусків: {n}',
    noBlanks: 'Пропусків ще немає — візьміть відповідь у [квадратні дужки].',

    // Fill in the blanks — learner
    blankN: 'Пропуск {n}',
    correctAnswer: 'Відповідь: {a}',
  },
  fr: {
    // Ordering — editor
    modeSequence: 'Remettre dans l’ordre',
    modeCategories: 'Classer par catégories',
    promptLabel: 'Consigne',
    promptPlaceholder: 'Consigne pour l’apprenant…',
    itemsSequence: 'Éléments, dans le bon ordre',
    itemsSequenceHelp: 'Les apprenants les voient mélangés et les remettent dans cet ordre.',
    itemsCategories: 'Éléments',
    itemPlaceholder: 'Texte de l’élément',
    addItem: '+ Élément',
    removeItem: 'Supprimer l’élément',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    categoriesLabel: 'Catégories',
    categoryPlaceholder: 'Nom de la catégorie',
    addCategory: '+ Catégorie',
    removeCategory: 'Supprimer la catégorie',
    itemCategory: 'Bonne catégorie',
    noCategory: '— Catégorie —',

    // Ordering — learner
    sequenceHint: 'Faites glisser les éléments, ou utilisez les flèches, pour les remettre dans le bon ordre.',
    categoriesHint: 'Faites glisser chaque élément dans une catégorie, ou choisissez-la dans sa liste.',
    unsorted: 'Pas encore classés',
    chooseCategory: 'Choisissez une catégorie',
    correctPosition: 'Bonne position : {n}',
    correctCategory: 'Bonne catégorie : {c}',
    dragItem: 'Faites glisser pour réordonner',

    // Fill in the blanks — editor
    textLabel: 'Texte à trous',
    textPlaceholder: 'La capitale de la France est [Paris].',
    textHelp: 'Placez chaque réponse entre crochets : [Paris]. Séparez les autres réponses acceptées par |, par ex. [Paris|Paname] — la première est la bonne réponse.',
    fbModeType: 'Saisir la réponse',
    fbModeSelect: 'Choisir dans une liste',
    caseSensitive: 'Réponses sensibles à la casse',
    caseSensitiveHelp: 'Désactivé : « paris » est aussi accepté pour « Paris ». S’applique aux réponses saisies.',
    blanksCount: 'Trous : {n}',
    noBlanks: 'Aucun trou pour l’instant — placez une réponse entre [crochets].',

    // Fill in the blanks — learner
    blankN: 'Trou {n}',
    correctAnswer: 'Réponse : {a}',
  },
  es: {
    // Ordering — editor
    modeSequence: 'Poner en orden',
    modeCategories: 'Clasificar en categorías',
    promptLabel: 'Tarea',
    promptPlaceholder: 'Instrucción para el alumno…',
    itemsSequence: 'Elementos, en el orden correcto',
    itemsSequenceHelp: 'Los alumnos los ven mezclados y los devuelven a este orden.',
    itemsCategories: 'Elementos',
    itemPlaceholder: 'Texto del elemento',
    addItem: '+ Elemento',
    removeItem: 'Eliminar el elemento',
    moveUp: 'Subir',
    moveDown: 'Bajar',
    categoriesLabel: 'Categorías',
    categoryPlaceholder: 'Nombre de la categoría',
    addCategory: '+ Categoría',
    removeCategory: 'Eliminar la categoría',
    itemCategory: 'Categoría correcta',
    noCategory: '— Categoría —',

    // Ordering — learner
    sequenceHint: 'Arrastra los elementos, o usa las flechas, para ponerlos en el orden correcto.',
    categoriesHint: 'Arrastra cada elemento a una categoría o elígela en su lista.',
    unsorted: 'Sin clasificar',
    chooseCategory: 'Elige una categoría',
    correctPosition: 'Posición correcta: {n}',
    correctCategory: 'Categoría correcta: {c}',
    dragItem: 'Arrastra para cambiar el orden',

    // Fill in the blanks — editor
    textLabel: 'Texto con huecos',
    textPlaceholder: 'La capital de Francia es [París].',
    textHelp: 'Pon cada respuesta entre corchetes: [París]. Separa las demás respuestas aceptadas con |, p. ej. [París|Paris]; la primera es la respuesta correcta.',
    fbModeType: 'Escribir la respuesta',
    fbModeSelect: 'Elegir de una lista',
    caseSensitive: 'Distinguir mayúsculas y minúsculas',
    caseSensitiveHelp: 'Desactivado: “parís” también cuenta como “París”. Se aplica a las respuestas escritas.',
    blanksCount: 'Huecos: {n}',
    noBlanks: 'Aún no hay huecos: pon una respuesta entre [corchetes].',

    // Fill in the blanks — learner
    blankN: 'Hueco {n}',
    correctAnswer: 'Respuesta: {a}',
  },
}

export default assessment
