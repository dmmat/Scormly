import type { LocaleTable } from '../types.ts'

// SEO landing page copy (bilingual). The site's default language is English.
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
    f10Title: 'Bilingual interface',
    f10Text: 'Use the builder in English or Ukrainian, with more languages on the way.',

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
    faqA19: 'The course player supports English, Ukrainian, Spanish, French, German, Italian, Dutch and Portuguese, or picks the language automatically. The builder itself is available in English and Ukrainian.',


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
    f10Title: 'Двомовний інтерфейс',
    f10Text: 'Користуйтеся конструктором англійською чи українською, інші мови — на підході.',

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
    faqA19: 'Плеєр курсу підтримує англійську, українську, іспанську, французьку, німецьку, італійську, нідерландську та португальську мови або обирає мову автоматично. Сам конструктор доступний англійською та українською.',


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
}

export default landing
