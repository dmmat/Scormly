import type { Language } from '../src/i18n/types.ts'

// The structured-data text of index.html (the SoftwareApplication JSON-LD, the
// WebSite description and the Twitter image alt), per language. The English
// entries must match index.html exactly: seoPrerender swaps them for the
// translation on each language page and fails the build if one is not found.
// Keep double quotes out of the strings (they sit inside JSON).
export interface LdText {
  description: string
  siteDescription: string
  imageAlt: string
  features: string[]
}

export const LD: Record<Language, LdText> = {
  en: {
    description:
      'Free, open-source SCORM editor and course builder (SCORM authoring tool) that runs online in the browser and exports SCORM 1.2 / 2004 and cmi5 (xAPI) packages for any LMS. No backend, no account — courses are kept in the browser, in a folder on disk or as a project .zip, and never leave the device.',
    siteDescription: 'Free, open-source SCORM editor and course builder that works online in the browser.',
    imageAlt: 'Scormly — build interactive courses and export to SCORM',
    features: [
      'Block-based course editor with drag-and-drop, undo/redo and insert-anywhere',
      'SCORM 1.2, SCORM 2004 (4th edition) and cmi5 (xAPI) export with resume, scores and question interactions',
      'Pre-export course check, including accessibility gaps',
      'Quizzes mixing single, multiple, matching, ordering and fill-in-the-blanks questions',
      'Branching dialogue scenarios with classic, chat and scene layouts and a built-in library of characters and backgrounds, flashcards, image hotspots and reflection',
      'Process diagrams, step-by-step guides, timelines, comparison tables and before / after sliders',
      'Widget block: custom HTML / CSS / JavaScript or an uploaded page, styled to match the course',
      'Cover page, 10 themes and a custom theme, block backgrounds and ready-made block templates',
      'Review comments on blocks, shared through the project .zip, with no accounts',
      'Projects kept in the browser, in a folder on disk or as a project .zip',
      'AI-ready: AGENTS.md in every project documents the course format for AI assistants',
      'Accessible courses designed to help meet WCAG 2.1 AA: keyboard and screen-reader support, captions and transcripts, a learner accessibility menu',
      'Player interface in 8 languages; editor in English, Ukrainian, French, Spanish and German',
      'Guided tour, in-app Q&A and keyboard shortcuts',
      'Installable web app (PWA)',
      'Local-first: no backend, data stays on device',
    ],
  },
  uk: {
    description:
      'Безкоштовний SCORM-редактор і конструктор курсів із відкритим кодом (інструмент для авторів SCORM), що працює онлайн у браузері й експортує пакети SCORM 1.2 / 2004 та cmi5 (xAPI) для будь-якої LMS. Без сервера й акаунта — курси зберігаються в браузері, у теці на диску або як .zip проєкту й ніколи не залишають пристрій.',
    siteDescription: 'Безкоштовний SCORM-редактор і конструктор курсів із відкритим кодом, що працює онлайн у браузері.',
    imageAlt: 'Scormly — створюйте інтерактивні курси й експортуйте їх у SCORM',
    features: [
      'Блоковий редактор курсів із перетягуванням, скасуванням/поверненням дій і вставкою будь-де',
      'Експорт SCORM 1.2, SCORM 2004 (4-те видання) та cmi5 (xAPI) із продовженням, оцінками й відповідями на запитання',
      'Перевірка курсу перед експортом, зокрема прогалини в доступності',
      'Тести, що поєднують запитання з однією чи кількома відповідями, на відповідність, на порядок і з пропусками',
      'Розгалужені діалогові сценарії з класичним виглядом, чатом і сценою, вбудована бібліотека персонажів і фонів, флешкартки, інтерактивні зони на зображеннях і рефлексія',
      'Схеми процесів, покрокові інструкції, хронологічні стрічки, таблиці порівняння та слайдери «до / після»',
      'Блок «Віджет»: власний HTML / CSS / JavaScript або завантажена сторінка зі стилем курсу',
      'Обкладинка, 10 тем і власна тема, фони блоків та готові шаблони блоків',
      'Коментарі до блоків для рецензування, що передаються через .zip проєкту, без акаунтів',
      'Проєкти в браузері, у теці на диску або як .zip проєкту',
      'Готовність до ШІ: AGENTS.md у кожному проєкті описує формат курсу для ШІ-асистентів',
      'Доступні курси, розроблені для відповідності WCAG 2.1 AA: клавіатура й екранні читачі, субтитри та транскрипти, меню доступності для учня',
      'Інтерфейс плеєра 8 мовами; редактор англійською, українською, французькою, іспанською та німецькою',
      'Екскурсія, запитання й відповіді в застосунку та клавіатурні скорочення',
      'Встановлюваний вебзастосунок (PWA)',
      'Local-first: без сервера, дані лишаються на пристрої',
    ],
  },
  fr: {
    description:
      'Éditeur SCORM et outil de création de cours gratuit et open source (outil auteur SCORM) qui fonctionne en ligne dans le navigateur et exporte des paquets SCORM 1.2 / 2004 et cmi5 (xAPI) pour tout LMS. Pas de serveur, pas de compte : les cours restent dans le navigateur, dans un dossier sur le disque ou dans un .zip de projet, et ne quittent jamais l’appareil.',
    siteDescription: 'Éditeur SCORM et outil de création de cours gratuit et open source, qui fonctionne en ligne dans le navigateur.',
    imageAlt: 'Scormly — créez des cours interactifs et exportez-les en SCORM',
    features: [
      'Éditeur de cours par blocs avec glisser-déposer, annuler/rétablir et insertion n’importe où',
      'Export SCORM 1.2, SCORM 2004 (4e édition) et cmi5 (xAPI) avec reprise, scores et interactions des questions',
      'Contrôle du cours avant l’export, y compris les lacunes d’accessibilité',
      'Quiz mêlant questions à choix unique, à choix multiples, d’appariement, d’ordre et à trous',
      'Scénarios de dialogue ramifiés avec dispositions classique, chat et scène, bibliothèque intégrée de personnages et d’arrière-plans, cartes mémoire, zones interactives sur image et réflexion',
      'Schémas de processus, guides pas à pas, frises chronologiques, tableaux comparatifs et curseurs avant / après',
      'Bloc Widget : HTML / CSS / JavaScript personnalisé ou page importée, au style du cours',
      'Page de couverture, 10 thèmes et un thème personnalisé, arrière-plans de blocs et modèles de blocs prêts à l’emploi',
      'Commentaires de relecture sur les blocs, partagés via le .zip du projet, sans compte',
      'Projets conservés dans le navigateur, dans un dossier sur le disque ou dans un .zip de projet',
      'Prêt pour l’IA : AGENTS.md dans chaque projet décrit le format du cours pour les assistants IA',
      'Cours accessibles conçus pour répondre aux WCAG 2.1 AA : clavier et lecteurs d’écran, sous-titres et transcriptions, menu d’accessibilité pour l’apprenant',
      'Interface du lecteur en 8 langues ; éditeur en anglais, ukrainien, français, espagnol et allemand',
      'Visite guidée, questions-réponses intégrées et raccourcis clavier',
      'Application web installable (PWA)',
      'Local d’abord : pas de serveur, les données restent sur l’appareil',
    ],
  },
  es: {
    description:
      'Editor SCORM y creador de cursos gratuito y de código abierto (herramienta de autor SCORM) que funciona en línea en el navegador y exporta paquetes SCORM 1.2 / 2004 y cmi5 (xAPI) para cualquier LMS. Sin servidor ni cuenta: los cursos se guardan en el navegador, en una carpeta del disco o como .zip de proyecto y nunca salen del dispositivo.',
    siteDescription: 'Editor SCORM y creador de cursos gratuito y de código abierto que funciona en línea en el navegador.',
    imageAlt: 'Scormly — crea cursos interactivos y expórtalos a SCORM',
    features: [
      'Editor de cursos por bloques con arrastrar y soltar, deshacer/rehacer e inserción en cualquier lugar',
      'Exportación a SCORM 1.2, SCORM 2004 (4.ª edición) y cmi5 (xAPI) con reanudación, puntuaciones e interacciones de las preguntas',
      'Comprobación del curso antes de exportar, incluidas las carencias de accesibilidad',
      'Cuestionarios que combinan preguntas de opción única, múltiple, de emparejar, de ordenar y de rellenar huecos',
      'Escenarios de diálogo ramificados con disposición clásica, de chat y de escena, biblioteca integrada de personajes y fondos, tarjetas, zonas interactivas en imágenes y reflexión',
      'Diagramas de proceso, guías paso a paso, líneas de tiempo, tablas comparativas y controles deslizantes de antes / después',
      'Bloque Widget: HTML / CSS / JavaScript propio o una página subida, con el estilo del curso',
      'Portada, 10 temas y un tema personalizado, fondos de bloque y plantillas de bloque listas para usar',
      'Comentarios de revisión en los bloques, compartidos mediante el .zip del proyecto, sin cuentas',
      'Proyectos guardados en el navegador, en una carpeta del disco o como .zip de proyecto',
      'Preparado para la IA: AGENTS.md en cada proyecto describe el formato del curso para los asistentes de IA',
      'Cursos accesibles diseñados para cumplir las WCAG 2.1 AA: teclado y lectores de pantalla, subtítulos y transcripciones, menú de accesibilidad para el alumno',
      'Interfaz del reproductor en 8 idiomas; editor en inglés, ucraniano, francés, español y alemán',
      'Visita guiada, preguntas y respuestas en la aplicación y atajos de teclado',
      'Aplicación web instalable (PWA)',
      'Local primero: sin servidor, los datos se quedan en el dispositivo',
    ],
  },
  de: {
    description:
      'Kostenloser Open-Source-SCORM-Editor und Kursersteller (SCORM-Autorentool), der online im Browser läuft und SCORM-1.2/2004- sowie cmi5-(xAPI-)Pakete für jedes LMS exportiert. Ohne Server, ohne Konto: Kurse liegen im Browser, in einem Ordner auf der Festplatte oder als Projekt-.zip und verlassen das Gerät nie.',
    siteDescription: 'Kostenloser Open-Source-SCORM-Editor und Kursersteller, der online im Browser funktioniert.',
    imageAlt: 'Scormly — interaktive Kurse erstellen und als SCORM exportieren',
    features: [
      'Blockbasierter Kurseditor mit Drag-and-drop, Rückgängig/Wiederholen und Einfügen an beliebiger Stelle',
      'Export als SCORM 1.2, SCORM 2004 (4. Edition) und cmi5 (xAPI) mit Fortsetzen, Punkten und Frageninteraktionen',
      'Kursprüfung vor dem Export, einschließlich Lücken bei der Barrierefreiheit',
      'Tests mit Einzelauswahl-, Mehrfachauswahl-, Zuordnungs-, Reihenfolge- und Lückentextfragen',
      'Verzweigte Dialogszenarien mit klassischem, Chat- und Szenen-Layout, eingebaute Bibliothek mit Figuren und Hintergründen, Lernkarten, Bild-Hotspots und Reflexion',
      'Prozessdiagramme, Schritt-für-Schritt-Anleitungen, Zeitleisten, Vergleichstabellen und Vorher-nachher-Regler',
      'Widget-Block: eigenes HTML / CSS / JavaScript oder eine hochgeladene Seite im Stil des Kurses',
      'Titelseite, 10 Themes und ein eigenes Theme, Blockhintergründe und fertige Blockvorlagen',
      'Prüfkommentare an Blöcken, geteilt über die Projekt-.zip, ohne Konten',
      'Projekte im Browser, in einem Ordner auf der Festplatte oder als Projekt-.zip',
      'KI-bereit: AGENTS.md in jedem Projekt beschreibt das Kursformat für KI-Assistenten',
      'Barrierefreie Kurse, die auf die WCAG 2.1 AA ausgelegt sind: Tastatur- und Screenreader-Unterstützung, Untertitel und Transkripte, ein Barrierefreiheitsmenü für Lernende',
      'Player-Oberfläche in 8 Sprachen; Editor auf Englisch, Ukrainisch, Französisch, Spanisch und Deutsch',
      'Geführte Tour, Fragen und Antworten in der App und Tastenkürzel',
      'Installierbare Web-App (PWA)',
      'Local-first: kein Server, die Daten bleiben auf dem Gerät',
    ],
  },
}
