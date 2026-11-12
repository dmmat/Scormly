import type { LocaleTable } from '../types.ts'

// SEO landing page copy (en / uk / fr / es). The site's default language is English.
const landing: LocaleTable = {
  en: {
    // Nav
    navFeatures: 'Features',
    navHow: 'How it works',
    navFaq: 'FAQ',
    navAi: 'AI',
    navGithub: 'GitHub',
    openApp: 'Open the builder',

    // Hero
    heroBadge: 'Open source · Free · 100% local',
    heroTitle:
      'Free SCORM editor and authoring tool — right in your browser',
    heroSubtitle:
      'Scormly is a free, open-source SCORM authoring tool and course creator that works online in your browser. Build interactive courses from blocks and export a SCORM 1.2, SCORM 2004 or cmi5 package in one click — no backend, no sign-up, and your content never leaves your computer.',
    heroCtaPrimary: 'Start building — free',
    heroCtaSecondary: 'View on GitHub',
    heroCtaDemo: 'Open the demo course',
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

    // Who it is for
    whoTitle:
      'Who Scormly is for',
    whoSubtitle:
      'One tool for anyone who needs a SCORM course without a license, an install or a cloud account.',
    who1Title:
      'Instructional designers',
    who1Text:
      'Build interactive SCORM and cmi5 courses with quizzes, scenarios and flashcards, without paying for a seat in a commercial authoring tool.',
    who2Title:
      'Teachers and Moodle admins',
    who2Text:
      'Create a course in the browser and upload the package to Moodle or any other LMS in minutes. Progress, scores and answers are tracked.',
    who3Title:
      'Small L&D teams',
    who3Text:
      'Share projects as a .zip, review them with comments on any block, and keep every course as plain files you own.',
    who4Title:
      'Privacy- and accessibility-minded organisations',
    who4Text:
      'Nothing is uploaded: there is no server. Courses are designed to help meet WCAG 2.1 AA, and the course check flags accessibility gaps before export.',

    // Privacy callout
    privacyTitle: 'Your data stays on your machine',
    privacyText:
      'Scormly has no backend. Your project stays on your device: in the browser’s private storage, in a folder on your disk (Chrome and Edge), or as a project .zip you can back up and share. SCORM packaging happens inside the browser. No accounts, no analytics on your content, no uploads. Privacy by architecture, not by promise.',

    // Features
    designBadge: 'Design',
    designTitle: 'Courses that look designed, not assembled',
    designSubtitle: 'A cover page, block styles from your theme, image and quote layouts, carousels and smooth motion — polished courses without a designer.',
    designSwatches: 'Try a block background',
    designPoint1Title: 'Cover page and themed blocks',
    designPoint1Text: 'Open the course with a title page, then give any block a background from your theme — tint, color, gradient or dark. Change the theme and everything follows.',
    designPoint2Title: 'Ready-made blocks',
    designPoint2Text: 'Statements, testimonials with photos, quotes on images, image & text, text on image, full-width pictures and photo carousels — one click each.',
    designPoint3Title: 'Downloads for learners',
    designPoint3Text: 'Attach PDFs, spreadsheets, slides or archives; they ship inside the SCORM package and download with their original names.',
    designPoint4Title: 'Motion and layout',
    designPoint4Text: 'Blocks glide in as learners scroll, lessons slide into place, and you choose the content width and typography. Reduced-motion settings are always respected.',
    featuresTitle: 'Everything you need to author a course',
    featuresSubtitle: 'A focused block editor with the building blocks of modern e-learning — and nothing you don’t need.',
    f1Title: 'Rich block library',
    f1Text: 'Text, media, tabs, accordions, flashcards and dialogue scenarios with a chat layout — plus interactive image hotspots, timelines, process diagrams, step-by-step guides, comparisons, before / after sliders, reflections, sort-the-order and fill-in-the-blanks exercises. Need something else? A Widget block takes your own HTML and JavaScript or an uploaded .html / .zip.',
    f2Title: 'Graded quizzes',
    f2Text: 'Single and multiple choice, matching, ordering and fill-in-the-blank questions in one test, with feedback and a passing score — every answer reported to your LMS.',
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
    f8Title: '10 global themes',
    f8Text: 'From Rose and Ocean to Mono and Terminal: switch the colors and the look of buttons and interactions across the whole project with one click — every theme tuned for WCAG AA contrast.',
    f9Title: 'Install as an app',
    f9Text: 'Install Scormly from Chrome or Edge and launch it from your desktop like any other app.',
    f10Title: 'Multilingual interface',
    f10Text: 'Use the builder in English, Ukrainian, French or Spanish, with more languages on the way.',

    // Accessibility section
    a11yBadge: 'Accessible by design',
    a11yTitle: 'Courses every learner can use',
    a11ySubtitle:
      'Scormly courses are designed to help you meet WCAG 2.1 AA out of the box — the exported player handles the accessible markup, so you can focus on the content.',
    a11yPoint1Title: 'Keyboard navigation',
    a11yPoint1Text:
      'Every block — tabs, flashcards, hotspots, quizzes, exercises — works from the keyboard, with a visible focus ring and a “Skip to content” link.',
    a11yPoint2Title: 'Screen-reader friendly',
    a11yPoint2Text:
      'Semantic headings and labelled controls; lesson changes and quiz feedback are announced, and correct or wrong is never shown by color alone.',
    a11yPoint3Title: 'Captions & transcripts',
    a11yPoint3Text:
      'Add WebVTT captions to videos and transcripts to video and audio, and mark purely decorative images so screen readers skip them.',
    a11yPoint4Title: 'Learner accessibility menu',
    a11yPoint4Text:
      'Learners pick a larger text size, high contrast, readable spacing or reduced motion — remembered on their device. Every theme meets AA contrast.',
    a11yPoint5Title: 'Checked before export',
    a11yPoint5Text:
      'The course check flags missing alt text, captions, transcripts, embed titles and content language before you publish.',
    a11yPoint6Title: 'Respects LMS preferences',
    a11yPoint6Text:
      'The exported SCORM / cmi5 player reads the learner’s caption and language preferences from the LMS and applies them.',
    a11yNote:
      'Accessibility also depends on your content: write meaningful alt text, accurate captions and clear language. Scormly gives you the tools and the checks.',
    a11yVisualLabel: 'Illustrative example of the learner accessibility menu in an exported course',
    a11yMockTitle: 'Accessibility settings',
    a11yMockTextSize: 'Text size',
    a11yMockSizeNormal: 'Normal',
    a11yMockSizeLarge: 'Large',
    a11yMockSizeXl: 'Extra large',
    a11yMockContrast: 'High contrast',
    a11yMockSpacing: 'Readable spacing',
    a11yMockMotion: 'Reduce motion',
    a11yMockCaptions: 'Captions on by default',
    a11yMockLms: 'Captions preference from LMS applied',

    // AI-ready section
    aiBadge: 'AI-ready',
    aiTitle: 'Build courses together with your AI assistant',
    aiSubtitle:
      'A Scormly project is a folder of plain, documented files, so AI agents like Claude, ChatGPT or Cursor can read, write and check courses alongside you.',
    aiPoint1Title: 'AGENTS.md in every project',
    aiPoint1Text:
      'Each project folder ships with a guide to the project.json format and every block type, so any agent knows how to author valid content.',
    aiPoint2Title: 'Works with the assistant you use',
    aiPoint2Text:
      'Point Claude Code, Cursor or ChatGPT at the project folder: the agent writes lessons, blocks and quizzes into project.json, and you review, preview and export in Scormly.',
    aiPoint3Title: 'Still 100% local',
    aiPoint3Text:
      'The agent works on files on your own disk. Scormly uploads nothing — what you share with an assistant is up to you.',
    aiTermComment: '# ask your assistant',
    aiTermPrompt: 'read AGENTS.md, then add a phishing lesson',
    aiChatPrompt: 'Add a lesson on spotting phishing with a timeline and a 3-question quiz, then export it for our LMS.',
    aiStep1: 'Read AGENTS.md',
    aiStep2: 'Added lesson “Spotting phishing”',
    aiStep3: 'Added timeline and quiz blocks',
    aiStep4: 'Course check: no issues',
    aiStep5: 'Ready to preview and export in Scormly',
    aiVisualLabel: 'Illustrative example of an AI assistant editing a Scormly project',

    // What's new
    navNews: 'What’s new',
    navMenu: 'Menu',
    navNewTab: 'opens in a new tab',
    newsBadge: 'Changelog',
    newsTitle: 'What’s new',
    newsSubtitle: 'Scormly ships often. Here are the latest updates to the builder.',
    newsLatest: 'Latest',
    newsMore: 'Follow development on GitHub',

    // How it works
    howTitle: 'From idea to SCORM in three steps',
    how1Title: 'Create a project',
    how1Text:
      'Start in the browser with one click, or pick a folder on your computer (Chrome and Edge). Scormly saves your project and media there automatically.',
    how2Title: 'Build your lessons',
    how2Text: 'Add blocks, write content, drop in media and quizzes, and pick a theme.',
    how3Title: 'Export to SCORM',
    how3Text: 'Download a single SCORM or cmi5 .zip package and upload it to your LMS. Done.',

    // FAQ
    faqTitle: 'Frequently asked questions',
    faqQ1: 'Is Scormly really free?',
    faqA1: 'Yes. Scormly is open source under the MIT license and free to use, forever. There are no paid tiers or hidden limits.',
    faqQ2: 'Where is my data stored?',
    faqA2:
      'On your own device. You choose where a project lives: in the browser’s private storage (Chrome, Edge, Firefox), in a folder on your disk (Chrome and Edge, via the File System Access API), or as a project .zip. There is no server, so nothing is uploaded or stored remotely.',
    faqQ3: 'Which LMS platforms are supported?',
    faqA3: 'Scormly exports SCORM 1.2, SCORM 2004 and cmi5 (xAPI) packages that work with Moodle, TalentLMS, SCORM Cloud and virtually any standards-compliant LMS. Progress, quiz scores and individual answers are reported back, and learners resume where they left off.',
    faqQ4: 'Do I need to install anything?',
    faqA4:
      'No. Scormly runs entirely in the browser. For saving to a folder on disk you need a Chromium-based browser (Chrome or Edge) that supports the File System Access API; other browsers, such as Firefox, keep projects in the browser’s private storage. If you like, you can also install it as an app from the browser.',
    faqQ5: 'Can I self-host it?',
    faqA5: 'Absolutely. It is a static site — clone the repository, run the build, and host the output anywhere, or just use it locally.',
    faqQ6:
      'Can Scormly replace commercial authoring tools?',
    faqA6:
      'For many courses, yes. Scormly covers block-based courses with lessons, media, graded quizzes, branching dialogue scenarios, flashcards, hotspots and custom HTML widgets, and exports SCORM 1.2, SCORM 2004 and cmi5 with scores and question interactions. It is free, open source and keeps your data on your device. It is a different approach from slide-based tools: if you need timeline animation on slides, screen recording or a vendor support contract, a commercial tool may still fit better.',
    faqQ7: 'Can I build courses with AI?',
    faqA7: 'Yes. Every project folder includes an AGENTS.md file that documents project.json and all block types, so an assistant like Claude, ChatGPT or Cursor can author valid courses.',
    faqQ8: 'Can I check my course before publishing?',
    faqA8: 'Yes. Export runs a course check first and lists problems such as empty lessons, missing media or quiz questions without a correct answer, so you can fix them before uploading to your LMS.',
    faqQ9: 'Can I use the builder without a mouse?',
    faqA9: 'Yes. Menus, dialogs and lists work fully from the keyboard, lessons and blocks can be reordered with keys, and pressing ? shows every shortcut.',
    faqQ10: 'Is there a free, open-source SCORM editor?',
    faqA10: 'Yes — Scormly is a free SCORM editor and SCORM course creator released under the MIT license. The source code is on GitHub, it works online in the browser without an account, and you can self-host it or use it offline as an installed app.',
    faqQ11: 'Can I try a SCORM demo before building a course?',
    faqA11: 'Yes. The live demo on this page runs the same interactive blocks your learners get — dialogue trainer, quiz, flashcards and course outline. When you are ready, open the builder and export your own SCORM package.',
    faqQ12: 'Are Scormly courses accessible?',
    faqA12: 'Scormly is designed to help you meet WCAG 2.1 AA. The exported player provides keyboard navigation, screen-reader friendly markup and announcements, captions and transcripts, AA-contrast themes and a learner accessibility menu (text size, high contrast, readable spacing, reduced motion). The course check flags missing alt text, captions, transcripts and more before export. Final conformance still depends on your content, so review it with your own accessibility process.',
    faqQ13: 'Does SCORM or cmi5 support accessibility?',
    faqA13: 'SCORM and cmi5 are packaging and tracking standards — they do not make a course accessible by themselves. Accessibility depends on the HTML content inside the package, which Scormly’s player builds with accessibility in mind. SCORM does carry learner preferences such as captioning and language (and cmi5 carries language), and the Scormly player respects them.',
    faqQ14: 'What is the best free SCORM authoring tool?',
    faqA14: 'It depends on what you build. Scormly is a free, open-source option that runs in the browser with no install or account and exports SCORM 1.2, SCORM 2004 and cmi5. Other free tools include Adapt (self-hosted, responsive courses), eXeLearning (open-source desktop and web editor) and H5P with Lumi (interactive pieces, SCORM 1.2). Choose by the export format your LMS needs and whether you want to install anything.',
    faqQ15: 'How do I create a SCORM package for free?',
    faqA15: 'Open Scormly in your browser, create a project, add lessons and blocks (text, media, quizzes), and click Export. Choose SCORM 1.2, SCORM 2004 or cmi5, and Scormly builds the .zip package in your browser. Upload that .zip to your LMS as a SCORM activity. No sign-up and no software to install.',
    faqQ16: 'Should I export SCORM 1.2, SCORM 2004 or cmi5?',
    faqA16: 'Use what your LMS supports best. SCORM 1.2 is the most widely supported and works almost everywhere. SCORM 2004 (4th edition) reports more detail, such as separate completion and success status. cmi5 is the modern xAPI-based standard for LMSs that support it. Scormly exports all three from the same course, so you can switch at any time.',
    faqQ17: 'Is Scormly a free alternative to Articulate Storyline or Rise?',
    faqA17: 'Yes, for block-based courses. Like Rise, Scormly builds courses from blocks in the browser, and it exports SCORM 1.2, SCORM 2004 and cmi5. Unlike Articulate 360, it is free, open source and stores nothing in the cloud. Storyline’s slide-based timeline animations are a different approach that Scormly does not copy.',
    faqQ18: 'Does Scormly work with Moodle?',
    faqA18: 'Yes. Export your course as a SCORM package and add it in Moodle as a SCORM package activity. Moodle tracks completion, score and attempts, and learners resume where they left off. The same package works in TalentLMS, SCORM Cloud and other standards-compliant LMSs.',
    faqQ19: 'In which languages can learners take a Scormly course?',
    faqA19: 'The course player supports English, Ukrainian, Spanish, French, German, Italian, Dutch and Portuguese, or picks the language automatically. The builder itself is available in English, Ukrainian, French and Spanish.',


    // About the project
    aboutTitle:
      'About the project',
    aboutText:
      'Scormly is an independent open-source project, developed in the open on GitHub. Questions, ideas and feedback are welcome.',
    aboutVersion:
      'Version',
    aboutReleased:
      'Latest release',
    aboutLicense:
      'License',
    aboutRepo:
      'Source code',
    aboutNews:
      'See what’s new',

    // Contribute CTA
    contributeBadge: 'Open source',
    contributeTitle: "Let's build Scormly together",
    contributeText:
      'Scormly is open source and moving fast. Star the repo, open an issue, or send a pull request — new blocks, languages, integrations and ideas are all welcome.',
    contributeCta: 'Become a contributor',
    contributeIssues: 'Suggest a feature',

    // Footer
    footerTagline: 'Free, open-source SCORM editor and course builder with SCORM and cmi5 export.',
    footerLicense: 'MIT licensed',
    footerIssues: 'Report an issue',
    footerDemo: 'Demo course',
    footerMade: 'Open source, made for educators.',
  },
  uk: {
    // Nav
    navFeatures: 'Можливості',
    navHow: 'Як це працює',
    navFaq: 'FAQ',
    navAi: 'AI',
    navGithub: 'GitHub',
    openApp: 'Відкрити конструктор',

    // Hero
    heroBadge: 'Open source · Безкоштовно · 100% локально',
    heroTitle:
      'Безкоштовний SCORM-редактор і інструмент авторингу — прямо в браузері',
    heroSubtitle:
      'Scormly — безкоштовний інструмент для створення SCORM-курсів з відкритим кодом, що працює онлайн у браузері. Створюйте інтерактивні курси з блоків і експортуйте пакет SCORM 1.2, SCORM 2004 чи cmi5 в один клік — без сервера й реєстрації, а ваш контент ніколи не залишає комп’ютер.',
    heroCtaPrimary: 'Почати безкоштовно',
    heroCtaSecondary: 'Подивитися на GitHub',
    heroCtaDemo: 'Відкрити демо-курс',
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

    // Who it is for
    whoTitle:
      'Для кого Scormly',
    whoSubtitle:
      'Один інструмент для всіх, кому потрібен SCORM-курс без ліцензії, встановлення чи хмарного акаунта.',
    who1Title:
      'Педагогічні дизайнери',
    who1Text:
      'Створюйте інтерактивні курси SCORM і cmi5 з тестами, сценаріями й картками, не платячи за місце в комерційному інструменті авторингу.',
    who2Title:
      'Викладачі та адміністратори Moodle',
    who2Text:
      'Створіть курс у браузері й за кілька хвилин завантажте пакет у Moodle чи будь-яку іншу LMS. Прогрес, бали й відповіді відстежуються.',
    who3Title:
      'Невеликі L&D-команди',
    who3Text:
      'Діліться проєктами як .zip, рецензуйте їх коментарями до будь-якого блоку й зберігайте кожен курс як звичайні файли, що належать вам.',
    who4Title:
      'Організації, яким важливі приватність і доступність',
    who4Text:
      'Нічого не завантажується: сервера немає. Курси створені так, щоб допомогти відповідати WCAG 2.1 AA, а перевірка курсу показує прогалини в доступності ще до експорту.',

    // Privacy callout
    privacyTitle: 'Ваші дані залишаються на вашому комп’ютері',
    privacyText:
      'У Scormly немає бекенду. Проєкт залишається на вашому пристрої: у приватному сховищі браузера, у папці на диску (Chrome і Edge) або як .zip проєкту, який можна зберегти як копію чи передати колегам. SCORM-пакет збирається в браузері. Жодних акаунтів, жодної аналітики вашого контенту, жодних завантажень на сервер. Приватність на рівні архітектури, а не обіцянок.',

    // Features
    designBadge: 'Дизайн',
    designTitle: 'Курси, що виглядають задизайненими, а не зібраними',
    designSubtitle: 'Титульна сторінка, стилі блоків із вашої теми, макети зображень і цитат, каруселі та плавна анімація — гарні курси без дизайнера.',
    designSwatches: 'Спробуйте фон блоку',
    designPoint1Title: 'Титульна сторінка й блоки в стилі теми',
    designPoint1Text: 'Відкрийте курс обкладинкою, а будь-якому блоку дайте фон із вашої теми — відтінок, колір, градієнт чи темний. Змініть тему — і все підлаштується.',
    designPoint2Title: 'Готові блоки',
    designPoint2Text: 'Акцентні фрази, відгуки з фото, цитати на зображенні, фото й текст, текст на фото, зображення на всю ширину та фотокаруселі — в один клік.',
    designPoint3Title: 'Матеріали для студентів',
    designPoint3Text: 'Прикріплюйте PDF, таблиці, презентації чи архіви: вони потрапляють у SCORM-пакет і завантажуються з оригінальними назвами.',
    designPoint4Title: 'Анімація й макет',
    designPoint4Text: 'Блоки плавно з’являються під час прокручування, уроки змінюються з переходом, а ширину контенту й типографіку ви обираєте самі. Налаштування зменшення анімації завжди враховуються.',
    featuresTitle: 'Усе для створення курсу',
    featuresSubtitle: 'Сфокусований блочний редактор з будівельними блоками сучасного e-learning — і нічого зайвого.',
    f1Title: 'Багата бібліотека блоків',
    f1Text: 'Текст, медіа, вкладки, акордеони, картки й діалогові сценарії з чат-виглядом — а також інтерактивні зображення з гарячими точками, таймлайни, схеми процесів, покрокові інструкції, порівняння, слайдери «до / після», рефлексії, вправи на впорядкування та заповнення пропусків. Потрібне щось інше? Блок «Віджет» приймає власний HTML і JavaScript або завантажений .html / .zip.',
    f2Title: 'Квізи з оцінюванням',
    f2Text: 'Питання з однією чи кількома відповідями, на відповідність, упорядкування й заповнення пропусків в одному тесті, із фідбеком і прохідним балом — кожна відповідь потрапляє у звіт LMS.',
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
    f8Title: '10 глобальних тем',
    f8Text: 'Від Rose та Ocean до Mono й Terminal: змінюйте кольори й вигляд кнопок та інтерактиву по всьому проєкту одним кліком — кожна тема з контрастом рівня WCAG AA.',
    f9Title: 'Встановлюється як застосунок',
    f9Text: 'Встановіть Scormly з Chrome чи Edge і запускайте з робочого столу, як звичайну програму.',
    f10Title: 'Багатомовний інтерфейс',
    f10Text: 'Користуйтеся конструктором українською, англійською, французькою чи іспанською, інші мови — на підході.',

    // Accessibility section
    a11yBadge: 'Доступність за замовчуванням',
    a11yTitle: 'Курси, якими може користуватися кожен',
    a11ySubtitle:
      'Курси Scormly створені так, щоб допомогти вам відповідати WCAG 2.1 AA одразу — доступну розмітку бере на себе експортований плеєр, а ви зосереджуєтеся на змісті.',
    a11yPoint1Title: 'Навігація з клавіатури',
    a11yPoint1Text:
      'Кожен блок — вкладки, картки, гарячі точки, тести, вправи — працює з клавіатури, з помітною рамкою фокуса й посиланням «Перейти до вмісту».',
    a11yPoint2Title: 'Зручно для програм зчитування екрана',
    a11yPoint2Text:
      'Семантичні заголовки й підписані елементи керування; зміна уроку та фідбек тестів озвучуються, а правильність відповіді ніколи не передається лише кольором.',
    a11yPoint3Title: 'Субтитри й розшифровки',
    a11yPoint3Text:
      'Додавайте субтитри WebVTT до відео й текстові розшифровки до відео та аудіо, а суто декоративні зображення позначайте, щоб програми зчитування їх пропускали.',
    a11yPoint4Title: 'Меню доступності для слухача',
    a11yPoint4Text:
      'Слухач обирає більший текст, високу контрастність, зручні інтервали чи менше анімації — налаштування зберігаються на його пристрої. Кожна тема має контраст рівня AA.',
    a11yPoint5Title: 'Перевірка перед експортом',
    a11yPoint5Text:
      'Перевірка курсу знаходить відсутні alt-тексти, субтитри, розшифровки, назви вбудованого контенту й мову контенту ще до публікації.',
    a11yPoint6Title: 'Враховує налаштування з LMS',
    a11yPoint6Text:
      'Експортований плеєр SCORM / cmi5 зчитує налаштування субтитрів і мови слухача з LMS і застосовує їх.',
    a11yNote:
      'Доступність залежить і від вашого контенту: пишіть змістовні alt-тексти, точні субтитри й зрозумілі тексти. Scormly дає інструменти й перевірки.',
    a11yVisualLabel: 'Ілюстративний приклад меню доступності для слухача в експортованому курсі',
    a11yMockTitle: 'Налаштування доступності',
    a11yMockTextSize: 'Розмір тексту',
    a11yMockSizeNormal: 'Звичайний',
    a11yMockSizeLarge: 'Великий',
    a11yMockSizeXl: 'Дуже великий',
    a11yMockContrast: 'Висока контрастність',
    a11yMockSpacing: 'Зручні інтервали',
    a11yMockMotion: 'Менше анімації',
    a11yMockCaptions: 'Субтитри за замовчуванням',
    a11yMockLms: 'Застосовано налаштування субтитрів з LMS',

    // AI-ready section
    aiBadge: 'Готовий до AI',
    aiTitle: 'Створюйте курси разом з AI-асистентом',
    aiSubtitle:
      'Проєкт Scormly — це папка зі звичайними задокументованими файлами, тож AI-агенти на кшталт Claude, ChatGPT чи Cursor можуть читати, писати й перевіряти курси разом з вами.',
    aiPoint1Title: 'AGENTS.md у кожному проєкті',
    aiPoint1Text:
      'У кожній папці проєкту є інструкція з форматом project.json і всіма типами блоків, тож будь-який агент знає, як створити коректний контент.',
    aiPoint2Title: 'Працює з вашим асистентом',
    aiPoint2Text:
      'Відкрийте папку проєкту в Claude Code, Cursor чи ChatGPT: агент пише уроки, блоки й тести в project.json, а ви переглядаєте й експортуєте курс у Scormly.',
    aiPoint3Title: 'Так само 100% локально',
    aiPoint3Text:
      'Агент працює з файлами на вашому диску. Scormly нічого не завантажує — чим ділитися з асистентом, вирішуєте ви.',
    aiTermComment: '# попросіть асистента',
    aiTermPrompt: 'прочитай AGENTS.md і додай урок про фішинг',
    aiChatPrompt: 'Додай урок про розпізнавання фішингу з таймлайном і тестом на 3 питання, а потім експортуй для нашої LMS.',
    aiStep1: 'Прочитано AGENTS.md',
    aiStep2: 'Додано урок «Як розпізнати фішинг»',
    aiStep3: 'Додано блоки таймлайну й тесту',
    aiStep4: 'Перевірка курсу: проблем немає',
    aiStep5: 'Готово до перегляду й експорту в Scormly',
    aiVisualLabel: 'Ілюстративний приклад: AI-асистент редагує проєкт Scormly',

    // What's new
    navNews: 'Що нового',
    navMenu: 'Меню',
    navNewTab: 'відкриється в новій вкладці',
    newsBadge: 'Журнал змін',
    newsTitle: 'Що нового',
    newsSubtitle: 'Scormly оновлюється часто. Ось останні зміни в конструкторі.',
    newsLatest: 'Найновіше',
    newsMore: 'Стежте за розробкою на GitHub',

    // How it works
    howTitle: 'Від ідеї до SCORM за три кроки',
    how1Title: 'Створіть проєкт',
    how1Text:
      'Почніть у браузері одним кліком або оберіть папку на комп’ютері (Chrome і Edge). Scormly зберігає проєкт і медіа автоматично.',
    how2Title: 'Наповніть уроки',
    how2Text: 'Додавайте блоки, пишіть контент, вставляйте медіа та квізи, обирайте тему.',
    how3Title: 'Експортуйте в SCORM',
    how3Text: 'Завантажте єдиний .zip-пакет SCORM чи cmi5 і залийте його у вашу LMS. Готово.',

    // FAQ
    faqTitle: 'Часті запитання',
    faqQ1: 'Scormly справді безкоштовний?',
    faqA1: 'Так. Scormly — open source за ліцензією MIT і безкоштовний назавжди. Немає платних тарифів чи прихованих обмежень.',
    faqQ2: 'Де зберігаються мої дані?',
    faqA2:
      'На вашому пристрої. Ви самі обираєте, де живе проєкт: у приватному сховищі браузера (Chrome, Edge, Firefox), у папці на диску (Chrome і Edge, через File System Access API) або як .zip проєкту. Сервера немає, тож нічого не завантажується й не зберігається віддалено.',
    faqQ3: 'Які LMS підтримуються?',
    faqA3: 'Scormly експортує пакети SCORM 1.2, SCORM 2004 і cmi5 (xAPI), які працюють із Moodle, TalentLMS, SCORM Cloud та практично будь-якою сумісною LMS. Прогрес, бали за тести й окремі відповіді передаються в LMS, а слухачі продовжують з місця, де зупинилися.',
    faqQ4: 'Чи треба щось встановлювати?',
    faqA4:
      'Ні. Scormly працює повністю в браузері. Для збереження в папку на диску потрібен браузер на базі Chromium (Chrome або Edge) із підтримкою File System Access API; інші браузери, як-от Firefox, зберігають проєкти у приватному сховищі браузера. За бажання Scormly можна встановити з браузера як застосунок.',
    faqQ5: 'Чи можна розгорнути в себе?',
    faqA5: 'Звісно. Це статичний сайт — клонуйте репозиторій, зберіть і розмістіть результат будь-де, або просто використовуйте локально.',
    faqQ6:
      'Чи може Scormly замінити комерційні інструменти авторингу?',
    faqA6:
      'Для багатьох курсів — так. Scormly покриває блочні курси з уроками, медіа, тестами з оцінюванням, розгалуженими діалоговими сценаріями, картками, гарячими точками й власними HTML-віджетами та експортує SCORM 1.2, SCORM 2004 і cmi5 з балами й відповідями на питання. Він безкоштовний, з відкритим кодом і зберігає дані на вашому пристрої. Це інший підхід, ніж у слайдових інструментів: якщо вам потрібні анімація на таймлайні слайдів, запис екрана чи договір про підтримку від вендора, комерційний інструмент може підійти краще.',
    faqQ7: 'Чи можна створювати курси за допомогою AI?',
    faqA7: 'Так. У кожній папці проєкту є файл AGENTS.md з описом project.json і всіх типів блоків, тож асистент на кшталт Claude, ChatGPT чи Cursor може створювати коректні курси.',
    faqQ8: 'Чи можна перевірити курс перед публікацією?',
    faqA8: 'Так. Перед експортом курс перевіряється, і ви бачите список проблем — порожні уроки, відсутні медіа чи питання без правильної відповіді, — щоб виправити їх до завантаження в LMS.',
    faqQ9: 'Чи можна працювати без миші?',
    faqA9: 'Так. Меню, діалоги й списки повністю доступні з клавіатури, уроки й блоки можна переставляти клавішами, а натиснувши ?, ви побачите всі гарячі клавіші.',
    faqQ10: 'Чи існує безкоштовний SCORM-редактор з відкритим кодом?',
    faqA10: 'Так — Scormly: безкоштовний SCORM-редактор і конструктор SCORM-курсів за ліцензією MIT. Код відкритий на GitHub, редактор працює онлайн у браузері без акаунта, а ще його можна розгорнути в себе чи встановити як застосунок.',
    faqQ11: 'Чи можна спробувати SCORM-демо до створення курсу?',
    faqA11: 'Так. Жива демонстрація на цій сторінці запускає ті самі інтерактивні блоки, що й у ваших слухачів: діалоговий тренажер, квіз, картки та зміст курсу. Коли будете готові — відкрийте конструктор і експортуйте власний SCORM-пакет.',
    faqQ12: 'Чи доступні курси Scormly?',
    faqA12: 'Scormly створений, щоб допомогти вам відповідати WCAG 2.1 AA. Експортований плеєр забезпечує навігацію з клавіатури, розмітку й оголошення для програм зчитування екрана, субтитри та розшифровки, теми з контрастом рівня AA і меню доступності для слухача (розмір тексту, висока контрастність, зручні інтервали, менше анімації). Перевірка курсу перед експортом знаходить відсутні alt-тексти, субтитри, розшифровки тощо. Остаточна відповідність усе ж залежить від вашого контенту, тож перевіряйте його у своєму процесі.',
    faqQ13: 'Чи підтримують SCORM і cmi5 доступність?',
    faqA13: 'SCORM і cmi5 — це стандарти пакування й відстеження, самі по собі вони не роблять курс доступним. Доступність залежить від HTML-контенту всередині пакета, і плеєр Scormly будує його з урахуванням доступності. Водночас SCORM передає налаштування слухача, як-от субтитри й мову (cmi5 — мову), і плеєр Scormly їх враховує.',
    faqQ14: 'Який безкоштовний інструмент для створення SCORM-курсів найкращий?',
    faqA14: 'Залежить від того, що ви створюєте. Scormly — безкоштовний варіант з відкритим кодом, який працює в браузері без встановлення й акаунта та експортує SCORM 1.2, SCORM 2004 і cmi5. Серед інших безкоштовних інструментів — Adapt (розгортається на власному сервері, адаптивні курси), eXeLearning (редактор з відкритим кодом для комп’ютера й вебу) та H5P із Lumi (інтерактивні елементи, SCORM 1.2). Обирайте за форматом експорту, потрібним вашій LMS, і за тим, чи готові ви щось встановлювати.',
    faqQ15: 'Як безкоштовно створити SCORM-пакет?',
    faqA15: 'Відкрийте Scormly у браузері, створіть проєкт, додайте уроки й блоки (текст, медіа, тести) та натисніть «Експорт». Оберіть SCORM 1.2, SCORM 2004 чи cmi5 — і Scormly збере .zip-пакет просто у вашому браузері. Завантажте цей .zip у свою LMS як SCORM-активність. Без реєстрації й без встановлення програм.',
    faqQ16: 'Що експортувати: SCORM 1.2, SCORM 2004 чи cmi5?',
    faqA16: 'Те, що найкраще підтримує ваша LMS. SCORM 1.2 підтримується найширше й працює майже всюди. SCORM 2004 (4-та редакція) передає більше деталей, наприклад окремі статуси завершення й успішності. cmi5 — сучасний стандарт на основі xAPI для LMS, які його підтримують. Scormly експортує всі три формати з того самого курсу, тож змінити вибір можна будь-коли.',
    faqQ17: 'Чи є Scormly безкоштовною альтернативою Articulate Storyline або Rise?',
    faqA17: 'Так, для блочних курсів. Як і Rise, Scormly будує курси з блоків у браузері та експортує SCORM 1.2, SCORM 2004 і cmi5. На відміну від Articulate 360, він безкоштовний, з відкритим кодом і нічого не зберігає в хмарі. Слайдові анімації на таймлайні, як у Storyline, — інший підхід, який Scormly не копіює.',
    faqQ18: 'Чи працює Scormly з Moodle?',
    faqA18: 'Так. Експортуйте курс як SCORM-пакет і додайте його в Moodle як активність «Пакет SCORM». Moodle відстежує завершення, бал і спроби, а слухачі продовжують з місця, де зупинилися. Той самий пакет працює в TalentLMS, SCORM Cloud та інших LMS, сумісних зі стандартами.',
    faqQ19: 'Якими мовами слухачі можуть проходити курс Scormly?',
    faqA19: 'Плеєр курсу підтримує англійську, українську, іспанську, французьку, німецьку, італійську, нідерландську та португальську мови або обирає мову автоматично. Сам конструктор доступний англійською, українською, французькою та іспанською.',


    // About the project
    aboutTitle:
      'Про проєкт',
    aboutText:
      'Scormly — незалежний проєкт з відкритим кодом, який розвивається відкрито на GitHub. Питання, ідеї та відгуки вітаються.',
    aboutVersion:
      'Версія',
    aboutReleased:
      'Останній реліз',
    aboutLicense:
      'Ліцензія',
    aboutRepo:
      'Вихідний код',
    aboutNews:
      'Що нового',

    // Contribute CTA
    contributeBadge: 'Відкритий код',
    contributeTitle: 'Розвиваймо Scormly разом',
    contributeText:
      'Scormly — відкритий і швидко розвивається. Поставте зірочку, відкрийте issue або надішліть pull request — нові блоки, мови, інтеграції та ідеї вітаються.',
    contributeCta: 'Стати контрибʼютором',
    contributeIssues: 'Запропонувати фічу',

    // Footer
    footerTagline: 'Безкоштовний SCORM-редактор і конструктор курсів з відкритим кодом та експортом у SCORM і cmi5.',
    footerLicense: 'Ліцензія MIT',
    footerIssues: 'Повідомити про проблему',
    footerDemo: 'Демо-курс',
    footerMade: 'Open source, для освітян.',
  },
  fr: {
    // Nav
    navFeatures: 'Fonctionnalités',
    navHow: 'Comment ça marche',
    navFaq: 'FAQ',
    navAi: 'IA',
    navGithub: 'GitHub',
    openApp: 'Ouvrir l’éditeur',

    // Hero
    heroBadge: 'Open source · Gratuit · 100 % local',
    heroTitle:
      'Éditeur SCORM gratuit et outil auteur en ligne — directement dans votre navigateur',
    heroSubtitle:
      'Scormly est un outil auteur SCORM gratuit et open source qui fonctionne en ligne, dans votre navigateur. Créez un cours SCORM interactif à partir de blocs et exportez-le en SCORM 1.2, SCORM 2004 ou cmi5 en un clic — sans serveur, sans inscription, et sans que vos contenus quittent votre ordinateur.',
    heroCtaPrimary: 'Créer un cours gratuitement',
    heroCtaSecondary: 'Voir sur GitHub',
    heroCtaDemo: 'Ouvrir le cours de démo',
    heroNote: 'Tout se passe dans votre navigateur. Rien à installer.',

    // Trust pillars
    pillarsTitle: 'À vous, et rien qu’à vous',
    pillarOpenTitle: 'Open source',
    pillarOpenText:
      'Scormly est entièrement open source, sous licence MIT. Lisez le code, hébergez-le vous-même, créez votre fork, contribuez.',
    pillarFreeTitle: 'Entièrement gratuit',
    pillarFreeText:
      'Pas d’abonnement, pas de licence par utilisateur, pas de fonctionnalité payante. Tout est accessible à tous, pour toujours.',
    pillarLocalTitle: 'Local et confidentiel',
    pillarLocalText:
      'Tout s’exécute sur votre appareil. Nous ne stockons rien et ne transmettons rien : il n’existe aucun serveur auquel envoyer vos données.',

    // Who it is for
    whoTitle:
      'À qui s’adresse Scormly',
    whoSubtitle:
      'Un seul outil pour tous ceux qui ont besoin d’un cours SCORM sans licence, sans installation et sans compte dans le cloud.',
    who1Title:
      'Concepteurs pédagogiques',
    who1Text:
      'Créez des cours SCORM et cmi5 interactifs avec quiz, scénarios et cartes mémo, sans payer de licence pour un outil auteur commercial.',
    who2Title:
      'Enseignants et administrateurs Moodle',
    who2Text:
      'Créez un cours dans le navigateur et déposez le paquet sur Moodle ou tout autre LMS en quelques minutes. Progression, scores et réponses sont suivis.',
    who3Title:
      'Petites équipes formation',
    who3Text:
      'Partagez vos projets en .zip, relisez-les en commentant n’importe quel bloc et conservez chaque cours sous forme de simples fichiers qui vous appartiennent.',
    who4Title:
      'Organisations attentives à la confidentialité et à l’accessibilité',
    who4Text:
      'Rien n’est envoyé nulle part : il n’y a pas de serveur. Les cours sont conçus pour vous aider à respecter les WCAG 2.1 AA, et la vérification du cours signale les défauts d’accessibilité avant l’export.',

    // Privacy callout
    privacyTitle: 'Vos données restent sur votre machine',
    privacyText:
      'Scormly n’a pas de serveur. Votre projet reste sur votre appareil : dans le stockage privé du navigateur, dans un dossier de votre disque (Chrome et Edge) ou sous forme de .zip de projet à sauvegarder et à partager. Le paquet SCORM est généré dans le navigateur. Pas de compte, pas d’analyse de vos contenus, pas d’envoi de fichiers. La confidentialité est garantie par l’architecture, pas par une promesse.',

    // Features
    designBadge: 'Design',
    designTitle: 'Des cours au design soigné, pas un simple assemblage',
    designSubtitle: 'Page de couverture, styles de blocs tirés de votre thème, mises en page pour images et citations, carrousels et animations fluides : des cours élégants, sans graphiste.',
    designSwatches: 'Essayez un fond de bloc',
    designPoint1Title: 'Page de couverture et blocs aux couleurs du thème',
    designPoint1Text: 'Ouvrez le cours sur une page de titre, puis donnez à n’importe quel bloc un fond issu de votre thème : teinte, couleur, dégradé ou sombre. Changez de thème, tout suit.',
    designPoint2Title: 'Blocs prêts à l’emploi',
    designPoint2Text: 'Phrases d’accroche, témoignages avec photo, citations sur image, image et texte, texte sur image, visuels pleine largeur et carrousels de photos — en un clic.',
    designPoint3Title: 'Fichiers à télécharger pour les apprenants',
    designPoint3Text: 'Joignez des PDF, des tableurs, des présentations ou des archives : ils sont intégrés au paquet SCORM et se téléchargent sous leur nom d’origine.',
    designPoint4Title: 'Animations et mise en page',
    designPoint4Text: 'Les blocs apparaissent en douceur au fil du défilement, les leçons s’enchaînent avec une transition, et vous choisissez la largeur du contenu et la typographie. Le réglage de réduction des animations est toujours respecté.',
    featuresTitle: 'Tout ce qu’il faut pour créer un cours',
    featuresSubtitle: 'Un éditeur par blocs qui va à l’essentiel, avec toutes les briques du e-learning moderne — et rien de superflu.',
    f1Title: 'Une riche bibliothèque de blocs',
    f1Text: 'Texte, médias, onglets, accordéons, cartes mémo et scénarios de dialogue façon messagerie — mais aussi images à zones cliquables, chronologies, schémas de processus, guides pas à pas, comparaisons, curseurs avant / après, réflexions, exercices de mise en ordre et textes à trous. Il vous faut autre chose ? Le bloc Widget accepte votre propre HTML et JavaScript, ou un fichier .html / .zip importé.',
    f2Title: 'Quiz notés',
    f2Text: 'Choix unique ou multiple, association, mise en ordre et texte à trous dans un même test, avec feedback et score de réussite — chaque réponse est transmise à votre LMS.',
    f3Title: 'Un éditeur qui pardonne',
    f3Text: 'Insérez un bloc où vous voulez, réorganisez librement et annulez n’importe quelle action — même depuis la notification qui suit une suppression.',
    f4Title: 'Export SCORM 1.2 / 2004 et cmi5',
    f4Text: 'Des paquets pour Moodle et tout autre LMS, générés en un clic dans le navigateur. Les apprenants reprennent là où ils s’étaient arrêtés, et une vérification avant export repère les leçons vides, les médias manquants et les questions de quiz sans bonne réponse.',
    f5Title: 'Parcours guidés',
    f5Text: 'Imposez le visionnage des vidéos, verrouillez la navigation en parcours linéaire et choisissez comment l’achèvement est comptabilisé.',
    f6Title: 'Pensé pour le clavier',
    f6Text: 'Des raccourcis pour les actions courantes (appuyez sur ?) et un accès complet au clavier pour les menus, les boîtes de dialogue et la réorganisation.',
    f7Title: 'Aide intégrée',
    f7Text: 'Une visite guidée, des réponses aux questions fréquentes et une page « Nouveautés » — directement dans l’éditeur.',
    f8Title: '10 thèmes globaux',
    f8Text: 'De Rose et Ocean à Mono et Terminal : changez en un clic les couleurs et l’apparence des boutons et des éléments interactifs dans tout le projet — chaque thème respecte le contraste WCAG AA.',
    f9Title: 'Installable comme une application',
    f9Text: 'Installez Scormly depuis Chrome ou Edge et lancez-le depuis votre bureau, comme n’importe quelle application.',
    f10Title: 'Interface multilingue',
    f10Text: 'Utilisez l’éditeur en français, en anglais, en espagnol ou en ukrainien — d’autres langues arrivent.',

    // Accessibility section
    a11yBadge: 'Accessible dès la conception',
    a11yTitle: 'Des cours utilisables par tous les apprenants',
    a11ySubtitle:
      'Les cours Scormly sont conçus pour vous aider à respecter d’emblée les WCAG 2.1 AA : le lecteur exporté se charge du balisage accessible, vous vous concentrez sur le contenu.',
    a11yPoint1Title: 'Navigation au clavier',
    a11yPoint1Text:
      'Chaque bloc — onglets, cartes mémo, zones cliquables, quiz, exercices — s’utilise au clavier, avec un indicateur de focus visible et un lien « Aller au contenu ».',
    a11yPoint2Title: 'Compatible avec les lecteurs d’écran',
    a11yPoint2Text:
      'Titres sémantiques et commandes étiquetées ; les changements de leçon et le feedback des quiz sont annoncés, et une réponse juste ou fausse n’est jamais signalée par la seule couleur.',
    a11yPoint3Title: 'Sous-titres et transcriptions',
    a11yPoint3Text:
      'Ajoutez des sous-titres WebVTT aux vidéos, des transcriptions aux vidéos et aux fichiers audio, et signalez les images purement décoratives pour que les lecteurs d’écran les ignorent.',
    a11yPoint4Title: 'Menu d’accessibilité pour l’apprenant',
    a11yPoint4Text:
      'L’apprenant choisit un texte plus grand, un contraste élevé, un espacement confortable ou des animations réduites — ses réglages sont mémorisés sur son appareil. Tous les thèmes respectent le contraste AA.',
    a11yPoint5Title: 'Vérifié avant l’export',
    a11yPoint5Text:
      'La vérification du cours signale, avant publication, les textes alternatifs, sous-titres, transcriptions et titres de contenus intégrés manquants, ainsi que l’absence de langue du contenu.',
    a11yPoint6Title: 'Respecte les préférences du LMS',
    a11yPoint6Text:
      'Le lecteur SCORM / cmi5 exporté lit dans le LMS les préférences de sous-titres et de langue de l’apprenant, et les applique.',
    a11yNote:
      'L’accessibilité dépend aussi de vos contenus : rédigez des textes alternatifs pertinents, des sous-titres fidèles et des textes clairs. Scormly vous fournit les outils et les contrôles.',
    a11yVisualLabel: 'Exemple illustratif du menu d’accessibilité de l’apprenant dans un cours exporté',
    a11yMockTitle: 'Paramètres d’accessibilité',
    a11yMockTextSize: 'Taille du texte',
    a11yMockSizeNormal: 'Normale',
    a11yMockSizeLarge: 'Grande',
    a11yMockSizeXl: 'Très grande',
    a11yMockContrast: 'Contraste élevé',
    a11yMockSpacing: 'Espacement confortable',
    a11yMockMotion: 'Réduire les animations',
    a11yMockCaptions: 'Sous-titres activés par défaut',
    a11yMockLms: 'Préférence de sous-titres du LMS appliquée',

    // AI-ready section
    aiBadge: 'Prêt pour l’IA',
    aiTitle: 'Créez vos cours avec votre assistant IA',
    aiSubtitle:
      'Un projet Scormly est un dossier de fichiers simples et documentés : des agents IA comme Claude, ChatGPT ou Cursor peuvent donc lire, écrire et vérifier vos cours à vos côtés.',
    aiPoint1Title: 'Un AGENTS.md dans chaque projet',
    aiPoint1Text:
      'Chaque dossier de projet contient un guide du format project.json et de tous les types de blocs : n’importe quel agent sait ainsi produire un contenu valide.',
    aiPoint2Title: 'Compatible avec votre assistant habituel',
    aiPoint2Text:
      'Ouvrez le dossier du projet dans Claude Code, Cursor ou ChatGPT : l’agent écrit les leçons, les blocs et les quiz dans project.json ; vous relisez, prévisualisez et exportez dans Scormly.',
    aiPoint3Title: 'Toujours 100 % local',
    aiPoint3Text:
      'L’agent travaille sur des fichiers de votre propre disque. Scormly n’envoie rien : c’est vous qui décidez ce que vous partagez avec un assistant.',
    aiTermComment: '# demandez à votre assistant',
    aiTermPrompt: 'lis AGENTS.md, puis ajoute une leçon sur le phishing',
    aiChatPrompt: 'Ajoute une leçon pour apprendre à repérer le phishing, avec une chronologie et un quiz de 3 questions, puis exporte-la pour notre LMS.',
    aiStep1: 'AGENTS.md lu',
    aiStep2: 'Leçon « Repérer le phishing » ajoutée',
    aiStep3: 'Blocs chronologie et quiz ajoutés',
    aiStep4: 'Vérification du cours : aucun problème',
    aiStep5: 'Prêt pour l’aperçu et l’export dans Scormly',
    aiVisualLabel: 'Exemple illustratif d’un assistant IA modifiant un projet Scormly',

    // What's new
    navNews: 'Nouveautés',
    navMenu: 'Menu',
    navNewTab: 's’ouvre dans un nouvel onglet',
    newsBadge: 'Journal des modifications',
    newsTitle: 'Nouveautés',
    newsSubtitle: 'Scormly évolue en continu. Voici les dernières nouveautés de l’éditeur.',
    newsLatest: 'Dernière version',
    newsMore: 'Suivre le développement sur GitHub',

    // How it works
    howTitle: 'De l’idée au SCORM en trois étapes',
    how1Title: 'Créez un projet',
    how1Text:
      'Démarrez en un clic dans le navigateur, ou choisissez un dossier sur votre ordinateur (Chrome et Edge). Scormly y enregistre automatiquement votre projet et vos médias.',
    how2Title: 'Composez vos leçons',
    how2Text: 'Ajoutez des blocs, rédigez vos contenus, insérez médias et quiz, puis choisissez un thème.',
    how3Title: 'Exportez en SCORM',
    how3Text: 'Téléchargez un unique paquet .zip SCORM ou cmi5 et déposez-le sur votre LMS. C’est tout.',

    // FAQ
    faqTitle: 'Questions fréquentes',
    faqQ1: 'Scormly est-il vraiment gratuit ?',
    faqA1: 'Oui. Scormly est open source, sous licence MIT, et gratuit pour toujours. Il n’y a ni offre payante ni limite cachée.',
    faqQ2: 'Où mes données sont-elles stockées ?',
    faqA2:
      'Sur votre propre appareil. C’est vous qui choisissez où vit un projet : dans le stockage privé du navigateur (Chrome, Edge, Firefox), dans un dossier de votre disque (Chrome et Edge, via l’API File System Access) ou sous forme de .zip de projet. Il n’y a pas de serveur : rien n’est donc envoyé ni stocké à distance.',
    faqQ3: 'Quels LMS sont pris en charge ?',
    faqA3: 'Scormly exporte des paquets SCORM 1.2, SCORM 2004 et cmi5 (xAPI) compatibles avec Moodle, TalentLMS, SCORM Cloud et pratiquement tous les LMS conformes aux standards. La progression, les scores aux quiz et chaque réponse sont transmis au LMS, et les apprenants reprennent là où ils s’étaient arrêtés.',
    faqQ4: 'Faut-il installer quelque chose ?',
    faqA4:
      'Non. Scormly fonctionne entièrement dans le navigateur. Pour enregistrer dans un dossier de votre disque, il faut un navigateur basé sur Chromium (Chrome ou Edge) compatible avec l’API File System Access ; les autres navigateurs, comme Firefox, conservent les projets dans le stockage privé du navigateur. Si vous le souhaitez, vous pouvez aussi l’installer comme application depuis le navigateur.',
    faqQ5: 'Puis-je l’héberger moi-même ?',
    faqA5: 'Bien sûr. C’est un site statique : clonez le dépôt, lancez le build et hébergez le résultat où vous voulez — ou utilisez-le simplement en local.',
    faqQ6:
      'Scormly peut-il remplacer les outils auteur commerciaux ?',
    faqA6:
      'Pour beaucoup de cours, oui. Scormly couvre les cours par blocs avec leçons, médias, quiz notés, scénarios de dialogue à embranchements, cartes mémo, zones cliquables et widgets HTML sur mesure, et exporte en SCORM 1.2, SCORM 2004 et cmi5 avec les scores et les réponses aux questions. Il est gratuit, open source et garde vos données sur votre appareil. Son approche diffère de celle des outils à base de diapositives : si vous avez besoin d’animations sur une ligne de temps, d’enregistrement d’écran ou d’un contrat de support éditeur, un outil commercial restera peut-être plus adapté.',
    faqQ7: 'Puis-je créer des cours avec l’IA ?',
    faqA7: 'Oui. Chaque dossier de projet contient un fichier AGENTS.md qui documente project.json et tous les types de blocs : un assistant comme Claude, ChatGPT ou Cursor peut ainsi produire des cours valides.',
    faqQ8: 'Puis-je vérifier mon cours avant de le publier ?',
    faqA8: 'Oui. L’export commence par une vérification du cours et liste les problèmes — leçons vides, médias manquants, questions de quiz sans bonne réponse — pour que vous les corrigiez avant le dépôt sur votre LMS.',
    faqQ9: 'Puis-je utiliser l’éditeur sans souris ?',
    faqA9: 'Oui. Les menus, les boîtes de dialogue et les listes s’utilisent entièrement au clavier, les leçons et les blocs se réorganisent avec les touches, et la touche ? affiche tous les raccourcis.',
    faqQ10: 'Existe-t-il un éditeur SCORM gratuit et open source ?',
    faqA10: 'Oui : Scormly est un éditeur SCORM gratuit et un outil de création de cours SCORM publié sous licence MIT. Le code source est sur GitHub, l’éditeur fonctionne en ligne dans le navigateur, sans compte, et vous pouvez l’héberger vous-même ou l’utiliser hors ligne une fois installé comme application.',
    faqQ11: 'Puis-je essayer une démo SCORM avant de créer un cours ?',
    faqA11: 'Oui. La démo interactive de cette page utilise les mêmes blocs que ceux proposés à vos apprenants : entraînement au dialogue, quiz, cartes mémo et plan du cours. Quand vous êtes prêt, ouvrez l’éditeur et exportez votre propre paquet SCORM.',
    faqQ12: 'Les cours Scormly sont-ils accessibles ?',
    faqA12: 'Scormly est conçu pour vous aider à respecter les WCAG 2.1 AA. Le lecteur exporté offre la navigation au clavier, un balisage et des annonces adaptés aux lecteurs d’écran, des sous-titres et des transcriptions, des thèmes au contraste AA et un menu d’accessibilité pour l’apprenant (taille du texte, contraste élevé, espacement confortable, animations réduites). Avant l’export, la vérification du cours signale notamment les textes alternatifs, sous-titres et transcriptions manquants. La conformité finale dépend toutefois de vos contenus : faites-les valider selon votre propre démarche d’accessibilité.',
    faqQ13: 'SCORM et cmi5 prennent-ils en charge l’accessibilité ?',
    faqA13: 'SCORM et cmi5 sont des standards de conditionnement et de suivi : ils ne rendent pas un cours accessible à eux seuls. L’accessibilité dépend du contenu HTML du paquet, que le lecteur Scormly génère en pensant à l’accessibilité. SCORM transmet en revanche des préférences de l’apprenant, comme les sous-titres et la langue (cmi5, la langue), et le lecteur Scormly en tient compte.',
    faqQ14: 'Quel est le meilleur outil auteur SCORM gratuit ?',
    faqA14: 'Tout dépend de ce que vous créez. Scormly est une solution gratuite et open source qui fonctionne dans le navigateur, sans installation ni compte, et exporte en SCORM 1.2, SCORM 2004 et cmi5. Parmi les autres outils gratuits : Adapt (à héberger soi-même, cours responsive), eXeLearning (éditeur open source pour ordinateur et web) et H5P avec Lumi (activités interactives, SCORM 1.2). Choisissez selon le format d’export attendu par votre LMS et selon que vous acceptez ou non d’installer un logiciel.',
    faqQ15: 'Comment créer un paquet SCORM gratuitement ?',
    faqA15: 'Ouvrez Scormly dans votre navigateur, créez un projet, ajoutez des leçons et des blocs (texte, médias, quiz), puis cliquez sur Exporter. Choisissez SCORM 1.2, SCORM 2004 ou cmi5 : Scormly génère le paquet .zip dans votre navigateur. Déposez ce .zip sur votre LMS en tant qu’activité SCORM. Sans inscription et sans logiciel à installer.',
    faqQ16: 'Faut-il exporter en SCORM 1.2, en SCORM 2004 ou en cmi5 ?',
    faqA16: 'Choisissez le format que votre LMS gère le mieux. SCORM 1.2 est le plus répandu et fonctionne presque partout. SCORM 2004 (4e édition) remonte davantage de détails, par exemple des statuts d’achèvement et de réussite distincts. cmi5 est le standard moderne, fondé sur xAPI, pour les LMS qui le prennent en charge. Scormly exporte les trois à partir du même cours : vous pouvez donc changer à tout moment.',
    faqQ17: 'Scormly est-il une alternative gratuite à Articulate Storyline ou Rise ?',
    faqA17: 'Oui, pour les cours par blocs. Comme Rise, Scormly permet de composer des cours à partir de blocs dans le navigateur et exporte en SCORM 1.2, SCORM 2004 et cmi5. Contrairement à Articulate 360, il est gratuit, open source et ne stocke rien dans le cloud. Les animations sur ligne de temps de Storyline, organisées en diapositives, relèvent d’une autre approche que Scormly ne cherche pas à reproduire.',
    faqQ18: 'Scormly fonctionne-t-il avec Moodle ?',
    faqA18: 'Oui. Exportez votre cours en paquet SCORM et ajoutez-le dans Moodle comme activité « Paquetage SCORM ». Moodle suit l’achèvement, le score et les tentatives, et les apprenants reprennent là où ils s’étaient arrêtés. Le même paquet fonctionne dans TalentLMS, SCORM Cloud et les autres LMS conformes aux standards.',
    faqQ19: 'Dans quelles langues les apprenants peuvent-ils suivre un cours Scormly ?',
    faqA19: 'Le lecteur de cours est disponible en anglais, ukrainien, espagnol, français, allemand, italien, néerlandais et portugais, ou choisit la langue automatiquement. L’éditeur, lui, est disponible en anglais, ukrainien, français et espagnol.',


    // About the project
    aboutTitle:
      'À propos du projet',
    aboutText:
      'Scormly est un projet open source indépendant, développé en toute transparence sur GitHub. Questions, idées et retours sont les bienvenus.',
    aboutVersion:
      'Version',
    aboutReleased:
      'Dernière version',
    aboutLicense:
      'Licence',
    aboutRepo:
      'Code source',
    aboutNews:
      'Voir les nouveautés',

    // Contribute CTA
    contributeBadge: 'Open source',
    contributeTitle: 'Construisons Scormly ensemble',
    contributeText:
      'Scormly est open source et avance vite. Ajoutez une étoile au dépôt, ouvrez une issue ou proposez une pull request — nouveaux blocs, langues, intégrations, idées : tout est bienvenu.',
    contributeCta: 'Contribuer au projet',
    contributeIssues: 'Proposer une fonctionnalité',

    // Footer
    footerTagline: 'Éditeur SCORM et outil de création de cours gratuit et open source, avec export SCORM et cmi5.',
    footerLicense: 'Sous licence MIT',
    footerIssues: 'Signaler un problème',
    footerDemo: 'Cours de démo',
    footerMade: 'Open source, conçu pour les formateurs et les enseignants.',
  },
  es: {
    // Nav
    navFeatures: 'Funciones',
    navHow: 'Cómo funciona',
    navFaq: 'FAQ',
    navAi: 'IA',
    navGithub: 'GitHub',
    openApp: 'Abrir el editor',

    // Hero
    heroBadge: 'Código abierto · Gratis · 100 % local',
    heroTitle:
      'Editor SCORM gratuito y herramienta de autor online, directamente en tu navegador',
    heroSubtitle:
      'Scormly es una herramienta de autor SCORM gratuita y de código abierto que funciona online, en tu navegador. Crea cursos SCORM interactivos a partir de bloques y exporta un paquete SCORM 1.2, SCORM 2004 o cmi5 con un solo clic: sin servidor, sin registro y sin que tu contenido salga de tu equipo.',
    heroCtaPrimary: 'Crear un curso gratis',
    heroCtaSecondary: 'Ver en GitHub',
    heroCtaDemo: 'Abrir el curso de demostración',
    heroNote: 'Funciona por completo en tu navegador. Sin instalar nada.',

    // Trust pillars
    pillarsTitle: 'Tuyo, y solo tuyo',
    pillarOpenTitle: 'Código abierto',
    pillarOpenText:
      'Scormly es totalmente de código abierto, con licencia MIT. Lee el código, alójalo por tu cuenta, haz un fork o colabora.',
    pillarFreeTitle: 'Totalmente gratis',
    pillarFreeText:
      'Sin suscripciones, sin licencias por usuario y sin funciones de pago. Todo está disponible para todos, para siempre.',
    pillarLocalTitle: 'Local y privado',
    pillarLocalText:
      'Todo se ejecuta en tu dispositivo. No guardamos ni transmitimos nada: no existe ningún servidor al que enviar tus datos.',

    // Who it is for
    whoTitle:
      'Para quién es Scormly',
    whoSubtitle:
      'Una sola herramienta para quien necesite un curso SCORM sin licencias, sin instalaciones y sin cuentas en la nube.',
    who1Title:
      'Diseñadores instruccionales',
    who1Text:
      'Crea cursos SCORM y cmi5 interactivos con cuestionarios, escenarios y tarjetas, sin pagar una licencia de una herramienta de autor comercial.',
    who2Title:
      'Docentes y administradores de Moodle',
    who2Text:
      'Crea un curso en el navegador y sube el paquete a Moodle o a cualquier otro LMS en cuestión de minutos. El progreso, las puntuaciones y las respuestas quedan registrados.',
    who3Title:
      'Equipos pequeños de formación',
    who3Text:
      'Comparte los proyectos como .zip, revísalos con comentarios en cualquier bloque y conserva cada curso como archivos normales que son tuyos.',
    who4Title:
      'Organizaciones que cuidan la privacidad y la accesibilidad',
    who4Text:
      'No se sube nada: no hay servidor. Los cursos están pensados para ayudarte a cumplir las WCAG 2.1 AA, y la comprobación del curso detecta los fallos de accesibilidad antes de exportar.',

    // Privacy callout
    privacyTitle: 'Tus datos se quedan en tu equipo',
    privacyText:
      'Scormly no tiene servidor. Tu proyecto permanece en tu dispositivo: en el almacenamiento privado del navegador, en una carpeta de tu disco (Chrome y Edge) o como un .zip del proyecto que puedes guardar como copia y compartir. El paquete SCORM se genera dentro del navegador. Sin cuentas, sin analíticas sobre tu contenido, sin subir archivos. Privacidad por diseño, no por promesa.',

    // Features
    designBadge: 'Diseño',
    designTitle: 'Cursos con diseño de verdad, no un simple montaje',
    designSubtitle: 'Portada, estilos de bloque tomados de tu tema, composiciones para imágenes y citas, carruseles y animaciones suaves: cursos cuidados sin necesidad de un diseñador.',
    designSwatches: 'Prueba un fondo de bloque',
    designPoint1Title: 'Portada y bloques con los colores del tema',
    designPoint1Text: 'Abre el curso con una portada y dale a cualquier bloque un fondo de tu tema: tono suave, color, degradado u oscuro. Cambia de tema y todo se adapta.',
    designPoint2Title: 'Bloques listos para usar',
    designPoint2Text: 'Frases destacadas, testimonios con foto, citas sobre imagen, imagen y texto, texto sobre imagen, imágenes a todo el ancho y carruseles de fotos, cada uno a un clic.',
    designPoint3Title: 'Descargas para los alumnos',
    designPoint3Text: 'Adjunta archivos PDF, hojas de cálculo, presentaciones o archivos comprimidos: van dentro del paquete SCORM y se descargan con su nombre original.',
    designPoint4Title: 'Animación y maquetación',
    designPoint4Text: 'Los bloques aparecen con suavidad al desplazarse, las lecciones cambian con una transición y tú eliges el ancho del contenido y la tipografía. La preferencia de reducir el movimiento se respeta siempre.',
    featuresTitle: 'Todo lo que necesitas para crear un curso',
    featuresSubtitle: 'Un editor por bloques que va al grano, con las piezas del e-learning actual y nada que te sobre.',
    f1Title: 'Amplia biblioteca de bloques',
    f1Text: 'Texto, multimedia, pestañas, acordeones, tarjetas y escenarios de diálogo con aspecto de chat, además de imágenes con zonas interactivas, líneas de tiempo, diagramas de proceso, guías paso a paso, comparaciones, deslizadores de antes / después, reflexiones y ejercicios de ordenar y de rellenar huecos. ¿Necesitas algo más? El bloque Widget admite tu propio HTML y JavaScript, o un archivo .html / .zip que subas.',
    f2Title: 'Cuestionarios con nota',
    f2Text: 'Preguntas de opción única y múltiple, de emparejar, de ordenar y de rellenar huecos en una misma prueba, con retroalimentación y puntuación mínima. Cada respuesta se envía a tu LMS.',
    f3Title: 'Un editor que perdona los errores',
    f3Text: 'Inserta un bloque donde quieras, reordena con libertad y deshaz cualquier cambio, incluso desde la notificación que aparece al eliminar.',
    f4Title: 'Exportación a SCORM 1.2 / 2004 y cmi5',
    f4Text: 'Paquetes para Moodle y cualquier otro LMS con un solo clic, generados en el navegador. Los alumnos retoman el curso donde lo dejaron, y una comprobación previa a la exportación detecta lecciones vacías, archivos multimedia que faltan y preguntas sin respuesta correcta.',
    f5Title: 'Itinerarios guiados',
    f5Text: 'Exige que se vean los videos, bloquea la navegación en un recorrido lineal y elige cómo se cuenta la finalización.',
    f6Title: 'Pensado para el teclado',
    f6Text: 'Atajos para las acciones habituales (pulsa ?) y acceso completo con el teclado a menús, cuadros de diálogo y reordenación.',
    f7Title: 'Ayuda integrada',
    f7Text: 'Una visita guiada, respuestas a las dudas más habituales y una página de “Novedades”, todo dentro del editor.',
    f8Title: '10 temas globales',
    f8Text: 'De Rose y Ocean a Mono y Terminal: cambia con un clic los colores y el aspecto de los botones y los elementos interactivos de todo el proyecto. Todos los temas cumplen el contraste WCAG AA.',
    f9Title: 'Instálalo como aplicación',
    f9Text: 'Instala Scormly desde Chrome o Edge y ábrelo desde el escritorio como cualquier otra aplicación.',
    f10Title: 'Interfaz en varios idiomas',
    f10Text: 'Usa el editor en español, inglés, francés o ucraniano. Pronto habrá más idiomas.',

    // Accessibility section
    a11yBadge: 'Accesible por diseño',
    a11yTitle: 'Cursos que todos los alumnos pueden usar',
    a11ySubtitle:
      'Los cursos de Scormly están pensados para ayudarte a cumplir las WCAG 2.1 AA desde el primer momento: el reproductor exportado se encarga del marcado accesible para que tú te centres en el contenido.',
    a11yPoint1Title: 'Navegación con el teclado',
    a11yPoint1Text:
      'Todos los bloques (pestañas, tarjetas, zonas interactivas, cuestionarios, ejercicios) funcionan con el teclado, con un indicador de foco visible y un enlace “Saltar al contenido”.',
    a11yPoint2Title: 'Compatible con lectores de pantalla',
    a11yPoint2Text:
      'Títulos semánticos y controles etiquetados; los cambios de lección y la retroalimentación de los cuestionarios se anuncian, y un acierto o un error nunca se indica solo con el color.',
    a11yPoint3Title: 'Subtítulos y transcripciones',
    a11yPoint3Text:
      'Añade subtítulos WebVTT a los videos y transcripciones al video y al audio, y marca las imágenes puramente decorativas para que los lectores de pantalla las omitan.',
    a11yPoint4Title: 'Menú de accesibilidad para el alumno',
    a11yPoint4Text:
      'El alumno elige un texto más grande, alto contraste, espaciado cómodo o menos movimiento, y sus preferencias se recuerdan en su dispositivo. Todos los temas cumplen el contraste AA.',
    a11yPoint5Title: 'Comprobado antes de exportar',
    a11yPoint5Text:
      'La comprobación del curso avisa, antes de publicar, si faltan textos alternativos, subtítulos, transcripciones, títulos de contenido incrustado o el idioma del contenido.',
    a11yPoint6Title: 'Respeta las preferencias del LMS',
    a11yPoint6Text:
      'El reproductor SCORM / cmi5 exportado lee en el LMS las preferencias de subtítulos e idioma del alumno y las aplica.',
    a11yNote:
      'La accesibilidad también depende de tu contenido: escribe textos alternativos con sentido, subtítulos fieles y un lenguaje claro. Scormly te da las herramientas y las comprobaciones.',
    a11yVisualLabel: 'Ejemplo ilustrativo del menú de accesibilidad del alumno en un curso exportado',
    a11yMockTitle: 'Ajustes de accesibilidad',
    a11yMockTextSize: 'Tamaño del texto',
    a11yMockSizeNormal: 'Normal',
    a11yMockSizeLarge: 'Grande',
    a11yMockSizeXl: 'Muy grande',
    a11yMockContrast: 'Alto contraste',
    a11yMockSpacing: 'Espaciado cómodo',
    a11yMockMotion: 'Reducir el movimiento',
    a11yMockCaptions: 'Subtítulos activados por defecto',
    a11yMockLms: 'Preferencia de subtítulos del LMS aplicada',

    // AI-ready section
    aiBadge: 'Preparado para la IA',
    aiTitle: 'Crea cursos junto a tu asistente de IA',
    aiSubtitle:
      'Un proyecto de Scormly es una carpeta de archivos sencillos y documentados, así que agentes de IA como Claude, ChatGPT o Cursor pueden leer, escribir y revisar los cursos contigo.',
    aiPoint1Title: 'AGENTS.md en cada proyecto',
    aiPoint1Text:
      'Cada carpeta de proyecto incluye una guía del formato project.json y de todos los tipos de bloque, para que cualquier agente sepa crear contenido válido.',
    aiPoint2Title: 'Funciona con el asistente que ya usas',
    aiPoint2Text:
      'Abre la carpeta del proyecto con Claude Code, Cursor o ChatGPT: el agente escribe lecciones, bloques y cuestionarios en project.json, y tú revisas, previsualizas y exportas en Scormly.',
    aiPoint3Title: 'Sigue siendo 100 % local',
    aiPoint3Text:
      'El agente trabaja con archivos de tu propio disco. Scormly no sube nada: lo que compartes con un asistente lo decides tú.',
    aiTermComment: '# pídeselo a tu asistente',
    aiTermPrompt: 'lee AGENTS.md y añade una lección sobre phishing',
    aiChatPrompt: 'Añade una lección sobre cómo detectar el phishing con una línea de tiempo y un cuestionario de 3 preguntas, y luego expórtala para nuestro LMS.',
    aiStep1: 'AGENTS.md leído',
    aiStep2: 'Lección “Cómo detectar el phishing” añadida',
    aiStep3: 'Bloques de línea de tiempo y cuestionario añadidos',
    aiStep4: 'Comprobación del curso: sin problemas',
    aiStep5: 'Listo para la vista previa y la exportación en Scormly',
    aiVisualLabel: 'Ejemplo ilustrativo de un asistente de IA editando un proyecto de Scormly',

    // What's new
    navNews: 'Novedades',
    navMenu: 'Menú',
    navNewTab: 'se abre en una pestaña nueva',
    newsBadge: 'Registro de cambios',
    newsTitle: 'Novedades',
    newsSubtitle: 'Scormly se actualiza a menudo. Estas son las últimas novedades del editor.',
    newsLatest: 'Lo último',
    newsMore: 'Seguir el desarrollo en GitHub',

    // How it works
    howTitle: 'De la idea al SCORM en tres pasos',
    how1Title: 'Crea un proyecto',
    how1Text:
      'Empieza en el navegador con un clic o elige una carpeta de tu equipo (Chrome y Edge). Scormly guarda ahí tu proyecto y tus archivos multimedia automáticamente.',
    how2Title: 'Monta tus lecciones',
    how2Text: 'Añade bloques, escribe el contenido, incorpora multimedia y cuestionarios, y elige un tema.',
    how3Title: 'Exporta a SCORM',
    how3Text: 'Descarga un único paquete .zip SCORM o cmi5 y súbelo a tu LMS. Listo.',

    // FAQ
    faqTitle: 'Preguntas frecuentes',
    faqQ1: '¿De verdad Scormly es gratis?',
    faqA1: 'Sí. Scormly es de código abierto, con licencia MIT, y gratuito para siempre. No hay planes de pago ni límites ocultos.',
    faqQ2: '¿Dónde se guardan mis datos?',
    faqA2:
      'En tu propio dispositivo. Tú eliges dónde vive cada proyecto: en el almacenamiento privado del navegador (Chrome, Edge, Firefox), en una carpeta de tu disco (Chrome y Edge, mediante la API File System Access) o como un .zip del proyecto. No hay servidor, así que nada se sube ni se guarda en remoto.',
    faqQ3: '¿Con qué plataformas LMS es compatible?',
    faqA3: 'Scormly exporta paquetes SCORM 1.2, SCORM 2004 y cmi5 (xAPI) que funcionan en Moodle, TalentLMS, SCORM Cloud y prácticamente cualquier LMS compatible con los estándares. El progreso, las puntuaciones de los cuestionarios y cada respuesta se envían al LMS, y los alumnos retoman el curso donde lo dejaron.',
    faqQ4: '¿Tengo que instalar algo?',
    faqA4:
      'No. Scormly funciona por completo en el navegador. Para guardar en una carpeta del disco necesitas un navegador basado en Chromium (Chrome o Edge) compatible con la API File System Access; otros navegadores, como Firefox, guardan los proyectos en el almacenamiento privado del navegador. Si quieres, también puedes instalarlo como aplicación desde el navegador.',
    faqQ5: '¿Puedo alojarlo por mi cuenta?',
    faqA5: 'Por supuesto. Es un sitio estático: clona el repositorio, ejecuta el build y aloja el resultado donde quieras, o úsalo simplemente en local.',
    faqQ6:
      '¿Puede Scormly sustituir a las herramientas de autor comerciales?',
    faqA6:
      'Para muchos cursos, sí. Scormly cubre los cursos por bloques con lecciones, multimedia, cuestionarios con nota, escenarios de diálogo con ramificación, tarjetas, zonas interactivas y widgets HTML a medida, y exporta a SCORM 1.2, SCORM 2004 y cmi5 con las puntuaciones y las respuestas a cada pregunta. Es gratuito, de código abierto y mantiene tus datos en tu dispositivo. Su enfoque es distinto al de las herramientas basadas en diapositivas: si necesitas animaciones con línea de tiempo en diapositivas, grabación de pantalla o un contrato de soporte con un proveedor, puede que una herramienta comercial te encaje mejor.',
    faqQ7: '¿Puedo crear cursos con IA?',
    faqA7: 'Sí. Cada carpeta de proyecto incluye un archivo AGENTS.md que documenta project.json y todos los tipos de bloque, de modo que un asistente como Claude, ChatGPT o Cursor puede crear cursos válidos.',
    faqQ8: '¿Puedo revisar mi curso antes de publicarlo?',
    faqA8: 'Sí. Al exportar se ejecuta primero una comprobación del curso que enumera problemas como lecciones vacías, archivos multimedia que faltan o preguntas sin respuesta correcta, para que los corrijas antes de subirlo a tu LMS.',
    faqQ9: '¿Puedo usar el editor sin ratón?',
    faqA9: 'Sí. Los menús, los cuadros de diálogo y las listas funcionan íntegramente con el teclado, las lecciones y los bloques se reordenan con las teclas, y al pulsar ? se muestran todos los atajos.',
    faqQ10: '¿Existe un editor SCORM gratuito y de código abierto?',
    faqA10: 'Sí: Scormly es un editor SCORM gratuito y una herramienta para crear cursos SCORM publicada con licencia MIT. El código fuente está en GitHub, funciona online en el navegador sin necesidad de cuenta, y puedes alojarlo por tu cuenta o usarlo sin conexión como aplicación instalada.',
    faqQ11: '¿Puedo probar una demo SCORM antes de crear un curso?',
    faqA11: 'Sí. La demo interactiva de esta página usa los mismos bloques que verán tus alumnos: práctica de diálogo, cuestionario, tarjetas e índice del curso. Cuando quieras, abre el editor y exporta tu propio paquete SCORM.',
    faqQ12: '¿Son accesibles los cursos de Scormly?',
    faqA12: 'Scormly está pensado para ayudarte a cumplir las WCAG 2.1 AA. El reproductor exportado ofrece navegación con el teclado, marcado y avisos adaptados a lectores de pantalla, subtítulos y transcripciones, temas con contraste AA y un menú de accesibilidad para el alumno (tamaño del texto, alto contraste, espaciado cómodo, menos movimiento). Antes de exportar, la comprobación del curso detecta si faltan textos alternativos, subtítulos, transcripciones y otros elementos. Aun así, la conformidad final depende de tu contenido, así que revísalo con tu propio proceso de accesibilidad.',
    faqQ13: '¿SCORM y cmi5 son compatibles con la accesibilidad?',
    faqA13: 'SCORM y cmi5 son estándares de empaquetado y seguimiento: por sí solos no hacen accesible un curso. La accesibilidad depende del contenido HTML que va dentro del paquete, y el reproductor de Scormly lo genera pensando en ella. Eso sí, SCORM transmite preferencias del alumno como los subtítulos y el idioma (cmi5, el idioma), y el reproductor de Scormly las respeta.',
    faqQ14: '¿Cuál es la mejor herramienta de autor SCORM gratuita?',
    faqA14: 'Depende de lo que quieras crear. Scormly es una opción gratuita y de código abierto que funciona en el navegador, sin instalación ni cuenta, y exporta a SCORM 1.2, SCORM 2004 y cmi5. Otras herramientas gratuitas son Adapt (alojamiento propio, cursos adaptables), eXeLearning (editor de código abierto para escritorio y web) y H5P con Lumi (actividades interactivas, SCORM 1.2). Elige según el formato de exportación que necesite tu LMS y según si quieres instalar algo o no.',
    faqQ15: '¿Cómo crear un paquete SCORM gratis?',
    faqA15: 'Abre Scormly en tu navegador, crea un proyecto, añade lecciones y bloques (texto, multimedia, cuestionarios) y haz clic en Exportar. Elige SCORM 1.2, SCORM 2004 o cmi5 y Scormly generará el paquete .zip en tu navegador. Sube ese .zip a tu LMS como actividad SCORM. Sin registro y sin instalar ningún programa.',
    faqQ16: '¿Qué me conviene exportar: SCORM 1.2, SCORM 2004 o cmi5?',
    faqA16: 'El formato con el que mejor trabaje tu LMS. SCORM 1.2 es el más extendido y funciona casi en cualquier parte. SCORM 2004 (4.ª edición) registra más detalle, como estados de finalización y de aprobación por separado. cmi5 es el estándar moderno, basado en xAPI, para los LMS que lo admiten. Scormly exporta los tres a partir del mismo curso, así que puedes cambiar cuando quieras.',
    faqQ17: '¿Es Scormly una alternativa gratuita a Articulate Storyline o Rise?',
    faqA17: 'Sí, para cursos por bloques. Igual que Rise, Scormly permite crear cursos a partir de bloques en el navegador y exporta a SCORM 1.2, SCORM 2004 y cmi5. A diferencia de Articulate 360, es gratuito, de código abierto y no guarda nada en la nube. Las animaciones con línea de tiempo sobre diapositivas de Storyline responden a otro enfoque, que Scormly no pretende imitar.',
    faqQ18: '¿Funciona Scormly con Moodle?',
    faqA18: 'Sí. Exporta tu curso como paquete SCORM y añádelo en Moodle como actividad “Paquete SCORM”. Moodle registra la finalización, la puntuación y los intentos, y los alumnos retoman el curso donde lo dejaron. El mismo paquete funciona en TalentLMS, SCORM Cloud y otros LMS compatibles con los estándares.',
    faqQ19: '¿En qué idiomas pueden los alumnos hacer un curso de Scormly?',
    faqA19: 'El reproductor del curso está disponible en inglés, ucraniano, español, francés, alemán, italiano, neerlandés y portugués, o elige el idioma automáticamente. El editor, por su parte, está disponible en inglés, ucraniano, francés y español.',


    // About the project
    aboutTitle:
      'Sobre el proyecto',
    aboutText:
      'Scormly es un proyecto independiente de código abierto que se desarrolla de forma pública en GitHub. Las preguntas, las ideas y los comentarios son bienvenidos.',
    aboutVersion:
      'Versión',
    aboutReleased:
      'Última versión',
    aboutLicense:
      'Licencia',
    aboutRepo:
      'Código fuente',
    aboutNews:
      'Ver las novedades',

    // Contribute CTA
    contributeBadge: 'Código abierto',
    contributeTitle: 'Construyamos Scormly entre todos',
    contributeText:
      'Scormly es de código abierto y avanza rápido. Dale una estrella al repositorio, abre una issue o envía una pull request: nuevos bloques, idiomas, integraciones e ideas, todo es bienvenido.',
    contributeCta: 'Colaborar en el proyecto',
    contributeIssues: 'Proponer una función',

    // Footer
    footerTagline: 'Editor SCORM y creador de cursos gratuito y de código abierto, con exportación a SCORM y cmi5.',
    footerLicense: 'Licencia MIT',
    footerIssues: 'Informar de un problema',
    footerDemo: 'Curso de demostración',
    footerMade: 'Código abierto, hecho para docentes.',
  },
}

export default landing
