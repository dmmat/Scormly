import type { LocaleTable } from '../types'

// UI strings for the continue and scenario blocks.
const scenario: LocaleTable = {
  en: {
    // ── ContinueBlock ──
    continueDefault: 'Continue',
    continueLocked: 'Locked until tasks are completed',
    continueLockedHint: 'Complete the tasks above to continue.',
    buttonLabel: 'Button label',
    mode: 'Mode',
    modeUnrestricted: 'Free',
    modeRestricted: 'Blocking',
    restrictedHelp:
      'The button is locked until the learner answers the quizzes, exercises and reflections above and watches the required videos. They must click it before moving on.',
    gateHelp: 'The blocks below stay hidden until the learner clicks the button.',
    nextCard: 'Also show the “Next lesson” card',
    nextCardHelp: 'This button already takes the learner on, so the card under it is hidden.',

    // ── ScenarioBlock ──
    characterName: 'Character name',
    characterDefault: 'Character',
    characterLine: 'Character line…',
    characterImages: 'Character image by emotion',
    layout: 'Layout',
    layoutClassic: 'Classic',
    layoutChat: 'Chat (messenger)',
    userAvatar: 'Your avatar (chat replies)',
    emptyScenario: 'Scenario is empty',
    choiceDefault: 'Answer option',

    emotionNeutral: 'neutral',
    emotionHappy: 'happy',
    emotionConcerned: 'concerned',

    nodeN: 'Node {n}',
    unknownNode: 'Unknown node',
    finish: '— Finish —',
    startNode: 'Start',
    makeStart: 'Make start node',
    deleteNode: 'Delete node',

    choiceTextPlaceholder: 'Option text',
    transition: 'Transition',
    emotion: 'Emotion',
    addChoice: '+ Answer option',
    deleteChoice: 'Delete option',
    addNode: '+ Add node',
  },
  uk: {
    // ── ContinueBlock ──
    continueDefault: 'Продовжити',
    continueLocked: 'Заблоковано до виконання завдань',
    continueLockedHint: 'Виконайте завдання вище, щоб продовжити.',
    buttonLabel: 'Напис на кнопці',
    mode: 'Режим',
    modeUnrestricted: 'Вільний',
    modeRestricted: 'Блокуючий',
    restrictedHelp:
      'Кнопка заблокована, доки студент не відповість на квізи, вправи й рефлексії вище та не перегляне обовʼязкові відео. Натиснути її треба, щоб перейти далі.',
    gateHelp: 'Блоки нижче приховані, доки студент не натисне кнопку.',
    nextCard: 'Також показувати картку «Наступний урок»',
    nextCardHelp: 'Ця кнопка вже веде студента далі, тому картку під нею приховано.',

    // ── ScenarioBlock ──
    characterName: 'Імʼя персонажа',
    characterDefault: 'Персонаж',
    characterLine: 'Репліка персонажа…',
    characterImages: 'Зображення персонажа за емоцією',
    layout: 'Вигляд',
    layoutClassic: 'Класичний',
    layoutChat: 'Чат (месенджер)',
    userAvatar: 'Ваш аватар (відповіді в чаті)',
    emptyScenario: 'Сценарій порожній',
    choiceDefault: 'Варіант відповіді',

    emotionNeutral: 'нейтральна',
    emotionHappy: 'радісна',
    emotionConcerned: 'занепокоєна',

    nodeN: 'Вузол {n}',
    unknownNode: 'Невідомий вузол',
    finish: '— Завершити —',
    startNode: 'Початковий',
    makeStart: 'Зробити початковим',
    deleteNode: 'Видалити вузол',

    choiceTextPlaceholder: 'Текст варіанту',
    transition: 'Перехід',
    emotion: 'Емоція',
    addChoice: '+ Варіант відповіді',
    deleteChoice: 'Видалити варіант',
    addNode: '+ Додати вузол',
  },
  fr: {
    // ── ContinueBlock ──
    continueDefault: 'Continuer',
    continueLocked: 'Verrouillé tant que les activités ne sont pas terminées',
    continueLockedHint: 'Terminez les activités ci-dessus pour continuer.',
    buttonLabel: 'Libellé du bouton',
    mode: 'Mode',
    modeUnrestricted: 'Libre',
    modeRestricted: 'Bloquant',
    restrictedHelp:
      'Le bouton reste verrouillé tant que l’apprenant n’a pas répondu aux quiz, exercices et réflexions ci-dessus ni regardé les vidéos obligatoires. Il doit cliquer dessus avant de poursuivre.',
    gateHelp: 'Les blocs ci-dessous restent masqués jusqu’à ce que l’apprenant clique sur le bouton.',
    nextCard: 'Afficher aussi la carte « Leçon suivante »',
    nextCardHelp: 'Ce bouton fait déjà avancer l’apprenant : la carte située dessous est donc masquée.',

    // ── ScenarioBlock ──
    characterName: 'Nom du personnage',
    characterDefault: 'Personnage',
    characterLine: 'Réplique du personnage…',
    characterImages: 'Image du personnage selon l’émotion',
    layout: 'Disposition',
    layoutClassic: 'Classique',
    layoutChat: 'Chat (messagerie)',
    userAvatar: 'Votre avatar (réponses du chat)',
    emptyScenario: 'Le scénario est vide',
    choiceDefault: 'Option de réponse',

    emotionNeutral: 'neutre',
    emotionHappy: 'content',
    emotionConcerned: 'préoccupé',

    nodeN: 'Nœud {n}',
    unknownNode: 'Nœud inconnu',
    finish: '— Fin —',
    startNode: 'Départ',
    makeStart: 'Définir comme nœud de départ',
    deleteNode: 'Supprimer le nœud',

    choiceTextPlaceholder: 'Texte de l’option',
    transition: 'Transition',
    emotion: 'Émotion',
    addChoice: '+ Option de réponse',
    deleteChoice: 'Supprimer l’option',
    addNode: '+ Ajouter un nœud',
  },
  es: {
    // ── ContinueBlock ──
    continueDefault: 'Continuar',
    continueLocked: 'Bloqueado hasta que se completen las tareas',
    continueLockedHint: 'Completa las tareas anteriores para continuar.',
    buttonLabel: 'Texto del botón',
    mode: 'Modo',
    modeUnrestricted: 'Libre',
    modeRestricted: 'Con bloqueo',
    restrictedHelp:
      'El botón permanece bloqueado hasta que el alumno responde los cuestionarios, ejercicios y reflexiones anteriores y ve los videos obligatorios. Debe hacer clic en él antes de seguir.',
    gateHelp: 'Los bloques siguientes permanecen ocultos hasta que el alumno hace clic en el botón.',
    nextCard: 'Mostrar también la tarjeta “Siguiente lección”',
    nextCardHelp: 'Este botón ya lleva al alumno a la siguiente lección, así que la tarjeta que hay debajo se oculta.',

    // ── ScenarioBlock ──
    characterName: 'Nombre del personaje',
    characterDefault: 'Personaje',
    characterLine: 'Línea del personaje…',
    characterImages: 'Imagen del personaje según la emoción',
    layout: 'Diseño',
    layoutClassic: 'Clásico',
    layoutChat: 'Chat (mensajería)',
    userAvatar: 'Tu avatar (respuestas del chat)',
    emptyScenario: 'El escenario está vacío',
    choiceDefault: 'Opción de respuesta',

    emotionNeutral: 'neutral',
    emotionHappy: 'contento',
    emotionConcerned: 'preocupado',

    nodeN: 'Nodo {n}',
    unknownNode: 'Nodo desconocido',
    finish: '— Fin —',
    startNode: 'Inicio',
    makeStart: 'Convertir en nodo inicial',
    deleteNode: 'Eliminar nodo',

    choiceTextPlaceholder: 'Texto de la opción',
    transition: 'Transición',
    emotion: 'Emoción',
    addChoice: '+ Opción de respuesta',
    deleteChoice: 'Eliminar opción',
    addNode: '+ Añadir nodo',
  },
}

export default scenario
