import type { LocaleTable } from '../types'

// SEO landing page copy (bilingual). The site's default language is English.
const landing: LocaleTable = {
  en: {
    // Nav
    navDemo: 'Demo',
    navFeatures: 'Features',
    navHow: 'How it works',
    navFaq: 'FAQ',
    navGithub: 'GitHub',
    openApp: 'Open the builder',

    // Hero
    heroBadge: 'Open source · Free · 100% local',
    heroTitle: 'Build interactive courses and export to SCORM — right in your browser',
    heroSubtitle:
      'Scormly is a local-first, block-based course builder. No backend, no sign-up. Your content never leaves your computer, and you export a standards-compliant SCORM or cmi5 package in one click.',
    heroCtaPrimary: 'Start building — free',
    heroCtaSecondary: 'View on GitHub',
    heroNote: 'Runs entirely in your browser. Nothing to install.',

    // Trust pillars
    pillarsTitle: 'Yours, and only yours',
    pillarOpenTitle: 'Open source',
    pillarOpenText:
      'Scormly is fully open source under the MIT license. Read the code, self-host it, fork it, contribute back.',
    pillarFreeTitle: 'Completely free',
    pillarFreeText:
      'No subscriptions, no seats, no paywalled features. Every capability is available to everyone, forever.',
    pillarLocalTitle: 'Local & private',
    pillarLocalText:
      'Everything runs on your device. We store nothing and transmit nothing — there is no server to send your data to.',

    // Privacy callout
    privacyTitle: 'Your data stays on your machine',
    privacyText:
      'Scormly has no backend. Projects and media are saved straight to your own file system via the File System Access API, and SCORM packaging happens inside the browser. No accounts, no analytics on your content, no uploads. Privacy by architecture, not by promise.',

    // Features
    featuresTitle: 'Everything you need to author a course',
    featuresSubtitle: 'A focused block editor with the building blocks of modern e-learning — and nothing you don’t need.',
    f1Title: 'Rich block library',
    f1Text: 'Text, media, tabs, accordions, flashcards and dialogue scenarios with a chat layout — plus interactive image hotspots, timelines and process steps, sort-the-order and fill-in-the-blanks exercises.',
    f2Title: 'Graded quizzes',
    f2Text: 'Single choice, multiple choice and matching questions with feedback and a passing score — every answer reported to your LMS.',
    f3Title: 'A forgiving editor',
    f3Text: 'Insert a block anywhere, reorder freely and undo any change — even straight from the notification after a delete.',
    f4Title: 'SCORM 1.2 / 2004 and cmi5 export',
    f4Text: 'One-click packages for Moodle and any other LMS, built in the browser. Learners resume where they left off, and a check before export catches empty lessons, missing media and quiz questions without a correct answer.',
    f5Title: 'Guided learning paths',
    f5Text: 'Require videos to be watched, lock navigation to a linear path and choose how completion is counted.',
    f6Title: 'Keyboard-first',
    f6Text: 'Shortcuts for common actions (press ?) and full keyboard access to menus, dialogs and reordering.',
    f7Title: 'Help built in',
    f7Text: 'A guided tour, answers to common questions and a “What’s new” page — right inside the builder.',
    f8Title: 'Global themes',
    f8Text: 'Switch the look of buttons and interactions across the whole project with one click.',
    f9Title: 'Install as an app',
    f9Text: 'Install Scormly from Chrome or Edge and launch it from your desktop like any other app.',
    f10Title: 'Bilingual interface',
    f10Text: 'Use the builder in English or Ukrainian, with more languages on the way.',

    // AI-ready section
    navAi: 'AI',
    aiBadge: 'AI-ready',
    aiTitle: 'Build courses together with your AI assistant',
    aiSubtitle:
      'A Scormly project is a folder of plain, documented files, so AI agents like Claude, ChatGPT or Cursor can read, write and check courses alongside you.',
    aiPoint1Title: 'AGENTS.md in every project',
    aiPoint1Text:
      'Each project folder ships with a guide to the project.json format and every block type, so any agent knows how to author valid content.',
    aiPoint2Title: 'Local MCP server',
    aiPoint2Text:
      'scormly-mcp connects Claude Desktop, Claude Code or Cursor to your project folder, with tools to add lessons and blocks, check the course and export SCORM or cmi5.',
    aiPoint3Title: 'Still 100% local',
    aiPoint3Text:
      'The agent works on files on your own disk. Scormly and scormly-mcp upload nothing — what you share with an assistant is up to you.',
    aiTermComment: '# connect your course folder',
    aiChatPrompt: 'Add a lesson on spotting phishing with a timeline and a 3-question quiz, then export it for our LMS.',
    aiStep1: 'Read AGENTS.md',
    aiStep2: 'Added lesson “Spotting phishing”',
    aiStep3: 'Added timeline and quiz blocks',
    aiStep4: 'Course check: no issues',
    aiStep5: 'Exported SCORM 2004 package',
    aiVisualLabel: 'Illustrative example of an AI assistant editing a Scormly project',

    // What's new
    navNews: 'What’s new',
    newsBadge: 'Changelog',
    newsTitle: 'What’s new',
    newsSubtitle: 'Scormly ships often. Here are the latest updates to the builder.',
    newsLatest: 'Latest',
    newsMore: 'Follow development on GitHub',

    // How it works
    howTitle: 'From idea to SCORM in three steps',
    how1Title: 'Create a project',
    how1Text: 'Pick a folder on your computer. Scormly saves your project and media there directly.',
    how2Title: 'Build your lessons',
    how2Text: 'Add blocks, write content, drop in media and quizzes, and pick a theme.',
    how3Title: 'Export to SCORM',
    how3Text: 'Download a single SCORM or cmi5 .zip package and upload it to your LMS. Done.',

    // FAQ
    faqTitle: 'Frequently asked questions',
    faqQ1: 'Is Scormly really free?',
    faqA1: 'Yes. Scormly is open source under the MIT license and free to use, forever. There are no paid tiers or hidden limits.',
    faqQ2: 'Where is my data stored?',
    faqA2: 'On your own computer. Scormly writes your project and media to a folder you choose via the File System Access API. There is no server, so nothing is uploaded or stored remotely.',
    faqQ3: 'Which LMS platforms are supported?',
    faqA3: 'Scormly exports SCORM 1.2, SCORM 2004 and cmi5 (xAPI) packages that work with Moodle, TalentLMS, SCORM Cloud and virtually any standards-compliant LMS. Progress, quiz scores and individual answers are reported back, and learners resume where they left off.',
    faqQ4: 'Do I need to install anything?',
    faqA4: 'No. Scormly runs entirely in the browser. For saving to disk you need a Chromium-based browser (Chrome or Edge) that supports the File System Access API. If you like, you can also install it as an app from the browser.',
    faqQ5: 'Can I self-host it?',
    faqA5: 'Absolutely. It is a static site — clone the repository, run the build, and host the output anywhere, or just use it locally.',
    faqQ6: 'Can it replace commercial authoring tools?',
    faqA6: 'Scormly follows a modern block-based authoring approach, but it is local-first, free and open source. It is a great fit if you want full control over your data.',
    faqQ7: 'Can I build courses with AI?',
    faqA7: 'Yes. Every project folder includes an AGENTS.md file that documents project.json and all block types, so an assistant like Claude, ChatGPT or Cursor can author valid courses. With the local scormly-mcp server, Claude Desktop, Claude Code or Cursor can add lessons and blocks, check the course and export it directly.',
    faqQ8: 'Can I check my course before publishing?',
    faqA8: 'Yes. Export runs a course check first and lists problems such as empty lessons, missing media or quiz questions without a correct answer, so you can fix them before uploading to your LMS.',
    faqQ9: 'Can I use the builder without a mouse?',
    faqA9: 'Yes. Menus, dialogs and lists work fully from the keyboard, lessons and blocks can be reordered with keys, and pressing ? shows every shortcut.',

    // Contribute CTA
    contributeBadge: 'Open source',
    contributeTitle: "Let's build Scormly together",
    contributeText:
      'Scormly is open source and moving fast. Star the repo, open an issue, or send a pull request — new blocks, languages, integrations and ideas are all welcome.',
    contributeCta: 'Become a contributor',
    contributeIssues: 'Suggest a feature',

    // Footer
    footerTagline: 'Local-first course builder with SCORM and cmi5 export.',
    footerLicense: 'MIT licensed',
    footerIssues: 'Report an issue',
    footerMade: 'Open source, made for educators.',
  },
  uk: {
    // Nav
    navDemo: 'Демо',
    navFeatures: 'Можливості',
    navHow: 'Як це працює',
    navFaq: 'FAQ',
    navGithub: 'GitHub',
    openApp: 'Відкрити конструктор',

    // Hero
    heroBadge: 'Open source · Безкоштовно · 100% локально',
    heroTitle: 'Створюйте інтерактивні курси й експортуйте в SCORM — прямо в браузері',
    heroSubtitle:
      'Scormly — це local-first блочний конструктор курсів. Без сервера й реєстрації. Ваш контент ніколи не залишає комп’ютер, а готовий пакет SCORM чи cmi5 ви отримуєте в один клік.',
    heroCtaPrimary: 'Почати безкоштовно',
    heroCtaSecondary: 'Подивитися на GitHub',
    heroNote: 'Працює повністю в браузері. Нічого не треба встановлювати.',

    // Trust pillars
    pillarsTitle: 'Ваше — і тільки ваше',
    pillarOpenTitle: 'Відкритий код',
    pillarOpenText:
      'Scormly повністю open source за ліцензією MIT. Читайте код, розгортайте в себе, форкайте, долучайтеся.',
    pillarFreeTitle: 'Повністю безкоштовно',
    pillarFreeText:
      'Жодних підписок, місць чи платних функцій. Усі можливості доступні всім і назавжди.',
    pillarLocalTitle: 'Локально та приватно',
    pillarLocalText:
      'Усе працює на вашому пристрої. Ми нічого не зберігаємо й нічого не передаємо — немає навіть сервера, куди слати дані.',

    // Privacy callout
    privacyTitle: 'Ваші дані залишаються на вашому комп’ютері',
    privacyText:
      'У Scormly немає бекенду. Проєкти й медіа зберігаються напряму у вашу файлову систему через File System Access API, а SCORM-пакет збирається в браузері. Жодних акаунтів, жодної аналітики вашого контенту, жодних завантажень на сервер. Приватність на рівні архітектури, а не обіцянок.',

    // Features
    featuresTitle: 'Усе для створення курсу',
    featuresSubtitle: 'Сфокусований блочний редактор з будівельними блоками сучасного e-learning — і нічого зайвого.',
    f1Title: 'Багата бібліотека блоків',
    f1Text: 'Текст, медіа, вкладки, акордеони, картки й діалогові сценарії з чат-виглядом — а також інтерактивні зображення з гарячими точками, таймлайни й покрокові процеси, вправи на впорядкування та заповнення пропусків.',
    f2Title: 'Квізи з оцінюванням',
    f2Text: 'Питання з однією чи кількома відповідями та на відповідність, із фідбеком і прохідним балом — кожна відповідь потрапляє у звіт LMS.',
    f3Title: 'Редактор, що прощає помилки',
    f3Text: 'Вставляйте блок будь-де, змінюйте порядок і скасовуйте будь-яку дію — навіть просто зі сповіщення після видалення.',
    f4Title: 'Експорт SCORM 1.2 / 2004 і cmi5',
    f4Text: 'Пакети для Moodle та будь-якої LMS в один клік, зібрані в браузері. Слухачі продовжують з місця, де зупинилися, а перевірка перед експортом знаходить порожні уроки, відсутні медіа й питання без правильної відповіді.',
    f5Title: 'Керований шлях навчання',
    f5Text: 'Вимагайте повного перегляду відео, вмикайте лінійну навігацію та обирайте, як зараховується проходження.',
    f6Title: 'Зручно з клавіатури',
    f6Text: 'Гарячі клавіші для частих дій (натисніть ?) і повний доступ з клавіатури до меню, діалогів і зміни порядку.',
    f7Title: 'Вбудована довідка',
    f7Text: 'Тур конструктором, відповіді на часті питання та сторінка «Що нового» — просто в редакторі.',
    f8Title: 'Глобальні теми',
    f8Text: 'Змінюйте вигляд кнопок та інтерактиву по всьому проєкту одним кліком.',
    f9Title: 'Встановлюється як застосунок',
    f9Text: 'Встановіть Scormly з Chrome чи Edge і запускайте з робочого столу, як звичайну програму.',
    f10Title: 'Двомовний інтерфейс',
    f10Text: 'Користуйтеся конструктором англійською чи українською, інші мови — на підході.',

    // AI-ready section
    navAi: 'AI',
    aiBadge: 'Готовий до AI',
    aiTitle: 'Створюйте курси разом з AI-асистентом',
    aiSubtitle:
      'Проєкт Scormly — це папка зі звичайними задокументованими файлами, тож AI-агенти на кшталт Claude, ChatGPT чи Cursor можуть читати, писати й перевіряти курси разом з вами.',
    aiPoint1Title: 'AGENTS.md у кожному проєкті',
    aiPoint1Text:
      'У кожній папці проєкту є інструкція з форматом project.json і всіма типами блоків, тож будь-який агент знає, як створити коректний контент.',
    aiPoint2Title: 'Локальний MCP-сервер',
    aiPoint2Text:
      'scormly-mcp під’єднує Claude Desktop, Claude Code чи Cursor до папки проєкту й дає інструменти, щоб додавати уроки й блоки, перевіряти курс та експортувати SCORM чи cmi5.',
    aiPoint3Title: 'Так само 100% локально',
    aiPoint3Text:
      'Агент працює з файлами на вашому диску. Scormly і scormly-mcp нічого не завантажують — чим ділитися з асистентом, вирішуєте ви.',
    aiTermComment: '# під’єднайте папку курсу',
    aiChatPrompt: 'Додай урок про розпізнавання фішингу з таймлайном і тестом на 3 питання, а потім експортуй для нашої LMS.',
    aiStep1: 'Прочитано AGENTS.md',
    aiStep2: 'Додано урок «Як розпізнати фішинг»',
    aiStep3: 'Додано блоки таймлайну й тесту',
    aiStep4: 'Перевірка курсу: проблем немає',
    aiStep5: 'Експортовано пакет SCORM 2004',
    aiVisualLabel: 'Ілюстративний приклад: AI-асистент редагує проєкт Scormly',

    // What's new
    navNews: 'Що нового',
    newsBadge: 'Журнал змін',
    newsTitle: 'Що нового',
    newsSubtitle: 'Scormly оновлюється часто. Ось останні зміни в конструкторі.',
    newsLatest: 'Найновіше',
    newsMore: 'Стежте за розробкою на GitHub',

    // How it works
    howTitle: 'Від ідеї до SCORM за три кроки',
    how1Title: 'Створіть проєкт',
    how1Text: 'Оберіть папку на комп’ютері. Scormly зберігатиме проєкт і медіа просто в неї.',
    how2Title: 'Наповніть уроки',
    how2Text: 'Додавайте блоки, пишіть контент, вставляйте медіа та квізи, обирайте тему.',
    how3Title: 'Експортуйте в SCORM',
    how3Text: 'Завантажте єдиний .zip-пакет SCORM чи cmi5 і залийте його у вашу LMS. Готово.',

    // FAQ
    faqTitle: 'Часті запитання',
    faqQ1: 'Scormly справді безкоштовний?',
    faqA1: 'Так. Scormly — open source за ліцензією MIT і безкоштовний назавжди. Немає платних тарифів чи прихованих обмежень.',
    faqQ2: 'Де зберігаються мої дані?',
    faqA2: 'На вашому комп’ютері. Scormly записує проєкт і медіа в обрану вами папку через File System Access API. Сервера немає, тож нічого не завантажується й не зберігається віддалено.',
    faqQ3: 'Які LMS підтримуються?',
    faqA3: 'Scormly експортує пакети SCORM 1.2, SCORM 2004 і cmi5 (xAPI), які працюють із Moodle, TalentLMS, SCORM Cloud та практично будь-якою сумісною LMS. Прогрес, бали за тести й окремі відповіді передаються в LMS, а слухачі продовжують з місця, де зупинилися.',
    faqQ4: 'Чи треба щось встановлювати?',
    faqA4: 'Ні. Scormly працює повністю в браузері. Для збереження на диск потрібен браузер на базі Chromium (Chrome або Edge) із підтримкою File System Access API. За бажання його можна встановити з браузера як застосунок.',
    faqQ5: 'Чи можна розгорнути в себе?',
    faqA5: 'Звісно. Це статичний сайт — клонуйте репозиторій, зберіть і розмістіть результат будь-де, або просто використовуйте локально.',
    faqQ6: 'Чи може це замінити комерційні інструменти авторингу?',
    faqA6: 'Scormly використовує сучасний блочний підхід до авторингу, але є local-first, безкоштовним і відкритим. Чудовий вибір, якщо хочете повний контроль над даними.',
    faqQ7: 'Чи можна створювати курси за допомогою AI?',
    faqA7: 'Так. У кожній папці проєкту є файл AGENTS.md з описом project.json і всіх типів блоків, тож асистент на кшталт Claude, ChatGPT чи Cursor може створювати коректні курси. А з локальним сервером scormly-mcp Claude Desktop, Claude Code чи Cursor можуть напряму додавати уроки й блоки, перевіряти курс і експортувати його.',
    faqQ8: 'Чи можна перевірити курс перед публікацією?',
    faqA8: 'Так. Перед експортом курс перевіряється, і ви бачите список проблем — порожні уроки, відсутні медіа чи питання без правильної відповіді, — щоб виправити їх до завантаження в LMS.',
    faqQ9: 'Чи можна працювати без миші?',
    faqA9: 'Так. Меню, діалоги й списки повністю доступні з клавіатури, уроки й блоки можна переставляти клавішами, а натиснувши ?, ви побачите всі гарячі клавіші.',

    // Contribute CTA
    contributeBadge: 'Відкритий код',
    contributeTitle: 'Розвиваймо Scormly разом',
    contributeText:
      'Scormly — відкритий і швидко розвивається. Поставте зірочку, відкрийте issue або надішліть pull request — нові блоки, мови, інтеграції та ідеї вітаються.',
    contributeCta: 'Стати контрибʼютором',
    contributeIssues: 'Запропонувати фічу',

    // Footer
    footerTagline: 'Local-first конструктор курсів з експортом у SCORM і cmi5.',
    footerLicense: 'Ліцензія MIT',
    footerIssues: 'Повідомити про проблему',
    footerMade: 'Open source, для освітян.',
  },
}

export default landing
