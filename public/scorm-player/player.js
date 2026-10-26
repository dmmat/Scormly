/* Scormly SCORM player. Reads the course embedded by course-data.js
   (window.__SCORMLY_COURSE__) and renders it for the learner, reporting
   completion/score to the LMS via the tracking wrapper (window.SCORM, provided
   by scorm.js or xapi.js). */
(function () {
  'use strict';

  // [brand, brand-dark, button radius, surface radius] — mirrors the builder
  // themes in src/index.css so exports look like the preview.
  var THEME_ACCENT = {
    rose: ['#db2777', '#be185d', '0.5rem', '0.5rem'],
    ocean: ['#0369a1', '#075985', '9999px', '1rem'],
    forest: ['#15803d', '#166534', '0.25rem', '0.25rem'],
    sunset: ['#c2410c', '#9a3412', '0.75rem', '0.75rem'],
    mono: ['#334155', '#1e293b', '0', '0'],
    indigo: ['#4f46e5', '#4338ca', '2px', '2px'],
    crimson: ['#dc2626', '#b91c1c', '0', '2px'],
    mint: ['#0f766e', '#115e59', '1.25rem', '1.5rem'],
    grape: ['#9333ea', '#7e22ce', '9999px', '0.375rem'],
    terminal: ['#15803d', '#166534', '0', '0'],
  };

  var T = {
    en: { prev: 'Previous', next: 'Next', progress: 'Lesson {n} of {total}',
      empty: 'This lesson has no content yet.', submit: 'Submit answer', submitAll: 'Submit answers', retry: 'Try again',
      correct: 'Correct', incorrect: 'Incorrect', yourScore: 'Your score: {s}%',
      passed: 'Passed', failed: 'Not passed', restart: 'Restart', end: 'The end',
      finish: 'Finish', exitCourse: 'Exit course', courseComplete: 'Course complete',
      courseCompleteText: 'You have reached the end of the course. You can close this window.',
      courseIncomplete: 'The course is not complete yet',
      courseIncompleteText: 'Some activities still need your answer. Finish them to complete the course — your progress is saved.',
      unfinishedLessons: 'Unfinished lessons',
      courseFailed: 'The course is not passed yet',
      courseFailedText: 'You need {p}% to pass. Retake the tests in these lessons — your progress is saved.',
      retakeLessons: 'Lessons with tests to retake',
      review: 'Review the course', watchToContinue: 'Watch the video to continue.',
      close: 'Close', hotspotMarker: 'Marker {n}: {title}', hotspotProgress: 'Explored {n} of {total}',
      stepOf: 'Step {n} of {total}', goToStep: 'Go to step {n}',
      sequenceHint: 'Drag the items, or use the arrows, to put them in the right order.',
      categoriesHint: 'Drag each item into a category, or pick one from its list.',
      unsorted: 'Not sorted yet', chooseCategory: 'Choose a category', dragItem: 'Drag to reorder',
      moveUp: 'Move up', moveDown: 'Move down', correctPosition: 'Correct position: {n}',
      correctCategory: 'Correct: {c}', correctAnswer: 'Answer: {a}', blankN: 'Blank {n}',
      skipToContent: 'Skip to content', lessonNav: 'Lesson navigation', a11ySettings: 'Accessibility settings',
      textSize: 'Text size', textNormal: 'Normal', textLarge: 'Large', textXLarge: 'Extra large',
      highContrast: 'High contrast', readableSpacing: 'Readable spacing', reduceMotion: 'Reduce motion',
      captionsDefault: 'Captions on by default', captions: 'Captions', transcript: 'Transcript',
      embedTitle: 'Embedded content', lessonAnnounce: 'Lesson {n} of {total}: {title}',
      cardFront: 'Front', cardBack: 'Back', flipHint: 'Press Enter or Space to flip the card.',
      startCourse: 'Start course', continueCourse: 'Continue course', lessonsCount: '{n} lessons',
      nextLesson: 'Next lesson', lessonsMenu: 'Lessons', courseHome: 'Course home', closeMenu: 'Close',
      progressPct: '{n}% complete', download: 'Download', carousel: 'Image carousel',
      slideOf: 'Image {n} of {total}', prevSlide: 'Previous image', nextSlide: 'Next image', goToSlide: 'Show image {n}',
      openStep: 'Step {n}: {title}', exploredOf: 'Explored {n} of {total}', back: 'Back', startOver: 'Start over',
      baSlider: 'Compare: drag to show more of “{before}” or “{after}”',
      answerPlaceholder: 'Type your answer…', submitAnswer: 'Submit', answerSaved: 'Your answer is saved.',
      editAnswer: 'Edit answer', sampleAnswer: 'Sample answer', continueLocked: 'Complete the tasks above to continue.' },
    uk: { prev: 'Назад', next: 'Далі', progress: 'Урок {n} з {total}',
      empty: 'У цьому уроці ще немає контенту.', submit: 'Відповісти', submitAll: 'Надіслати відповіді', retry: 'Спробувати ще раз',
      correct: 'Правильно', incorrect: 'Неправильно', yourScore: 'Ваш результат: {s}%',
      passed: 'Складено', failed: 'Не складено', restart: 'Спочатку', end: 'Кінець',
      finish: 'Завершити', exitCourse: 'Вийти з курсу', courseComplete: 'Курс завершено',
      courseCompleteText: 'Ви пройшли курс до кінця. Це вікно можна закрити.',
      courseIncomplete: 'Курс ще не завершено',
      courseIncompleteText: 'Деякі завдання ще чекають на вашу відповідь. Виконайте їх, щоб завершити курс — ваш прогрес збережено.',
      unfinishedLessons: 'Незавершені уроки',
      courseFailed: 'Курс ще не складено',
      courseFailedText: 'Щоб скласти, потрібно {p}%. Перескладіть тести в цих уроках — ваш прогрес збережено.',
      retakeLessons: 'Уроки з тестами для перескладання',
      review: 'Переглянути курс', watchToContinue: 'Перегляньте відео, щоб продовжити.',
      close: 'Закрити', hotspotMarker: 'Мітка {n}: {title}', hotspotProgress: 'Переглянуто {n} з {total}',
      stepOf: 'Крок {n} з {total}', goToStep: 'Перейти до кроку {n}',
      sequenceHint: 'Перетягніть елементи або скористайтеся стрілками, щоб розставити їх у правильному порядку.',
      categoriesHint: 'Перетягніть кожен елемент у категорію або оберіть її зі списку.',
      unsorted: 'Ще не розсортовано', chooseCategory: 'Оберіть категорію', dragItem: 'Перетягніть, щоб змінити порядок',
      moveUp: 'Вище', moveDown: 'Нижче', correctPosition: 'Правильна позиція: {n}',
      correctCategory: 'Правильно: {c}', correctAnswer: 'Відповідь: {a}', blankN: 'Пропуск {n}',
      skipToContent: 'Перейти до вмісту', lessonNav: 'Навігація уроками', a11ySettings: 'Налаштування доступності',
      textSize: 'Розмір тексту', textNormal: 'Звичайний', textLarge: 'Великий', textXLarge: 'Дуже великий',
      highContrast: 'Висока контрастність', readableSpacing: 'Зручні інтервали', reduceMotion: 'Зменшити анімацію',
      captionsDefault: 'Субтитри увімкнено за замовчуванням', captions: 'Субтитри', transcript: 'Транскрипт',
      embedTitle: 'Вбудований вміст', lessonAnnounce: 'Урок {n} з {total}: {title}',
      cardFront: 'Лицьовий бік', cardBack: 'Зворотний бік', flipHint: 'Натисніть Enter або пробіл, щоб перевернути картку.',
      startCourse: 'Почати курс', continueCourse: 'Продовжити курс', lessonsCount: 'Уроків: {n}',
      nextLesson: 'Наступний урок', lessonsMenu: 'Уроки', courseHome: 'Головна курсу', closeMenu: 'Закрити',
      progressPct: 'Пройдено {n}%', download: 'Завантажити', carousel: 'Карусель зображень',
      slideOf: 'Зображення {n} з {total}', prevSlide: 'Попереднє зображення', nextSlide: 'Наступне зображення', goToSlide: 'Показати зображення {n}',
      openStep: 'Крок {n}: {title}', exploredOf: 'Переглянуто {n} з {total}', back: 'Назад', startOver: 'Спочатку',
      baSlider: 'Порівняння: тягніть, щоб показати більше «{before}» або «{after}»',
      answerPlaceholder: 'Напишіть свою відповідь…', submitAnswer: 'Надіслати', answerSaved: 'Вашу відповідь збережено.',
      editAnswer: 'Змінити відповідь', sampleAnswer: 'Приклад відповіді', continueLocked: 'Виконайте завдання вище, щоб продовжити.' },
    es: { prev: 'Anterior', next: 'Siguiente', progress: 'Lección {n} de {total}',
      empty: 'Esta lección aún no tiene contenido.', submit: 'Enviar respuesta', submitAll: 'Enviar respuestas', retry: 'Intentar de nuevo',
      correct: 'Correcto', incorrect: 'Incorrecto', yourScore: 'Tu puntuación: {s} %',
      passed: 'Aprobado', failed: 'No aprobado', restart: 'Reiniciar', end: 'Fin',
      finish: 'Finalizar', exitCourse: 'Salir del curso', courseComplete: 'Curso completado',
      courseCompleteText: 'Has llegado al final del curso. Ya puedes cerrar esta ventana.',
      courseIncomplete: 'El curso aún no está completado',
      courseIncompleteText: 'Algunas actividades todavía esperan tu respuesta. Complétalas para terminar el curso; tu progreso se ha guardado.',
      unfinishedLessons: 'Lecciones sin terminar',
      courseFailed: 'Todavía no has aprobado el curso',
      courseFailedText: 'Necesitas un {p} % para aprobar. Repite las pruebas de estas lecciones; tu progreso se ha guardado.',
      retakeLessons: 'Lecciones con pruebas por repetir',
      review: 'Repasar el curso', watchToContinue: 'Mira el video para continuar.',
      close: 'Cerrar', hotspotMarker: 'Marcador {n}: {title}', hotspotProgress: 'Explorados: {n} de {total}',
      stepOf: 'Paso {n} de {total}', goToStep: 'Ir al paso {n}',
      sequenceHint: 'Arrastra los elementos, o usa las flechas, para ponerlos en el orden correcto.',
      categoriesHint: 'Arrastra cada elemento a una categoría o elígela en su lista.',
      unsorted: 'Sin clasificar', chooseCategory: 'Elige una categoría', dragItem: 'Arrastra para cambiar el orden',
      moveUp: 'Subir', moveDown: 'Bajar', correctPosition: 'Posición correcta: {n}',
      correctCategory: 'Categoría correcta: {c}', correctAnswer: 'Respuesta: {a}', blankN: 'Espacio en blanco {n}',
      skipToContent: 'Saltar al contenido', lessonNav: 'Navegación por las lecciones', a11ySettings: 'Ajustes de accesibilidad',
      textSize: 'Tamaño del texto', textNormal: 'Normal', textLarge: 'Grande', textXLarge: 'Muy grande',
      highContrast: 'Alto contraste', readableSpacing: 'Espaciado cómodo', reduceMotion: 'Reducir el movimiento',
      captionsDefault: 'Subtítulos activados por defecto', captions: 'Subtítulos', transcript: 'Transcripción',
      embedTitle: 'Contenido insertado', lessonAnnounce: 'Lección {n} de {total}: {title}',
      cardFront: 'Anverso', cardBack: 'Reverso', flipHint: 'Pulsa Enter o la barra espaciadora para dar la vuelta a la tarjeta.',
      startCourse: 'Empezar el curso', continueCourse: 'Continuar el curso', lessonsCount: 'Lecciones: {n}',
      nextLesson: 'Siguiente lección', lessonsMenu: 'Lecciones', courseHome: 'Inicio del curso', closeMenu: 'Cerrar',
      progressPct: '{n} % completado', download: 'Descargar', carousel: 'Carrusel de imágenes',
      slideOf: 'Imagen {n} de {total}', prevSlide: 'Imagen anterior', nextSlide: 'Imagen siguiente', goToSlide: 'Mostrar la imagen {n}',
      openStep: 'Paso {n}: {title}', exploredOf: 'Explorados: {n} de {total}', back: 'Atrás', startOver: 'Empezar de nuevo',
      baSlider: 'Comparación: arrastra para ver más de «{before}» o de «{after}»',
      answerPlaceholder: 'Escribe tu respuesta…', submitAnswer: 'Enviar', answerSaved: 'Tu respuesta se ha guardado.',
      editAnswer: 'Editar la respuesta', sampleAnswer: 'Respuesta de ejemplo', continueLocked: 'Completa las tareas anteriores para continuar.' },
    fr: { prev: 'Précédent', next: 'Suivant', progress: 'Leçon {n} sur {total}',
      empty: 'Cette leçon n’a pas encore de contenu.', submit: 'Valider la réponse', submitAll: 'Valider les réponses', retry: 'Réessayer',
      correct: 'Correct', incorrect: 'Incorrect', yourScore: 'Votre score : {s} %',
      passed: 'Réussi', failed: 'Non réussi', restart: 'Recommencer', end: 'Fin',
      finish: 'Terminer', exitCourse: 'Quitter le cours', courseComplete: 'Cours terminé',
      courseCompleteText: 'Vous avez atteint la fin du cours. Vous pouvez fermer cette fenêtre.',
      courseIncomplete: 'Le cours n’est pas encore terminé',
      courseIncompleteText: 'Certaines activités attendent encore votre réponse. Terminez-les pour achever le cours — votre progression est enregistrée.',
      unfinishedLessons: 'Leçons non terminées',
      courseFailed: 'Le cours n’est pas encore validé',
      courseFailedText: 'Il faut {p} % pour valider le cours. Repassez les tests de ces leçons — votre progression est enregistrée.',
      retakeLessons: 'Leçons dont les tests sont à repasser',
      review: 'Revoir le cours', watchToContinue: 'Regardez la vidéo pour continuer.',
      close: 'Fermer', hotspotMarker: 'Repère {n} : {title}', hotspotProgress: 'Explorés : {n} sur {total}',
      stepOf: 'Étape {n} sur {total}', goToStep: 'Aller à l’étape {n}',
      sequenceHint: 'Faites glisser les éléments, ou utilisez les flèches, pour les remettre dans le bon ordre.',
      categoriesHint: 'Faites glisser chaque élément dans une catégorie, ou choisissez-la dans sa liste.',
      unsorted: 'Pas encore classés', chooseCategory: 'Choisissez une catégorie', dragItem: 'Faites glisser pour réordonner',
      moveUp: 'Monter', moveDown: 'Descendre', correctPosition: 'Bonne position : {n}',
      correctCategory: 'Bonne catégorie : {c}', correctAnswer: 'Réponse : {a}', blankN: 'Trou {n}',
      skipToContent: 'Aller au contenu', lessonNav: 'Navigation entre les leçons', a11ySettings: 'Paramètres d’accessibilité',
      textSize: 'Taille du texte', textNormal: 'Normale', textLarge: 'Grande', textXLarge: 'Très grande',
      highContrast: 'Contraste élevé', readableSpacing: 'Espacement confortable', reduceMotion: 'Réduire les animations',
      captionsDefault: 'Sous-titres activés par défaut', captions: 'Sous-titres', transcript: 'Transcription',
      embedTitle: 'Contenu intégré', lessonAnnounce: 'Leçon {n} sur {total} : {title}',
      cardFront: 'Recto', cardBack: 'Verso', flipHint: 'Appuyez sur Entrée ou Espace pour retourner la carte.',
      startCourse: 'Commencer le cours', continueCourse: 'Reprendre le cours', lessonsCount: 'Leçons : {n}',
      nextLesson: 'Leçon suivante', lessonsMenu: 'Leçons', courseHome: 'Accueil du cours', closeMenu: 'Fermer',
      progressPct: '{n} % terminé', download: 'Télécharger', carousel: 'Carrousel d’images',
      slideOf: 'Image {n} sur {total}', prevSlide: 'Image précédente', nextSlide: 'Image suivante', goToSlide: 'Afficher l’image {n}',
      openStep: 'Étape {n} : {title}', exploredOf: 'Explorés : {n} sur {total}', back: 'Retour', startOver: 'Recommencer',
      baSlider: 'Comparer : faites glisser pour voir davantage « {before} » ou « {after} »',
      answerPlaceholder: 'Saisissez votre réponse…', submitAnswer: 'Envoyer', answerSaved: 'Votre réponse est enregistrée.',
      editAnswer: 'Modifier la réponse', sampleAnswer: 'Exemple de réponse', continueLocked: 'Terminez les activités ci-dessus pour continuer.' },
    de: { prev: 'Zurück', next: 'Weiter', progress: 'Lektion {n} von {total}',
      empty: 'Diese Lektion hat noch keinen Inhalt.', submit: 'Antwort absenden', submitAll: 'Antworten absenden', retry: 'Erneut versuchen',
      correct: 'Richtig', incorrect: 'Falsch', yourScore: 'Ihr Ergebnis: {s} %',
      passed: 'Bestanden', failed: 'Nicht bestanden', restart: 'Neu starten', end: 'Ende',
      finish: 'Abschließen', exitCourse: 'Kurs verlassen', courseComplete: 'Kurs abgeschlossen',
      courseCompleteText: 'Sie haben das Ende des Kurses erreicht. Sie können dieses Fenster jetzt schließen.',
      courseIncomplete: 'Der Kurs ist noch nicht abgeschlossen',
      courseIncompleteText: 'Einige Aufgaben warten noch auf Ihre Antwort. Erledigen Sie sie, um den Kurs abzuschließen – Ihr Fortschritt ist gespeichert.',
      unfinishedLessons: 'Nicht abgeschlossene Lektionen',
      courseFailed: 'Der Kurs ist noch nicht bestanden',
      courseFailedText: 'Zum Bestehen benötigen Sie {p} %. Wiederholen Sie die Tests in diesen Lektionen – Ihr Fortschritt ist gespeichert.',
      retakeLessons: 'Lektionen mit zu wiederholenden Tests',
      review: 'Kurs noch einmal ansehen', watchToContinue: 'Sehen Sie sich das Video an, um fortzufahren.',
      close: 'Schließen', hotspotMarker: 'Markierung {n}: {title}', hotspotProgress: '{n} von {total} erkundet',
      stepOf: 'Schritt {n} von {total}', goToStep: 'Zu Schritt {n}',
      sequenceHint: 'Ziehen Sie die Elemente oder verwenden Sie die Pfeile, um sie in die richtige Reihenfolge zu bringen.',
      categoriesHint: 'Ziehen Sie jedes Element in eine Kategorie oder wählen Sie diese in seiner Liste aus.',
      unsorted: 'Noch nicht zugeordnet', chooseCategory: 'Kategorie wählen', dragItem: 'Zum Umsortieren ziehen',
      moveUp: 'Nach oben', moveDown: 'Nach unten', correctPosition: 'Richtige Position: {n}',
      correctCategory: 'Richtige Kategorie: {c}', correctAnswer: 'Antwort: {a}', blankN: 'Lücke {n}',
      skipToContent: 'Zum Inhalt springen', lessonNav: 'Lektionsnavigation', a11ySettings: 'Einstellungen zur Barrierefreiheit',
      textSize: 'Textgröße', textNormal: 'Normal', textLarge: 'Groß', textXLarge: 'Sehr groß',
      highContrast: 'Hoher Kontrast', readableSpacing: 'Lesefreundliche Abstände', reduceMotion: 'Bewegung reduzieren',
      captionsDefault: 'Untertitel standardmäßig an', captions: 'Untertitel', transcript: 'Transkript',
      embedTitle: 'Eingebetteter Inhalt', lessonAnnounce: 'Lektion {n} von {total}: {title}',
      cardFront: 'Vorderseite', cardBack: 'Rückseite', flipHint: 'Drücken Sie die Eingabe- oder Leertaste, um die Karte umzudrehen.',
      startCourse: 'Kurs starten', continueCourse: 'Kurs fortsetzen', lessonsCount: 'Lektionen: {n}',
      nextLesson: 'Nächste Lektion', lessonsMenu: 'Lektionen', courseHome: 'Kursübersicht', closeMenu: 'Schließen',
      progressPct: '{n} % abgeschlossen', download: 'Herunterladen', carousel: 'Bilderkarussell',
      slideOf: 'Bild {n} von {total}', prevSlide: 'Vorheriges Bild', nextSlide: 'Nächstes Bild', goToSlide: 'Bild {n} anzeigen',
      openStep: 'Schritt {n}: {title}', exploredOf: '{n} von {total} erkundet', back: 'Zurück', startOver: 'Von vorn beginnen',
      baSlider: 'Vergleich: Ziehen Sie, um mehr von „{before}“ oder „{after}“ zu sehen',
      answerPlaceholder: 'Ihre Antwort eingeben…', submitAnswer: 'Absenden', answerSaved: 'Ihre Antwort wurde gespeichert.',
      editAnswer: 'Antwort bearbeiten', sampleAnswer: 'Beispielantwort', continueLocked: 'Erledigen Sie die Aufgaben oben, um fortzufahren.' },
    it: { prev: 'Indietro', next: 'Avanti', progress: 'Lezione {n} di {total}',
      empty: 'Questa lezione non ha ancora contenuti.', submit: 'Invia risposta', submitAll: 'Invia risposte', retry: 'Riprova',
      correct: 'Corretto', incorrect: 'Errato', yourScore: 'Il tuo punteggio: {s}%',
      passed: 'Superato', failed: 'Non superato', restart: 'Ricomincia', end: 'Fine',
      finish: 'Termina', exitCourse: 'Esci dal corso', courseComplete: 'Corso completato',
      courseCompleteText: 'Hai raggiunto la fine del corso. Ora puoi chiudere questa finestra.',
      courseIncomplete: 'Il corso non è ancora completato',
      courseIncompleteText: 'Alcune attività attendono ancora la tua risposta. Completale per terminare il corso: i tuoi progressi sono salvati.',
      unfinishedLessons: 'Lezioni non completate',
      courseFailed: 'Il corso non è ancora superato',
      courseFailedText: 'Per superarlo serve il {p}%. Ripeti i test di queste lezioni: i tuoi progressi sono salvati.',
      retakeLessons: 'Lezioni con test da ripetere',
      review: 'Rivedi il corso', watchToContinue: 'Guarda il video per continuare.',
      close: 'Chiudi', hotspotMarker: 'Indicatore {n}: {title}', hotspotProgress: 'Esplorati: {n} su {total}',
      stepOf: 'Passaggio {n} di {total}', goToStep: 'Vai al passaggio {n}',
      sequenceHint: 'Trascina gli elementi, o usa le frecce, per metterli nell’ordine corretto.',
      categoriesHint: 'Trascina ogni elemento in una categoria o sceglila dal suo elenco.',
      unsorted: 'Non ancora classificati', chooseCategory: 'Scegli una categoria', dragItem: 'Trascina per riordinare',
      moveUp: 'Sposta su', moveDown: 'Sposta giù', correctPosition: 'Posizione corretta: {n}',
      correctCategory: 'Categoria corretta: {c}', correctAnswer: 'Risposta: {a}', blankN: 'Spazio vuoto {n}',
      skipToContent: 'Vai al contenuto', lessonNav: 'Navigazione tra le lezioni', a11ySettings: 'Impostazioni di accessibilità',
      textSize: 'Dimensione del testo', textNormal: 'Normale', textLarge: 'Grande', textXLarge: 'Molto grande',
      highContrast: 'Contrasto elevato', readableSpacing: 'Spaziatura leggibile', reduceMotion: 'Riduci le animazioni',
      captionsDefault: 'Sottotitoli attivi per impostazione predefinita', captions: 'Sottotitoli', transcript: 'Trascrizione',
      embedTitle: 'Contenuto incorporato', lessonAnnounce: 'Lezione {n} di {total}: {title}',
      cardFront: 'Fronte', cardBack: 'Retro', flipHint: 'Premi Invio o la barra spaziatrice per girare la scheda.',
      startCourse: 'Inizia il corso', continueCourse: 'Continua il corso', lessonsCount: 'Lezioni: {n}',
      nextLesson: 'Lezione successiva', lessonsMenu: 'Lezioni', courseHome: 'Pagina iniziale del corso', closeMenu: 'Chiudi',
      progressPct: 'Completato al {n}%', download: 'Scarica', carousel: 'Carosello di immagini',
      slideOf: 'Immagine {n} di {total}', prevSlide: 'Immagine precedente', nextSlide: 'Immagine successiva', goToSlide: 'Mostra l’immagine {n}',
      openStep: 'Passaggio {n}: {title}', exploredOf: 'Esplorati: {n} su {total}', back: 'Indietro', startOver: 'Ricomincia da capo',
      baSlider: 'Confronto: trascina per vedere di più «{before}» o «{after}»',
      answerPlaceholder: 'Scrivi la tua risposta…', submitAnswer: 'Invia', answerSaved: 'La tua risposta è stata salvata.',
      editAnswer: 'Modifica la risposta', sampleAnswer: 'Risposta di esempio', continueLocked: 'Completa le attività qui sopra per continuare.' },
    nl: { prev: 'Vorige', next: 'Volgende', progress: 'Les {n} van {total}',
      empty: 'Deze les heeft nog geen inhoud.', submit: 'Antwoord versturen', submitAll: 'Antwoorden versturen', retry: 'Opnieuw proberen',
      correct: 'Goed', incorrect: 'Fout', yourScore: 'Je score: {s}%',
      passed: 'Geslaagd', failed: 'Niet geslaagd', restart: 'Opnieuw beginnen', end: 'Einde',
      finish: 'Afronden', exitCourse: 'Cursus verlaten', courseComplete: 'Cursus afgerond',
      courseCompleteText: 'Je hebt het einde van de cursus bereikt. Je kunt dit venster nu sluiten.',
      courseIncomplete: 'De cursus is nog niet afgerond',
      courseIncompleteText: 'Sommige opdrachten wachten nog op je antwoord. Rond ze af om de cursus te voltooien; je voortgang is opgeslagen.',
      unfinishedLessons: 'Niet-afgeronde lessen',
      courseFailed: 'Je bent nog niet geslaagd voor de cursus',
      courseFailedText: 'Je hebt {p}% nodig om te slagen. Maak de toetsen in deze lessen opnieuw; je voortgang is opgeslagen.',
      retakeLessons: 'Lessen met toetsen om opnieuw te maken',
      review: 'Cursus nog eens bekijken', watchToContinue: 'Bekijk de video om verder te gaan.',
      close: 'Sluiten', hotspotMarker: 'Markering {n}: {title}', hotspotProgress: '{n} van {total} bekeken',
      stepOf: 'Stap {n} van {total}', goToStep: 'Ga naar stap {n}',
      sequenceHint: 'Sleep de items, of gebruik de pijlen, om ze in de juiste volgorde te zetten.',
      categoriesHint: 'Sleep elk item naar een categorie of kies die in de bijbehorende lijst.',
      unsorted: 'Nog niet ingedeeld', chooseCategory: 'Kies een categorie', dragItem: 'Sleep om de volgorde te wijzigen',
      moveUp: 'Omhoog', moveDown: 'Omlaag', correctPosition: 'Juiste positie: {n}',
      correctCategory: 'Juiste categorie: {c}', correctAnswer: 'Antwoord: {a}', blankN: 'Invulveld {n}',
      skipToContent: 'Naar de inhoud', lessonNav: 'Lesnavigatie', a11ySettings: 'Toegankelijkheidsinstellingen',
      textSize: 'Tekstgrootte', textNormal: 'Normaal', textLarge: 'Groot', textXLarge: 'Extra groot',
      highContrast: 'Hoog contrast', readableSpacing: 'Ruimere tekstafstand', reduceMotion: 'Minder beweging',
      captionsDefault: 'Ondertiteling standaard aan', captions: 'Ondertiteling', transcript: 'Transcript',
      embedTitle: 'Ingesloten inhoud', lessonAnnounce: 'Les {n} van {total}: {title}',
      cardFront: 'Voorkant', cardBack: 'Achterkant', flipHint: 'Druk op Enter of de spatiebalk om de kaart om te draaien.',
      startCourse: 'Cursus starten', continueCourse: 'Cursus hervatten', lessonsCount: 'Lessen: {n}',
      nextLesson: 'Volgende les', lessonsMenu: 'Lessen', courseHome: 'Startpagina van de cursus', closeMenu: 'Sluiten',
      progressPct: '{n}% voltooid', download: 'Downloaden', carousel: 'Afbeeldingencarrousel',
      slideOf: 'Afbeelding {n} van {total}', prevSlide: 'Vorige afbeelding', nextSlide: 'Volgende afbeelding', goToSlide: 'Afbeelding {n} tonen',
      openStep: 'Stap {n}: {title}', exploredOf: '{n} van {total} bekeken', back: 'Terug', startOver: 'Opnieuw beginnen',
      baSlider: 'Vergelijken: sleep om meer van ‘{before}’ of ‘{after}’ te zien',
      answerPlaceholder: 'Typ je antwoord…', submitAnswer: 'Versturen', answerSaved: 'Je antwoord is opgeslagen.',
      editAnswer: 'Antwoord bewerken', sampleAnswer: 'Voorbeeldantwoord', continueLocked: 'Rond de opdrachten hierboven af om verder te gaan.' },
    pt: { prev: 'Anterior', next: 'Próximo', progress: 'Lição {n} de {total}',
      empty: 'Esta lição ainda não tem conteúdo.', submit: 'Enviar resposta', submitAll: 'Enviar respostas', retry: 'Tentar novamente',
      correct: 'Correto', incorrect: 'Incorreto', yourScore: 'Sua pontuação: {s}%',
      passed: 'Aprovado', failed: 'Não aprovado', restart: 'Reiniciar', end: 'Fim',
      finish: 'Concluir', exitCourse: 'Sair do curso', courseComplete: 'Curso concluído',
      courseCompleteText: 'Você chegou ao fim do curso. Já pode fechar esta janela.',
      courseIncomplete: 'O curso ainda não foi concluído',
      courseIncompleteText: 'Algumas atividades ainda aguardam sua resposta. Conclua-as para terminar o curso — seu progresso está salvo.',
      unfinishedLessons: 'Lições não concluídas',
      courseFailed: 'A nota de aprovação ainda não foi atingida',
      courseFailedText: 'São necessários {p}% para a aprovação. Refaça os testes destas lições — seu progresso está salvo.',
      retakeLessons: 'Lições com testes para refazer',
      review: 'Revisar o curso', watchToContinue: 'Assista ao vídeo para continuar.',
      close: 'Fechar', hotspotMarker: 'Marcador {n}: {title}', hotspotProgress: 'Explorados: {n} de {total}',
      stepOf: 'Etapa {n} de {total}', goToStep: 'Ir para a etapa {n}',
      sequenceHint: 'Arraste os itens, ou use as setas, para colocá-los na ordem correta.',
      categoriesHint: 'Arraste cada item para uma categoria ou escolha-a na lista do item.',
      unsorted: 'Ainda não classificados', chooseCategory: 'Escolha uma categoria', dragItem: 'Arraste para reordenar',
      moveUp: 'Mover para cima', moveDown: 'Mover para baixo', correctPosition: 'Posição correta: {n}',
      correctCategory: 'Categoria correta: {c}', correctAnswer: 'Resposta: {a}', blankN: 'Lacuna {n}',
      skipToContent: 'Pular para o conteúdo', lessonNav: 'Navegação entre as lições', a11ySettings: 'Configurações de acessibilidade',
      textSize: 'Tamanho do texto', textNormal: 'Normal', textLarge: 'Grande', textXLarge: 'Muito grande',
      highContrast: 'Alto contraste', readableSpacing: 'Espaçamento confortável', reduceMotion: 'Reduzir animações',
      captionsDefault: 'Legendas ativadas por padrão', captions: 'Legendas', transcript: 'Transcrição',
      embedTitle: 'Conteúdo incorporado', lessonAnnounce: 'Lição {n} de {total}: {title}',
      cardFront: 'Frente', cardBack: 'Verso', flipHint: 'Pressione Enter ou Espaço para virar o cartão.',
      startCourse: 'Iniciar o curso', continueCourse: 'Continuar o curso', lessonsCount: 'Lições: {n}',
      nextLesson: 'Próxima lição', lessonsMenu: 'Lições', courseHome: 'Início do curso', closeMenu: 'Fechar',
      progressPct: '{n}% concluído', download: 'Baixar', carousel: 'Carrossel de imagens',
      slideOf: 'Imagem {n} de {total}', prevSlide: 'Imagem anterior', nextSlide: 'Próxima imagem', goToSlide: 'Mostrar a imagem {n}',
      openStep: 'Etapa {n}: {title}', exploredOf: 'Explorados: {n} de {total}', back: 'Voltar', startOver: 'Começar de novo',
      baSlider: 'Comparar: arraste para ver mais de “{before}” ou de “{after}”',
      answerPlaceholder: 'Digite sua resposta…', submitAnswer: 'Enviar', answerSaved: 'Sua resposta foi salva.',
      editAnswer: 'Editar resposta', sampleAnswer: 'Exemplo de resposta', continueLocked: 'Conclua as tarefas acima para continuar.' },
  };
  // Browser-based default; resume() refines it from the course settings / LMS.
  var lang = (function () {
    var l = (navigator.language || 'en').toLowerCase().slice(0, 2);
    return Object.prototype.hasOwnProperty.call(T, l) ? l : 'en';
  })();
  function t(key, vars) {
    var s = (T[lang] && T[lang][key]) || T.en[key] || key;
    if (vars) for (var k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  // ── Learner accessibility preferences ────────────────────────────────────
  // Stored per learner in localStorage ('scormly-a11y'). `motion` and
  // `captions` are tri-state: undefined = follow the OS / LMS default.
  var A11Y_KEY = 'scormly-a11y';
  var a11y = { text: 'normal', contrast: false, spacing: false, motion: undefined, captions: undefined };
  var lmsCaptions = false; // LMS learner preference said "captions on"
  var lmsAudioOff = false; // LMS learner preference said "sound off"
  try {
    var storedA11y = JSON.parse(window.localStorage.getItem(A11Y_KEY) || 'null');
    if (storedA11y && typeof storedA11y === 'object') {
      if (storedA11y.text === 'large' || storedA11y.text === 'xlarge') a11y.text = storedA11y.text;
      a11y.contrast = storedA11y.contrast === true;
      a11y.spacing = storedA11y.spacing === true;
      if (typeof storedA11y.motion === 'boolean') a11y.motion = storedA11y.motion;
      if (typeof storedA11y.captions === 'boolean') a11y.captions = storedA11y.captions;
    }
  } catch (e) { /* storage unavailable or corrupt: defaults */ }

  function saveA11y() {
    try { window.localStorage.setItem(A11Y_KEY, JSON.stringify(a11y)); } catch (e) { /* storage unavailable */ }
  }
  function osReducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function motionReduced() { return typeof a11y.motion === 'boolean' ? a11y.motion : osReducedMotion(); }
  // Local override > LMS preference > off.
  function captionsOn() { return typeof a11y.captions === 'boolean' ? a11y.captions : lmsCaptions; }

  // Reflect the preferences as attributes on <html>; player.css does the rest.
  function applyA11y() {
    var root = document.documentElement;
    if (a11y.text !== 'normal') root.setAttribute('data-a11y-text', a11y.text); else root.removeAttribute('data-a11y-text');
    if (a11y.contrast) root.setAttribute('data-a11y-contrast', 'on'); else root.removeAttribute('data-a11y-contrast');
    if (a11y.spacing) root.setAttribute('data-a11y-spacing', 'on'); else root.removeAttribute('data-a11y-spacing');
    // 'full' = explicit opt-out, which also overrides the OS media query in CSS.
    if (typeof a11y.motion === 'boolean') root.setAttribute('data-a11y-motion', a11y.motion ? 'reduce' : 'full');
    else root.removeAttribute('data-a11y-motion');
  }
  function applyCaptions(video) {
    var on = captionsOn();
    var tracks = video.textTracks || [];
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].kind === 'captions') tracks[i].mode = on ? 'showing' : 'disabled';
    }
  }

  // Darken a #rrggbb color toward black (used for the high-contrast accent).
  function darken(hex, factor) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      var d = Math.round(v * factor).toString(16);
      return d.length < 2 ? '0' + d : d;
    });
    return '#' + c.join('');
  }

  // Polite live region, kept outside #app so re-renders don't recreate it
  // (screen readers only announce changes to regions that already exist).
  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = msg; }, 60);
  }

  // Header button + non-modal settings panel (disclosure pattern).
  var a11yPanelSeq = 0;
  var a11yMenu = null; // the menu in the current header (re-created on render)
  document.addEventListener('mousedown', function (e) {
    if (a11yMenu && a11yMenu.isOpen() && !a11yMenu.wrap.contains(e.target)) a11yMenu.close();
  });
  function renderA11yMenu() {
    var panelId = 'a11y-panel-' + (++a11yPanelSeq);
    var titleId = panelId + '-title';
    var btn = h('button', { class: 'a11y-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId,
      'aria-label': t('a11ySettings'), title: t('a11ySettings') }, h('span', { 'aria-hidden': 'true', text: 'Aa' }));
    var panel = h('div', { class: 'a11y-panel', id: panelId, role: 'dialog', 'aria-labelledby': titleId });
    panel.hidden = true;
    var wrap = h('div', { class: 'a11y-menu' }, [btn, panel]);

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var first = panel.querySelector('input:checked') || panel.querySelector('input');
        if (first) first.focus();
      } else if (returnFocus) btn.focus();
    }
    btn.addEventListener('click', function () { setOpen(panel.hidden, true); });
    wrap.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !panel.hidden) { e.stopPropagation(); setOpen(false, true); }
    });
    // Close when focus or a click moves outside the menu.
    wrap.addEventListener('focusout', function (e) {
      if (!panel.hidden && e.relatedTarget && !wrap.contains(e.relatedTarget)) setOpen(false, false);
    });
    a11yMenu = { wrap: wrap, isOpen: function () { return !panel.hidden; }, close: function () { setOpen(false, false); } };

    panel.appendChild(h('p', { class: 'a11y-panel-title', id: titleId, text: t('a11ySettings') }));
    var sizes = h('fieldset', { class: 'a11y-sizes' }, h('legend', { text: t('textSize') }));
    [['normal', 'textNormal'], ['large', 'textLarge'], ['xlarge', 'textXLarge']].forEach(function (opt) {
      var input = h('input', { type: 'radio', name: panelId + '-size', value: opt[0] });
      input.checked = a11y.text === opt[0];
      input.addEventListener('change', function () { if (input.checked) { a11y.text = opt[0]; saveA11y(); applyA11y(); } });
      sizes.appendChild(h('label', { class: 'a11y-opt' }, [input, h('span', { text: t(opt[1]) })]));
    });
    panel.appendChild(sizes);

    function toggle(labelKey, checked, onChange) {
      var input = h('input', { type: 'checkbox' });
      input.checked = checked;
      input.addEventListener('change', function () { onChange(input.checked); saveA11y(); applyA11y(); });
      panel.appendChild(h('label', { class: 'a11y-opt a11y-toggle' }, [input, h('span', { text: t(labelKey) })]));
    }
    toggle('highContrast', a11y.contrast, function (v) { a11y.contrast = v; });
    toggle('readableSpacing', a11y.spacing, function (v) { a11y.spacing = v; });
    toggle('reduceMotion', motionReduced(), function (v) { a11y.motion = v; });
    toggle('captionsDefault', captionsOn(), function (v) {
      a11y.captions = v;
      Array.prototype.forEach.call(document.querySelectorAll('video'), applyCaptions);
    });
    return wrap;
  }

  // New screens start at the top. The page itself scrolls (not .player-body),
  // so full-width bands can span the viewport.
  function scrollToTop() { window.scrollTo(0, 0); }

  // After a lesson change: focus the lesson heading and announce it.
  function focusLessonHeading(announceIt) {
    var h1 = document.querySelector('.lesson-title, .finish-title, .sc-intro-title');
    if (h1) { try { h1.focus({ preventScroll: true }); } catch (e) { h1.focus(); } }
    scrollToTop();
    if (!announceIt) return;
    if (state.finished) { announce(t('courseComplete')); return; }
    if (state.onIntro) { announce(state.course.title || ''); return; }
    var lessons = state.course.lessons || [];
    var lesson = lessons[state.lessonIndex];
    announce(t('lessonAnnounce', { n: state.lessonIndex + 1, total: lessons.length, title: lesson ? lesson.title || '' : '' }));
  }

  function skipLink() {
    return h('a', { class: 'skip-link', href: '#main-content', text: t('skipToContent'),
      onclick: function (e) { e.preventDefault(); focusLessonHeading(false); } });
  }

  // Author-set language of the course content (BCP 47), or null.
  function contentLang() {
    var l = state.course && state.course.settings && state.course.settings.contentLanguage;
    return typeof l === 'string' && l.trim() ? l.trim() : null;
  }

  // Block types that produce a 0–100 score and count like quizzes (course
  // score, per-block objectives, the 'quiz' completion rule, linear gating).
  var SCORED = { quiz: true, ordering: true, fillBlanks: true };

  var state = { course: null, lessonIndex: 0, visited: {}, continued: {}, watched: {}, reflections: {}, quizResults: {}, quizzes: [], quizIndexById: {}, interactionIndex: 0, sessionStart: 0, complete: false, finished: false, summary: null, learner: null, lmsMode: 'normal',
    onIntro: false, navDirection: null, revealed: {}, menuOpen: false };
  // Set at boot to the unload handler, so the completion screen's "Exit course"
  // button can end the LMS session the same way closing the window does.
  var endSession = null;

  function start(course) {
    state.course = course;
    // A custom theme arrives as a resolved palette (see withThemeTokens).
    var tk = course.theme === 'custom' && course.themeTokens;
    var accent = tk ? [tk.brand, tk.brandDark, tk.radiusBtn, tk.radiusInteractive]
      : THEME_ACCENT[course.theme] || THEME_ACCENT.rose;
    document.documentElement.style.setProperty('--brand', accent[0]);
    document.documentElement.style.setProperty('--brand-dark', accent[1]);
    document.documentElement.style.setProperty('--radius-btn', accent[2]);
    document.documentElement.style.setProperty('--radius-surface', accent[3]);
    // Theme-specific extras beyond color/radius (e.g. terminal font) live in player.css.
    document.documentElement.setAttribute('data-theme', tk ? 'custom' : THEME_ACCENT[course.theme] ? course.theme : 'rose');
    // High-contrast accent: the theme's dark shade pushed toward black so
    // white-on-brand buttons and brand-colored text reach ~7:1.
    document.documentElement.style.setProperty('--brand-hc', darken(accent[1], 0.6));
    document.documentElement.style.setProperty('--brand-hc-dark', darken(accent[1], 0.45));
    applyA11y();
    applyLayout();
    document.title = course.title || 'Course';

    // Index all scored blocks for scoring and per-block objectives.
    (course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) {
        if (SCORED[b.type]) {
          state.quizIndexById[b.id] = state.quizzes.length;
          state.quizzes.push({ id: b.id, data: b.data });
        }
      });
    });

    SCORM.init();
    state.sessionStart = Date.now();
    // Always 'suspend', even when complete: exit='' lets the LMS end the
    // attempt, and on the next launch the course restarts from scratch (some
    // LMS even show the fresh attempt as incomplete). Suspending keeps the
    // finished state resumable; completion/success are already reported.
    // Set now, not only on unload: browsers block the synchronous XHR many
    // LMS APIs use to commit during page dismissal, and an exit that never
    // reaches the LMS counts as a normal exit — the resume data is dropped.
    SCORM.setExit('suspend');
    // Registered right after init (not after the async cmi5 handshake) so a
    // learner who closes the window early still gets a proper terminate.
    // pagehide covers browsers/iframes where beforeunload doesn't fire
    // (mobile Safari, some LMS frame teardowns); the flag stops a double exit.
    var exited = false;
    // unloading: see SCORM.finish. Returns its result (a promise for cmi5).
    endSession = function (unloading) {
      // After "Exit course", the unload still flushes what the exit left
      // waiting (cmi5 batches it with terminated; SCORM finish is a no-op).
      if (exited) return unloading ? SCORM.finish(true) : null;
      exited = true;
      SCORM.setSessionTime(sessionSeconds());
      SCORM.setExit('suspend');
      // Only ever terminate from the AU; cmi5 `abandoned` is LMS-issued.
      return SCORM.finish(unloading);
    };
    // beforeunload can still be cancelled (a "leave this page?" prompt), so it
    // only commits; the session ends on pagehide. A page restored from the
    // back/forward cache has a finished session, so it reloads for a new one.
    window.addEventListener('beforeunload', function () {
      if (exited) return;
      SCORM.setSessionTime(sessionSeconds());
      SCORM.commit();
    });
    window.addEventListener('pagehide', function () { endSession(true); });
    window.addEventListener('pageshow', function (e) { if (e.persisted && exited) location.reload(); });
    // cmi5 loads its launch context and resume data over the network; SCORM
    // calls back immediately.
    SCORM.whenReady(resume, lateResume);
  }

  // cmi5 on a slow LMS: the player stopped waiting and started fresh, then the
  // saved state arrived. Merge the two so nothing from either session is lost
  // (answers given meanwhile are the newer ones), and write the result. A
  // learner still on the cover page or the untouched first lesson goes on to
  // the saved place; one already working stays put (no re-render under them).
  function lateResume() {
    state.learner = SCORM.getLearner && SCORM.getLearner();
    state.lmsMode = (SCORM.getMode && SCORM.getMode()) || 'normal';
    var saved = null;
    try { saved = JSON.parse(SCORM.getSuspend() || 'null'); } catch (e) { saved = null; }
    var fresh = state.quizResults;
    var atStart = state.onIntro || (state.lessonIndex === 0 && Object.keys(state.visited).length <= 1
      && !Object.keys(fresh).length);
    applySuspend(saved);
    Object.keys(fresh).forEach(function (id) { state.quizResults[id] = fresh[id]; });
    if (atStart && state.onIntro) render(); // the cover's button now reads "Continue course"
    else if (atStart && saved && typeof saved.l === 'number') { visit(saved.l); return; }
    else refreshGating();
    reportProgress();
  }

  function resume() {
    // Player UI language. An explicit course setting wins. In 'auto': the
    // course content language when the player speaks it (an English course
    // with Ukrainian buttons, from a Ukrainian browser or LMS profile, reads
    // as broken and mixes languages for screen readers), then the LMS
    // preference (SCORM learner_preference.language / cmi5
    // languagePreference), then the browser-based default.
    var fixedLang = settings().playerLanguage;
    var courseLang = (contentLang() || '').toLowerCase().slice(0, 2);
    var lmsLang = (SCORM.getPreferredLanguage && SCORM.getPreferredLanguage()) || '';
    var twoLetter = lmsLang.toLowerCase().slice(0, 2);
    if (fixedLang !== 'auto') lang = fixedLang;
    else if (Object.prototype.hasOwnProperty.call(T, courseLang)) lang = courseLang;
    else if (Object.prototype.hasOwnProperty.call(T, twoLetter)) lang = twoLetter;
    document.documentElement.lang = lang;

    // LMS learner preference "captions on" (SCORM audio_captioning / 1.2
    // student_preference.text). A local override in the a11y menu still wins.
    // Sound muted in the LMS (cmi5 audioPreference 'off' must be applied at
    // startup; SCORM audio level 0 / -1): media starts muted.
    try {
      var prefs = SCORM.getLearnerPreferences && SCORM.getLearnerPreferences();
      lmsCaptions = !!prefs && Number(prefs.captions) === 1;
      lmsAudioOff = !!prefs && prefs.audio === 'off';
    } catch (e) { lmsCaptions = false; lmsAudioOff = false; }

    state.learner = SCORM.getLearner && SCORM.getLearner();
    state.lmsMode = (SCORM.getMode && SCORM.getMode()) || 'normal';

    // Resume from saved progress, if any (format: see buildSuspend).
    var saved = null;
    try { saved = JSON.parse(SCORM.getSuspend() || 'null'); } catch (e) { saved = null; }
    applySuspend(saved);

    // A fresh attempt opens on the cover page (when the course has one); a
    // resumed one goes straight back to the saved lesson.
    if (introOn() && !(saved && typeof saved.l === 'number')) { showIntro(false); return; }
    visit(saved && typeof saved.l === 'number' ? saved.l : 0);
  }

  // ── Layout: content width, typography, full-bleed width ──────────────────
  var CONTENT_WIDTH = { narrow: 680, normal: 768, wide: 1024, full: 1400 };
  function applyLayout() {
    var cfg = settings();
    var root = document.documentElement;
    root.style.setProperty('--content-w', CONTENT_WIDTH[cfg.contentWidth] + 'px');
    root.style.setProperty('--col-w', CONTENT_WIDTH[cfg.contentWidth] + 'px');
    root.classList.add('typo-' + cfg.typography);
    // Full-bleed images/cover pages span the viewport (minus the scrollbar).
    function pageWidth() { root.style.setProperty('--page-w', root.clientWidth + 'px'); }
    pageWidth();
    window.addEventListener('resize', pageWidth);
  }

  function introOn() { return !!(state.course.intro && state.course.intro.enabled); }

  function showIntro(moveFocus) {
    state.onIntro = true;
    state.finished = false;
    state.navDirection = 'prev';
    state.menuOpen = false;
    render();
    if (moveFocus) focusLessonHeading(true);
    else scrollToTop();
  }

  // First lesson not yet complete (where "Start/Continue course" leads).
  function firstOpenLesson() {
    var lessons = state.course.lessons || [];
    for (var i = 0; i < lessons.length; i++) if (!lessonComplete(i)) return canReachLesson(i) ? i : 0;
    return 0;
  }

  // Restricted "Continue" gates in a lesson (block subsequent content + advance).
  function lessonGates(lesson) {
    return (lesson.blocks || []).filter(function (b) {
      return b.type === 'continue' && b.data.mode === 'restricted';
    });
  }
  // Videos in a lesson that must be watched before advancing.
  function requiredVideos(lesson) {
    return (lesson.blocks || []).filter(function (b) {
      return b.type === 'video' && b.data.requireWatch;
    });
  }
  // Scored blocks (quizzes & exercises) in a lesson, and whether they've all
  // been answered.
  function lessonQuizzesAnswered(lesson) {
    return (lesson.blocks || []).every(function (b) {
      return !SCORED[b.type] || state.quizResults[b.id] != null;
    });
  }
  // Per-block gates that block advancing in any navigation mode: restricted
  // Continue gates passed AND every required video watched.
  function gatesSatisfied(lesson) {
    if (!lesson) return true;
    return lessonGates(lesson).every(function (b) { return state.continued[b.id]; })
      && requiredVideos(lesson).every(function (b) { return state.watched[b.id]; });
  }
  // Lessons still blocking course completion: not visited, gates or required
  // videos open, or (under the 'quiz' rule) scored blocks unanswered.
  function unfinishedLessons() {
    var quizRule = settings().completion === 'quiz';
    var out = [];
    (state.course.lessons || []).forEach(function (lesson, i) {
      if (!lessonComplete(i) || (quizRule && !lessonQuizzesAnswered(lesson))) out.push(i);
    });
    return out;
  }
  function lessonComplete(index) {
    var lesson = (state.course.lessons || [])[index];
    if (!lesson || !state.visited[index]) return false;
    return gatesSatisfied(lesson);
  }
  // Whether the learner may leave the current lesson via Next/Finish. Always
  // requires the per-block gates; linear navigation also requires the lesson's
  // quizzes to be answered (when the completion rule involves quizzes).
  function canLeaveLesson(index) {
    var lesson = (state.course.lessons || [])[index];
    if (!gatesSatisfied(lesson)) return false;
    if (settings().navigation === 'linear' && settings().completion === 'quiz') {
      return lessonQuizzesAnswered(lesson);
    }
    return true;
  }
  // Finished tasks for restricted Continue gates: scored blocks answered,
  // reflections submitted, required videos watched.
  function taskDone(b) {
    if (SCORED[b.type]) return state.quizResults[b.id] != null;
    if (b.type === 'reflection') return state.reflections[b.id] != null;
    if (b.type === 'video' && b.data.requireWatch) return !!state.watched[b.id];
    return true;
  }
  // A restricted Continue stays locked until every task above it is done.
  function continueLocked(b) {
    if (b.data.mode !== 'restricted' || state.continued[b.id]) return false;
    var lesson = (state.course.lessons || [])[state.lessonIndex];
    var blocks = (lesson && lesson.blocks) || [];
    for (var k = 0, at = blocks.indexOf(b); k < at; k++) if (!taskDone(blocks[k])) return true;
    return false;
  }
  // Whether a Continue block hides the blocks after it (any mode). One at the
  // very end of the lesson leads on instead, like the "Next lesson" card.
  function isGate(b) {
    var lesson = (state.course.lessons || [])[state.lessonIndex];
    var blocks = (lesson && lesson.blocks) || [];
    var at = blocks.indexOf(b);
    return at >= 0 && at < blocks.length - 1;
  }
  // Continue button. Mid-lesson it reveals the blocks after it in place and
  // steps aside; the click is remembered, so that content stays open when the
  // learner comes back (and restricted gates count toward completion). At the
  // end it advances to the next lesson (or finishes on the last one) when the
  // lesson's rules allow leaving it (required videos, linear quiz rule, gates).
  function onContinue(b) {
    var lessons = state.course.lessons || [];
    state.continued[b.id] = true;
    reportProgress();
    if (isGate(b)) { revealAfter(b); return; }
    if (canLeaveLesson(state.lessonIndex)) {
      if (state.lessonIndex >= lessons.length - 1) finishCourse(); else visit(state.lessonIndex + 1);
      return;
    }
    refreshGating();
  }
  // Re-render in place, then bring the newly shown content into view and move
  // focus to it (the clicked button is gone).
  function revealAfter(b) {
    var blocks = state.course.lessons[state.lessonIndex].blocks;
    var top = window.pageYOffset;
    render();
    window.scrollTo(0, top);
    var el = null;
    for (var k = blocks.indexOf(b) + 1; k < blocks.length && !el; k++) {
      el = document.querySelector('.blk[data-block="' + blocks[k].id + '"]');
    }
    if (!el) return;
    el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    var header = document.querySelector('.player-header');
    var y = el.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) - 16;
    try { window.scrollTo({ top: y, behavior: motionReduced() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
  }

  // Linear navigation: a lesson can be jumped to only when every lesson
  // before it has been visited and may be left (gates, required videos, quiz
  // rule) — i.e. it is reachable by Next alone.
  function canReachLesson(index) {
    if (settings().navigation !== 'linear') return true;
    for (var k = 0; k < index; k++) {
      if (!state.visited[k] || !canLeaveLesson(k)) return false;
    }
    return true;
  }

  // Learner explicitly ends the course: report + commit the final state and
  // show the completion screen. The session is NOT terminated here — "Review
  // the course" (and a quiz retake during review) must stay tracked;
  // Terminate happens on unload (onExit) or via the "Exit course" button.
  function finishCourse() {
    state.visited[state.lessonIndex] = true;
    state.finished = true;
    reportProgress();
    render();
    focusLessonHeading(true);
  }

  function sessionSeconds() { return (Date.now() - state.sessionStart) / 1000; }

  // "Exit course" on the completion screen: terminate the LMS session, then
  // leave — a SCORM 2004 LMS closes the course itself on the suspendAll
  // navigation request; cmi5 returns to the LaunchData returnURL once
  // `terminated` is sent; otherwise try closing the window (SCORM popups).
  // When nothing works (1.2 SCO in an iframe) the completion screen stays,
  // which already tells the learner the window can be closed.
  function exitCourse() {
    if (SCORM.requestExit) SCORM.requestExit();
    var pending = endSession ? endSession(false) : null;
    var url = SCORM.getReturnUrl && SCORM.getReturnUrl();
    var left = false;
    function leave() {
      if (left) return;
      left = true;
      if (url) { location.assign(url); return; }
      try { window.close(); } catch (e) { /* not a script-opened window */ }
    }
    if (pending && typeof pending.then === 'function') {
      // Don't strand the learner if the LRS never answers.
      setTimeout(leave, 3000);
      pending.then(leave, leave);
    } else {
      leave();
    }
  }

  // Mark a required video as watched and update gating without re-rendering
  // (which would reset the video element).
  function markWatched(id) {
    if (state.watched[id]) return;
    state.watched[id] = true;
    reportProgress();
    refreshGating();
  }
  // Re-evaluate the advance button and hide any now-satisfied video hints,
  // in place (no full render).
  function refreshGating() {
    var btn = document.getElementById('advance-btn');
    if (btn) btn.disabled = !canLeaveLesson(state.lessonIndex);
    var card = document.getElementById('next-card');
    if (card) card.disabled = !canLeaveLesson(state.lessonIndex);
    var bar = document.querySelector('.progress-fill');
    if (bar) bar.style.width = progressPct() + '%';
    document.querySelectorAll('.outline-item[data-lesson]').forEach(function (el) {
      el.disabled = !canReachLesson(Number(el.getAttribute('data-lesson')));
    });
    Object.keys(state.watched).forEach(function (id) {
      var hint = document.getElementById('vgate-' + id);
      if (hint) hint.style.display = 'none';
    });
    // Unlock restricted Continue buttons whose tasks are now done.
    var lesson = (state.course.lessons || [])[state.lessonIndex];
    ((lesson && lesson.blocks) || []).forEach(function (b) {
      if (b.type !== 'continue') return;
      var el = document.querySelector('.continue[data-continue="' + b.id + '"]');
      if (!el || (el.getAttribute('data-locked') === '1') === continueLocked(b)) return;
      var fresh = renderBlock(b);
      if (fresh) el.parentNode.replaceChild(fresh, el);
    });
  }

  function visit(index) {
    var prevIndex = state.onIntro ? -1 : state.lessonIndex;
    state.navDirection = !lessonShown ? null : index < prevIndex ? 'prev' : 'next';
    if (index !== state.lessonIndex || state.onIntro) state.revealed = {};
    state.onIntro = false;
    state.menuOpen = false;
    state.lessonIndex = index;
    state.visited[index] = true;
    render();
    reportProgress();
    // The initial (resume) render keeps the natural focus order; later lesson
    // changes move focus to the heading and announce the lesson.
    if (lessonShown) focusLessonHeading(true);
    else scrollToTop();
    lessonShown = true;
  }
  var lessonShown = false;

  var DEFAULT_SETTINGS = { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' };
  function settings() {
    var s = state.course.settings || {};
    // The LMS's mastery score (1.2 mastery_score, 2004 scaled_passing_score,
    // cmi5 masteryScore) wins over the course's own: the LMS judges pass/fail
    // by it, so the completion screen must agree with what the LMS records.
    var lmsPass = SCORM.getLmsMastery ? SCORM.getLmsMastery() : null;
    return {
      completion: s.completion || DEFAULT_SETTINGS.completion,
      scored: s.scored !== false,
      passingScore: typeof lmsPass === 'number' && isFinite(lmsPass) && lmsPass > 0 ? lmsPass
        : typeof s.passingScore === 'number' ? s.passingScore : DEFAULT_SETTINGS.passingScore,
      navigation: s.navigation === 'linear' ? 'linear' : 'free',
      playerLanguage: typeof s.playerLanguage === 'string' && Object.prototype.hasOwnProperty.call(T, s.playerLanguage) ? s.playerLanguage : 'auto',
      showProgress: s.showProgress !== false,
      finishMessage: typeof s.finishMessage === 'string' ? s.finishMessage.trim() : '',
      contentWidth: CONTENT_WIDTH[s.contentWidth] ? s.contentWidth : 'wide',
      typography: s.typography === 'editorial' || s.typography === 'rounded' ? s.typography : 'modern',
      blockAnimation: s.blockAnimation === 'none' || s.blockAnimation === 'slide' || s.blockAnimation === 'zoom' ? s.blockAnimation : 'fade',
      lessonTransition: s.lessonTransition === 'none' || s.lessonTransition === 'slide' ? s.lessonTransition : 'fade',
    };
  }

  function reportProgress() {
    var lessons = state.course.lessons || [];
    var cfg = settings();
    var completedCount = 0;
    lessons.forEach(function (_, i) { if (lessonComplete(i)) completedCount++; });
    var contentDone = lessons.length > 0 && completedCount === lessons.length;
    var progressFraction = lessons.length ? completedCount / lessons.length : 0;

    var hasQuiz = state.quizzes.length > 0;
    var quizzesDone = hasQuiz && state.quizzes.every(function (q) {
      return state.quizResults[q.id] != null;
    });

    // Completion criterion (project setting). 'quiz' also requires every quiz
    // answered; falls back to content-only when the course has no quizzes.
    var completed = (cfg.completion === 'quiz' && hasQuiz)
      ? (contentDone && quizzesDone)
      : contentDone;

    // A 2004 progress_measure of 1 means complete, so it stays below 1 while
    // quizzes are still open.
    if (!completed) progressFraction = Math.min(progressFraction, 0.99);
    SCORM.setProgress(progressFraction);
    // cmi5: emit a `progressed` statement when crossing a 10% milestone.
    // No-op on SCORM, where setProgress already covers the progress measure.
    if (SCORM.setProgressed) SCORM.setProgressed(progressFraction);

    // Scoring / pass-fail — only when enabled and the course has quizzes.
    var success = null;
    var scoreValue = null;
    if (cfg.scored && hasQuiz && quizzesDone) {
      // Rounded once, so the verdict here and the raw score the LMS stores
      // (and judges by its own mastery score) agree: 79.5 is 80 everywhere.
      scoreValue = Math.round(avgOf(state.quizzes.map(function (q) { return state.quizResults[q.id]; })));
      SCORM.setScore(scoreValue, 0, 100);
      if (completed) success = scoreValue >= cfg.passingScore ? 'passed' : 'failed';
    }

    state.complete = completed;
    // Snapshot for the completion screen (success may be null until completed).
    state.summary = {
      completed: completed,
      score: scoreValue,
      success: scoreValue == null ? null : (scoreValue >= cfg.passingScore ? 'passed' : 'failed'),
    };
    SCORM.report(completed, success);
    // false = rejected for size; the runtime lowered its limit, so rebuild.
    if (SCORM.setSuspend(buildSuspend()) === false) SCORM.setSuspend(buildSuspend());
    SCORM.setLocation(String(state.lessonIndex));
    // Session time rides along with every commit: if the final commit on
    // unload is lost (see the setExit note in boot), the LMS still records
    // the time spent instead of zero.
    SCORM.setSessionTime(sessionSeconds());
    SCORM.commit();
  }

  function avgOf(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  // ── Resume state (suspend_data) ──────────────────────────────────────────
  // Keys: l=lesson, v=visited indices, q=scores by block id, c=passed
  // restricted "Continue" gates, w=watched required videos. When the runtime
  // reports a size limit (SCORM 1.2: 4096 chars) and the state outgrows it, it
  // is shrunk step by step — never silently: block ids become ordinals and
  // visited lists become ranges (z=1), then the gate/video maps are dropped.
  // Lesson position and scores are always kept.
  function blockOrdinals() {
    var list = [];
    (state.course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) { list.push(b.id); });
    });
    return list;
  }
  function toRanges(nums) {
    nums = nums.slice().sort(function (a, b) { return a - b; });
    var out = [];
    for (var i = 0; i < nums.length; i++) {
      var s = nums[i], e = s;
      while (i + 1 < nums.length && nums[i + 1] === e + 1) e = nums[++i];
      out.push(s === e ? String(s) : s + '-' + e);
    }
    return out.join(',');
  }
  function fromRanges(str) {
    var out = [];
    String(str).split(',').forEach(function (part) {
      var m = /^(\d+)(?:-(\d+))?$/.exec(part);
      if (!m) return;
      for (var n = +m[1], e = m[2] ? +m[2] : n; n <= e; n++) out.push(n);
    });
    return out;
  }
  function buildSuspend() {
    var visited = Object.keys(state.visited).map(Number);
    var str = JSON.stringify({
      l: state.lessonIndex, v: visited, q: state.quizResults,
      c: Object.keys(state.continued), w: Object.keys(state.watched),
    });
    var limit = (SCORM.suspendLimit && SCORM.suspendLimit()) || 0;
    if (!limit || str.length <= limit) return str;

    var ids = blockOrdinals();
    function ord(list) {
      return list.map(function (id) { return ids.indexOf(id); }).filter(function (n) { return n >= 0; });
    }
    var q = {};
    Object.keys(state.quizResults).forEach(function (id) {
      var n = ids.indexOf(id);
      if (n >= 0) q[n] = Math.round(state.quizResults[id]);
    });
    var compact = { l: state.lessonIndex, z: 1, v: toRanges(visited), q: q,
      c: toRanges(ord(Object.keys(state.continued))), w: toRanges(ord(Object.keys(state.watched))) };
    var steps = [
      [],               // compact encoding only
      ['w'],            // then forget watched videos
      ['w', 'c'],       // then passed gates
      ['w', 'c', 'v'],  // then visited lessons
    ];
    for (var i = 0; i < steps.length; i++) {
      steps[i].forEach(function (k) { delete compact[k]; });
      str = JSON.stringify(compact);
      if (str.length <= limit) {
        console.warn('[Scormly] Resume data exceeded ' + limit + ' chars; saved in compact form'
          + (steps[i].length ? ' without: ' + steps[i].join(', ') : '') + '.');
        return str;
      }
    }
    console.error('[Scormly] Resume data (' + str.length + ' chars) exceeds the LMS limit of '
      + limit + ' even with only lesson position and scores; the LMS may truncate it.');
    return str;
  }
  // Apply a saved blob (full or compact form) to state.
  function applySuspend(saved) {
    if (!saved || typeof saved !== 'object') return;
    if (saved.z) {
      var ids = blockOrdinals();
      var q = {};
      Object.keys(saved.q || {}).forEach(function (n) { if (ids[n]) q[ids[n]] = saved.q[n]; });
      state.quizResults = q;
      if (saved.v) fromRanges(saved.v).forEach(function (i) { state.visited[i] = true; });
      if (saved.c) fromRanges(saved.c).forEach(function (n) { if (ids[n]) state.continued[ids[n]] = true; });
      if (saved.w) fromRanges(saved.w).forEach(function (n) { if (ids[n]) state.watched[ids[n]] = true; });
      return;
    }
    (saved.v || []).forEach(function (i) { state.visited[i] = true; });
    state.quizResults = saved.q || {};
    (saved.c || []).forEach(function (id) { state.continued[id] = true; });
    (saved.w || []).forEach(function (id) { state.watched[id] = true; });
  }

  function render() {
    var app = document.getElementById('app');
    app.innerHTML = '';
    var lessons = state.course.lessons || [];
    var i = state.lessonIndex;
    var lesson = lessons[i];

    if (state.finished) { renderComplete(app); return; }
    if (state.onIntro) { renderIntro(app); return; }

    // Gates (restricted Continue + required videos), plus linear-mode quiz rule,
    // decide whether the learner may move on from this lesson.
    var canAdvance = canLeaveLesson(i);
    var isLast = i >= lessons.length - 1;

    // On the last lesson, "Next" becomes "Finish" (primary) to end the course.
    var advanceBtn = isLast
      ? h('button', { id: 'advance-btn', class: 'btn', text: t('finish'), disabled: canAdvance ? null : 'true',
          onclick: function () { if (canLeaveLesson(state.lessonIndex)) finishCourse(); } })
      : h('button', { id: 'advance-btn', class: 'btn btn-outline', text: t('next'), disabled: canAdvance ? null : 'true',
          onclick: function () { if (canLeaveLesson(state.lessonIndex)) visit(state.lessonIndex + 1); } });

    var titleRow = [
      h('span', { class: 'player-title', lang: contentLang(), text: state.course.title || '' }),
      settings().showProgress
        ? h('span', { class: 'player-progress', text: t('progress', { n: i + 1, total: lessons.length }) })
        : null,
    ];
    // Show the LMS-reported learner name (greeting) when available.
    if (state.learner && state.learner.name) {
      titleRow.push(h('span', { class: 'player-progress', text: '· ' + state.learner.name }));
    }
    // Browse / Review mode badge (LMS told us not to track this attempt).
    if (state.lmsMode && state.lmsMode !== 'normal') {
      titleRow.push(h('span', { class: 'player-progress', text: '· ' + state.lmsMode }));
    }
    var prevDisabled = i === 0 && !introOn();
    var header = h('header', { class: 'player-header' }, [
      h('div', { class: 'player-head-main' }, [menuButton()].concat(titleRow)),
      h('div', { class: 'player-actions' }, [
        renderA11yMenu(),
        h('nav', { class: 'player-nav', 'aria-label': t('lessonNav') }, [
          h('button', { class: 'btn btn-outline', text: t('prev'), disabled: prevDisabled ? 'true' : null,
            onclick: function () { if (i > 0) visit(i - 1); else if (introOn()) showIntro(true); } }),
          advanceBtn,
        ]),
      ]),
      progressBar(),
    ]);

    var anim = blockAnimation();
    var blocksEl = h('div', { class: 'blocks' });
    var gated = false;
    var lastShown = null;
    if (lesson && lesson.blocks && lesson.blocks.length) {
      for (var bi = 0; bi < lesson.blocks.length; bi++) {
        var b = lesson.blocks[bi];
        var el = renderBlock(b);
        if (el) { blocksEl.appendChild(wrapBlock(b, el, anim)); lastShown = b; }
        // Hide everything after a Continue that hasn't been clicked yet.
        if (b.type === 'continue' && !state.continued[b.id] && isGate(b)) {
          gated = true;
          break;
        }
      }
    } else {
      blocksEl.appendChild(h('p', { class: 'empty', text: t('empty') }));
    }

    var lessonEl = h('div', { class: 'lesson' + transitionClass(), lang: contentLang() }, [
      settings().showProgress ? h('p', { class: 'lesson-kicker', text: t('progress', { n: i + 1, total: lessons.length }) }) : null,
      h('h1', { class: 'lesson-title', tabindex: '-1', text: lesson ? lesson.title : '' }),
      blocksEl,
      // A Continue button at the very end already leads on; the card would repeat it.
      gated || (lastShown && lastShown.type === 'continue' && !lastShown.data.nextCard)
        ? null : nextCard(isLast, lessons[i + 1], canAdvance),
    ]);
    var body = h('main', { class: 'player-body', id: 'main-content' }, lessonEl);

    app.appendChild(skipLink());
    app.appendChild(header);
    app.appendChild(body);
    app.appendChild(renderLessonMenu());
    state.navDirection = null;
    observeReveals();
  }

  // "Next lesson: <title>" card at the end of a lesson (Finish on the last).
  function nextCard(isLast, next, enabled) {
    return h('button', { id: 'next-card', class: 'next-card', type: 'button', disabled: enabled ? null : 'true',
      onclick: function () {
        if (!canLeaveLesson(state.lessonIndex)) return;
        if (isLast) finishCourse(); else visit(state.lessonIndex + 1);
      } }, [
      h('span', { class: 'next-card-text' }, [
        h('span', { class: 'next-card-label', text: isLast ? t('finish') : t('nextLesson') }),
        !isLast && next ? h('span', { class: 'next-card-title', lang: contentLang(), text: next.title || '' }) : null,
      ]),
      h('span', { class: 'next-card-arrow', 'aria-hidden': 'true', text: isLast ? '✓' : '→' }),
    ]);
  }

  // ── Progress, lesson menu ────────────────────────────────────────────────
  function progressPct() {
    var lessons = state.course.lessons || [];
    if (!lessons.length) return 0;
    var done = 0;
    lessons.forEach(function (_, k) { if (lessonComplete(k)) done++; });
    return Math.round((done / lessons.length) * 100);
  }
  function progressBar() {
    if (!settings().showProgress) return null;
    var pct = progressPct();
    return h('div', { class: 'progress-track', role: 'progressbar', 'aria-label': t('progressPct', { n: pct }),
      'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct) },
      h('div', { class: 'progress-fill', style: 'width:' + pct + '%' }));
  }

  var MENU_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
  function menuButton() {
    return h('button', { class: 'menu-btn', id: 'menu-btn', type: 'button', 'aria-label': t('lessonsMenu'),
      title: t('lessonsMenu'), 'aria-expanded': state.menuOpen ? 'true' : 'false', 'aria-controls': 'lesson-menu',
      html: MENU_ICON, onclick: function () { setMenu(!state.menuOpen); } });
  }

  function setMenu(open) {
    state.menuOpen = open;
    var menu = document.getElementById('lesson-menu');
    var btn = document.getElementById('menu-btn');
    if (!menu) return;
    menu.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var current = menu.querySelector('[aria-current]') || menu.querySelector('button');
      if (current) current.focus();
    } else if (btn) btn.focus();
  }

  // Slide-in drawer with the cover page, every lesson, its status and progress.
  function renderLessonMenu() {
    var lessons = state.course.lessons || [];
    var pct = progressPct();
    var list = h('ol', { class: 'menu-list' });
    function row(label, num, current, done, locked, onPick) {
      list.appendChild(h('li', {}, h('button', { type: 'button', class: 'menu-row' + (current ? ' is-current' : ''),
        'aria-current': current ? 'page' : null, disabled: locked ? 'true' : null, onclick: onPick }, [
        h('span', { class: 'menu-dot' + (done ? ' is-done' : ''), 'aria-hidden': 'true', text: done ? '✓' : num }),
        h('span', { class: 'menu-label', lang: contentLang(), text: label }),
      ])));
    }
    if (introOn()) row(t('courseHome'), '•', state.onIntro, false, false, function () { showIntro(true); });
    lessons.forEach(function (lesson, k) {
      row(lesson.title || t('progress', { n: k + 1, total: lessons.length }), String(k + 1),
        !state.onIntro && !state.finished && k === state.lessonIndex, lessonComplete(k), !canReachLesson(k),
        function () { if (canReachLesson(k)) visit(k); });
    });
    var panel = h('nav', { class: 'menu-panel', 'aria-label': t('lessonsMenu') }, [
      h('div', { class: 'menu-head' }, [
        h('div', { class: 'menu-title-row' }, [
          h('span', { class: 'menu-course', lang: contentLang(), text: state.course.title || '' }),
          h('button', { type: 'button', class: 'menu-close', 'aria-label': t('closeMenu'), text: '✕',
            onclick: function () { setMenu(false); } }),
        ]),
        h('div', { class: 'menu-progress' }, [
          h('div', { class: 'menu-progress-track' }, h('div', { class: 'menu-progress-fill', style: 'width:' + pct + '%' })),
          h('span', { text: t('progressPct', { n: pct }) }),
        ]),
      ]),
      list,
    ]);
    var wrap = h('div', { class: 'lesson-menu', id: 'lesson-menu' }, [
      h('div', { class: 'menu-backdrop', 'aria-hidden': 'true', onclick: function () { setMenu(false); } }),
      panel,
    ]);
    wrap.hidden = !state.menuOpen;
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.stopPropagation(); setMenu(false); }
    });
    return wrap;
  }

  // ── Course cover page ────────────────────────────────────────────────────
  function renderIntro(app) {
    var course = state.course;
    var intro = course.intro || {};
    var layout = intro.layout === 'split' || intro.layout === 'minimal' ? intro.layout : 'cover';
    var image = layout === 'minimal' ? '' : (course.coverImage || '');
    var lessons = course.lessons || [];
    var started = Object.keys(state.visited).length > 0;
    var startLabel = (intro.buttonLabel || '').trim() || (started ? t('continueCourse') : t('startCourse'));

    var header = h('header', { class: 'player-header' }, [
      h('div', { class: 'player-head-main' }, [menuButton(),
        h('span', { class: 'player-title', lang: contentLang(), text: course.title || '' })]),
      h('div', { class: 'player-actions' }, [renderA11yMenu()]),
      progressBar(),
    ]);
    var section = h('section', { class: 'sc-intro sc-intro-' + layout + (image ? '' : ' no-image') }, [
      image ? h('div', { class: 'sc-intro-media' }, h('img', { src: image, alt: '' })) : null,
      h('div', { class: 'sc-intro-content' }, [
        intro.eyebrow ? h('p', { class: 'sc-intro-eyebrow', text: intro.eyebrow }) : null,
        h('h1', { class: 'sc-intro-title', tabindex: '-1', text: course.title || '' }),
        course.description ? h('p', { class: 'sc-intro-text', text: course.description }) : null,
        h('div', { class: 'sc-intro-actions' }, [
          lessons.length ? h('button', { class: 'btn sc-intro-start', type: 'button', text: startLabel + ' →',
            onclick: function () { visit(firstOpenLesson()); } }) : null,
          h('span', { class: 'sc-intro-meta', text: t('lessonsCount', { n: lessons.length }) }),
        ]),
      ]),
    ]);
    var outline = null;
    if (intro.showOutline !== false && lessons.length) {
      var ol = h('ol');
      lessons.forEach(function (lesson, k) {
        var done = lessonComplete(k);
        ol.appendChild(h('li', {}, h('button', { type: 'button', disabled: canReachLesson(k) ? null : 'true',
          onclick: function () { if (canReachLesson(k)) visit(k); } }, [
          h('span', { class: 'sc-intro-num', text: k < 9 ? '0' + (k + 1) : String(k + 1) }),
          h('span', { class: 'sc-intro-ltitle', text: lesson.title || '' }),
          h('span', { class: 'sc-intro-arrow', 'aria-hidden': 'true', text: done ? '✓' : '→' }),
        ])));
      });
      outline = h('nav', { class: 'sc-intro-outline', 'aria-label': t('lessonsMenu') }, ol);
    }
    // Author content under the title section (text, images, media).
    var blocks = null;
    if (intro.blocks && intro.blocks.length) {
      var anim = blockAnimation();
      blocks = h('div', { class: 'blocks sc-intro-blocks' });
      intro.blocks.forEach(function (b) {
        var el = renderBlock(b);
        if (el) blocks.appendChild(wrapBlock(b, el, anim));
      });
    }
    var body = h('main', { class: 'player-body', id: 'main-content' },
      h('div', { class: 'lesson lesson-intro' + transitionClass(), lang: contentLang() }, [section, blocks, outline]));
    app.appendChild(skipLink());
    app.appendChild(header);
    app.appendChild(body);
    app.appendChild(renderLessonMenu());
    state.navDirection = null;
    observeReveals();
  }

  // ── Block wrappers, entrance animations, lesson transitions ──────────────
  var BACKGROUNDS = { muted: 1, soft: 1, accent: 1, gradient: 1, dark: 1, image: 1 };
  var DARK_BG = { accent: 1, gradient: 1, dark: 1, image: 1 };
  var PADDINGS = { compact: 1, normal: 1, spacious: 1 };

  function blockAnimation() {
    if (motionReduced() || typeof IntersectionObserver === 'undefined') return 'none';
    return settings().blockAnimation;
  }

  function transitionClass() {
    var tr = settings().lessonTransition;
    if (!state.navDirection || tr === 'none' || motionReduced()) return '';
    return tr === 'slide' ? ' lesson-enter-slide-' + state.navDirection : ' lesson-enter-fade';
  }

  // Panel styling (settings.background / spacing) + animation class. Blocks
  // already revealed in this lesson (re-renders after a gate) don't animate again.
  function wrapBlock(b, el, anim) {
    var s = b.settings || {};
    var bg = BACKGROUNDS[s.background] ? s.background : null;
    var cls = 'blk blk-pad-' + (PADDINGS[s.spacing] ? s.spacing : 'normal');
    if (s.width === 'narrow' || s.width === 'wide' || s.width === 'full') cls += ' blk-' + s.width;
    if (bg) cls += ' blk-has-bg' + (DARK_BG[bg] ? ' blk-on-dark' : '');
    if (anim !== 'none' && !state.revealed[b.id]) cls += ' anim-' + anim;
    var w = h('div', { class: cls, 'data-bg': bg, 'data-block': b.id }, el);
    // Photo panel: the image under a dimming gradient (same as the builder).
    if (bg === 'image' && s.backgroundImage) {
      w.style.backgroundImage = 'linear-gradient(rgb(10 12 20 / 0.55), rgb(10 12 20 / 0.62)), url("' +
        String(s.backgroundImage).replace(/"/g, '%22') + '")';
    }
    return w;
  }

  var revealObserver = null;
  function observeReveals() {
    if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
    var els = document.querySelectorAll('.blk.anim-fade, .blk.anim-slide, .blk.anim-zoom');
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    var last = 0;
    var step = 0;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var now = Date.now();
        step = now - last < 120 ? step + 1 : 0;
        last = now;
        e.target.style.animationDelay = Math.min(step, 5) * 80 + 'ms';
        e.target.classList.add('is-in');
        state.revealed[e.target.getAttribute('data-block')] = true;
        revealObserver.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(els, function (el) { revealObserver.observe(el); });
  }

  // Completion screen shown after the learner clicks Finish.
  function renderComplete(app) {
    var s = state.summary || {};
    var header = h('header', { class: 'player-header' }, [
      h('div', { style: 'display:flex;align-items:center;gap:12px;min-width:0' }, [
        h('span', { class: 'player-title', text: state.course.title || '' }),
      ]),
      h('div', { class: 'player-actions' }, [
        renderA11yMenu(),
        h('nav', { class: 'player-nav', 'aria-label': t('lessonNav') }, [
          h('button', { class: 'btn btn-outline', text: t('review'),
            onclick: function () { state.finished = false; render(); focusLessonHeading(true); } }),
          // Exit back to the LMS — only shown when actually running in one.
          SCORM.available()
            ? h('button', { class: 'btn', text: t('exitCourse'), onclick: exitCourse })
            : null,
        ]),
      ]),
    ]);
    // Free navigation lets the learner reach Finish with activities left
    // undone. Then the LMS rightly shows the course as not completed, so the
    // screen must not claim otherwise: list the unfinished lessons instead.
    // Failed: the LMS doesn't count the course as done either (cmi5 moveOn
    // CompletedAndPassed; SCORM success_status failed), so no "Course
    // complete" / author's congratulations — show the pass mark and the
    // lessons where points can still be won.
    var card = s.completed && s.success === 'failed' ? h('div', { class: 'finish-card' }, [
      h('div', { class: 'finish-check failed', 'aria-hidden': 'true', text: '!' }),
      h('h1', { class: 'finish-title', tabindex: '-1', text: t('courseFailed') }),
      h('p', { class: 'finish-score', text: t('yourScore', { s: Math.round(s.score) }) }),
      h('p', { class: 'finish-text', text: t('courseFailedText', { p: Math.round(settings().passingScore) }) }),
      lessonLinks(retakeLessons(), t('retakeLessons')),
    ]) : s.completed ? h('div', { class: 'finish-card' }, [
      h('div', { class: 'finish-check', 'aria-hidden': 'true', text: '✓' }),
      h('h1', { class: 'finish-title', tabindex: '-1', text: t('courseComplete') }),
      s.score != null ? h('p', { class: 'finish-score', text: t('yourScore', { s: Math.round(s.score) }) }) : null,
      s.success ? h('p', { class: 'finish-status ' + s.success, text: s.success === 'passed' ? t('passed') : t('failed') }) : null,
      h('p', { class: 'finish-text', text: settings().finishMessage || t('courseCompleteText') }),
    ]) : h('div', { class: 'finish-card' }, [
      h('div', { class: 'finish-check incomplete', 'aria-hidden': 'true', text: '!' }),
      h('h1', { class: 'finish-title', tabindex: '-1', text: t('courseIncomplete') }),
      h('p', { class: 'finish-text', text: t('courseIncompleteText') }),
      lessonLinks(unfinishedLessons(), t('unfinishedLessons')),
    ]);
    var body = h('main', { class: 'player-body', id: 'main-content' }, [h('div', { class: 'lesson' }, card)]);
    app.appendChild(skipLink());
    app.appendChild(header);
    app.appendChild(body);
  }

  // Completion-screen list of lesson buttons (by index) that reopen the lesson.
  function lessonLinks(indexes, label) {
    var lessons = state.course.lessons || [];
    return h('ul', { class: 'finish-todo', 'aria-label': label }, indexes.map(function (i) {
      return h('li', {}, h('button', { class: 'btn btn-outline', lang: contentLang(),
        text: lessons[i].title || t('progress', { n: i + 1, total: lessons.length }),
        disabled: canReachLesson(i) ? null : 'true',
        onclick: function () { state.finished = false; visit(i); } }));
    }));
  }
  // Lessons with a scored block below 100%, i.e. where a retake can raise the score.
  function retakeLessons() {
    var out = [];
    (state.course.lessons || []).forEach(function (lesson, i) {
      if ((lesson.blocks || []).some(function (b) { return SCORED[b.type] && state.quizResults[b.id] < 100; })) out.push(i);
    });
    return out;
  }

  // Decorative images get an empty alt so screen readers skip them.
  function imgAlt(img) { return img.decorative ? '' : (img.alt || ''); }

  // Media element followed by a collapsible text transcript, when provided.
  function withTranscript(media, transcript) {
    var text = typeof transcript === 'string' ? transcript.trim() : '';
    if (!text) return media;
    return h('div', { class: 'media-with-transcript' }, [media,
      h('details', { class: 'transcript' }, [
        h('summary', { text: t('transcript') }),
        h('div', { class: 'transcript-text', text: text }),
      ])]);
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'heading': {
        var el = h('h' + b.data.level, { text: b.data.text });
        el.style.textAlign = b.data.align || 'left';
        return el;
      }
      case 'paragraph': {
        var pv = { lead: 1, dropcap: 1, columns: 1 }[b.data.variant] ? b.data.variant : 'normal';
        return h('div', { class: 'rich-text sc-para-' + pv, html: b.data.html });
      }
      case 'list': {
        var list = h(b.data.ordered ? 'ol' : 'ul', { class: 'list' });
        (b.data.items || []).forEach(function (it) { list.appendChild(h('li', { text: it })); });
        return list;
      }
      case 'note': {
        var nv = NOTE_ICONS[b.data.variant] ? b.data.variant : 'note';
        var icon = h('span', { class: 'sc-note-icon', 'aria-hidden': 'true' });
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + NOTE_ICONS[nv] + '"/></svg>';
        return h('div', { class: 'sc-note sc-note-' + nv }, [icon, h('p', { class: 'sc-note-text', text: b.data.text || '' })]);
      }
      case 'image': {
        if (!b.data.src) return null;
        var size = { small: 1, medium: 1, large: 1, full: 1 }[b.data.size] ? b.data.size : 'large';
        var align = b.data.align === 'left' || b.data.align === 'right' ? b.data.align : 'center';
        var figCls = 'sc-img sc-img-' + size + (size === 'small' || size === 'medium' ? ' sc-img-' + align : '');
        return h('figure', { class: figCls }, [
          h('img', { src: b.data.src, alt: imgAlt(b.data) }),
          b.data.caption ? h('figcaption', { text: b.data.caption }) : null,
        ]);
      }
      case 'gallery': {
        var imgs = (b.data.images || []).filter(function (img) { return img.src; });
        if (b.data.layout === 'carousel') return renderCarousel(imgs);
        var cols = b.data.columns === 2 || b.data.columns === 4 ? b.data.columns : 3;
        var g = h('div', { class: 'sc-gallery sc-cols-' + cols });
        imgs.forEach(function (img) {
          g.appendChild(h('figure', {}, [h('img', { src: img.src, alt: imgAlt(img) }),
            img.caption ? h('figcaption', { text: img.caption }) : null]));
        });
        return g;
      }
      case 'video':
        return renderVideo(b);
      case 'audio':
        if (!b.data.src) return null;
        return withTranscript(h('audio', { controls: 'true', src: b.data.src, style: 'width:100%', muted: lmsAudioOff ? '' : null }), b.data.transcript);
      case 'embed': {
        var em = toEmbedUrl(b.data.url || '');
        if (!em) return null;
        return h('div', { class: 'embed' }, h('iframe', {
          src: em, title: (b.data.title || '').trim() || t('embedTitle'), allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        }));
      }
      case 'code':
        return h('pre', { class: 'code' }, h('code', { text: b.data.code || '' }));
      case 'table':
        return renderTable(b);
      case 'quote':
        return renderQuote(b);
      case 'continue': {
        // A passed gate disappears; the blocks it was hiding are now shown.
        if (state.continued[b.id] && isGate(b)) return null;
        var locked = continueLocked(b);
        return h('div', { class: 'continue', 'data-continue': b.id, 'data-locked': locked ? '1' : null }, [
          h('button', { class: 'btn', type: 'button', disabled: locked ? 'true' : null,
            'aria-describedby': locked ? 'clock-' + b.id : null,
            onclick: function () { if (!continueLocked(b)) onContinue(b); } },
            [locked ? h('span', { 'aria-hidden': 'true', text: '🔒 ' }) : null, b.data.label || '']),
          locked ? h('p', { id: 'clock-' + b.id, class: 'continue-locked', text: t('continueLocked') }) : null,
        ]);
      }
      case 'divider':
        return renderDivider(b.data);
      case 'courseOutline':
        return renderOutline(b);
      case 'tabs': return renderTabs(b);
      case 'accordion': return renderAccordion(b);
      case 'flashcards': return renderFlashcards(b);
      case 'scenario': return renderScenario(b);
      case 'quiz': return renderQuiz(b);
      case 'hotspot': return renderHotspot(b);
      case 'timeline': return renderTimeline(b);
      case 'ordering': return renderOrdering(b);
      case 'fillBlanks': return renderFillBlanks(b);
      case 'imageText': return renderImageText(b);
      case 'attachment': return renderAttachment(b);
      case 'columns': return renderColumns(b);
      case 'process': return renderProcess(b);
      case 'steps': return renderSteps(b);
      case 'comparison': return renderComparison(b);
      case 'beforeAfter': return renderBeforeAfter(b);
      case 'reflection': return renderReflection(b);
      default: return null;
    }
  }

  // Callout icons (24×24 stroked paths), same as the builder's NoteView.
  var NOTE_ICONS = {
    note: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    tip: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
    success: 'm8 12.5 2.5 2.5L16 9.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    warning: 'M12 9v4m0 4h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  };

  // Lines, decorative separators, a labelled line, or empty space.
  function renderDivider(d) {
    switch (d.style) {
      case 'spacer': return h('div', { class: 'sc-spacer', 'aria-hidden': 'true' });
      case 'gradient': return h('hr', { class: 'sc-divider sc-divider-gradient' });
      case 'dots': return h('div', { class: 'sc-divider sc-divider-dots', role: 'separator' }, [h('span'), h('span'), h('span')]);
      case 'ornament': return h('div', { class: 'sc-divider sc-divider-ornament', role: 'separator' }, h('span', { 'aria-hidden': 'true', text: '\u2726' }));
      case 'wave': return h('div', { class: 'sc-divider sc-divider-wave', role: 'separator' });
      case 'label': return h('div', { class: 'sc-divider sc-divider-label', role: 'separator', 'aria-label': d.label || null }, h('span', { text: d.label || '' }));
      default: {
        var hr = h('hr', { class: 'sc-divider sc-divider-line' });
        hr.style.borderTopStyle = d.style === 'dashed' || d.style === 'dotted' ? d.style : 'solid';
        return hr;
      }
    }
  }

  // Quote in one of six styles; markup shared with the builder (sc-quote-*).
  function renderQuote(b) {
    var d = b.data;
    var v = { statement: 1, card: 1, photo: 1, image: 1 }[d.variant] ? d.variant : 'classic';
    var hasMedia = (v === 'photo' || v === 'image') && !!d.image;
    var cite = d.author || d.role ? h('figcaption', { class: 'sc-quote-cite' }, [
      v === 'card' && d.image ? h('img', { class: 'sc-quote-avatar', src: d.image, alt: '' }) : null,
      h('span', { class: 'sc-quote-who' }, [
        d.author ? h('span', { class: 'sc-quote-author', text: d.author }) : null,
        d.role ? h('span', { class: 'sc-quote-role', text: d.role }) : null,
      ]),
    ]) : null;
    var right = v === 'photo' && d.photoSide === 'right' ? ' photo-right' : '';
    return h('figure', { class: 'sc-quote sc-quote-' + v + (hasMedia ? ' has-media' : '') + right }, [
      v === 'photo' && d.image ? h('div', { class: 'sc-quote-media' }, h('img', { src: d.image, alt: '' })) : null,
      v === 'image' && d.image ? h('img', { class: 'sc-quote-bg', src: d.image, alt: '' }) : null,
      h('div', { class: 'sc-quote-body' }, [
        v !== 'classic' ? h('span', { class: 'sc-quote-mark', 'aria-hidden': 'true', text: '\u201C' }) : null,
        h('blockquote', { class: 'sc-quote-text', text: d.text || '' }),
        cite,
      ]),
    ]);
  }

  function renderImageText(b) {
    var d = b.data;
    var layout = d.layout === 'right' || d.layout === 'overlay' ? d.layout : 'left';
    return h('div', { class: 'sc-imgtext sc-imgtext-' + layout + (d.src ? '' : ' no-image') }, [
      d.src ? h('div', { class: 'sc-imgtext-media' }, h('img', { src: d.src, alt: imgAlt(d) })) : null,
      h('div', { class: 'sc-imgtext-body rich-text', html: d.html || '' }),
    ]);
  }

  var GRIP_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';

  // 2–4 side-by-side text columns (stacked on phones).
  function renderColumns(b) {
    var cols = (b.data.columns || []).slice(0, 4);
    if (!cols.length) return null;
    var st = b.data.style === 'cards' || b.data.style === 'lines' ? b.data.style : 'plain';
    return h('div', { class: 'sc-columns sc-columns-' + cols.length + ' sc-columns-' + st }, cols.map(function (c) {
      return h('div', { class: 'sc-column' }, [
        c.title ? h('h3', { class: 'sc-column-title', text: c.title }) : null,
        h('div', { class: 'rich-text sc-column-text', html: c.html || '' }),
      ]);
    }));
  }
  // ── Process diagram ──────────────────────────────────────────────────────
  // Mirrors ProcessPreview.tsx; geometry as in src/blocks/process.ts.
  function pctOf(v) { return Math.round(v * 1000) / 10 + '%'; }
  // A step's description: its rich text, or older plain text escaped with
  // line breaks kept (as stepHtml in src/blocks/process.ts).
  function stepHtml(s) {
    if (typeof s.html === 'string') return s.html;
    return String(s.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }
  function ringPoint(k, n) {
    var a = (k / n) * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a), deg: (a * 180) / Math.PI };
  }

  // Style variants each layout offers (src/blocks/process.ts PROCESS_VARIANTS).
  var PROCESS_VARIANTS = { flow: { soft: 1, outline: 1 }, chevrons: { soft: 1 }, pyramid: { soft: 1 }, cycle: { soft: 1 } };

  function renderProcess(b) {
    var steps = b.data.steps || [];
    var n = steps.length;
    if (!n) return null;
    var layout = { chevrons: 1, cycle: 1, pyramid: 1 }[b.data.layout] ? b.data.layout : 'flow';
    // Flow: at most 4 steps per row, rows balanced (5 → 3 + 2).
    var cols = n <= 4 ? n : Math.ceil(n / Math.ceil(n / 4));
    var size = layout === 'flow' ? ' sc-process-cols-' + cols : (n > 4 ? ' sc-process-many' : '') + (n > 6 ? ' sc-process-lots' : '');
    var variant = PROCESS_VARIANTS[layout][b.data.variant] ? ' sc-process-' + b.data.variant : '';
    var wrap = h('div', { class: 'sc-process sc-process-' + layout + size + variant });
    wrap.style.setProperty('--n', String(n));
    wrap.style.setProperty('--cols', String(cols));
    if (layout === 'cycle') { renderCycle(b, wrap, steps); return wrap; }
    var ol = h('ol', { class: 'sc-process-list' });
    steps.forEach(function (s, i) {
      var num = h('span', { class: 'sc-process-num', 'aria-hidden': 'true', text: String(i + 1) });
      var title = h('p', { class: 'sc-process-title', text: s.title || '' });
      var li = h('li', { class: 'sc-process-step' },
        layout === 'flow' ? [num, title] : [h('div', { class: 'sc-process-head' }, [num, title])]);
      li.appendChild(h('div', { class: 'sc-process-text rich-text', html: stepHtml(s) }));
      if (layout === 'pyramid') {
        var top = 0.4 + (0.6 * i) / n, bottom = 0.4 + (0.6 * (i + 1)) / n, slant = (bottom - top) / 2;
        li.style.setProperty('--w', pctOf(bottom));
        li.style.setProperty('--cut', pctOf(slant / bottom));
        li.style.setProperty('--pad', pctOf(slant));
        li.style.setProperty('--tint', pctOf(0.1 + 0.22 * (n > 1 ? i / (n - 1) : 1)));
      }
      ol.appendChild(li);
    });
    wrap.appendChild(ol);
    return wrap;
  }

  // Steps on a ring; the open step's text shows in the middle.
  function renderCycle(b, wrap, steps) {
    var n = steps.length;
    var seen = {};
    var ring = h('div', { class: 'sc-cycle-ring' });
    var panel = h('div', { id: 'cycle-' + b.id, class: 'sc-cycle-panel', 'aria-live': 'polite' });
    var progress = h('p', { class: 'sc-cycle-progress' });
    var nodes = steps.map(function (s, k) {
      var p = ringPoint(k, n);
      var btn = h('button', { type: 'button', class: 'sc-cycle-node', 'aria-controls': panel.id,
        'aria-label': t('openStep', { n: k + 1, title: s.title || '' }), onclick: function () { show(k); } }, [
        h('span', { class: 'sc-cycle-node-num', text: String(k + 1) }),
        h('span', { class: 'sc-cycle-node-title', text: s.title || '' }),
      ]);
      btn.style.setProperty('--x', p.x + '%');
      btn.style.setProperty('--y', p.y + '%');
      ring.appendChild(btn);
      return btn;
    });
    steps.forEach(function (s, k) {
      var p = ringPoint(k + 0.5, n);
      var arrow = h('span', { class: 'sc-cycle-arrow', 'aria-hidden': 'true' });
      arrow.style.setProperty('--x', p.x + '%');
      arrow.style.setProperty('--y', p.y + '%');
      arrow.style.setProperty('--r', (p.deg + 135) + 'deg');
      ring.appendChild(arrow);
    });
    ring.appendChild(panel);
    function show(k) {
      seen[k] = true;
      var count = 0;
      nodes.forEach(function (btn, j) {
        if (seen[j]) count++;
        btn.className = 'sc-cycle-node' + (j === k ? ' is-active' : '') + (seen[j] ? ' is-seen' : '');
        btn.setAttribute('aria-pressed', j === k ? 'true' : 'false');
      });
      panel.innerHTML = '';
      panel.appendChild(h('p', { class: 'sc-process-title', text: steps[k].title || '' }));
      panel.appendChild(h('div', { class: 'sc-process-text rich-text', html: stepHtml(steps[k]) }));
      progress.textContent = t('exploredOf', { n: count, total: n });
    }
    show(0);
    wrap.appendChild(ring);
    wrap.appendChild(progress);
  }

  // ── Step-by-step guide ───────────────────────────────────────────────────
  // 'list' shows every step; 'slides' one at a time with Back / Next.
  function guideStepBody(s) {
    return h('div', { class: 'sc-steps-body' }, [
      s.title ? h('h3', { class: 'sc-steps-title', text: s.title }) : null,
      h('div', { class: 'sc-steps-text rich-text', html: s.html || '' }),
      s.src ? h('figure', { class: 'sc-steps-media' }, h('img', { src: s.src, alt: s.alt || '' })) : null,
    ]);
  }

  function renderSteps(b) {
    var steps = b.data.steps || [];
    if (!steps.length) return null;
    if (b.data.layout !== 'slides') {
      return h('ol', { class: 'sc-steps sc-steps-list' }, steps.map(function (s, i) {
        return h('li', { class: 'sc-steps-item' }, [
          h('span', { class: 'sc-steps-num', 'aria-hidden': 'true', text: String(i + 1) }), guideStepBody(s)]);
      }));
    }
    var index = 0;
    var bars = h('div', { class: 'sc-steps-bars', 'aria-hidden': 'true' }, steps.map(function () { return h('span'); }));
    var slide = h('div', { class: 'sc-steps-slide', 'aria-live': 'polite' });
    var count = h('span', { class: 'sc-steps-count' });
    var back = h('button', { class: 'btn btn-outline', type: 'button', text: t('back'),
      onclick: function () { go(index - 1); } });
    var next = h('button', { class: 'btn', type: 'button',
      onclick: function () { go(index === steps.length - 1 ? 0 : index + 1); } });
    function go(n) {
      if (n < 0 || n >= steps.length) return;
      index = n;
      Array.prototype.forEach.call(bars.children, function (bar, k) { bar.className = k <= n ? 'is-done' : ''; });
      slide.innerHTML = '';
      slide.appendChild(h('span', { class: 'sc-steps-num', 'aria-hidden': 'true', text: String(n + 1) }));
      slide.appendChild(guideStepBody(steps[n]));
      count.textContent = t('stepOf', { n: n + 1, total: steps.length });
      next.textContent = n === steps.length - 1 ? t('startOver') : t('next');
      // Keep keyboard focus alive when the focused button becomes disabled.
      var focused = document.activeElement;
      back.disabled = n === 0;
      if (focused === back && back.disabled) next.focus();
    }
    go(0);
    return h('div', { class: 'sc-steps sc-steps-slides' }, [bars, slide,
      h('div', { class: 'sc-steps-nav' }, [back, count, next])]);
  }

  // ── Comparison (pros & cons, A vs B) ─────────────────────────────────────
  function renderComparison(b) {
    var cols = (b.data.columns || []).slice(0, 4);
    if (!cols.length) return null;
    var vs = !!b.data.versus && cols.length === 2;
    var grid = h('div', { class: 'sc-compare-grid' });
    cols.forEach(function (c, i) {
      if (vs && i === 1) grid.appendChild(h('span', { class: 'sc-compare-badge', 'aria-hidden': 'true', text: 'VS' }));
      var tone = { pro: 1, con: 1 }[c.tone] ? c.tone : 'neutral';
      var items = (c.items || []).filter(function (it) { return String(it).trim(); });
      grid.appendChild(h('div', { class: 'sc-compare-col sc-compare-' + tone }, [
        c.title ? h('h3', { class: 'sc-compare-title', text: c.title }) : null,
        h('ul', { class: 'sc-compare-list' }, items.map(function (it) {
          return h('li', { class: 'sc-compare-item' }, [
            h('span', { class: 'sc-compare-mark', 'aria-hidden': 'true' }), h('span', { text: it })]);
        })),
      ]));
    });
    var wrap = h('div', { class: 'sc-compare' + (vs ? ' sc-compare-vs' : '') }, grid);
    wrap.style.setProperty('--n', String(cols.length));
    return wrap;
  }

  // ── Before / after slider ────────────────────────────────────────────────
  // Mouse and pen jump to the pointer; touch moves on horizontal drags only
  // (touch-action: pan-y), so a vertical swipe still scrolls the page.
  var BA_KEYS = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 };
  function renderBeforeAfter(b) {
    var d = b.data;
    if (!d.before || !d.after) return null;
    var pos = 50;
    var dragging = false;
    var handle = h('div', { class: 'sc-ba-handle', role: 'slider', tabindex: '0',
      'aria-label': t('baSlider', { before: d.beforeLabel || '', after: d.afterLabel || '' }),
      'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span', { class: 'sc-ba-knob' }));
    var wrap = h('div', { class: 'sc-ba' }, [
      h('img', { class: 'sc-ba-after', src: d.after, alt: d.afterAlt || '', draggable: 'false' }),
      h('div', { class: 'sc-ba-before' }, h('img', { src: d.before, alt: d.beforeAlt || '', draggable: 'false' })),
      d.beforeLabel ? h('span', { class: 'sc-ba-label sc-ba-label-before', 'aria-hidden': 'true', text: d.beforeLabel }) : null,
      d.afterLabel ? h('span', { class: 'sc-ba-label sc-ba-label-after', 'aria-hidden': 'true', text: d.afterLabel }) : null,
      handle,
    ]);
    function set(v) {
      pos = Math.round(Math.min(100, Math.max(0, v)));
      wrap.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(pos));
      handle.setAttribute('aria-valuetext', pos + '%');
    }
    function moveTo(x) {
      var r = wrap.getBoundingClientRect();
      if (r.width) set(((x - r.left) / r.width) * 100);
    }
    wrap.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* capture unsupported */ }
      if (e.pointerType !== 'touch') moveTo(e.clientX);
    });
    wrap.addEventListener('pointermove', function (e) { if (dragging) moveTo(e.clientX); });
    wrap.addEventListener('pointerup', function () { dragging = false; });
    wrap.addEventListener('pointercancel', function () { dragging = false; });
    handle.addEventListener('keydown', function (e) {
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? 100 : BA_KEYS[e.key] != null ? pos + BA_KEYS[e.key] : null;
      if (next == null) return;
      e.preventDefault();
      set(next);
    });
    set(50);
    return wrap;
  }

  // ── Reflection ───────────────────────────────────────────────────────────
  // Not scored. Submitting reports the answer as a neutral long-fill-in
  // interaction, shows the sample answer and counts as a done task for a
  // restricted Continue below. Answers live for the session only (they could
  // overflow suspend_data).
  function renderReflection(b) {
    var d = b.data;
    var id = 'reflect-' + b.id;
    var input = h('textarea', { id: id, class: 'sc-reflect-input', placeholder: t('answerPlaceholder') });
    input.value = state.reflections[b.id] || '';
    var status = h('span', { class: 'sc-reflect-status', role: 'status' });
    var actions = h('div', { class: 'sc-reflect-actions' });
    var sample = String(d.sample || '').trim() ? h('div', { class: 'sc-reflect-sample' }, [
      h('p', { class: 'sc-reflect-sample-label', text: t('sampleAnswer') }),
      h('p', { class: 'sc-reflect-sample-text', text: d.sample }),
    ]) : null;
    var wrap = h('div', { class: 'sc-reflect' }, [
      h('label', { class: 'sc-reflect-prompt', for: id, text: d.prompt || '' }), input, actions]);
    var submit = h('button', { class: 'btn', type: 'button', text: t('submitAnswer'), onclick: function () {
      var text = input.value.trim();
      if (!text) return;
      state.reflections[b.id] = text;
      SCORM.recordInteraction(state.interactionIndex++, {
        id: b.id,
        type: 'long-fill-in',
        interactionType: 'long-fill-in',
        response: text,
        neutral: true,
        description: d.prompt || '',
      });
      setSaved(true);
      refreshGating();
    } });
    var edit = h('button', { class: 'btn btn-outline', type: 'button', text: t('editAnswer'),
      onclick: function () { setSaved(false); input.focus(); } });
    function setSaved(on) {
      input.readOnly = on;
      actions.innerHTML = '';
      actions.appendChild(on ? edit : submit);
      actions.appendChild(status);
      status.textContent = on ? t('answerSaved') : '';
      if (on && sample && !sample.parentNode) wrap.appendChild(sample);
    }
    input.addEventListener('input', function () { submit.disabled = !input.value.trim(); });
    submit.disabled = !input.value.trim();
    setSaved(state.reflections[b.id] != null);
    return wrap;
  }


  function formatBytes(bytes) {
    if (!bytes || bytes < 0) return '';
    var units = ['B', 'KB', 'MB', 'GB'];
    var n = bytes;
    var i = 0;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + ' ' + units[i];
  }

  var DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>';
  function renderAttachment(b) {
    var files = (b.data.files || []).filter(function (f) { return f.src; });
    if (!files.length) return null;
    var list = h('ul', { class: 'sc-attach-list' });
    files.forEach(function (f) {
      var ext = /\.([A-Za-z0-9]{1,5})$/.exec(f.name || '');
      var dl = h('a', { class: 'sc-attach-dl', href: f.src, download: f.name || '' });
      dl.innerHTML = DOWNLOAD_ICON;
      dl.appendChild(h('span', { text: t('download') }));
      dl.appendChild(h('span', { class: 'sr-only', text: f.name || '' }));
      list.appendChild(h('li', {}, h('div', { class: 'sc-attach-item' }, [
        h('span', { class: 'sc-attach-badge', 'aria-hidden': 'true', text: ext ? ext[1].toUpperCase() : 'FILE' }),
        h('span', { class: 'sc-attach-meta' }, [
          h('span', { class: 'sc-attach-name', text: f.name || '' }),
          f.size ? h('span', { class: 'sc-attach-size', text: formatBytes(f.size) }) : null,
        ]),
        dl,
      ])));
    });
    return h('div', { class: 'sc-attach' }, [
      b.data.title ? h('p', { class: 'sc-attach-title', text: b.data.title }) : null,
      list,
    ]);
  }

  var CHEVRON = { left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>' };
  // Gallery 'carousel' layout: one image at a time, buttons, dots, arrows, swipe.
  function renderCarousel(imgs) {
    if (!imgs.length) return null;
    var total = imgs.length;
    var index = 0;
    var track = h('div', { class: 'sc-carousel-track' });
    var slides = imgs.map(function (img, n) {
      var slide = h('div', { class: 'sc-carousel-slide', role: 'group', 'aria-roledescription': 'slide',
        'aria-label': t('slideOf', { n: n + 1, total: total }) }, h('img', { src: img.src, alt: imgAlt(img), draggable: 'false' }));
      track.appendChild(slide);
      return slide;
    });
    var viewport = h('div', { class: 'sc-carousel-viewport' }, track);
    var caption = h('p', { class: 'sc-carousel-caption', 'aria-live': 'polite' });
    var dots = [];
    function go(n) {
      index = (n + total) % total;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      slides.forEach(function (s, k) {
        if (k === index) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      dots.forEach(function (d, k) {
        d.className = k === index ? 'is-active' : '';
        if (k === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      caption.textContent = imgs[index].caption || '';
    }
    if (total > 1) {
      var prev = h('button', { type: 'button', class: 'sc-carousel-btn sc-prev', 'aria-label': t('prevSlide'), onclick: function () { go(index - 1); } });
      prev.innerHTML = CHEVRON.left;
      var next = h('button', { type: 'button', class: 'sc-carousel-btn sc-next', 'aria-label': t('nextSlide'), onclick: function () { go(index + 1); } });
      next.innerHTML = CHEVRON.right;
      viewport.appendChild(prev);
      viewport.appendChild(next);
      var startX = null;
      viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; });
      viewport.addEventListener('pointercancel', function () { startX = null; });
      viewport.addEventListener('pointerup', function (e) {
        if (startX == null) return;
        var dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      });
    }
    var dotsEl = total > 1 ? h('div', { class: 'sc-carousel-dots' }, imgs.map(function (_, n) {
      var d = h('button', { type: 'button', 'aria-label': t('goToSlide', { n: n + 1 }), onclick: function () { go(n); } });
      dots.push(d);
      return d;
    })) : null;
    var root = h('div', { class: 'sc-carousel', role: 'region', 'aria-roledescription': 'carousel', 'aria-label': t('carousel'), tabindex: '0' }, [
      viewport,
      h('div', { class: 'sc-carousel-foot' }, [caption, dotsEl]),
    ]);
    root.addEventListener('keydown', function (e) {
      if (e.target !== root) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });
    go(0);
    return root;
  }

  function toEmbedUrl(url) {
    if (!url) return '';
    try {
      var u = new URL(url);
      var host = u.hostname.replace(/^www\.|^m\./, '');
      if (host === 'youtube.com' && u.searchParams.get('v')) {
        return 'https://www.youtube.com/embed/' + u.searchParams.get('v');
      }
      if (host === 'youtu.be') {
        return 'https://www.youtube.com/embed/' + u.pathname.slice(1);
      }
      if (host === 'vimeo.com') {
        var id = u.pathname.split('/').filter(Boolean)[0];
        if (/^\d+$/.test(id)) return 'https://player.vimeo.com/video/' + id;
      }
      return u.protocol === 'https:' ? url : '';
    } catch (e) { return ''; }
  }

  // Course outline: links to every lesson; a click navigates the learner there.
  // The lesson list is derived live from the course (not stored in the block).
  function renderOutline(b) {
    var lessons = state.course.lessons || [];
    var wrap = h('div', { class: 'outline' });
    if (b.data.title) wrap.appendChild(h('p', { class: 'outline-title', text: b.data.title }));
    var ol = h('ol', { class: 'outline-list' });
    var n = 0; // sequential number among shown lessons
    lessons.forEach(function (lesson, i) {
      if (i === state.lessonIndex) return; // exclude the current lesson
      n++;
      // Linear mode: lessons not yet reachable by Next are shown but locked.
      var locked = !canReachLesson(i);
      var row = h('button', { class: 'outline-item', type: 'button', 'data-lesson': String(i), disabled: locked ? 'true' : null,
        onclick: (function (idx) { return function () { if (canReachLesson(idx)) visit(idx); }; })(i) }, [
        b.data.numbered ? h('span', { class: 'outline-num', text: String(n) }) : null,
        h('span', { class: 'outline-label', text: lesson.title || '' }),
        h('span', { class: 'outline-arrow', text: '→' }),
      ]);
      ol.appendChild(h('li', {}, row));
    });
    wrap.appendChild(ol);
    return wrap;
  }

  // Video block. Download is disabled (controlsList=nodownload + no context
  // menu / PiP) — a deterrent, not DRM. When requireWatch is set, watching to
  // ~95% (or to the end) satisfies the lesson's advance gate.
  function renderVideo(b) {
    if (!b.data.src) return null;
    var video = h('video', {
      controls: 'true', controlslist: 'nodownload', disablepictureinpicture: 'true',
      src: b.data.src, poster: b.data.poster || null, muted: lmsAudioOff ? '' : null,
    });
    video.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    // WebVTT captions; shown by default per the learner's / LMS preference.
    if (b.data.captions) {
      video.appendChild(h('track', { kind: 'captions', src: b.data.captions, srclang: contentLang() || lang,
        label: t('captions'), default: captionsOn() ? '' : null }));
      applyCaptions(video);
      video.addEventListener('loadedmetadata', function () { applyCaptions(video); });
    }
    if (!b.data.requireWatch || state.onIntro) return withTranscript(video, b.data.transcript);

    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime / video.duration >= 0.95) markWatched(b.id);
    });
    video.addEventListener('ended', function () { markWatched(b.id); });

    var wrap = h('div', { class: 'video-required' }, [video]);
    if (!state.watched[b.id]) {
      wrap.appendChild(h('p', { id: 'vgate-' + b.id, class: 'video-gate', text: t('watchToContinue') }));
    }
    return withTranscript(wrap, b.data.transcript);
  }

  function renderTable(b) {
    var rows = b.data.rows || [];
    var auto = b.data.width === 'auto';
    var align = { center: 1, right: 1 }[b.data.align] ? b.data.align : 'left';
    var table = h('table', { class: 'data-table ' + (auto ? 'sc-table sc-table-auto sc-table-' + align : 'sc-table') });
    rows.forEach(function (row, ri) {
      var tr = h('tr');
      row.forEach(function (cell) {
        tr.appendChild(h(b.data.header && ri === 0 ? 'th' : 'td', { text: cell }));
      });
      table.appendChild(tr);
    });
    return table;
  }

  function renderTabs(b) {
    var tabs = b.data.tabs || [];
    // WAI-ARIA tabs: roving tabindex, arrows/Home/End move and activate.
    var base = 'tabs-' + b.id;
    var wrap = h('div', { class: 'tabs' });
    var bar = h('div', { class: 'tab-bar', role: 'tablist' });
    var panel = h('div', { class: 'tab-panel rich-text', role: 'tabpanel', id: base + '-panel', tabindex: '0' });
    var btns = [];
    function show(idx, focus) {
      btns.forEach(function (el, i) {
        el.className = 'tab-btn' + (i === idx ? ' active' : '');
        el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        el.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      panel.innerHTML = tabs[idx] ? tabs[idx].html : '';
      panel.setAttribute('aria-labelledby', base + '-tab-' + idx);
      if (focus) btns[idx].focus();
    }
    tabs.forEach(function (tab, idx) {
      var btn = h('button', { class: 'tab-btn', type: 'button', role: 'tab', id: base + '-tab-' + idx,
        'aria-controls': base + '-panel', text: tab.title, onclick: function () { show(idx); } });
      btn.addEventListener('keydown', function (e) {
        var n = tabs.length, to = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (idx + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (idx - 1 + n) % n;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = n - 1;
        if (to < 0) return;
        e.preventDefault();
        show(to, true);
      });
      btns.push(btn);
      bar.appendChild(btn);
    });
    wrap.appendChild(bar);
    wrap.appendChild(panel);
    if (tabs.length) show(0);
    return wrap;
  }

  function renderAccordion(b) {
    var wrap = h('div', {});
    (b.data.items || []).forEach(function (item, idx) {
      var bodyId = 'acc-' + b.id + '-' + idx;
      var body = h('div', { class: 'accordion-body rich-text', id: bodyId, html: item.html });
      body.style.display = 'none';
      var chev = h('span', { class: 'chev', 'aria-hidden': 'true', text: '▸' });
      var head = h('button', { class: 'accordion-head', type: 'button', 'aria-expanded': 'false', 'aria-controls': bodyId,
        onclick: function () {
          var open = body.style.display !== 'none';
          body.style.display = open ? 'none' : 'block';
          chev.textContent = open ? '▸' : '▾';
          head.setAttribute('aria-expanded', open ? 'false' : 'true');
        } }, [chev, h('span', { text: item.title })]);
      wrap.appendChild(h('div', { class: 'accordion-item' }, [head, body]));
    });
    return wrap;
  }

  function renderFlashcards(b) {
    var grid = h('div', { class: 'flashcards' });
    (b.data.cards || []).forEach(function (card) {
      // Only the visible face is exposed to assistive tech; flipping
      // announces the newly shown side.
      var front = h('div', { class: 'flashcard-face flashcard-front', text: card.front });
      var back = h('div', { class: 'flashcard-face flashcard-back', 'aria-hidden': 'true', text: card.back });
      var inner = h('div', { class: 'flashcard-inner' }, [front, back]);
      var fc = h('div', { class: 'flashcard', role: 'button', tabindex: '0', title: t('flipHint') }, inner);
      function flip() {
        var flipped = fc.classList.toggle('flipped');
        front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
        announce((flipped ? t('cardBack') : t('cardFront')) + ': ' + (flipped ? card.back : card.front));
      }
      fc.addEventListener('click', flip);
      fc.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); flip(); }
      });
      grid.appendChild(fc);
    });
    return grid;
  }

  // Image hotspots: numbered pulsing markers; a click opens a card with the
  // marker's title and text. Esc closes it and returns focus to the marker.
  function renderHotspot(b) {
    if (!b.data.src) return null;
    var spots = b.data.hotspots || [];
    var visited = {};
    var visitedCount = 0;
    var openIdx = -1;
    var markers = [];
    var stage = h('div', { class: 'hotspot-stage' }, h('img', { src: b.data.src, alt: imgAlt(b.data) }));
    var progress = spots.length ? h('p', { class: 'hotspot-progress' }) : null;
    var pop = null;

    function updateProgress() {
      if (progress) progress.textContent = t('hotspotProgress', { n: visitedCount, total: spots.length });
    }
    function close(focus) {
      if (pop) { pop.parentNode.removeChild(pop); pop = null; }
      if (openIdx >= 0) {
        markers[openIdx].setAttribute('aria-expanded', 'false');
        markers[openIdx].classList.remove('active');
        if (focus) markers[openIdx].focus();
      }
      openIdx = -1;
    }
    function open(i, focus) {
      var s = spots[i];
      close(false);
      openIdx = i;
      if (!visited[s.id]) { visited[s.id] = true; visitedCount++; markers[i].classList.add('visited'); updateProgress(); }
      markers[i].setAttribute('aria-expanded', 'true');
      markers[i].classList.add('active');
      // Anchor the card to the marker's nearer edge so it stays over the image.
      var tx = s.x < 33 ? '0%' : s.x > 67 ? '-100%' : '-50%';
      var ty = s.y <= 55 ? '1.5rem' : 'calc(-100% - 1.5rem)';
      pop = h('div', { class: 'hotspot-pop', role: 'dialog', tabindex: '-1', 'aria-label': s.title || '' }, [
        h('div', { class: 'hotspot-pop-head' }, [
          h('p', { class: 'hotspot-pop-title', text: s.title || '' }),
          h('button', { class: 'hotspot-close', type: 'button', 'aria-label': t('close'), text: '✕',
            onclick: function () { close(true); } }),
        ]),
        s.text ? h('p', { class: 'hotspot-pop-text', text: s.text }) : null,
      ]);
      pop.style.left = s.x + '%';
      pop.style.top = s.y + '%';
      pop.style.transform = 'translate(' + tx + ', ' + ty + ')';
      stage.appendChild(pop);
      // Move focus into the card so keyboard / screen reader users land on it.
      if (focus) pop.focus();
    }

    spots.forEach(function (s, i) {
      var m = h('button', { class: 'hotspot-marker', type: 'button', 'aria-expanded': 'false',
        'aria-label': t('hotspotMarker', { n: i + 1, title: s.title || '' }),
        onclick: function (e) { if (openIdx === i) close(false); else open(i, e.detail === 0); } },
        h('span', { class: 'hotspot-dot', text: String(i + 1) }));
      m.style.left = s.x + '%';
      m.style.top = s.y + '%';
      markers.push(m);
      stage.appendChild(m);
    });
    updateProgress();

    var wrap = h('div', { class: 'hotspot' }, [stage, progress]);
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openIdx >= 0) { e.stopPropagation(); close(true); }
    });
    return wrap;
  }

  // Timeline: 'vertical' lists every item; 'stepper' shows one step at a time
  // with Previous/Next and clickable step dots.
  function timelineItemBody(it) {
    return [
      it.label ? h('p', { class: 'timeline-label', text: it.label }) : null,
      it.title ? h('p', { class: 'timeline-title', text: it.title }) : null,
      it.text ? h('p', { class: 'timeline-text', text: it.text }) : null,
    ];
  }

  function renderTimeline(b) {
    var items = b.data.items || [];
    if (!items.length) return null;
    if (b.data.layout !== 'stepper') {
      var ol = h('ol', { class: 'timeline' });
      items.forEach(function (it) {
        ol.appendChild(h('li', { class: 'timeline-item' },
          [h('span', { class: 'timeline-dot' })].concat(timelineItemBody(it))));
      });
      return ol;
    }

    var index = 0;
    var seen = { 0: true };
    var dots = h('div', { class: 'stepper-dots' });
    var body = h('div', { class: 'stepper-body', 'aria-live': 'polite' });
    var counter = h('span', { class: 'stepper-count' });
    var prev = h('button', { class: 'btn btn-outline', type: 'button', text: t('prev'),
      onclick: function () { go(index - 1); } });
    var next = h('button', { class: 'btn', type: 'button', text: t('next'),
      onclick: function () { go(index + 1); } });
    var dotEls = items.map(function (it, n) {
      var d = h('button', { class: 'stepper-dot', type: 'button', text: String(n + 1),
        'aria-label': t('goToStep', { n: n + 1 }), onclick: function () { go(n); } });
      dots.appendChild(d);
      return d;
    });

    function go(n) {
      if (n < 0 || n >= items.length) return;
      index = n;
      seen[n] = true;
      dotEls.forEach(function (d, i) {
        d.className = 'stepper-dot' + (i === n ? ' active' : seen[i] ? ' seen' : '');
        if (i === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      body.innerHTML = '';
      timelineItemBody(items[n]).forEach(function (el) { if (el) body.appendChild(el); });
      counter.textContent = t('stepOf', { n: n + 1, total: items.length });
      // Keep keyboard focus alive when the focused button becomes disabled.
      var focused = document.activeElement;
      prev.disabled = n === 0;
      next.disabled = n === items.length - 1;
      if (focused === prev && prev.disabled) next.focus();
      else if (focused === next && next.disabled) prev.focus();
    }
    go(0);

    return h('div', { class: 'stepper' }, [dots, body,
      h('div', { class: 'stepper-nav' }, [prev, counter, next])]);
  }

  function renderScenario(b) {
    if ((b.data.layout || 'classic') === 'chat') return renderScenarioChat(b);
    var data = b.data;
    var wrap = h('div', { class: 'scenario' });
    function go(nodeId, emotion, moveFocus) {
      wrap.innerHTML = '';
      var node = nodeId ? (data.nodes || []).find(function (n) { return n.id === nodeId; }) : null;
      var emo = emotion || (node ? node.emotion : 'neutral');
      var avatar = data.characterImages && data.characterImages[emo];
      var col = h('div', { style: 'flex:1;min-width:0' });
      col.appendChild(h('p', { class: 'scenario-name', text: data.characterName || '' }));
      if (node) {
        col.appendChild(h('p', { class: 'scenario-text', tabindex: '-1', text: node.text }));
        var choices = h('div', { class: 'scenario-choices' });
        (node.choices || []).forEach(function (c) {
          choices.appendChild(h('button', { class: 'btn btn-outline', text: c.text, style: 'text-align:left',
            onclick: function () { go(c.nextNodeId, c.setEmotion, true); } }));
        });
        col.appendChild(choices);
      } else {
        col.appendChild(h('p', { class: 'empty scenario-text', tabindex: '-1', text: t('end') }));
        col.appendChild(h('button', { class: 'btn btn-outline', text: t('restart'),
          onclick: function () { go(data.startNodeId, null, true); } }));
      }
      var row = h('div', { class: 'scenario-row' }, [
        avatar ? h('img', { class: 'scenario-avatar', src: avatar, alt: '' }) : null,
        col,
      ]);
      wrap.appendChild(row);
      // The clicked choice is gone; move focus to the character's new line and
      // announce it.
      if (moveFocus) {
        var said = wrap.querySelector('.scenario-text');
        if (said) said.focus();
        announce((data.characterName ? data.characterName + ': ' : '') + (node ? node.text : t('end')));
      }
    }
    go(data.startNodeId);
    return wrap;
  }

  // Messenger-style scenario: an accumulating phone chat with reply bubbles.
  function renderScenarioChat(b) {
    var data = b.data;
    var nodes = data.nodes || [];
    function findNode(id) { return id ? nodes.find(function (n) { return n.id === id; }) : null; }
    var start = findNode(data.startNodeId);
    var imgs = data.characterImages || {};

    var wrap = h('div', { class: 'chat' });
    var header = h('div', { class: 'chat-header' }, [
      imgs.neutral ? h('img', { class: 'chat-avatar', src: imgs.neutral, alt: '' })
        : h('span', { class: 'chat-avatar chat-avatar-fallback', text: (data.characterName || '?').slice(0, 1).toUpperCase() }),
      h('span', { class: 'chat-name', text: data.characterName || '' }),
    ]);
    var body = h('div', { class: 'chat-body', role: 'log', 'aria-live': 'polite' });
    var replies = h('div', { class: 'chat-replies' });

    var messages = [];
    var currentId = data.startNodeId;
    var shown = 0; // messages already in the DOM

    // Appends only new messages, so the live log announces just those.
    function renderBody() {
      if (shown > messages.length) { body.innerHTML = ''; shown = 0; }
      messages.slice(shown).forEach(function (m) {
        if (m.from === 'bot') {
          var av = imgs[m.emotion];
          body.appendChild(h('div', { class: 'chat-row chat-row-bot' }, [
            av ? h('img', { class: 'chat-msg-avatar', src: av, alt: '' })
              : h('span', { class: 'chat-msg-avatar chat-avatar-fallback' }),
            h('p', { class: 'chat-bubble chat-bubble-bot', text: m.text }),
          ]));
        } else {
          body.appendChild(h('div', { class: 'chat-row chat-row-user' }, [
            h('p', { class: 'chat-bubble chat-bubble-user', text: m.text }),
            data.userAvatar ? h('img', { class: 'chat-msg-avatar', src: data.userAvatar, alt: '' }) : null,
          ]));
        }
      });
      shown = messages.length;
      body.scrollTop = body.scrollHeight;
    }

    function renderReplies(moveFocus) {
      replies.innerHTML = '';
      var node = findNode(currentId);
      if (node) {
        (node.choices || []).forEach(function (c) {
          replies.appendChild(h('button', { class: 'chat-reply', text: c.text, onclick: function () { choose(c); } }));
        });
      } else {
        replies.appendChild(h('span', { class: 'empty', text: t('end') }));
        replies.appendChild(h('button', { class: 'btn btn-outline', text: t('restart'), onclick: reset }));
      }
      // The clicked reply was removed; keep focus inside the chat.
      if (moveFocus) {
        var first = replies.querySelector('button');
        if (first) first.focus();
      }
    }

    function choose(c) {
      var target = findNode(c.nextNodeId);
      var emotion = c.setEmotion || (target ? target.emotion : 'neutral');
      messages.push({ from: 'user', text: c.text, emotion: emotion });
      if (target) messages.push({ from: 'bot', text: target.text, emotion: target.emotion });
      currentId = c.nextNodeId;
      renderBody(); renderReplies(true);
    }

    function reset() {
      messages = [];
      body.innerHTML = ''; shown = 0;
      if (start) messages.push({ from: 'bot', text: start.text, emotion: start.emotion });
      currentId = data.startNodeId;
      renderBody(); renderReplies(true);
    }

    if (start) messages.push({ from: 'bot', text: start.text, emotion: start.emotion });
    renderBody(); renderReplies();
    wrap.appendChild(header); wrap.appendChild(body); wrap.appendChild(replies);
    return wrap;
  }

  function renderQuiz(b) {
    var data = b.data;
    var answers = {};
    var submitted = false;
    var openedAt = Date.now(); // for latency on each interaction
    // Reveal correctness after submitting unless the quiz hides answers.
    var showAnswers = data.showAnswers !== false;
    var wrap = h('div', {});

    // For each matching question, scramble the right-column choices once so
    // the correct answer isn't simply the option at the same index. Stable
    // across re-renders within an attempt; re-rolled on retry.
    function shuffleArray(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }
    // Per attempt (call after clearing `answers`): matching choices, one per
    // distinct answer so several items can share a category; sequence starting
    // orders; fill-in dropdown lists.
    var matchChoices = {}, blankSegs = {}, blankOpts = {};
    function rollChoices() {
      matchChoices = {};
      (data.questions || []).forEach(function (q) {
        if (q.type === 'matching') {
          var rights = [];
          (q.pairs || []).forEach(function (p) { if (rights.indexOf(p.right) < 0) rights.push(p.right); });
          matchChoices[q.id] = shuffleArray(rights);
        } else if (q.type === 'sequence') {
          answers[q.id] = shuffledOrder((q.items || []).map(function (it) { return it.id; }));
        } else if (q.type === 'fillBlanks') {
          blankSegs[q.id] = parseBlanks(q.text || '');
          blankOpts[q.id] = blankOptions(blankSegs[q.id]);
          answers[q.id] = [];
        }
      });
    }
    rollChoices();
    // Selected answers are canonical; only typed ones honour caseSensitive.
    function strictOf(q) { return q.mode !== 'select' && !!q.caseSensitive; }

    function build(focusKey) {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      (data.questions || []).forEach(function (q, qi) {
        var ok = reveal && isCorrect(q);
        var card = h('div', { class: 'quiz-q' + (reveal ? (ok ? ' correct' : ' incorrect') : '') });
        card.appendChild(h('p', { class: 'quiz-prompt', text: (qi + 1) + '. ' + q.prompt }));

        if (q.type === 'single' || q.type === 'multiple') {
          (q.options || []).forEach(function (o) {
            var input = h('input', { type: q.type === 'single' ? 'radio' : 'checkbox', name: q.id });
            input.disabled = submitted;
            input.checked = q.type === 'single' ? answers[q.id] === o.id
              : (answers[q.id] || []).indexOf(o.id) >= 0;
            input.addEventListener('change', function () {
              if (q.type === 'single') answers[q.id] = o.id;
              else {
                var set = answers[q.id] || [];
                var pos = set.indexOf(o.id);
                if (pos >= 0) set.splice(pos, 1); else set.push(o.id);
                answers[q.id] = set;
              }
            });
            card.appendChild(h('label', { class: 'quiz-opt' }, [input, h('span', { text: o.text }),
              reveal && o.feedback && input.checked ? h('span', { class: 'empty', text: '— ' + o.feedback }) : null]));
          });
        } else if (q.type === 'sequence') {
          if (!submitted) card.appendChild(h('p', { class: 'ord-hint', text: t('sequenceHint') }));
          card.appendChild(sequenceList(q.items || [], answers[q.id], submitted, reveal, build));
        } else if (q.type === 'fillBlanks') {
          card.appendChild(blanksText(blankSegs[q.id], answers[q.id], blankOpts[q.id], q.mode === 'select',
            strictOf(q), submitted, reveal));
        } else if (q.type === 'matching') {
          var choices = matchChoices[q.id] || [];
          (q.pairs || []).forEach(function (p) {
            var sel = h('select', { 'aria-label': p.left });
            sel.disabled = submitted;
            sel.appendChild(h('option', { value: '', text: '—' }));
            choices.forEach(function (right) { sel.appendChild(h('option', { value: right, text: right })); });
            sel.value = (answers[q.id] || {})[p.id] || '';
            sel.addEventListener('change', function () {
              answers[q.id] = answers[q.id] || {};
              answers[q.id][p.id] = sel.value;
            });
            card.appendChild(h('div', { class: 'quiz-match' }, [h('span', { text: p.left }), sel]));
          });
        }

        if (reveal) {
          card.appendChild(h('p', { class: 'quiz-feedback ' + (ok ? 'passed' : 'failed') }, [
            resultIcon(ok),
            (ok ? t('correct') : t('incorrect')) + (q.feedback ? ' — ' + q.feedback : ''),
          ]));
        }
        wrap.appendChild(card);
      });

      if (submitted) {
        var score = computeScore();
        var passed = score >= data.passingScore;
        var res = h('div', { class: 'quiz-result' }, [
          h('p', { class: 'quiz-score', text: t('yourScore', { s: score }) }),
          h('p', { class: (passed ? 'passed' : 'failed'), style: 'font-weight:500;margin:4px 0 0',
            text: passed ? t('passed') : t('failed') }),
          h('button', { class: 'btn btn-outline', style: 'margin-top:12px', text: t('retry'),
            onclick: function () { submitted = false; answers = {}; rollChoices(); openedAt = Date.now(); build(); focusFirstControl(wrap); } }),
        ]);
        wrap.appendChild(res);
      } else {
        wrap.appendChild(h('button', { class: 'btn', text: (data.questions || []).length > 1 ? t('submitAll') : t('submit'),
          onclick: function () { submitted = true; build(); recordScore(); announceResult(wrap); } }));
      }
      // Rebuilding replaces the DOM; keep keyboard focus on a moved item's arrow.
      if (focusKey) {
        var f = wrap.querySelector('[data-focus="' + focusKey + '"]');
        if (f && !f.disabled) f.focus();
      }
    }

    function isCorrect(q) {
      var a = answers[q.id];
      if (q.type === 'sequence') {
        return (q.items || []).every(function (it, i) { return (a || [])[i] === it.id; });
      }
      if (q.type === 'fillBlanks') {
        var blanks = blankSegs[q.id].filter(function (seg) { return seg.kind === 'blank'; });
        return blanks.length > 0 && blanks.every(function (seg) {
          return isBlankCorrect(seg.answers, (a || [])[seg.index], strictOf(q));
        });
      }
      if (q.type === 'single') {
        var opt = (q.options || []).find(function (o) { return o.id === a; });
        return !!(opt && opt.correct);
      }
      if (q.type === 'multiple') {
        var chosen = a || [];
        var correct = (q.options || []).filter(function (o) { return o.correct; }).map(function (o) { return o.id; });
        return chosen.length === correct.length && correct.every(function (id) { return chosen.indexOf(id) >= 0; });
      }
      var map = a || {};
      return (q.pairs || []).every(function (p) { return map[p.id] === p.right; });
    }

    function computeScore() {
      var qs = data.questions || [];
      if (!qs.length) return 0;
      var c = qs.filter(isCorrect).length;
      return Math.round((c / qs.length) * 100);
    }

    function recordScore() {
      var rawScore = computeScore();
      state.quizResults[b.id] = rawScore;
      var latency = (Date.now() - openedAt) / 1000;

      // Record each question as a SCORM interaction (LMS analytics).
      (data.questions || []).forEach(function (q) {
        var a = answers[q.id];
        if (q.type === 'fillBlanks') {
          // One fill-in interaction per blank, as in the fill-in-the-blanks block.
          blankSegs[q.id].forEach(function (seg) {
            if (seg.kind !== 'blank') return;
            SCORM.recordInteraction(state.interactionIndex++, {
              id: q.id + '_' + (seg.index + 1),
              type: 'fill-in',
              interactionType: 'fill-in',
              response: String((a || [])[seg.index] || '').trim(),
              correct: isBlankCorrect(seg.answers, (a || [])[seg.index], strictOf(q)),
              weight: 1,
              latencySec: latency,
              description: q.prompt + ' — ' + t('blankN', { n: seg.index + 1 }),
              correctResponses: seg.answers.slice(),
              caseMatters: strictOf(q),
              objectiveId: 'QUIZ_' + b.id,
            });
          });
          return;
        }
        if (q.type === 'sequence') {
          SCORM.recordInteraction(state.interactionIndex++, {
            id: q.id,
            type: 'sequencing',
            interactionType: 'sequencing',
            response: (a || []).slice(),
            correct: isCorrect(q),
            weight: 1,
            latencySec: latency,
            description: q.prompt,
            correctResponses: [(q.items || []).map(function (it) { return it.id; })],
            choices: (q.items || []).map(function (it) { return { id: it.id, text: it.text }; }),
            objectiveId: 'QUIZ_' + b.id,
          });
          return;
        }
        var pairs = q.pairs || [];
        // Matching targets are identified by pair id (the right-hand text is
        // free-form, not a valid identifier). Pairs sharing the same right-hand
        // text are one target: the first pair carrying that text.
        function targetId(rightText) {
          var p = pairs.find(function (x) { return x.right === rightText; });
          return p ? p.id : '';
        }
        // Responses/patterns are passed as arrays; the runtime joins them with
        // its own delimiters (SCORM 1.2 `,` `.`, SCORM 2004 / xAPI `[,]` `[.]`).
        var resp;
        if (q.type === 'matching') {
          resp = pairs.filter(function (p) { return a && a[p.id] && targetId(a[p.id]); })
            .map(function (p) { return [p.id, targetId(a[p.id])]; });
        } else if (Array.isArray(a)) {
          resp = a.slice();
        } else {
          resp = a || '';
        }
        // Correct response pattern, in the same notation as the response.
        var correct;
        if (q.type === 'matching') {
          correct = [pairs.map(function (p) { return [p.id, targetId(p.right)]; })];
        } else if (q.type === 'multiple') {
          correct = [(q.options || []).filter(function (o) { return o.correct; }).map(function (o) { return o.id; })];
        } else {
          var single = (q.options || []).find(function (o) { return o.correct; });
          correct = single ? [single.id] : [];
        }
        // Build interaction object — extra fields are ignored by SCORM, used by xAPI.
        var inter = {
          id: q.id,
          type: q.type === 'matching' ? 'matching' : 'choice',
          interactionType: q.type === 'matching' ? 'matching' : 'choice',
          response: resp,
          correct: isCorrect(q),
          weight: 1,
          latencySec: latency,
          description: q.prompt,
          correctResponses: correct,
          objectiveId: 'QUIZ_' + b.id,
        };
        if (q.type === 'matching') {
          inter.source = pairs.map(function (p) { return { id: p.id, text: p.left }; });
          inter.target = pairs.filter(function (p) { return targetId(p.right) === p.id; })
            .map(function (p) { return { id: p.id, text: p.right }; });
        } else {
          inter.choices = (q.options || []).map(function (o) { return { id: o.id, text: o.text }; });
        }
        SCORM.recordInteraction(state.interactionIndex++, inter);
      });

      // One objective per quiz. Passing threshold is the quiz's own passingScore.
      var passed = rawScore >= (data.passingScore || 0);
      SCORM.setObjective(state.quizIndexById[b.id] || 0, {
        id: 'QUIZ_' + b.id,
        name: 'Quiz ' + b.id,
        raw: rawScore, min: 0, max: 100,
        status: 'completed',
        success: passed ? 'passed' : 'failed',
      });

      reportProgress();
      // Answering a quiz can satisfy the linear-navigation gate; update the
      // advance button in place (the quiz re-renders itself, not the whole page).
      refreshGating();
    }

    build();
    return wrap;
  }

  // ── Scored exercises (ordering, fill in the blanks) ──────────────────────
  // Scoring mirrors src/blocks/ordering.ts and src/blocks/fillBlanks.ts.

  // Fisher–Yates; with 2+ items never returns the input order (a free score).
  function shuffledOrder(ids) {
    var out = ids.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    if (out.length > 1 && out.every(function (id, k) { return id === ids[k]; })) out.push(out.shift());
    return out;
  }

  // Store a scored block's result and report it like a quiz: objective
  // 'QUIZ_<id>' (the manifest declares the same ids), course score, gating.
  function commitExerciseScore(b, rawScore, label) {
    state.quizResults[b.id] = rawScore;
    var passed = rawScore >= (b.data.passingScore || 0);
    SCORM.setObjective(state.quizIndexById[b.id] || 0, {
      id: 'QUIZ_' + b.id,
      name: label + ' ' + b.id,
      raw: rawScore, min: 0, max: 100,
      status: 'completed',
      success: passed ? 'passed' : 'failed',
    });
    reportProgress();
    refreshGating();
  }

  // Submit button, or the score panel with "Try again" once submitted.
  // ✓ / ✗ glyph so correctness is never conveyed by color alone (the text
  // next to it carries the meaning for screen readers).
  function resultIcon(ok) {
    return h('span', { class: 'result-icon', 'aria-hidden': 'true', text: ok ? '✓' : '✗' });
  }
  // Icon plus screen-reader text, for items whose visible label is not a verdict.
  function resultMark(ok) {
    return h('span', { class: 'result-mark ' + (ok ? 'passed' : 'failed') }, [
      resultIcon(ok), h('span', { class: 'sr-only', text: ok ? t('correct') : t('incorrect') }),
    ]);
  }
  // After submitting: the Submit button is gone, so move focus to the result
  // panel and announce the score.
  function announceResult(wrap) {
    var res = wrap.querySelector('.quiz-result');
    if (!res) return;
    res.setAttribute('tabindex', '-1');
    res.focus();
    var parts = Array.prototype.map.call(res.querySelectorAll('p'), function (p) { return p.textContent; });
    announce(parts.join('. '));
  }
  function focusFirstControl(wrap) {
    var el = wrap.querySelector('input:not([disabled]), select:not([disabled]), button:not([disabled])');
    if (el) el.focus();
  }

  function exerciseFooter(submitted, score, passingScore, onSubmit, onRetry) {
    if (!submitted) return h('button', { class: 'btn', text: t('submit'), onclick: onSubmit });
    var passed = score >= passingScore;
    return h('div', { class: 'quiz-result' }, [
      h('p', { class: 'quiz-score', text: t('yourScore', { s: score }) }),
      h('p', { class: (passed ? 'passed' : 'failed'), style: 'font-weight:500;margin:4px 0 0',
        text: passed ? t('passed') : t('failed') }),
      h('button', { class: 'btn btn-outline', style: 'margin-top:12px', text: t('retry'), onclick: onRetry }),
    ]);
  }

  // Native drag & drop for mouse; the arrow buttons / selects cover
  // keyboard and touch (HTML5 DnD is unreliable on mobile).
  var dragId = null;
  function makeDraggable(el, id) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function (e) {
      dragId = id;
      el.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* old browsers */ }
    });
    el.addEventListener('dragend', function () { dragId = null; el.classList.remove('dragging'); });
  }
  function makeDropTarget(el, onDrop) {
    el.addEventListener('dragover', function (e) { if (dragId) { e.preventDefault(); el.classList.add('drop-over'); } });
    el.addEventListener('dragleave', function () { el.classList.remove('drop-over'); });
    el.addEventListener('drop', function (e) {
      e.preventDefault();
      el.classList.remove('drop-over');
      if (dragId) { var id = dragId; dragId = null; onDrop(id); }
    });
  }

  // "Put in order" list shared by the ordering block and quiz sequence
  // questions. `items` are in the correct order; `order` (the learner's item
  // ids) is rearranged in place, then `rebuild(focusKey)` re-renders the owner
  // and refocuses the control carrying that data-focus key.
  function sequenceList(items, order, submitted, reveal, rebuild) {
    var ids = items.map(function (it) { return it.id; });
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    function moveTo(id, to) {
      var from = order.indexOf(id);
      if (from < 0 || to < 0 || to >= order.length || from === to) return;
      order.splice(from, 1);
      order.splice(to, 0, id);
    }
    var list = h('ol', { class: 'ord-list' });
    order.forEach(function (id, i) {
      var it = byId[id];
      var right = ids.indexOf(id);
      var li = h('li', { class: 'ord-item' + (reveal ? (right === i ? ' correct' : ' incorrect') : '') });
      if (!submitted) {
        li.appendChild(h('span', { class: 'ord-handle', 'aria-hidden': 'true', title: t('dragItem'), html: GRIP_ICON }));
        makeDraggable(li, id);
        makeDropTarget(li, function (dragged) { moveTo(dragged, order.indexOf(id)); rebuild(); });
      }
      if (reveal) li.appendChild(resultMark(right === i));
      li.appendChild(h('span', { class: 'ord-text', text: it.text }));
      if (reveal && right !== i) li.appendChild(h('span', { class: 'ord-note', text: t('correctPosition', { n: right + 1 }) }));
      if (!submitted) {
        li.appendChild(h('button', { class: 'ord-arrow', type: 'button', text: '↑', 'data-focus': id + ':up',
          'aria-label': t('moveUp') + ': ' + it.text, disabled: i === 0 ? 'true' : null,
          onclick: function () { moveTo(id, i - 1); rebuild(id + ':up'); } }));
        li.appendChild(h('button', { class: 'ord-arrow', type: 'button', text: '↓', 'data-focus': id + ':down',
          'aria-label': t('moveDown') + ': ' + it.text, disabled: i === order.length - 1 ? 'true' : null,
          onclick: function () { moveTo(id, i + 1); rebuild(id + ':down'); } }));
      }
      list.appendChild(li);
    });
    return list;
  }

  function renderOrdering(b) {
    var data = b.data;
    var items = data.items || [];
    var categories = data.categories || [];
    var isSequence = data.mode !== 'categories';
    var showAnswers = data.showAnswers !== false;
    var ids = items.map(function (it) { return it.id; });
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var order, assigned, submitted, openedAt;
    var wrap = h('div', { class: 'ord' });

    function reset() { order = shuffledOrder(ids); assigned = {}; submitted = false; openedAt = Date.now(); }

    function computeScore() {
      if (!items.length) return 0;
      var ok = items.filter(function (it, i) {
        return isSequence ? order[i] === it.id : (!!it.categoryId && assigned[it.id] === it.categoryId);
      }).length;
      return Math.round((ok / items.length) * 100);
    }

    function categoryTitle(id) {
      var c = categories.find(function (x) { return x.id === id; });
      return c ? c.title : '';
    }

    function build(focusKey) {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      if (data.prompt) wrap.appendChild(h('p', { class: 'quiz-prompt', text: data.prompt }));
      if (!submitted) wrap.appendChild(h('p', { class: 'ord-hint', text: t(isSequence ? 'sequenceHint' : 'categoriesHint') }));
      if (isSequence) buildSequence(reveal); else buildCategories(reveal);
      wrap.appendChild(exerciseFooter(submitted, computeScore(), data.passingScore,
        function () { submitted = true; build(); recordScore(); announceResult(wrap); },
        function () { reset(); build(); focusFirstControl(wrap); }));
      // Rebuilding replaces the DOM; keep keyboard focus on the moved control.
      if (focusKey) {
        var f = wrap.querySelector('[data-focus="' + focusKey + '"]');
        if (f && !f.disabled) f.focus();
      }
    }

    function buildSequence(reveal) {
      wrap.appendChild(sequenceList(items, order, submitted, reveal, build));
    }

    function chip(id, inCategory, reveal) {
      var it = byId[id];
      var ok = !!inCategory && it.categoryId === inCategory;
      var el = h('div', { class: 'ord-item' + (reveal ? (ok ? ' correct' : ' incorrect') : '') });
      if (!submitted) {
        el.appendChild(h('span', { class: 'ord-handle', 'aria-hidden': 'true', title: t('dragItem'), html: GRIP_ICON }));
        makeDraggable(el, id);
      }
      if (reveal) el.appendChild(resultMark(ok));
      el.appendChild(h('span', { class: 'ord-text', text: it.text }));
      if (reveal && !ok && categoryTitle(it.categoryId)) {
        el.appendChild(h('span', { class: 'ord-note', text: t('correctCategory', { c: categoryTitle(it.categoryId) }) }));
      }
      var sel = h('select', { 'aria-label': t('chooseCategory') + ': ' + it.text, 'data-focus': id + ':sel' });
      sel.disabled = submitted;
      sel.appendChild(h('option', { value: '', text: '—' }));
      categories.forEach(function (c) { sel.appendChild(h('option', { value: c.id, text: c.title })); });
      sel.value = assigned[id] || '';
      sel.addEventListener('change', function () { assigned[id] = sel.value || undefined; build(id + ':sel'); });
      el.appendChild(sel);
      return el;
    }

    function bin(catId, title, reveal) {
      var el = h('div', { class: 'ord-bin' }, h('p', { class: 'ord-bin-title', text: title }));
      order.forEach(function (id) {
        if ((assigned[id] || null) === catId) el.appendChild(chip(id, catId, reveal));
      });
      if (!submitted) makeDropTarget(el, function (dragged) { assigned[dragged] = catId || undefined; build(); });
      return el;
    }

    function buildCategories(reveal) {
      wrap.appendChild(bin(null, t('unsorted'), reveal));
      var grid = h('div', { class: 'ord-bins' });
      categories.forEach(function (c) { grid.appendChild(bin(c.id, c.title, reveal)); });
      wrap.appendChild(grid);
    }

    function recordScore() {
      var rawScore = computeScore();
      var inter = {
        id: b.id,
        response: '',
        correct: rawScore === 100,
        weight: 1,
        latencySec: (Date.now() - openedAt) / 1000,
        description: data.prompt || '',
        objectiveId: 'QUIZ_' + b.id,
      };
      // Array responses are formatted per runtime (SCORM 1.2 / 2004 / xAPI).
      if (isSequence) {
        inter.type = inter.interactionType = 'sequencing';
        inter.response = order.slice();
        inter.correctResponses = [ids.slice()];
        inter.choices = items.map(function (it) { return { id: it.id, text: it.text }; });
      } else {
        inter.type = inter.interactionType = 'matching';
        inter.response = items.filter(function (it) { return assigned[it.id]; })
          .map(function (it) { return [it.id, assigned[it.id]]; });
        inter.correctResponses = [items.filter(function (it) { return it.categoryId; })
          .map(function (it) { return [it.id, it.categoryId]; })];
        inter.source = items.map(function (it) { return { id: it.id, text: it.text }; });
        inter.target = categories.map(function (c) { return { id: c.id, text: c.title }; });
      }
      SCORM.recordInteraction(state.interactionIndex++, inter);
      commitExerciseScore(b, rawScore, 'Ordering');
    }

    reset();
    build();
    return wrap;
  }

  // Blanks are `[answer|alternative]`; see parseBlanks in src/blocks/fillBlanks.ts.
  function parseBlanks(text) {
    var out = [], last = 0, index = 0, m;
    var re = /\[([^[\]\n]*)\]/g;
    function pushText(s) {
      if (!s) return;
      var prev = out[out.length - 1];
      if (prev && prev.kind === 'text') prev.text += s; else out.push({ kind: 'text', text: s });
    }
    while ((m = re.exec(text)) !== null) {
      var answers = m[1].split('|').map(function (a) { return a.trim(); }).filter(Boolean);
      pushText(text.slice(last, m.index));
      if (answers.length) out.push({ kind: 'blank', index: index++, answers: answers });
      else pushText(m[0]);
      last = m.index + m[0].length;
    }
    pushText(text.slice(last));
    return out;
  }
  function normalizeAnswer(v, caseSensitive) {
    var s = String(v).trim().replace(/\s+/g, ' ');
    return caseSensitive ? s : s.toLowerCase();
  }
  function isBlankCorrect(answers, response, caseSensitive) {
    if (!response) return false;
    var r = normalizeAnswer(response, caseSensitive);
    return answers.some(function (a) { return normalizeAnswer(a, caseSensitive) === r; });
  }

  // Every blank's canonical answer once, shuffled: the 'select' mode list.
  function blankOptions(segments) {
    var seen = {}, canon = [];
    segments.forEach(function (s) {
      if (s.kind === 'blank' && !seen[s.answers[0]]) { seen[s.answers[0]] = true; canon.push(s.answers[0]); }
    });
    return shuffledOrder(canon);
  }

  // Text with inline blanks, shared by the fill-in-the-blanks block and quiz
  // fill-in questions. `responses` (by blank index) is filled in place.
  function blanksText(segments, responses, options, isSelect, strict, submitted, reveal) {
    var p = h('p', { class: 'fib-text' });
    segments.forEach(function (s) {
      if (s.kind === 'text') { p.appendChild(document.createTextNode(s.text)); return; }
      var ok = isBlankCorrect(s.answers, responses[s.index], strict);
      var cls = 'fib-blank' + (reveal ? (ok ? ' correct' : ' incorrect') : '');
      var field;
      if (isSelect) {
        field = h('select', { class: cls, 'aria-label': t('blankN', { n: s.index + 1 }) });
        field.appendChild(h('option', { value: '', text: '—' }));
        options.forEach(function (o) { field.appendChild(h('option', { value: o, text: o })); });
        field.value = responses[s.index] || '';
        field.addEventListener('change', function () { responses[s.index] = field.value; });
      } else {
        field = h('input', { class: cls, type: 'text', autocomplete: 'off', spellcheck: 'false',
          size: String(Math.max(6, s.answers[0].length + 2)), 'aria-label': t('blankN', { n: s.index + 1 }) });
        field.value = responses[s.index] || '';
        field.addEventListener('input', function () { responses[s.index] = field.value; });
      }
      field.disabled = submitted;
      p.appendChild(field);
      if (reveal) p.appendChild(resultMark(ok));
      if (reveal && !ok) p.appendChild(h('span', { class: 'fib-answer', text: t('correctAnswer', { a: s.answers[0] }) }));
    });
    return p;
  }

  function renderFillBlanks(b) {
    var data = b.data;
    var isSelect = data.mode === 'select';
    // Selected answers are canonical; only typed ones honour caseSensitive.
    var strict = !isSelect && !!data.caseSensitive;
    var showAnswers = data.showAnswers !== false;
    var segments = parseBlanks(data.text || '');
    var blanks = segments.filter(function (s) { return s.kind === 'blank'; });
    var responses, submitted, openedAt, options;
    var wrap = h('div', { class: 'fib' });

    function reset() {
      responses = []; submitted = false; openedAt = Date.now();
      options = blankOptions(segments);
    }

    function computeScore() {
      if (!blanks.length) return 0;
      var ok = blanks.filter(function (s) { return isBlankCorrect(s.answers, responses[s.index], strict); }).length;
      return Math.round((ok / blanks.length) * 100);
    }

    function build() {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      wrap.appendChild(blanksText(segments, responses, options, isSelect, strict, submitted, reveal));
      wrap.appendChild(exerciseFooter(submitted, computeScore(), data.passingScore,
        function () { submitted = true; build(); recordScore(); announceResult(wrap); },
        function () { reset(); build(); focusFirstControl(wrap); }));
    }

    function recordScore() {
      var rawScore = computeScore();
      var latency = (Date.now() - openedAt) / 1000;
      // Context for LMS reports: the text with every blank shown as ___.
      var context = segments.map(function (s) { return s.kind === 'text' ? s.text : '___'; }).join('');
      // One fill-in interaction per blank; every accepted alternative is a
      // correct-response pattern (SCORM 1.2 keeps only the first).
      blanks.forEach(function (s) {
        SCORM.recordInteraction(state.interactionIndex++, {
          id: b.id + '_' + (s.index + 1),
          type: 'fill-in',
          interactionType: 'fill-in',
          response: String(responses[s.index] || '').trim(),
          correct: isBlankCorrect(s.answers, responses[s.index], strict),
          weight: 1,
          latencySec: latency,
          description: t('blankN', { n: s.index + 1 }) + ': ' + context,
          correctResponses: s.answers.slice(),
          caseMatters: strict,
          objectiveId: 'QUIZ_' + b.id,
        });
      });
      commitExerciseScore(b, rawScore, 'Fill in the blanks');
    }

    reset();
    build();
    return wrap;
  }

  // Boot. Course data is embedded as a global by course-data.js (loaded via a
  // <script> tag before this file). We deliberately avoid fetch()/XHR here:
  // many LMS environments sandbox the SCO or serve its files from a CDN that
  // rejects runtime requests for sibling files (404/400/403/CORS), while
  // <script>/<link>/<img> loads work fine.
  if (window.__SCORMLY_COURSE__) {
    start(window.__SCORMLY_COURSE__);
  } else {
    document.getElementById('app').appendChild(
      h('p', { class: 'empty', style: 'padding:2rem', text: 'Course data not found' })
    );
  }
})();
