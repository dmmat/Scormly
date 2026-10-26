import type { Language } from '../i18n/types'

// Builder release notes for the "What's new" dialog, newest first. Add an
// entry when shipping user-visible changes; the id doubles as the "seen" marker
// (a new id lights up the Help badge once for returning authors).
export interface Release {
  id: string
  /** YYYY-MM-DD; omitted while the release is still in progress. */
  date?: string
  items: Record<Language, string[]>
}

export const RELEASES: Release[] = [
  {
    // In progress: dated when it ships.
    id: 'custom-themes',
    items: {
      en: [
        'Custom theme: your own accent color and corner shape, kept readable automatically (WCAG AA).',
        'A more compact theme picker in Project settings.',
        'New blocks: process diagram (arrows, chevrons, cycle or pyramid, in three styles), step-by-step guide, comparison (pros and cons), before / after slider and reflection.',
        'Continue reveals the rest of the lesson; in Blocking mode it unlocks once the tasks above are done.',
        'Text: tables (grid, stripes or lines), links and keyboard shortcuts such as Ctrl+B, Ctrl+K and Tab between cells.',
        'More reliable LMS results: cmi5 pass / fail and the last statements are no longer lost when the window closes.',
      ],
      uk: [
        'Власна тема: ваш колір акценту й форма кутів, а читабельність (WCAG AA) — автоматично.',
        'Компактніший вибір теми в налаштуваннях проєкту.',
        'Нові блоки: схема процесу (стрілки, шеврони, цикл чи піраміда, у трьох стилях), покрокова інструкція, порівняння (переваги й недоліки), слайдер «до / після» та рефлексія.',
        '«Продовжити» відкриває решту уроку, а в блокуючому режимі — розблоковується після виконання завдань вище.',
        'Текст: таблиці (сітка, смуги чи лінії), посилання та гарячі клавіші — Ctrl+B, Ctrl+K, Tab між клітинками тощо.',
        'Надійніші результати в LMS: «складено / не складено» в cmi5 і останні записи більше не губляться при закритті вікна.',
      ],
    },
  },
  {
    id: '2026-10-07',
    date: '2026-10-07',
    items: {
      en: [
        'Block styles: theme or photo backgrounds, padding and width, plus ready-made blocks.',
        'A cover page before the first lesson, with your own text and media.',
        'Quizzes mix every question type, now with ordering and fill in the blanks, under one Submit.',
        'New blocks and options: columns, carousel, image & text, attachments, quote styles, table width.',
      ],
      uk: [
        'Стилі блоків: фон із теми чи фото, відступи й ширина, а також готові блоки.',
        'Титульна сторінка перед першим уроком із вашим текстом і медіа.',
        'Квіз поєднує всі типи питань, тепер і впорядкування та пропуски, з однією кнопкою відповіді.',
        'Нові блоки й опції: колонки, карусель, фото й текст, вкладення, стилі цитат, ширина таблиці.',
      ],
    },
  },
  {
    id: '2026-10-06-2',
    date: '2026-10-06',
    items: {
      en: [
        'More reliable LMS tracking: resume, time spent and pass/fail reach the LMS more reliably, and a passed course stays passed.',
        'Stricter SCORM and cmi5 conformance, with the official schema files included for older LMSes.',
        'An honest completion screen: it says when the course isn’t complete or passed yet and links to the lessons to finish or retake.',
        'Player buttons follow the course language, and a new “Exit course” button returns to the LMS.',
      ],
      uk: [
        'Надійніше відстеження в LMS: місце зупинки, час і результат доходять до LMS надійніше, а складений курс лишається складеним.',
        'Суворіша відповідність SCORM і cmi5, а для старіших LMS у пакети додано офіційні файли схем.',
        'Чесний фінальний екран: повідомляє, якщо курс ще не завершено чи не складено, і дає посилання на уроки, які треба пройти чи перескласти.',
        'Кнопки плеєра говорять мовою курсу, а нова кнопка «Вийти з курсу» повертає до LMS.',
      ],
    },
  },
  {
    id: '2026-09-30',
    date: '2026-09-30',
    items: {
      en: [
        'Five new themes, including a hacker-style Terminal; exports now match each theme’s shapes.',
        'Accessible courses: a learner accessibility menu, full keyboard and screen-reader support, AA contrast.',
        'Captions and transcripts for video and audio, decorative images and a content language.',
        'The pre-export check flags accessibility gaps such as missing alt text or captions.',
      ],
      uk: [
        'П’ять нових тем, зокрема хакерська Terminal; експорт повторює форму кнопок і карток теми.',
        'Доступні курси: меню доступності для слухача, повна підтримка клавіатури й зчитувачів екрана, контраст AA.',
        'Субтитри й розшифровки для відео та аудіо, декоративні зображення і мова контенту.',
        'Перевірка перед експортом знаходить прогалини доступності, як-от відсутні alt-тексти чи субтитри.',
      ],
    },
  },
  {
    id: '2026-09-29',
    date: '2026-09-29',
    items: {
      en: [
        'New blocks: image hotspots, timeline, and scored sort / order and fill-in-the-blanks exercises.',
        'A Help menu with a guided tour, Q&A and release notes; keyboard shortcuts everywhere.',
        'Insert a block anywhere, undo deletes from the notification, and a course check before export.',
        'Tabbed project settings with player language, lesson progress and a custom finish message.',
      ],
      uk: [
        'Нові блоки: hotspots на зображенні, таймлайн і оцінювані вправи на сортування та заповнення пропусків.',
        'Меню «Довідка» з туром, питаннями й відповідями та списком змін; гарячі клавіші всюди.',
        'Вставлення блоку будь-де, скасування видалення зі сповіщення й перевірка курсу перед експортом.',
        'Налаштування проєкту з вкладками: мова плеєра, прогрес уроків і власний текст фінального екрана.',
      ],
    },
  },
  {
    id: '2026-05-23',
    date: '2026-05-23',
    items: {
      en: [
        'cmi5 (xAPI) export next to SCORM 2004 and 1.2.',
        'Course outline block, chat layout for dialogue scenarios, required video watching and step-by-step navigation.',
        'Richer LMS reporting: per-quiz objectives, detailed question interactions, learner name and language.',
        'Download a project as a .zip to share it.',
      ],
      uk: [
        'Експорт cmi5 (xAPI) поруч із SCORM 2004 і 1.2.',
        'Блок «Зміст курсу», чат-вигляд для діалогових сценаріїв, обов’язковий перегляд відео й покрокова навігація.',
        'Детальніші звіти в LMS: цілі для кожного тесту, докладні відповіді на питання, ім’я та мова слухача.',
        'Завантаження проєкту як .zip, щоб поділитися ним.',
      ],
    },
  },
]

export const LATEST_RELEASE = RELEASES[0].id
