import type { LocaleTable } from '../types'

// UI strings for the quiz block.
const quiz: LocaleTable = {
  en: {
    passingScore: 'Passing score, %',
    showAnswers: 'Show correct answers',
    showAnswersHelp: 'After submitting, reveal which answers were right and any feedback. Off shows only the score.',
    questionN: 'Question {n}',

    typeSingle: 'Single answer',
    typeMultiple: 'Multiple answers',
    typeMatching: 'Matching',
    typeSequence: 'Put in order',
    typeFillBlanks: 'Fill in the blanks',
    typeSingleDesc: 'One correct option',
    typeMultipleDesc: 'Several correct options',
    typeMatchingDesc: 'Pair items with answers, or sort them into categories',
    typeSequenceDesc: 'Arrange the steps in the right order',
    typeFillBlanksDesc: 'Type or pick the missing words',
    questionType: 'Question type',

    promptLabel: 'Question',
    promptPlaceholder: 'Question text…',

    questionFeedback: 'Overall feedback',
    questionFeedbackPlaceholder: 'Explanation shown after answering (optional)',

    optionPlaceholder: 'Option text',
    optionFeedbackPlaceholder: 'Feedback',
    pairLeftPlaceholder: 'Left',
    pairRightPlaceholder: 'Right',

    addOption: '+ Option',
    addPair: '+ Pair',
    addQuestion: '+ Add question',

    removeQuestion: 'Remove question',
    removeOption: 'Remove option',
    removePair: 'Remove pair',
    correctOption: 'Correct option',
  },
  uk: {
    passingScore: 'Прохідний бал, %',
    showAnswers: 'Показувати правильні відповіді',
    showAnswersHelp: 'Після відповіді показувати, що правильно, і фідбек. Вимкнено — лише бал.',
    questionN: 'Питання {n}',

    typeSingle: 'Одна відповідь',
    typeMultiple: 'Декілька відповідей',
    typeMatching: 'Відповідність',
    typeSequence: 'Упорядкувати',
    typeFillBlanks: 'Заповнити пропуски',
    typeSingleDesc: 'Один правильний варіант',
    typeMultipleDesc: 'Кілька правильних варіантів',
    typeMatchingDesc: 'Поєднати пари або розсортувати за категоріями',
    typeSequenceDesc: 'Розставити кроки в правильному порядку',
    typeFillBlanksDesc: 'Вписати чи обрати пропущені слова',
    questionType: 'Тип питання',

    promptLabel: 'Питання',
    promptPlaceholder: 'Текст питання…',

    questionFeedback: 'Загальний фідбек',
    questionFeedbackPlaceholder: 'Пояснення після відповіді (необов’язково)',

    optionPlaceholder: 'Текст варіанта',
    optionFeedbackPlaceholder: 'Фідбек',
    pairLeftPlaceholder: 'Ліворуч',
    pairRightPlaceholder: 'Праворуч',

    addOption: '+ Варіант',
    addPair: '+ Пара',
    addQuestion: '+ Додати питання',

    removeQuestion: 'Видалити питання',
    removeOption: 'Видалити варіант',
    removePair: 'Видалити пару',
    correctOption: 'Правильний варіант',
  },
  fr: {
    passingScore: 'Score de réussite, %',
    showAnswers: 'Afficher les bonnes réponses',
    showAnswersHelp: 'Après validation, indique quelles réponses étaient justes et affiche le feedback. Désactivé : seul le score est affiché.',
    questionN: 'Question {n}',

    typeSingle: 'Réponse unique',
    typeMultiple: 'Réponses multiples',
    typeMatching: 'Association',
    typeSequence: 'Remettre dans l’ordre',
    typeFillBlanks: 'Texte à trous',
    typeSingleDesc: 'Une seule bonne option',
    typeMultipleDesc: 'Plusieurs bonnes options',
    typeMatchingDesc: 'Associer des éléments à leurs réponses, ou les classer par catégories',
    typeSequenceDesc: 'Remettre les étapes dans le bon ordre',
    typeFillBlanksDesc: 'Saisir ou choisir les mots manquants',
    questionType: 'Type de question',

    promptLabel: 'Question',
    promptPlaceholder: 'Texte de la question…',

    questionFeedback: 'Feedback général',
    questionFeedbackPlaceholder: 'Explication affichée après la réponse (facultatif)',

    optionPlaceholder: 'Texte de l’option',
    optionFeedbackPlaceholder: 'Feedback',
    pairLeftPlaceholder: 'Gauche',
    pairRightPlaceholder: 'Droite',

    addOption: '+ Option',
    addPair: '+ Paire',
    addQuestion: '+ Ajouter une question',

    removeQuestion: 'Supprimer la question',
    removeOption: 'Supprimer l’option',
    removePair: 'Supprimer la paire',
    correctOption: 'Bonne option',
  },
  es: {
    passingScore: 'Puntuación mínima, %',
    showAnswers: 'Mostrar las respuestas correctas',
    showAnswersHelp: 'Tras enviar, muestra qué respuestas eran correctas y la retroalimentación. Si está desactivado, solo se muestra la puntuación.',
    questionN: 'Pregunta {n}',

    typeSingle: 'Respuesta única',
    typeMultiple: 'Respuestas múltiples',
    typeMatching: 'Emparejar',
    typeSequence: 'Poner en orden',
    typeFillBlanks: 'Rellenar huecos',
    typeSingleDesc: 'Una sola opción correcta',
    typeMultipleDesc: 'Varias opciones correctas',
    typeMatchingDesc: 'Emparejar elementos con sus respuestas o clasificarlos en categorías',
    typeSequenceDesc: 'Colocar los pasos en el orden correcto',
    typeFillBlanksDesc: 'Escribir o elegir las palabras que faltan',
    questionType: 'Tipo de pregunta',

    promptLabel: 'Pregunta',
    promptPlaceholder: 'Texto de la pregunta…',

    questionFeedback: 'Retroalimentación general',
    questionFeedbackPlaceholder: 'Explicación que se muestra tras responder (opcional)',

    optionPlaceholder: 'Texto de la opción',
    optionFeedbackPlaceholder: 'Retroalimentación',
    pairLeftPlaceholder: 'Izquierda',
    pairRightPlaceholder: 'Derecha',

    addOption: '+ Opción',
    addPair: '+ Par',
    addQuestion: '+ Añadir pregunta',

    removeQuestion: 'Quitar pregunta',
    removeOption: 'Quitar opción',
    removePair: 'Quitar par',
    correctOption: 'Opción correcta',
  },
}

export default quiz
