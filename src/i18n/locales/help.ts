import type { LocaleTable } from '../types'

// Builder help: the guided tour, the help menu, the builder FAQ and the
// "What's new" dialog.
const help: LocaleTable = {
  en: {
    help: 'Help',
    menuTour: 'Take the tour',
    menuWhatsNew: "What's new",
    menuFaq: 'Questions & answers',
    menuShortcuts: 'Keyboard shortcuts',
    menuReport: 'Report an issue',
    newBadge: 'New',

    // Tour
    tourStep: '{n} of {total}',
    tourSkip: 'Skip tour',
    tourBack: 'Back',
    tourNext: 'Next',
    tourDone: 'Start building',
    tourWelcomeTitle: 'Welcome to Scormly 👋',
    tourWelcomeText:
      'A one-minute tour of the builder. You can skip it now and take it any time from the Help menu.',
    tourLessonsTitle: 'Lessons',
    tourLessonsText:
      'Your course is a list of lessons. Click one to edit it, drag the number to reorder, double-click (or F2) to rename.',
    tourCanvasTitle: 'Lesson content',
    tourCanvasText:
      'Lessons are built from blocks: text, media, quizzes, dialogue scenarios and more. Click a block to edit it; right-click for more actions.',
    tourAddTitle: 'Add blocks',
    tourAddText:
      'Add a block at the end here, or hover between two blocks and press “+” to insert one right there. Type to search, Enter to add.',
    tourSettingsTitle: 'Project settings',
    tourSettingsText:
      'Choose when the course counts as complete, whether it is scored with a passing mark, free or step-by-step navigation, and the theme.',
    tourPreviewTitle: 'Preview',
    tourPreviewText: 'See the course exactly as a learner will, with working quizzes and navigation.',
    tourCommentsTitle: 'Review comments',
    tourCommentsText:
      'Leave notes on any block — here or in Preview — for colleagues or for yourself. They travel with the project .zip and never reach the exported course.',
    tourExportTitle: 'Export to your LMS',
    tourExportText:
      'Download a SCORM 2004, SCORM 1.2 or cmi5 package and upload it to your LMS. Scormly checks the course for common problems first.',
    tourSaveTitle: 'Saving',
    tourSaveText:
      'Everything is saved automatically to your project folder on this computer. Nothing is uploaded anywhere.',
    tourHelpTitle: 'Help is here',
    tourHelpText:
      'Questions & answers, keyboard shortcuts, what’s new, and this tour again — all in the Help menu.',

    // FAQ
    faqTitle: 'Questions & answers',
    faqQ1: 'Where is my course saved?',
    faqA1:
      'In the folder you picked, on your own computer: project.json (the course), an assets/ folder with your media, a history file for undo/redo, and comments.json once there are comments. Scormly has no server — nothing is uploaded.',
    faqQ2: 'Do I need to press Save?',
    faqA2:
      'No. Changes are saved automatically about a second after you stop editing. Ctrl/⌘+S saves immediately. The Save button shows the state and turns red if saving fails.',
    faqQ3: 'Which export should I choose?',
    faqA3:
      'SCORM 2004 works in most modern LMSs and is the default. Use SCORM 1.2 for older systems, and cmi5 if your LMS supports xAPI/cmi5. When unsure, try SCORM 2004 first.',
    faqQ4: 'How do I put the course into my LMS?',
    faqA4:
      'Export a package (.zip), then upload that zip as a SCORM/cmi5 course in your LMS. Don’t unzip it. Packages are tested on SCORM Cloud.',
    faqQ5: 'How is completion and the score reported?',
    faqA5:
      'Set it in Project settings: complete when all lessons are viewed or all quizzes are answered, optionally with a passing score. The LMS receives completion, score, pass/fail and time, and learners resume where they left off.',
    faqQ6: 'Which media files can I use?',
    faqA6:
      'Images: PNG, JPEG, WebP, GIF, SVG (large images are resized automatically). Video: MP4, WebM. Audio: MP3, OGG, WAV, M4A. Media is copied into the project’s assets folder and bundled into exports.',
    faqQ7: 'How do I share a project with a colleague?',
    faqA7:
      'Project menu → Download project (.zip). They unzip it into a folder and open that folder in Scormly.',
    faqQ8: 'I deleted something by mistake.',
    faqA8:
      'Use Undo (Ctrl/⌘+Z) or the Undo button in the notification. Scormly keeps the last 50 steps, and the last 20 survive reopening the project.',
    faqQ9: 'Which browsers are supported?',
    faqA9:
      'Chrome, Edge, Opera and other Chromium browsers can save to a folder. Other browsers can use the builder without saving — download the project zip to keep your work.',
    faqQ10: 'Can AI tools edit my course?',
    faqA10:
      'Yes. Each project folder (and project .zip) has an AGENTS.md describing the project.json format, so an AI agent (or you) can edit the course file directly. It can work through your comments too — see below.',
    faqQ11: 'How do comments work?',
    faqA11:
      'Select a block and click Comment in its toolbar (Ctrl+Alt+M, ⌘⌥A on a Mac) to leave a note for a colleague or for yourself. There are no accounts: you type your name once and this browser remembers it. The Comments button in the header lists them — reply, resolve or delete them there. In Preview the same button lets you comment while you go through the course as a learner: point at a block and click Comment. Comments are kept in the project’s comments.json, travel in the project .zip and never reach the exported course. When a colleague’s .zip of the project comes back, their comments are added to yours — or choose “Add comments only” to keep your course as it is.',
    faqQ12: 'Can an AI assistant work through the comments?',
    faqA12:
      'Yes. AGENTS.md describes comments.json, so give the assistant the project folder or its .zip and ask, for example: “Read AGENTS.md and work through the open comments in comments.json.” It changes the course, replies to each comment with what it did and marks it resolved. Open the project — or the .zip it gives back — and read its replies in the Comments panel; reopen a comment if the change isn’t right.',

    // What's new
    whatsNewTitle: "What's new",
  },
  uk: {
    help: 'Довідка',
    menuTour: 'Пройти тур',
    menuWhatsNew: 'Що нового',
    menuFaq: 'Питання й відповіді',
    menuShortcuts: 'Гарячі клавіші',
    menuReport: 'Повідомити про проблему',
    newBadge: 'Нове',

    tourStep: '{n} з {total}',
    tourSkip: 'Пропустити тур',
    tourBack: 'Назад',
    tourNext: 'Далі',
    tourDone: 'До роботи',
    tourWelcomeTitle: 'Вітаємо в Scormly 👋',
    tourWelcomeText:
      'Хвилинний тур конструктором. Його можна пропустити зараз і пройти будь-коли з меню «Довідка».',
    tourLessonsTitle: 'Уроки',
    tourLessonsText:
      'Курс — це список уроків. Клацніть урок, щоб редагувати його; тягніть за номер, щоб змінити порядок; подвійний клік (або F2) — перейменувати.',
    tourCanvasTitle: 'Вміст уроку',
    tourCanvasText:
      'Уроки складаються з блоків: текст, медіа, тести, діалогові сценарії та інше. Клацніть блок, щоб редагувати; правий клік — більше дій.',
    tourAddTitle: 'Додавання блоків',
    tourAddText:
      'Додайте блок у кінець тут або наведіть між двома блоками й натисніть «+», щоб вставити саме там. Друкуйте для пошуку, Enter — додати.',
    tourSettingsTitle: 'Налаштування проєкту',
    tourSettingsText:
      'Оберіть, коли курс вважається завершеним, чи є прохідний бал, вільна чи покрокова навігація, і тему.',
    tourPreviewTitle: 'Перегляд',
    tourPreviewText: 'Подивіться на курс очима слухача — з робочими тестами й навігацією.',
    tourCommentsTitle: 'Коментарі',
    tourCommentsText:
      'Залишайте нотатки до будь-якого блоку — тут або в Перегляді — для колег чи для себе. Вони передаються разом із .zip проєкту й ніколи не потрапляють в експортований курс.',
    tourExportTitle: 'Експорт у LMS',
    tourExportText:
      'Завантажте пакет SCORM 2004, SCORM 1.2 або cmi5 і додайте його у свою LMS. Перед цим Scormly перевірить курс на типові проблеми.',
    tourSaveTitle: 'Збереження',
    tourSaveText:
      'Усе зберігається автоматично в папку проєкту на цьому комп’ютері. Нічого нікуди не завантажується.',
    tourHelpTitle: 'Довідка тут',
    tourHelpText:
      'Питання й відповіді, гарячі клавіші, що нового і цей тур — усе в меню «Довідка».',

    faqTitle: 'Питання й відповіді',
    faqQ1: 'Де зберігається мій курс?',
    faqA1:
      'У папці, яку ви обрали, на вашому комп’ютері: project.json (сам курс), папка assets/ з медіа, файл історії для скасування дій, а коли з’являться коментарі — ще й comments.json. У Scormly немає сервера — нічого не завантажується.',
    faqQ2: 'Чи треба натискати «Зберегти»?',
    faqA2:
      'Ні. Зміни зберігаються автоматично приблизно за секунду після останньої правки. Ctrl/⌘+S зберігає одразу. Кнопка «Зберегти» показує стан і червоніє, якщо зберегти не вдалося.',
    faqQ3: 'Який експорт обрати?',
    faqA3:
      'SCORM 2004 працює в більшості сучасних LMS і обраний за замовчуванням. SCORM 1.2 — для старіших систем, cmi5 — якщо LMS підтримує xAPI/cmi5. Якщо не впевнені, спершу спробуйте SCORM 2004.',
    faqQ4: 'Як додати курс у LMS?',
    faqA4:
      'Експортуйте пакет (.zip) і завантажте цей zip у LMS як SCORM/cmi5-курс. Не розпаковуйте його. Пакети перевірено на SCORM Cloud.',
    faqQ5: 'Як передаються завершення й оцінка?',
    faqA5:
      'Це задається в налаштуваннях проєкту: завершено, коли переглянуто всі уроки або дано відповіді на всі тести, за бажанням — з прохідним балом. LMS отримує завершення, бал, склав/не склав і час, а слухач продовжує з місця, де зупинився.',
    faqQ6: 'Які медіафайли можна використовувати?',
    faqA6:
      'Зображення: PNG, JPEG, WebP, GIF, SVG (великі зменшуються автоматично). Відео: MP4, WebM. Аудіо: MP3, OGG, WAV, M4A. Медіа копіюються в папку assets проєкту й потрапляють в експорт.',
    faqQ7: 'Як поділитися проєктом з колегою?',
    faqA7:
      'Меню проєкту → «Завантажити проєкт (.zip)». Колега розпаковує його в папку й відкриває цю папку в Scormly.',
    faqQ8: 'Я випадково щось видалив(ла).',
    faqA8:
      'Скасуйте дію (Ctrl/⌘+Z) або натисніть «Скасувати» у сповіщенні. Scormly пам’ятає останні 50 кроків, а останні 20 зберігаються й після повторного відкриття проєкту.',
    faqQ9: 'Які браузери підтримуються?',
    faqA9:
      'Chrome, Edge, Opera та інші браузери на Chromium вміють зберігати в папку. В інших браузерах конструктор працює без збереження — завантажуйте zip проєкту, щоб не втратити роботу.',
    faqQ10: 'Чи можуть ШІ-інструменти редагувати мій курс?',
    faqA10:
      'Так. У кожній папці проєкту (і в .zip проєкту) є AGENTS.md з описом формату project.json, тож ШІ-агент (або ви) можете редагувати файл курсу напряму. Він уміє й опрацьовувати ваші коментарі — див. нижче.',
    faqQ11: 'Як працюють коментарі?',
    faqA11:
      'Виділіть блок і натисніть «Коментар» на його панелі (Ctrl+Alt+M, на Mac ⌘⌥A), щоб лишити нотатку колезі чи собі на потім. Облікових записів немає: ім’я вводите один раз, і браузер його запам’ятовує. Кнопка «Коментарі» в шапці показує всі коментарі — там можна відповісти, позначити вирішеним чи видалити. У перегляді та сама кнопка дає коментувати, поки проходите курс як слухач: наведіть на блок і натисніть «Коментар». Коментарі зберігаються у файлі проєкту comments.json, їдуть разом із .zip проєкту й ніколи не потрапляють в експортований курс. Коли .zip проєкту повертається від колеги, його коментарі додаються до ваших — або виберіть «Лише додати коментарі», щоб курс лишився як є.',
    faqQ12: 'Чи може ШІ-асистент опрацювати коментарі?',
    faqA12:
      'Так. AGENTS.md описує comments.json, тож дайте асистентові папку проєкту або його .zip і попросіть, наприклад: «Прочитай AGENTS.md і опрацюй відкриті коментарі в comments.json». Він змінить курс, відповість на кожен коментар, що саме зробив, і позначить його вирішеним. Відкрийте проєкт — або .zip, який він поверне, — і перегляньте відповіді в панелі «Коментарі»; якщо зміна не підходить, відкрийте коментар знову.',

    whatsNewTitle: 'Що нового',
  },
  fr: {
    help: 'Aide',
    menuTour: 'Suivre la visite guidée',
    menuWhatsNew: 'Nouveautés',
    menuFaq: 'Questions et réponses',
    menuShortcuts: 'Raccourcis clavier',
    menuReport: 'Signaler un problème',
    newBadge: 'Nouveau',

    // Tour
    tourStep: '{n} sur {total}',
    tourSkip: 'Passer la visite',
    tourBack: 'Retour',
    tourNext: 'Suivant',
    tourDone: 'Commencer à créer',
    tourWelcomeTitle: 'Bienvenue dans Scormly 👋',
    tourWelcomeText:
      'Une visite de l’éditeur en une minute. Vous pouvez la passer et la reprendre à tout moment depuis le menu Aide.',
    tourLessonsTitle: 'Leçons',
    tourLessonsText:
      'Votre cours est une liste de leçons. Cliquez sur une leçon pour la modifier, faites glisser son numéro pour la déplacer, double-cliquez (ou F2) pour la renommer.',
    tourCanvasTitle: 'Contenu de la leçon',
    tourCanvasText:
      'Les leçons sont composées de blocs : texte, médias, quiz, scénarios de dialogue et plus encore. Cliquez sur un bloc pour le modifier ; clic droit pour d’autres actions.',
    tourAddTitle: 'Ajouter des blocs',
    tourAddText:
      'Ajoutez un bloc à la fin ici, ou survolez l’espace entre deux blocs et cliquez sur « + » pour en insérer un à cet endroit. Tapez pour rechercher, Enter pour ajouter.',
    tourSettingsTitle: 'Paramètres du projet',
    tourSettingsText:
      'Choisissez quand le cours est considéré comme terminé, s’il est noté avec un score de réussite, la navigation libre ou pas à pas, et le thème.',
    tourPreviewTitle: 'Aperçu',
    tourPreviewText: 'Voyez le cours exactement comme un apprenant, avec des quiz et une navigation qui fonctionnent.',
    tourCommentsTitle: 'Commentaires de relecture',
    tourCommentsText:
      'Laissez des notes sur n’importe quel bloc — ici ou dans l’aperçu — pour vos collègues ou pour vous-même. Elles voyagent avec le .zip du projet et n’apparaissent jamais dans le cours exporté.',
    tourExportTitle: 'Exporter vers votre LMS',
    tourExportText:
      'Téléchargez un paquet SCORM 2004, SCORM 1.2 ou cmi5 et importez-le dans votre LMS. Scormly vérifie d’abord que le cours ne présente pas de problèmes courants.',
    tourSaveTitle: 'Enregistrement',
    tourSaveText:
      'Tout est enregistré automatiquement dans le dossier de votre projet, sur cet ordinateur. Rien n’est envoyé nulle part.',
    tourHelpTitle: 'L’aide est ici',
    tourHelpText:
      'Questions et réponses, raccourcis clavier, nouveautés et cette visite guidée — tout est dans le menu Aide.',

    // FAQ
    faqTitle: 'Questions et réponses',
    faqQ1: 'Où mon cours est-il enregistré ?',
    faqA1:
      'Dans le dossier que vous avez choisi, sur votre ordinateur : project.json (le cours), un dossier assets/ avec vos médias, un fichier d’historique pour annuler/rétablir, et comments.json dès qu’il y a des commentaires. Scormly n’a pas de serveur — rien n’est envoyé.',
    faqQ2: 'Dois-je cliquer sur Enregistrer ?',
    faqA2:
      'Non. Les modifications sont enregistrées automatiquement environ une seconde après votre dernière modification. Ctrl/⌘+S enregistre immédiatement. Le bouton Enregistrer indique l’état et devient rouge si l’enregistrement échoue.',
    faqQ3: 'Quel export choisir ?',
    faqA3:
      'SCORM 2004 fonctionne dans la plupart des LMS récents et est proposé par défaut. Utilisez SCORM 1.2 pour les systèmes plus anciens, et cmi5 si votre LMS prend en charge xAPI/cmi5. En cas de doute, essayez d’abord SCORM 2004.',
    faqQ4: 'Comment ajouter le cours à mon LMS ?',
    faqA4:
      'Exportez un paquet (.zip), puis importez ce zip dans votre LMS en tant que cours SCORM/cmi5. Ne le décompressez pas. Les paquets sont testés sur SCORM Cloud.',
    faqQ5: 'Comment l’achèvement et le score sont-ils transmis ?',
    faqA5:
      'Cela se règle dans les Paramètres du projet : cours terminé quand toutes les leçons ont été vues ou que tous les quiz ont reçu une réponse, avec un score de réussite si vous le souhaitez. Le LMS reçoit l’achèvement, le score, la réussite ou l’échec et le temps passé, et les apprenants reprennent là où ils s’étaient arrêtés.',
    faqQ6: 'Quels fichiers multimédias puis-je utiliser ?',
    faqA6:
      'Images : PNG, JPEG, WebP, GIF, SVG (les grandes images sont redimensionnées automatiquement). Vidéo : MP4, WebM. Audio : MP3, OGG, WAV, M4A. Les médias sont copiés dans le dossier assets du projet et inclus dans les exports.',
    faqQ7: 'Comment partager un projet avec un collègue ?',
    faqA7:
      'Menu du projet → Télécharger le projet (.zip). Votre collègue le décompresse dans un dossier et ouvre ce dossier dans Scormly.',
    faqQ8: 'J’ai supprimé quelque chose par erreur.',
    faqA8:
      'Utilisez Annuler (Ctrl/⌘+Z) ou le bouton Annuler de la notification. Scormly conserve les 50 dernières actions, et les 20 dernières restent disponibles après la réouverture du projet.',
    faqQ9: 'Quels navigateurs sont pris en charge ?',
    faqA9:
      'Chrome, Edge, Opera et les autres navigateurs Chromium peuvent enregistrer dans un dossier. Dans les autres navigateurs, l’éditeur fonctionne sans enregistrement — téléchargez le zip du projet pour conserver votre travail.',
    faqQ10: 'Des outils d’IA peuvent-ils modifier mon cours ?',
    faqA10:
      'Oui. Chaque dossier de projet (et chaque .zip de projet) contient un fichier AGENTS.md qui décrit le format de project.json : un agent IA (ou vous) peut donc modifier directement le fichier du cours. Il peut aussi traiter vos commentaires — voir ci-dessous.',
    faqQ11: 'Comment fonctionnent les commentaires ?',
    faqA11:
      'Sélectionnez un bloc et cliquez sur Commenter dans sa barre d’outils (Ctrl+Alt+M, ⌘⌥A sur Mac) pour laisser une note à un collègue ou à vous-même. Il n’y a pas de compte : vous saisissez votre nom une fois et ce navigateur le retient. Le bouton Commentaires de l’en-tête en affiche la liste — vous pouvez y répondre, les résoudre ou les supprimer. Dans l’aperçu, le même bouton permet de commenter pendant que vous parcourez le cours comme un apprenant : pointez un bloc et cliquez sur Commenter. Les commentaires sont conservés dans le fichier comments.json du projet, voyagent dans le .zip du projet et n’apparaissent jamais dans le cours exporté. Quand le .zip d’un collègue vous revient, ses commentaires s’ajoutent aux vôtres — ou choisissez « Ajouter uniquement les commentaires » pour garder votre cours tel quel.',
    faqQ12: 'Un assistant IA peut-il traiter les commentaires ?',
    faqA12:
      'Oui. AGENTS.md décrit comments.json : donnez à l’assistant le dossier du projet ou son .zip et demandez-lui, par exemple : « Lis AGENTS.md et traite les commentaires ouverts de comments.json. » Il modifie le cours, répond à chaque commentaire en indiquant ce qu’il a fait et le marque comme résolu. Ouvrez le projet — ou le .zip qu’il vous renvoie — et lisez ses réponses dans le panneau Commentaires ; rouvrez un commentaire si la modification ne convient pas.',

    // What's new
    whatsNewTitle: 'Nouveautés',
  },
  es: {
    help: 'Ayuda',
    menuTour: 'Hacer el recorrido',
    menuWhatsNew: 'Novedades',
    menuFaq: 'Preguntas y respuestas',
    menuShortcuts: 'Atajos de teclado',
    menuReport: 'Informar de un problema',
    newBadge: 'Nuevo',

    // Tour
    tourStep: '{n} de {total}',
    tourSkip: 'Omitir el recorrido',
    tourBack: 'Atrás',
    tourNext: 'Siguiente',
    tourDone: 'Empezar a crear',
    tourWelcomeTitle: 'Te damos la bienvenida a Scormly 👋',
    tourWelcomeText:
      'Un recorrido de un minuto por el editor. Puedes omitirlo ahora y hacerlo cuando quieras desde el menú Ayuda.',
    tourLessonsTitle: 'Lecciones',
    tourLessonsText:
      'Tu curso es una lista de lecciones. Haz clic en una para editarla, arrastra su número para reordenarla y haz doble clic (o pulsa F2) para cambiarle el nombre.',
    tourCanvasTitle: 'Contenido de la lección',
    tourCanvasText:
      'Las lecciones se componen de bloques: texto, multimedia, cuestionarios, escenarios de diálogo y más. Haz clic en un bloque para editarlo; con el botón derecho verás más acciones.',
    tourAddTitle: 'Añadir bloques',
    tourAddText:
      'Añade un bloque al final desde aquí, o pasa el cursor entre dos bloques y pulsa “+” para insertarlo justo ahí. Escribe para buscar y pulsa Enter para añadir.',
    tourSettingsTitle: 'Configuración del proyecto',
    tourSettingsText:
      'Elige cuándo se considera completado el curso, si se califica con una puntuación mínima, si la navegación es libre o paso a paso, y el tema.',
    tourPreviewTitle: 'Vista previa',
    tourPreviewText: 'Mira el curso tal como lo verá un alumno, con cuestionarios y navegación que funcionan.',
    tourCommentsTitle: 'Comentarios de revisión',
    tourCommentsText:
      'Deja notas en cualquier bloque —aquí o en la vista previa— para tus colegas o para ti. Viajan con el .zip del proyecto y nunca llegan al curso exportado.',
    tourExportTitle: 'Exportar a tu LMS',
    tourExportText:
      'Descarga un paquete SCORM 2004, SCORM 1.2 o cmi5 y súbelo a tu LMS. Antes, Scormly comprueba que el curso no tenga problemas habituales.',
    tourSaveTitle: 'Guardado',
    tourSaveText:
      'Todo se guarda automáticamente en la carpeta de tu proyecto, en este equipo. No se sube nada a ningún sitio.',
    tourHelpTitle: 'La ayuda está aquí',
    tourHelpText:
      'Preguntas y respuestas, atajos de teclado, novedades y este recorrido otra vez: todo en el menú Ayuda.',

    // FAQ
    faqTitle: 'Preguntas y respuestas',
    faqQ1: '¿Dónde se guarda mi curso?',
    faqA1:
      'En la carpeta que elegiste, en tu propio equipo: project.json (el curso), una carpeta assets/ con tus archivos multimedia, un archivo de historial para deshacer/rehacer y comments.json cuando haya comentarios. Scormly no tiene servidor: no se sube nada.',
    faqQ2: '¿Tengo que pulsar Guardar?',
    faqA2:
      'No. Los cambios se guardan automáticamente más o menos un segundo después de que dejes de editar. Ctrl/⌘+S guarda al instante. El botón Guardar muestra el estado y se pone rojo si el guardado falla.',
    faqQ3: '¿Qué exportación debo elegir?',
    faqA3:
      'SCORM 2004 funciona en la mayoría de los LMS modernos y es la opción predeterminada. Usa SCORM 1.2 para sistemas más antiguos y cmi5 si tu LMS admite xAPI/cmi5. Si tienes dudas, prueba primero con SCORM 2004.',
    faqQ4: '¿Cómo pongo el curso en mi LMS?',
    faqA4:
      'Exporta un paquete (.zip) y sube ese zip a tu LMS como curso SCORM/cmi5. No lo descomprimas. Los paquetes se prueban en SCORM Cloud.',
    faqQ5: '¿Cómo se informa de la finalización y la puntuación?',
    faqA5:
      'Se define en Configuración del proyecto: el curso se completa cuando se han visto todas las lecciones o se han respondido todos los cuestionarios, opcionalmente con una puntuación mínima. El LMS recibe la finalización, la puntuación, el aprobado o suspenso y el tiempo, y los alumnos continúan donde lo dejaron.',
    faqQ6: '¿Qué archivos multimedia puedo usar?',
    faqA6:
      'Imágenes: PNG, JPEG, WebP, GIF, SVG (las imágenes grandes se redimensionan automáticamente). Video: MP4, WebM. Audio: MP3, OGG, WAV, M4A. Los archivos se copian en la carpeta assets del proyecto y se incluyen en las exportaciones.',
    faqQ7: '¿Cómo comparto un proyecto con un colega?',
    faqA7:
      'Menú del proyecto → Descargar el proyecto (.zip). Tu colega lo descomprime en una carpeta y abre esa carpeta en Scormly.',
    faqQ8: 'He eliminado algo por error.',
    faqA8:
      'Usa Deshacer (Ctrl/⌘+Z) o el botón Deshacer de la notificación. Scormly conserva los últimos 50 pasos, y los últimos 20 se mantienen al volver a abrir el proyecto.',
    faqQ9: '¿Qué navegadores son compatibles?',
    faqA9:
      'Chrome, Edge, Opera y otros navegadores basados en Chromium pueden guardar en una carpeta. En los demás navegadores puedes usar el editor sin guardar: descarga el zip del proyecto para conservar tu trabajo.',
    faqQ10: '¿Pueden las herramientas de IA editar mi curso?',
    faqA10:
      'Sí. Cada carpeta de proyecto (y cada .zip de proyecto) incluye un AGENTS.md que describe el formato de project.json, así que un agente de IA (o tú) puede editar directamente el archivo del curso. También puede ocuparse de tus comentarios: lo explicamos más abajo.',
    faqQ11: '¿Cómo funcionan los comentarios?',
    faqA11:
      'Selecciona un bloque y haz clic en Comentar en su barra de herramientas (Ctrl+Alt+M, ⌘⌥A en Mac) para dejar una nota a un colega o a ti mismo. No hay cuentas: escribes tu nombre una vez y este navegador lo recuerda. El botón Comentarios de la cabecera los muestra todos; ahí puedes responderlos, resolverlos o eliminarlos. En la vista previa, el mismo botón te permite comentar mientras recorres el curso como un alumno: señala un bloque y haz clic en Comentar. Los comentarios se guardan en el archivo comments.json del proyecto, viajan en el .zip del proyecto y nunca llegan al curso exportado. Cuando vuelve el .zip de un colega, sus comentarios se añaden a los tuyos; o elige “Añadir solo los comentarios” para dejar tu curso como está.',
    faqQ12: '¿Puede un asistente de IA ocuparse de los comentarios?',
    faqA12:
      'Sí. AGENTS.md describe comments.json, así que dale al asistente la carpeta del proyecto o su .zip y pídele, por ejemplo: “Lee AGENTS.md y ocúpate de los comentarios abiertos de comments.json”. Cambiará el curso, responderá a cada comentario explicando lo que hizo y lo marcará como resuelto. Abre el proyecto —o el .zip que te devuelva— y lee sus respuestas en el panel Comentarios; vuelve a abrir un comentario si el cambio no te convence.',

    // What's new
    whatsNewTitle: 'Novedades',
  },
  de: {
    help: 'Hilfe',
    menuTour: 'Rundgang starten',
    menuWhatsNew: 'Neuigkeiten',
    menuFaq: 'Fragen & Antworten',
    menuShortcuts: 'Tastenkürzel',
    menuReport: 'Problem melden',
    newBadge: 'Neu',

    // Tour
    tourStep: '{n} von {total}',
    tourSkip: 'Rundgang überspringen',
    tourBack: 'Zurück',
    tourNext: 'Weiter',
    tourDone: 'Loslegen',
    tourWelcomeTitle: 'Willkommen bei Scormly 👋',
    tourWelcomeText:
      'Ein einminütiger Rundgang durch den Builder. Sie können ihn jetzt überspringen und jederzeit über das Hilfemenü starten.',
    tourLessonsTitle: 'Lektionen',
    tourLessonsText:
      'Ihr Kurs ist eine Liste von Lektionen. Klicken Sie auf eine, um sie zu bearbeiten, ziehen Sie die Nummer, um die Reihenfolge zu ändern, und doppelklicken Sie (oder F2), um sie umzubenennen.',
    tourCanvasTitle: 'Lektionsinhalt',
    tourCanvasText:
      'Lektionen bestehen aus Blöcken: Text, Medien, Quizze, Dialogszenarien und mehr. Klicken Sie auf einen Block, um ihn zu bearbeiten; ein Rechtsklick zeigt weitere Aktionen.',
    tourAddTitle: 'Blöcke hinzufügen',
    tourAddText:
      'Fügen Sie hier am Ende einen Block hinzu, oder zeigen Sie zwischen zwei Blöcke und drücken Sie „+“, um direkt dort einen einzufügen. Tippen zum Suchen, Eingabetaste zum Hinzufügen.',
    tourSettingsTitle: 'Projekteinstellungen',
    tourSettingsText:
      'Legen Sie fest, wann der Kurs als abgeschlossen gilt, ob er mit einer Bestehensgrenze bewertet wird, ob die Navigation frei oder schrittweise erfolgt, und wählen Sie das Design.',
    tourPreviewTitle: 'Vorschau',
    tourPreviewText: 'Sehen Sie den Kurs genau so, wie ihn Lernende sehen werden, mit funktionierenden Quizzen und Navigation.',
    tourCommentsTitle: 'Review-Kommentare',
    tourCommentsText:
      'Hinterlassen Sie Notizen zu jedem Block – hier oder in der Vorschau – für Kolleginnen und Kollegen oder für sich selbst. Sie werden mit der Projekt-.zip weitergegeben und gelangen nie in den exportierten Kurs.',
    tourExportTitle: 'In Ihr LMS exportieren',
    tourExportText:
      'Laden Sie ein SCORM-2004-, SCORM-1.2- oder cmi5-Paket herunter und laden Sie es in Ihr LMS hoch. Scormly prüft den Kurs vorher auf häufige Probleme.',
    tourSaveTitle: 'Speichern',
    tourSaveText:
      'Alles wird automatisch in Ihrem Projektordner auf diesem Computer gespeichert. Es wird nichts hochgeladen.',
    tourHelpTitle: 'Hier gibt es Hilfe',
    tourHelpText:
      'Fragen & Antworten, Tastenkürzel, Neuigkeiten und dieser Rundgang noch einmal – alles im Hilfemenü.',

    // FAQ
    faqTitle: 'Fragen & Antworten',
    faqQ1: 'Wo wird mein Kurs gespeichert?',
    faqA1:
      'In dem Ordner, den Sie gewählt haben, auf Ihrem eigenen Computer: project.json (der Kurs), ein Ordner assets/ mit Ihren Medien, eine Verlaufsdatei für Rückgängig/Wiederholen und comments.json, sobald es Kommentare gibt. Scormly hat keinen Server – es wird nichts hochgeladen.',
    faqQ2: 'Muss ich auf Speichern klicken?',
    faqA2:
      'Nein. Änderungen werden etwa eine Sekunde nach dem Ende der Bearbeitung automatisch gespeichert. Strg/⌘+S speichert sofort. Die Schaltfläche „Speichern“ zeigt den Status an und wird rot, wenn das Speichern fehlschlägt.',
    faqQ3: 'Welchen Export soll ich wählen?',
    faqA3:
      'SCORM 2004 funktioniert in den meisten modernen LMS und ist die Voreinstellung. Verwenden Sie SCORM 1.2 für ältere Systeme und cmi5, wenn Ihr LMS xAPI/cmi5 unterstützt. Im Zweifel probieren Sie zuerst SCORM 2004.',
    faqQ4: 'Wie bringe ich den Kurs in mein LMS?',
    faqA4:
      'Exportieren Sie ein Paket (.zip) und laden Sie diese Zip-Datei in Ihrem LMS als SCORM-/cmi5-Kurs hoch. Entpacken Sie sie nicht. Die Pakete werden mit SCORM Cloud getestet.',
    faqQ5: 'Wie werden Abschluss und Punktzahl gemeldet?',
    faqA5:
      'Legen Sie es in den Projekteinstellungen fest: abgeschlossen, wenn alle Lektionen angesehen oder alle Quizze beantwortet wurden, optional mit einer Bestehensgrenze. Das LMS erhält Abschluss, Punktzahl, bestanden/nicht bestanden und Zeit, und Lernende setzen dort fort, wo sie aufgehört haben.',
    faqQ6: 'Welche Mediendateien kann ich verwenden?',
    faqA6:
      'Bilder: PNG, JPEG, WebP, GIF, SVG (große Bilder werden automatisch verkleinert). Video: MP4, WebM. Audio: MP3, OGG, WAV, M4A. Medien werden in den Ordner assets des Projekts kopiert und in die Exporte eingebunden.',
    faqQ7: 'Wie teile ich ein Projekt mit einer Kollegin oder einem Kollegen?',
    faqA7:
      'Menü „Projekt“ → Projekt herunterladen (.zip). Sie entpacken es in einen Ordner und öffnen diesen Ordner in Scormly.',
    faqQ8: 'Ich habe versehentlich etwas gelöscht.',
    faqA8:
      'Verwenden Sie Rückgängig (Strg/⌘+Z) oder die Schaltfläche „Rückgängig“ in der Benachrichtigung. Scormly behält die letzten 50 Schritte, und die letzten 20 bleiben beim erneuten Öffnen des Projekts erhalten.',
    faqQ9: 'Welche Browser werden unterstützt?',
    faqA9:
      'Chrome, Edge, Opera und andere Chromium-Browser können in einen Ordner speichern. Andere Browser können den Builder ohne Speichern nutzen – laden Sie die Projekt-Zip herunter, um Ihre Arbeit zu sichern.',
    faqQ10: 'Können KI-Tools meinen Kurs bearbeiten?',
    faqA10:
      'Ja. Jeder Projektordner (und jede Projekt-.zip) enthält eine AGENTS.md, die das Format von project.json beschreibt, sodass ein KI-Agent (oder Sie) die Kursdatei direkt bearbeiten kann. Er kann auch Ihre Kommentare abarbeiten – siehe unten.',
    faqQ11: 'Wie funktionieren Kommentare?',
    faqA11:
      'Wählen Sie einen Block aus und klicken Sie in seiner Werkzeugleiste auf Kommentieren (Strg+Alt+M, ⌘⌥A auf dem Mac), um eine Notiz für eine Kollegin, einen Kollegen oder sich selbst zu hinterlassen. Es gibt keine Konten: Sie geben Ihren Namen einmal ein, und dieser Browser merkt ihn sich. Die Schaltfläche „Kommentare“ in der Kopfzeile listet sie auf – dort können Sie antworten, sie als erledigt markieren oder löschen. In der Vorschau können Sie über dieselbe Schaltfläche kommentieren, während Sie den Kurs als Lernende durchgehen: Zeigen Sie auf einen Block und klicken Sie auf Kommentieren. Kommentare werden in der comments.json des Projekts gespeichert, reisen in der Projekt-.zip mit und gelangen nie in den exportierten Kurs. Wenn die .zip des Projekts von einer Kollegin oder einem Kollegen zurückkommt, werden deren Kommentare zu Ihren hinzugefügt – oder wählen Sie „Nur Kommentare hinzufügen“, um Ihren Kurs unverändert zu lassen.',
    faqQ12: 'Kann ein KI-Assistent die Kommentare abarbeiten?',
    faqA12:
      'Ja. AGENTS.md beschreibt comments.json. Geben Sie dem Assistenten also den Projektordner oder die .zip und bitten Sie ihn zum Beispiel: „Lies AGENTS.md und arbeite die offenen Kommentare in comments.json ab.“ Er ändert den Kurs, antwortet auf jeden Kommentar mit dem, was er getan hat, und markiert ihn als erledigt. Öffnen Sie das Projekt – oder die .zip, die er zurückgibt – und lesen Sie seine Antworten im Kommentarbereich; öffnen Sie einen Kommentar erneut, wenn die Änderung nicht passt.',

    // What's new
    whatsNewTitle: 'Neuigkeiten',
  },
}

export default help
