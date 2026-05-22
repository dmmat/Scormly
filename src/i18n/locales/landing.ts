import type { LocaleTable } from '../types'

// SEO landing page copy (bilingual). The site's default language is English.
const landing: LocaleTable = {
  en: {
    // Nav
    navFeatures: 'Features',
    navHow: 'How it works',
    navFaq: 'FAQ',
    navGithub: 'GitHub',
    openApp: 'Open the builder',

    // Hero
    heroBadge: 'Open source · Free · 100% local',
    heroTitle: 'Build interactive courses and export to SCORM — right in your browser',
    heroSubtitle:
      'Scormly is a local-first, block-based course builder. No backend, no sign-up. Your content never leaves your computer, and you export a standards-compliant SCORM package in one click.',
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
    featuresSubtitle: 'A focused block editor with the building blocks of modern e-learning.',
    f1Title: 'Block-based editor',
    f1Text: 'Compose lessons from content blocks with inline WYSIWYG editing.',
    f2Title: 'Rich block library',
    f2Text: 'Headings, text, lists, images, galleries, video, tabs, accordions, flashcards, dialogue scenarios and quizzes.',
    f3Title: 'Graded quizzes',
    f3Text: 'Single choice, multiple choice and matching questions with per-answer feedback and a passing score.',
    f4Title: 'Global themes',
    f4Text: 'Switch the look of buttons and interactions across the whole project with one click.',
    f5Title: 'SCORM 1.2 / 2004 export',
    f5Text: 'Generate a ready-to-upload SCORM package for Moodle and any other LMS — built entirely client-side.',
    f6Title: 'Bilingual interface',
    f6Text: 'Use the builder in English or Ukrainian, with more languages on the way.',
    f7Title: 'AI-friendly',
    f7Text: 'A local project is plain JSON, so you can point an AI assistant at it to edit or generate whole courses. Each project ships with an AGENTS.md guide that documents the format and every block type.',

    // How it works
    howTitle: 'From idea to SCORM in three steps',
    how1Title: 'Create a project',
    how1Text: 'Pick a folder on your computer. Scormly saves your project and media there directly.',
    how2Title: 'Build your lessons',
    how2Text: 'Add blocks, write content, drop in media and quizzes, and pick a theme.',
    how3Title: 'Export to SCORM',
    how3Text: 'Download a single .zip package and upload it to your LMS. Done.',

    // FAQ
    faqTitle: 'Frequently asked questions',
    faqQ1: 'Is Scormly really free?',
    faqA1: 'Yes. Scormly is open source under the MIT license and free to use, forever. There are no paid tiers or hidden limits.',
    faqQ2: 'Where is my data stored?',
    faqA2: 'On your own computer. Scormly writes your project and media to a folder you choose via the File System Access API. There is no server, so nothing is uploaded or stored remotely.',
    faqQ3: 'Which LMS platforms are supported?',
    faqA3: 'Scormly exports standard SCORM 1.2 (and 2004) packages, which work with Moodle, TalentLMS, iSpring, and virtually any SCORM-compliant LMS.',
    faqQ4: 'Do I need to install anything?',
    faqA4: 'No. Scormly runs entirely in the browser. For saving to disk you need a Chromium-based browser (Chrome or Edge) that supports the File System Access API.',
    faqQ5: 'Can I self-host it?',
    faqA5: 'Absolutely. It is a static site — clone the repository, run the build, and host the output anywhere, or just use it locally.',
    faqQ6: 'Can it replace commercial authoring tools?',
    faqA6: 'Scormly follows a modern block-based authoring approach, but it is local-first, free and open source. It is a great fit if you want full control over your data.',
    faqQ7: 'Can I build courses with AI?',
    faqA7: 'Yes. A Scormly project is a single project.json file, so you can let an AI assistant read and edit it to modify or author courses. Every project includes an AGENTS.md file documenting the data model and all block types, so the assistant knows exactly how to build valid content.',

    // Footer
    footerTagline: 'Local-first course builder with SCORM export.',
    footerLicense: 'MIT licensed',
    footerIssues: 'Report an issue',
    footerMade: 'Open source, made for educators.',
  },
  uk: {
    // Nav
    navFeatures: 'Можливості',
    navHow: 'Як це працює',
    navFaq: 'FAQ',
    navGithub: 'GitHub',
    openApp: 'Відкрити конструктор',

    // Hero
    heroBadge: 'Open source · Безкоштовно · 100% локально',
    heroTitle: 'Створюйте інтерактивні курси й експортуйте в SCORM — прямо в браузері',
    heroSubtitle:
      'Scormly — це local-first блочний конструктор курсів. Без сервера й реєстрації. Ваш контент ніколи не залишає комп’ютер, а готовий SCORM-пакет ви отримуєте в один клік.',
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
    featuresSubtitle: 'Сфокусований блочний редактор з будівельними блоками сучасного e-learning.',
    f1Title: 'Блочний редактор',
    f1Text: 'Складайте уроки з контентних блоків з інлайн-редагуванням WYSIWYG.',
    f2Title: 'Багата бібліотека блоків',
    f2Text: 'Заголовки, текст, списки, зображення, галереї, відео, вкладки, акордеони, картки, діалогові сценарії та квізи.',
    f3Title: 'Квізи з оцінюванням',
    f3Text: 'Питання single/multiple choice та на відповідність із фідбеком до відповідей і прохідним балом.',
    f4Title: 'Глобальні теми',
    f4Text: 'Змінюйте вигляд кнопок та інтерактиву по всьому проєкту одним кліком.',
    f5Title: 'Експорт SCORM 1.2 / 2004',
    f5Text: 'Готовий до завантаження SCORM-пакет для Moodle та будь-якої LMS — повністю на стороні клієнта.',
    f6Title: 'Двомовний інтерфейс',
    f6Text: 'Користуйтеся конструктором англійською чи українською, інші мови — на підході.',
    f7Title: 'Дружній до AI',
    f7Text: 'Локальний проєкт — це звичайний JSON, тож можна спрямувати AI-асистента на нього, щоб редагувати чи генерувати цілі курси. До кожного проєкту додається інструкція AGENTS.md з описом формату й усіх типів блоків.',

    // How it works
    howTitle: 'Від ідеї до SCORM за три кроки',
    how1Title: 'Створіть проєкт',
    how1Text: 'Оберіть папку на комп’ютері. Scormly зберігатиме проєкт і медіа просто в неї.',
    how2Title: 'Наповніть уроки',
    how2Text: 'Додавайте блоки, пишіть контент, вставляйте медіа та квізи, обирайте тему.',
    how3Title: 'Експортуйте в SCORM',
    how3Text: 'Завантажте єдиний .zip-пакет і залийте його у вашу LMS. Готово.',

    // FAQ
    faqTitle: 'Часті запитання',
    faqQ1: 'Scormly справді безкоштовний?',
    faqA1: 'Так. Scormly — open source за ліцензією MIT і безкоштовний назавжди. Немає платних тарифів чи прихованих обмежень.',
    faqQ2: 'Де зберігаються мої дані?',
    faqA2: 'На вашому комп’ютері. Scormly записує проєкт і медіа в обрану вами папку через File System Access API. Сервера немає, тож нічого не завантажується й не зберігається віддалено.',
    faqQ3: 'Які LMS підтримуються?',
    faqA3: 'Scormly експортує стандартні пакети SCORM 1.2 (і 2004), які працюють із Moodle, TalentLMS, iSpring та практично будь-якою SCORM-сумісною LMS.',
    faqQ4: 'Чи треба щось встановлювати?',
    faqA4: 'Ні. Scormly працює повністю в браузері. Для збереження на диск потрібен браузер на базі Chromium (Chrome або Edge) із підтримкою File System Access API.',
    faqQ5: 'Чи можна розгорнути в себе?',
    faqA5: 'Звісно. Це статичний сайт — клонуйте репозиторій, зберіть і розмістіть результат будь-де, або просто використовуйте локально.',
    faqQ6: 'Чи може це замінити комерційні інструменти авторингу?',
    faqA6: 'Scormly використовує сучасний блочний підхід до авторингу, але є local-first, безкоштовним і відкритим. Чудовий вибір, якщо хочете повний контроль над даними.',
    faqQ7: 'Чи можна створювати курси за допомогою AI?',
    faqA7: 'Так. Проєкт Scormly — це єдиний файл project.json, тож AI-асистент може читати й редагувати його, щоб змінювати чи створювати курси. До кожного проєкту входить файл AGENTS.md з описом моделі даних і всіх типів блоків, тож асистент точно знає, як побудувати коректний контент.',

    // Footer
    footerTagline: 'Local-first конструктор курсів з експортом у SCORM.',
    footerLicense: 'Ліцензія MIT',
    footerIssues: 'Повідомити про проблему',
    footerMade: 'Open source, для освітян.',
  },
}

export default landing
