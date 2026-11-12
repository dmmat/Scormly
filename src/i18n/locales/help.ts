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
}

export default help
