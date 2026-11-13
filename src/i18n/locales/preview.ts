import type { LocaleTable } from '../types'

// Learner preview (read-only course view) strings.
const preview: LocaleTable = {
  en: {
    title: 'Preview',
    open: 'Preview',
    close: 'Close preview',
    prev: 'Previous',
    next: 'Next',
    progress: 'Lesson {n} of {total}',
    empty: 'This lesson has no content yet.',
    finish: 'Finish',
    courseComplete: 'Course complete',
    courseCompleteText: 'You have reached the end of the course.',
    review: 'Review the course',

    // Quiz
    submit: 'Submit answer',
    submitAll: 'Submit answers',
    retry: 'Try again',
    correct: 'Correct',
    incorrect: 'Incorrect',
    selectAnswer: 'Select an answer',
    yourScore: 'Your score: {score}%',
    passed: 'Passed',
    failed: 'Not passed',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Complete the test',
    autoTestHint: 'Preview only: answers the questions and submits, so you can check the result.',
    autoPass: 'Passed',
    autoFail: 'Not passed',
    autoPassOff: 'This test can’t be passed — check its correct answers.',
    autoFailOff: 'This test can’t be failed — check its passing score.',

    // Scenario
    restart: 'Restart',
    end: 'The end',

    // Flashcards
    flipHint: 'Click to flip',
  },
  uk: {
    title: 'Перегляд',
    open: 'Перегляд',
    close: 'Закрити перегляд',
    prev: 'Назад',
    next: 'Далі',
    progress: 'Урок {n} з {total}',
    empty: 'У цьому уроці ще немає контенту.',
    finish: 'Завершити',
    courseComplete: 'Курс завершено',
    courseCompleteText: 'Ви пройшли курс до кінця.',
    review: 'Переглянути курс',

    // Quiz
    submit: 'Відповісти',
    submitAll: 'Надіслати відповіді',
    retry: 'Спробувати ще раз',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    selectAnswer: 'Оберіть відповідь',
    yourScore: 'Ваш результат: {score}%',
    passed: 'Складено',
    failed: 'Не складено',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Пройти тест',
    autoTestHint: 'Лише в перегляді: відповідає на запитання й надсилає тест, щоб перевірити результат.',
    autoPass: 'Успішно',
    autoFail: 'Неуспішно',
    autoPassOff: 'Цей тест неможливо скласти — перевірте правильні відповіді.',
    autoFailOff: 'Цей тест неможливо не скласти — перевірте прохідний бал.',

    // Scenario
    restart: 'Спочатку',
    end: 'Кінець',

    // Flashcards
    flipHint: 'Клікніть, щоб перевернути',
  },
  fr: {
    title: 'Aperçu',
    open: 'Aperçu',
    close: 'Fermer l’aperçu',
    prev: 'Précédent',
    next: 'Suivant',
    progress: 'Leçon {n} sur {total}',
    empty: 'Cette leçon n’a pas encore de contenu.',
    finish: 'Terminer',
    courseComplete: 'Cours terminé',
    courseCompleteText: 'Vous avez atteint la fin du cours.',
    review: 'Revoir le cours',

    // Quiz
    submit: 'Valider la réponse',
    submitAll: 'Valider les réponses',
    retry: 'Réessayer',
    correct: 'Correct',
    incorrect: 'Incorrect',
    selectAnswer: 'Sélectionnez une réponse',
    yourScore: 'Votre score : {score} %',
    passed: 'Réussi',
    failed: 'Non réussi',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Passer le test',
    autoTestHint: 'Aperçu uniquement : répond aux questions et les valide, pour que vous puissiez vérifier le résultat.',
    autoPass: 'Réussi',
    autoFail: 'Non réussi',
    autoPassOff: 'Ce test ne peut pas être réussi — vérifiez ses bonnes réponses.',
    autoFailOff: 'Ce test ne peut pas être raté — vérifiez son score de réussite.',

    // Scenario
    restart: 'Recommencer',
    end: 'Fin',

    // Flashcards
    flipHint: 'Cliquez pour retourner',
  },
  es: {
    title: 'Vista previa',
    open: 'Vista previa',
    close: 'Cerrar la vista previa',
    prev: 'Anterior',
    next: 'Siguiente',
    progress: 'Lección {n} de {total}',
    empty: 'Esta lección aún no tiene contenido.',
    finish: 'Finalizar',
    courseComplete: 'Curso completado',
    courseCompleteText: 'Has llegado al final del curso.',
    review: 'Repasar el curso',

    // Quiz
    submit: 'Enviar respuesta',
    submitAll: 'Enviar respuestas',
    retry: 'Intentar de nuevo',
    correct: 'Correcto',
    incorrect: 'Incorrecto',
    selectAnswer: 'Selecciona una respuesta',
    yourScore: 'Tu puntuación: {score} %',
    passed: 'Aprobado',
    failed: 'No aprobado',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Completar la prueba',
    autoTestHint: 'Solo en la vista previa: responde las preguntas y las envía, para que puedas comprobar el resultado.',
    autoPass: 'Aprobado',
    autoFail: 'No aprobado',
    autoPassOff: 'Esta prueba no se puede aprobar — revisa sus respuestas correctas.',
    autoFailOff: 'Esta prueba no se puede suspender — revisa su puntuación mínima.',

    // Scenario
    restart: 'Reiniciar',
    end: 'Fin',

    // Flashcards
    flipHint: 'Haz clic para girar',
  },
  de: {
    title: 'Vorschau',
    open: 'Vorschau',
    close: 'Vorschau schließen',
    prev: 'Zurück',
    next: 'Weiter',
    progress: 'Lektion {n} von {total}',
    empty: 'Diese Lektion hat noch keinen Inhalt.',
    finish: 'Beenden',
    courseComplete: 'Kurs abgeschlossen',
    courseCompleteText: 'Sie haben das Ende des Kurses erreicht.',
    review: 'Kurs wiederholen',

    // Quiz
    submit: 'Antwort abgeben',
    submitAll: 'Antworten abgeben',
    retry: 'Erneut versuchen',
    correct: 'Richtig',
    incorrect: 'Falsch',
    selectAnswer: 'Wählen Sie eine Antwort',
    yourScore: 'Ihr Ergebnis: {score} %',
    passed: 'Bestanden',
    failed: 'Nicht bestanden',
    // Author shortcut on quizzes (preview window only)
    autoTest: 'Test absolvieren',
    autoTestHint: 'Nur in der Vorschau: beantwortet die Fragen und gibt sie ab, damit Sie das Ergebnis prüfen können.',
    autoPass: 'Bestanden',
    autoFail: 'Nicht bestanden',
    autoPassOff: 'Dieser Test kann nicht bestanden werden – prüfen Sie die richtigen Antworten.',
    autoFailOff: 'In diesem Test kann man nicht durchfallen – prüfen Sie die Bestehensgrenze.',

    // Scenario
    restart: 'Neu starten',
    end: 'Ende',

    // Flashcards
    flipHint: 'Zum Umdrehen klicken',
  },
}

export default preview
