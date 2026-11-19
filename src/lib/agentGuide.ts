// Generates an AGENTS.md dropped into a new project folder. It documents the
// project.json data model and every block type so that AI agents (and humans)
// can read, edit, and author Scormly courses by editing project.json directly.
//
// BLOCK_DOCS is typed as Record<BlockType, ...>, so adding a new block type to
// the union forces a matching entry here, so the guide can't silently fall behind.

import type { BlockType, Course } from '../types/course'

export const AGENT_GUIDE_FILE = 'AGENTS.md'

interface BlockDoc {
  /** One-line purpose. */
  summary: string
  /** TS-like shape of the block's `data` field. */
  data: string
}

const BLOCK_DOCS: Record<BlockType, BlockDoc> = {
  heading: {
    summary: 'Section heading (H1–H3).',
    data: `{ level: 1 | 2 | 3, text: string, align?: 'left' | 'center' | 'right', eyebrow?: string, subtitle?: string }  // eyebrow: small accent line above the heading; subtitle: lead-in line under it, inline rich text (<strong>, <em>, <u>, <a>); both optional: use them to open a section (such a heading sits closer to the block after it, and settings.spacing 'spacious' on it adds air above only)`,
  },
  paragraph: {
    summary: 'Rich text paragraph.',
    data: `{ html: string, variant?: 'normal' | 'lead' | 'dropcap' | 'columns' }  // rich-text HTML (<p>, <strong>, <em>, <u>, <a href target="_blank" rel="noopener noreferrer">, <ul>/<ol>, <img>, and tables: <table class="rt-table rt-table-grid|rt-table-stripes|rt-table-lines [rt-table-fit]"> with an optional <thead><tr><th scope="col"> header row and a <tbody>; no merged cells); variant: lead = larger intro text, dropcap = big first letter, columns = two columns on wide screens`,
  },
  list: {
    summary: 'Bulleted or numbered list.',
    data: `{ ordered: boolean, items: string[] }`,
  },
  note: {
    summary: 'Callout box with an icon.',
    data: `{ variant: 'note' | 'tip' | 'success' | 'warning', text: string, html?: string, title?: string, icon?: boolean, color?: string }  // note = blue info, tip = theme color, success = green, warning = amber; text: the plain text; html: the same text as inline rich text (<strong>, <em>, <u>, <a>, <br>), wins over text (keep text as its plain version); title: small label above the text, e.g. "Key terms"; icon: false hides the icon; color '#rrggbb': the note's own color instead of its variant's`,
  },
  image: {
    summary: 'Single image with optional caption, in one of four sizes.',
    data: `{ src: string, alt: string, caption?: string, decorative?: boolean, size?: 'small' | 'medium' | 'large' | 'full', align?: 'left' | 'center' | 'right' }  // src: relative path under assets/images/ (or a data: URL); decorative: true = purely visual, rendered with empty alt (alt is then ignored); size: 'large' (default) = content column, 'full' = edge to edge of the page; align applies to small/medium`,
  },
  gallery: {
    summary: 'Several images as a grid or a swipeable carousel.',
    data: `{ images: { src: string, alt: string, caption?: string, decorative?: boolean }[], layout?: 'grid' | 'carousel', columns?: 2 | 3 | 4 }  // layout default 'grid' (columns default 3); carousel shows one image + its caption at a time`,
  },
  video: {
    summary: 'HTML5 video from a local file.',
    data: `{ src: string, poster?: string, requireWatch?: boolean, captions?: string, transcript?: string }  // src: relative path under assets/videos/; requireWatch: learner must watch ~95% before moving on; captions: WebVTT file under assets/captions/ (shown as closed captions); transcript: plain text shown under the video`,
  },
  audio: {
    summary: 'HTML5 audio from a local file.',
    data: `{ src: string, transcript?: string }  // src: relative path under assets/audio/; transcript: plain text shown under the player`,
  },
  embed: {
    summary: 'Embedded iframe (YouTube, Vimeo, or any https page).',
    data: `{ url: string, title?: string }  // title: accessible name of the iframe (screen readers announce it)`,
  },
  html: {
    summary: 'Custom HTML / CSS / JS (an interactive widget, simulation, game, chart…) shown in a frame: the author\'s own code or an uploaded .html page / .zip site. See "Custom HTML blocks" below.',
    data: `{ source: 'code' | 'file', code: string, src: string, fileName?: string, title?: string, height?: number, styles?: boolean }  // source 'code': the page is the HTML document in code; 'file': the page is src, an entry file like assets/html/<folder>/index.html whose folder ships whole (keep code '' or src '' for the unused one). title: accessible name of the frame; height: frame height in px, omitted = fit the page's content; styles: load the Scormly kit (course fonts, accent, sc-* classes) into the page, default true`,
  },
  code: {
    summary: 'Monospaced code snippet.',
    data: `{ code: string, language?: string }`,
  },
  table: {
    summary: 'Simple table; every row has the same number of columns. With layout "cards" it compares items side by side as cards.',
    data: `{ header: boolean, rows: string[][], width?: 'full' | 'auto', align?: 'left' | 'center' | 'right', style?: 'grid' | 'lines' | 'stripes' | 'panel', headerColor?: 'theme' | 'dark' | '#rrggbb', layout?: 'table' | 'cards' }  // cells are plain text, **double asterisks** make bold; header=true → first row is <th>; width: full (default) or fit content; align places an 'auto' table; style: grid (default, boxed cells), lines (rules between rows), stripes (tinted alternate rows), panel (rounded frame, colored header, bold first column: good for reference tables); headerColor colors the panel header and the card titles: theme (default, the theme's second color), dark, or a hex color; rowMarks: one entry per row ('' | 'highlight' | 'muted') to tint or grey out a row, e.g. ['', '', 'highlight']. highlightColumn (cards only): the column number of the card to frame (1 = first card). layout 'cards': every column after the first is a card (rows[0] = the card titles, rows[0][0] unused; column 0 = the label shown above each value), e.g. [["", "Plan A", "Plan B"], ["Price", "$10", "$20"], ["Best for", "Teams", "Companies"]]; best with 2-4 cards and short labels`,
  },
  quote: {
    summary: 'Highlighted quotation in one of five styles.',
    data: `{ text: string, author?: string, role?: string, variant?: 'classic' | 'statement' | 'card' | 'photo' | 'image', image?: string, photoSide?: 'left' | 'right' }  // variant default 'classic' (accent bar); statement = big centered text; card = testimonial with round author photo; photo = large author photo beside the quote (photoSide, default 'left'); image = white text over a background image. image: assets/images/ path (author photo or background); role: author's job title/company`,
  },
  continue: {
    summary: 'Continue button / page gate.',
    data: `{ mode: 'unrestricted' | 'restricted', label: string, nextCard?: boolean, newPage?: boolean }  // hides later blocks until clicked (restricted: locked until the quizzes, exercises, reflections and required videos above it on its page are done, and required to leave the lesson); newPage: true mid-lesson ends a page: the learner sees one page at a time and the button (or Next) opens the next one; as the lesson's last block it replaces the "Next lesson" card unless nextCard is true`,
  },
  divider: {
    summary: 'Horizontal separator.',
    data: `{ style: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'dots' | 'ornament' | 'wave' | 'label' | 'spacer', label?: string }  // gradient = fading accent line; dots/ornament/wave = decorative separators; label = line with centered text (label, e.g. "Part 2"); spacer = empty vertical space`,
  },
  courseOutline: {
    summary: 'Auto-generated links to the other lessons (excludes the lesson it is in).',
    data: `{ title: string, numbered: boolean }  // the lesson list is derived live; not stored here`,
  },
  tabs: {
    summary: 'Tabbed content panels.',
    data: `{ tabs: { id: string, title: string, html: string }[] }`,
  },
  accordion: {
    summary: 'Collapsible sections.',
    data: `{ items: { id: string, title: string, html: string }[] }`,
  },
  flashcards: {
    summary: 'Flip cards (front/back).',
    data: `{ cards: { id: string, front: string, back: string }[] }`,
  },
  scenario: {
    summary: 'Branching dialogue trainer.',
    data: `{
    characterName: string,
    startNodeId: string,
    layout?: 'classic' | 'chat' | 'scene',  // 'chat' = phone-messenger style; 'scene' = background picture with a large character and the line in a bubble (default 'classic')
    background?: string,          // scene layout: background picture (assets/ path, 16:9 works best)
    sceneImages?: { neutral?: string, happy?: string, concerned?: string },  // scene layout: waist-up poses (3:4, transparent) instead of characterImages
    userAvatar?: string,          // chat layout: learner's avatar on their replies (assets/ path)
    characterImages: { neutral?: string, happy?: string, concerned?: string },
    nodes: {
      id: string,
      text: string,
      emotion: 'neutral' | 'happy' | 'concerned',
      choices: { id: string, text: string, nextNodeId: string | null, setEmotion?: 'neutral' | 'happy' | 'concerned' }[]
    }[]
  }  // nextNodeId: null ends the scenario`,
  },
  quiz: {
    summary: 'Graded test: one Submit for all its questions (single / multiple choice, matching, put in order, fill in the blanks).',
    data: `{
    passingScore: number,  // 0–100
    showAnswers?: boolean,  // reveal correct answers after submitting (default true)
    questions: (
      | { id: string, type: 'single' | 'multiple', prompt: string, feedback?: string,
          options: { id: string, text: string, correct: boolean, feedback?: string }[] }
      | { id: string, type: 'matching', prompt: string, feedback?: string,
          pairs: { id: string, left: string, right: string }[] }
      | { id: string, type: 'sequence', prompt: string, feedback?: string,
          items: { id: string, text: string }[] }  // listed in the correct order; shown shuffled
      | { id: string, type: 'fillBlanks', prompt: string, feedback?: string,
          text: string, mode: 'type' | 'select', caseSensitive?: boolean }  // blanks as in the fillBlanks block
    )[]
  }`,
  },
  hotspot: {
    summary: 'Image with numbered clickable markers; each opens a card with a title and text (not scored).',
    data: `{
    src: string,  // relative path under assets/images/
    alt: string,
    hotspots: { id: string, x: number, y: number, title: string, text: string }[]
  }  // x/y: marker position as a percentage (0–100) of the image width/height`,
  },
  timeline: {
    summary: 'Timeline or process steps (not scored).',
    data: `{
    layout: 'vertical' | 'stepper',  // stepper = one step at a time with Previous/Next
    items: { id: string, label: string, title: string, text: string }[]
  }  // label: short marker such as a date or "Step 1"`,
  },
  ordering: {
    summary: 'Scored "sort / order" exercise: put items in sequence, or sort them into categories.',
    data: `{
    mode: 'sequence' | 'categories',
    prompt: string,
    items: { id: string, text: string, categoryId?: string }[],  // sequence: list items in the CORRECT order (shown shuffled); categories: categoryId = the item's correct category
    categories: { id: string, title: string }[],  // used in 'categories' mode
    passingScore: number,  // 0–100; score = % of items placed correctly
    showAnswers?: boolean  // reveal correct positions/categories after submitting (default true)
  }`,
  },
  fillBlanks: {
    summary: 'Scored fill-in-the-blanks exercise.',
    data: `{
    text: string,  // blanks in square brackets: "The capital of France is [Paris|Paname]."; '|' separates accepted answers, the first is canonical
    mode: 'type' | 'select',  // type = text inputs; select = dropdowns listing every blank's canonical answer
    passingScore: number,  // 0–100; score = % of blanks answered correctly
    showAnswers?: boolean,  // default true
    caseSensitive?: boolean  // default false
  }`,
  },
  imageText: {
    summary: 'Image beside rich text, or text over the image.',
    data: `{ src: string, alt: string, decorative?: boolean, layout: 'left' | 'right' | 'overlay', html: string }  // layout: image on the left/right of the text, or 'overlay' = white text on top of the image; html: rich text like paragraph`,
  },
  columns: {
    summary: '2–4 side-by-side columns of rich text (stacked on phones).',
    data: `{ style: 'plain' | 'cards' | 'lines', columns: { id: string, title: string, html: string }[] }  // 2 to 4 columns; title optional (empty = none); cards = each column on a white card, lines = rules between columns`,
  },
  attachment: {
    summary: 'Downloadable files (PDF, documents, spreadsheets, slides, archives…).',
    data: `{ title?: string, files: { id: string, src: string, name: string, size?: number }[] }  // src: relative path under assets/files/; name: file name offered for download (keep the extension); size in bytes (display only). HTML/JS/SVG/XML files are not allowed`,
  },
  process: {
    summary: 'Process diagram: numbered steps drawn as circles joined by arrows, chevrons, a cycle or a pyramid (not scored).',
    data: `{
    layout: 'flow' | 'chevrons' | 'cycle' | 'pyramid',
    variant?: 'solid' | 'soft' | 'outline',  // default 'solid'; 'soft' = tinted shapes (flow: tinted cards); 'outline' = outlined number circles (flow only; other layouts show solid)
    steps: { id: string, title: string, text: string, html?: string }[]  // html: the description as inline rich text (<strong>, <em>, <u>, <a href target="_blank" rel="noopener noreferrer">, <br>); when set it wins over text (keep text as its plain version)
  }  // 2–8 steps; flow shows at most 4 per row (rows balanced); keep titles short (1–3 words) and text to a sentence. flow = numbered circles joined by arrows (soft = each step on a tinted card); chevrons = arrow band with text under each; cycle = steps on a ring the learner opens one by one (text shown in the middle, so keep it short); pyramid = stacked levels, the first step on top`,
  },
  steps: {
    summary: 'Step-by-step guide: numbered how-to steps with rich text and an optional picture each (not scored).',
    data: `{
    layout: 'list' | 'slides',  // list = all steps in a numbered column; slides = one step at a time with Back/Next
    steps: { id: string, title: string, html: string, src?: string, alt?: string }[]
  }  // html: rich text like paragraph; src: optional picture under the text (assets/images/ path) with its alt text`,
  },
  cards: {
    summary: 'Cards (tiles) with an optional label, a title and text: key points, platforms, teams, terms with their codes.',
    data: `{ items: { id: string, badge: string, badgeColor?: string, title: string, html: string, highlight?: boolean, tone?: 'positive' | 'negative', color?: string }[], layout?: 'grid' | 'rows', labelStyle?: 'pill' | 'text', titleStyle?: 'plain' | 'band', numbered?: boolean, perRow?: 2 | 3 | 4 }  // badge: small label above the title ('' = none; badgeColor 'accent' (the theme's main color), 'grey' or '#rrggbb' gives it another color than the theme's second accent), drawn as a tinted pill or, with labelStyle 'text', as small grey capitals; html: rich text like paragraph, keep it short; highlight: accent tint for the card that matters most; tone: green (a good outcome, do) or red (a bad one, don't); color '#rrggbb': the card's own tint, wins over highlight and tone; titleStyle band: the title on a tinted strip across the card, with a ruled list under it (good for a few options with bullet points); layout rows: a ruled list, one card per line (number, label over title, text beside), good for terms or for who-does-what steps (label = who, title = what); numbered: 1, 2, 3 on the cards; perRow: cards per line on wide screens (default: as many as fit)`,
  },
  comparison: {
    summary: 'Comparison cards: pros and cons, or options side by side.',
    data: `{
    columns: { id: string, title: string, tone: 'pro' | 'con' | 'neutral', items: string[] }[],  // 2–4 columns; tone sets the item marker: pro = green check, con = red cross, neutral = dot; an item is plain text where **double asterisks** make bold
    versus?: boolean  // a "VS" badge between exactly two columns
  }`,
  },
  beforeAfter: {
    summary: 'Before / after slider: the learner drags a handle to compare two images (not scored).',
    data: `{ before: string, beforeAlt: string, beforeLabel: string, after: string, afterAlt: string, afterLabel: string }  // before/after: assets/images/ paths, ideally the same size and framing (the after image sets the size); labels are the corner chips, e.g. "Before" / "After"`,
  },
  reflection: {
    summary: 'Reflection: the learner writes a free-text answer, then sees the sample answer (not scored).',
    data: `{ prompt: string, sample: string }  // sample: shown after the learner submits; empty = none. The answer is reported to the LMS as a neutral long-fill-in interaction and counts as a task for a restricted Continue below it`,
  },
}

/**
 * How to write a page for a custom HTML block. Part of AGENTS.md, and what the
 * block's "Copy instructions for AI" button copies, so a chat assistant can
 * produce a page that drops straight in.
 */
export const HTML_BLOCK_GUIDE = `Write the page as a **complete HTML document** (\`<!doctype html>\`, a
\`<meta name="viewport" content="width=device-width, initial-scale=1">\`, CSS
in \`<style>\`, JS in \`<script>\`). It runs in a frame inside a lesson of an
e-learning course (SCORM / cmi5 in an LMS), possibly offline.

- **One file is best**: inline the CSS and JS. For a bigger site, deliver a
  \`.zip\` with \`index.html\` at its root and every other file (scripts,
  styles, images, fonts, JSON) referenced by a **relative** path
  (\`img/chart.png\`, not \`/img/chart.png\` or a file:// path). Don't load
  libraries from a CDN unless the author agrees: learners may be offline or
  behind a firewall. Put the library file in the zip instead.
- **Fit the column**: the frame is as wide as the lesson column (about 320 px
  on phones up to ~1000 px) and, by default, as tall as the page's content,
  so lay out for any width, let the content set the height, and don't size
  the page to \`100vh\` / \`height: 100%\` (that height is the frame's own). A
  fixed-height app (a canvas game) is fine when the author sets a height on
  the block.
- **Look: use the Scormly kit**: the course loads its own stylesheet into
  the page (unless the block sets \`styles: false\`), so the page matches the
  course theme and fonts with no CSS of its own. It already styles \`body\`
  (8 px padding, transparent background, course font, 16 px text),
  headings, links and focus rings. Use its classes rather than
  hand-made colors:
  - buttons: \`sc-btn\` (accent), \`sc-btn-secondary\` (outlined;
    \`aria-pressed="true"\` shows it selected);
  - surfaces: \`sc-card\` (white card), \`sc-panel\` (accent-tinted box),
    \`sc-note\` (callout with an accent bar), \`sc-badge\` (small pill);
  - forms: \`sc-label\`, \`sc-input\` (for input, select and textarea);
  - feedback: \`sc-correct\`, \`sc-wrong\`, \`sc-progress\` (a bar: put a
    \`<span style="width: 40%">\` inside);
  - text and layout: \`sc-muted\`, \`sc-accent\`, \`sc-center\`,
    \`sc-stack\` (vertical, 1 rem gaps), \`sc-row\` (wrapping row),
    \`sc-grid\` (responsive columns).

  For custom CSS, use its variables so a theme change follows:
  \`--sc-accent\`, \`--sc-accent-dark\` (accent text on white),
  \`--sc-accent-soft\` (tint), \`--sc-radius\` (button shape), \`--sc-font\`,
  \`--sc-heading-font\`, \`--sc-text\`, \`--sc-heading\`, \`--sc-muted\`,
  \`--sc-border\`, \`--sc-surface\`, \`--sc-success\`, \`--sc-error\`. White
  text on \`--sc-accent\` is always readable. The kit sits in a CSS cascade
  layer, so your own rules override it; don't link it yourself.
- **Accessible**: real \`<button>\`s and labelled form fields, keyboard
  operable, visible focus, enough contrast, alt text on images, no
  flashing content; respect \`prefers-reduced-motion\`.
- **Self-contained**: don't navigate the top window, open pop-ups unasked,
  or rely on cookies; wrap \`localStorage\` in try / catch (it can be
  unavailable). Don't ask for personal data or send anything to a server.
- **Height**: the frame measures the page and follows it as it changes
  (content, width, fonts), so don't add code that reports the height. Only a
  page whose height changes in a way that moves nothing in the document may
  ask for a new measurement: \`parent.postMessage({ type: 'scormly:height',
  height: document.documentElement.scrollHeight }, '*')\`.
- The course tracks completion and scores itself; the page doesn't need to
  talk to the LMS.`

function blockReference(): string {
  return (Object.keys(BLOCK_DOCS) as BlockType[])
    .map((type) => {
      const doc = BLOCK_DOCS[type]
      return `#### \`${type}\`\n${doc.summary}\n\n\`\`\`ts\ndata: ${doc.data}\n\`\`\``
    })
    .join('\n\n')
}

export function buildAgentGuide(course: Course): string {
  const firstLesson = course.lessons[0]?.id ?? 'lesson-...'

  return `# Scormly course: agent guide

This folder is a **Scormly** project. The entire course lives in
[\`project.json\`](./project.json), a single JSON file you can read and edit
directly to author or modify the course. Scormly is a local-first course builder
that exports to SCORM 1.2 / 2004 and cmi5 (xAPI).

> Edit \`project.json\` while the project is **closed** in the Scormly app (or
> reopen it afterwards), so your changes aren't overwritten by autosave. Keep the
> JSON valid and every \`id\` unique.

## Read first: the author's instructions

[\`user-instructions.md\`](./user-instructions.md) holds the author's own
notes for you: who the learners are, tone and style, terms to use or avoid,
house rules. Read it before you change anything and follow it. Where it
conflicts with the data format described here, the format wins. Scormly never
rewrites that file (unlike this one); edit it only when the author asks you to.

## Data model

\`\`\`
Course
├─ units?: Unit[]        (optional lesson groups)
└─ lessons: Lesson[]     (a lesson joins a unit with unitId)
   └─ blocks: Block[]
\`\`\`

### Course

\`\`\`ts
{
  id: string,
  title: string,
  description: string,
  coverImage?: string,
  theme: 'rose' | 'ocean' | 'forest' | 'sunset' | 'mono' | 'indigo' | 'crimson' | 'mint' | 'grape' | 'terminal' | 'custom',
  customTheme?: { accent: string, accent2?: string, shape: 'sharp' | 'soft' | 'rounded' | 'pill' },  // used by theme 'custom'; accent '#rrggbb' (darkened automatically if white text on it would be hard to read); accent2 '#rrggbb': the second color, for details (labels, card numbers, a heading's eyebrow, table and card headers); missing = the accent
  settings: {
    completion: 'view' | 'quiz',   // 'quiz' also requires every scored block (quiz, ordering, fillBlanks) answered
    scored: boolean,               // report a pass/fail result
    passingScore: number,          // 0–100, used when scored
    navigation: 'free' | 'linear', // linear: Next unlocks once the lesson's gates/quizzes are done
    playerLanguage?: 'auto' | 'en' | 'uk' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt', // player UI language; 'auto' (default) = contentLanguage if the player has it, else LMS/browser language
    showProgress?: boolean,        // show "Lesson n of N" in the player header (default true)
    finishMessage?: string,        // completion-screen text; empty/omitted = built-in message
    contentLanguage?: string,      // BCP 47 language of the course content (e.g. 'en', 'uk', 'pt-BR'); sets lang for screen readers
    contentWidth?: 'narrow' | 'normal' | 'wide' | 'full',  // lesson column width (default 'wide')
    typography?: 'modern' | 'editorial' | 'rounded',       // font style (default 'modern'; editorial = serif headings)
    blockAnimation?: 'none' | 'fade' | 'slide' | 'zoom',   // block entrance as the learner scrolls (default 'fade')
    lessonTransition?: 'none' | 'fade' | 'slide',          // animation between lessons (default 'fade')
    unitNumbering?: 'unit' | 'dotted' | 'none',  // with units: "Unit 2 · Lesson 1" (default), "Lesson 2.1", or "Lesson 5" counted through the course
    unitLabel?: string             // learner-facing word for a unit, e.g. "Module"; empty = "Unit" in the player language
  },
  intro?: {                        // optional cover page before the first lesson (not a lesson)
    enabled: boolean,
    layout: 'cover' | 'split' | 'minimal',  // cover = text over coverImage; split = image beside text; minimal = no image
    eyebrow?: string,              // small label above the title, e.g. "Onboarding · 15 min"
    buttonLabel?: string,          // start button text; empty = built-in "Start course"
    showOutline?: boolean,         // list the lessons under the button (default true)
    blocks?: Block[]               // extra content under the title: text and media blocks only
                                   // (heading, paragraph, list, note, quote, columns, table, code, image,
                                   // gallery, imageText, video, audio, embed, html, attachment, divider,
                                   // process, steps, comparison, cards, beforeAfter)
  },                               // the cover page shows the course title, description and coverImage
  units?: { id: string, title: string }[],  // optional units (modules, sections) grouping the lessons
  lessons: Lesson[]
}
\`\`\`

### Lesson

\`\`\`ts
{ id: string, title: string, status: 'draft' | 'published', blocks: Block[], unitId?: string }
\`\`\`

\`unitId\` puts the lesson in one of \`course.units\` (omit it for a lesson
outside the units). Keep \`lessons\` grouped: first the lessons without a unit,
then each unit's lessons together, in the order of \`units\` (Scormly regroups
them on load otherwise).

### Block

Every block is \`{ id: string, type: BlockType, settings: { spacing?: 'compact' | 'normal' | 'spacious', background?: 'none' | 'muted' | 'soft' | 'accent' | 'gradient' | 'dark' | 'image', backgroundImage?: string, width?: 'narrow' | 'normal' | 'wide' | 'full' }, data: <type-specific> }\`.
The \`type\` field selects the shape of \`data\` (a discriminated union).

\`settings.background\` paints the block as a panel in a color derived from the
theme (muted = light gray, soft = accent tint, accent / gradient = accent color
with white text, dark = near-black with white text, image = \`backgroundImage\`
(assets/images/ path) dimmed under white text); consecutive blocks with
the same background join into one panel. \`settings.spacing\` is its inner padding; on a block without a background, \`compact\` moves it closer to the blocks around it (use it to keep related blocks together) and \`spacious\` adds air.
\`settings.width\`: 'narrow' (~60% of the column, centered), 'normal' (default),
'wide' (breaks out past the column), 'full' stretches the block edge to edge of the page: with a
background it becomes a full-width band (content stays in the column); without
one, media blocks (text on image, carousel, quote on image) span the page.

## Block types

${blockReference()}

## Choosing a block (before you reach for a Widget)

The built-in blocks are themed, accessible, editable by the author in the app
and tracked; a Widget (\`html\`) is none of these by default. Most "designed"
layouts are a block with the right options:

| What you want to show | Use |
| --- | --- |
| The opening of a section: small line, heading, lead-in | \`heading\` with \`eyebrow\` and \`subtitle\` |
| Key points, platforms, teams, terms with codes | \`cards\` (grid; \`badge\` for the label, \`numbered\`, \`highlight\`) |
| A glossary or who-does-what steps, read line by line | \`cards\` with \`layout: 'rows'\` (\`badge\` = who, \`title\` = what, \`html\` = the detail) |
| A few options, each with bullet points | \`cards\` with \`titleStyle: 'band'\` and a \`<ul>\` in \`html\` |
| A good and a bad outcome side by side | \`cards\` with \`tone: 'positive'\` / \`'negative'\` |
| Do / don't, pros / cons | \`comparison\` (\`tone: 'pro'\` / \`'con'\`) |
| The same attributes for 2 to 4 items | \`table\` with \`layout: 'cards'\` (one card per column) |
| A reference table | \`table\` with \`style: 'panel'\`; \`rowMarks\` to highlight or mute a row |
| A callout with a label ("Key terms", "Out of scope") | \`note\` with \`title\` (and \`icon: false\` for a quiet box) |
| A sequence with arrows | \`process\` (flow / chevrons), or one \`paragraph\` with → between the steps |
| A walkthrough with screenshots | \`steps\` |

Keep the blocks of one idea close: give every block of a group except the last
\`settings.spacing: 'compact'\`. A heading with an eyebrow or subtitle already
sits close to what follows it. Reach for a Widget only when the content needs
behaviour or a layout no block has.

## Authoring rules

- **IDs**: every \`id\` (course, lesson, block, and nested items like quiz
  options, scenario nodes, tabs) must be unique within the file. Any unique
  string works; the app uses a short prefix + random suffix (e.g. \`block-x7f3a9\`).
- **Colors**: the course theme gives two colors, the accent (buttons, links)
  and a second color for details; blocks take them by themselves, so leave
  colors alone unless there is a reason. Where a color means something, set
  it on the block: a card's \`color\` or \`tone\`, a card label's
  \`badgeColor\`, a note's \`color\`, a table's \`headerColor\` (all
  \`'#rrggbb'\`; text on them is kept readable automatically). Use one or two
  extra colors per course and keep each to one meaning (for example blue for
  one team, green for "allowed"). There is no color inside text: rich text has
  no colored spans.
- **Adding content**: append a block object to a lesson's \`blocks\` array, or a
  whole lesson to \`lessons\`. Order in the array = order shown to the learner.
- **Rich text** (the \`html\` of \`paragraph\`, \`tabs\`, \`accordion\`, \`columns\`, \`cards\`,
  \`imageText\` and \`steps\`) is a small subset of HTML: paragraphs, bold /
  italic / underline, lists, links (\`<a href … target="_blank" rel="noopener
  noreferrer">\`; web, mailto: or tel: addresses only) and inline images with
  relative \`assets/\` paths, plus tables as described under \`paragraph\`.
  A process step's \`html\`, a note's \`html\` and a heading's \`subtitle\` are
  inline only (bold, italic, underline, links, line breaks); no lists, tables
  or images there. Table cells and comparison points are plain text where
  \`**double asterisks**\` make bold.
- **Media**: reference files by relative path under \`assets/images/\`,
  \`assets/videos/\`, \`assets/audio/\`, \`assets/captions/\` (WebVTT),
  \`assets/files/\` (attachments) or \`assets/html/<folder>/\` (a Widget
  block's page and its files). Put the files there too. A \`data:\` URL
  also works but bloats the file.
- **Media formats**: images PNG/JPEG/WebP/GIF/SVG, video MP4/WebM, audio
  MP3/OGG/WAV/M4A, captions WebVTT (.vtt). Other formats are rejected by the app.
  Attachments may be any document or archive except web pages and scripts
  (HTML, JS, SVG, XML); a Widget block's folder may hold any web files.
- **Accessibility**: give every informative image a meaningful \`alt\` (or set
  \`decorative: true\` when it adds no information); give videos \`captions\`
  and/or a \`transcript\`, audio a \`transcript\`, embeds a \`title\`; set
  \`settings.contentLanguage\` to the language the course is written in.
- **Quizzes**: for \`single\`/\`multiple\`, mark correct options with
  \`correct: true\` (at least one; give at least 2 options). For \`matching\`,
  the correct match for each pair is its own \`right\` value and learners pick
  answers by that text; pairs may share a \`right\` text to sort items into
  categories. Give at least 2 pairs. A \`sequence\` needs at least 2 items
  with text; a \`fillBlanks\` question at least one \`[blank]\`. Each question
  is right or wrong as a whole; the quiz score is the share of right ones.
- **Ordering**: give at least 2 items with non-empty text. In \`sequence\`
  mode list the items in the correct order. In \`categories\` mode give at
  least 2 categories and set every item's \`categoryId\` to one of them.
- **Fill in the blanks**: the \`text\` must contain at least one \`[answer]\`.
- **Scored blocks** (\`quiz\`, \`ordering\`, \`fillBlanks\`) each produce a
  0–100 score; the course score is their average, rounded to a whole number
  (the pass / fail verdict uses the rounded value).
- **Continue gates**: a \`continue\` block in the middle of a lesson hides the
  blocks after it until the learner clicks it; split long lessons into parts
  with it. A \`restricted\` one also waits for the quizzes, exercises,
  reflections and required videos above it (on its page). One at the very end
  of a lesson leads to the next lesson. With \`newPage: true\` it splits the
  lesson into pages shown one at a time instead of revealing the rest below.
- **Units**: to organise many lessons, add \`units\` and give each lesson the
  \`unitId\` of its unit (see Lesson above).
- **Custom HTML** (\`html\`): follow "Custom HTML blocks" below.
- **Scenarios**: \`startNodeId\` and every non-null \`nextNodeId\` must be the
  \`id\` of a node in the same scenario.
- **Don't** invent block \`type\`s or \`data\` fields beyond those listed above:
  unknown blocks are ignored by the player (and flagged before export). For
  something no block type does, use a Widget block (\`html\`).

## Custom HTML blocks

An \`html\` block shows a page of its own (an interactive widget, a
simulation, a calculator, a mini-game, a chart) in a frame inside the lesson.
Use it for what the other block types can't do; prefer the built-in blocks for
text, media, quizzes and exercises (they are tracked and themed).

- **Small page** → \`source: 'code'\` and the whole HTML document in \`code\`
  (a JSON string: escape quotes and line breaks).
- **Page with files** → \`source: 'file'\`: put the site in its own folder
  \`assets/html/<folder>/\` (a new folder name, e.g. \`html-x7f3a9\`) with
  \`index.html\` in it, and set \`src\` to \`assets/html/<folder>/index.html\`.
  Everything in that folder ships with the course; reference the files from
  the page by relative path.
- Give the block a \`title\` (what the frame is, for screen readers). Leave
  \`height\` out to fit the content, or set it (px) for a fixed-size app.

Writing the page:

${HTML_BLOCK_GUIDE}

## Before you finish: quality checklist

Scormly runs these checks before exporting and warns the author; a course that
passes them is ready to export:

- the course has at least one lesson, and no lesson is empty;
- image / video / audio blocks have a \`src\`, galleries have at least one
  image, embeds have a \`url\`, custom HTML blocks have code or a page,
  attachments at least one file, and a quote in the \`image\` style its
  background \`image\`;
- image hotspots have an image and at least one marker, and timelines at
  least one item;
- quizzes have questions; every question has text, enough options/pairs and a
  correct answer (sequence questions: 2+ items; fill-in questions: a blank);
- ordering blocks have at least 2 items with text; in categories mode at least
  2 categories and every item assigned to one;
- fill-in-the-blanks blocks contain at least one \`[blank]\`;
- scenarios start at an existing node and have no links to missing nodes;
- process diagrams have at least 2 steps, step-by-step guides at least one
  step, every comparison column at least one point, cards blocks at least one
  card, before / after blocks both images, and reflections a question;
- accessibility: non-decorative images (image, gallery, hotspot, before /
  after, step-by-step pictures, images in rich text) have alt text, videos
  have captions or a transcript, audio has a transcript, embeds and custom
  HTML blocks have a title,
  and the course content language is set.

## Typical agent workflow

1. Read \`project.json\` (and this guide) to understand the current course.
2. Make your edits (add lessons/blocks, rewrite text, build quizzes), keeping
   ids unique and the JSON valid.
3. Walk through the checklist above.
4. Ask the author to reopen the project in Scormly (the folder, or the \`.zip\`
   you return; see below) to review, preview and export (SCORM 2004 / 1.2 or
   cmi5). Exporting happens in the app, not from the file.

## Review comments (\`comments.json\`)

The author and reviewers leave comments on blocks in Scormly, kept in
[\`comments.json\`](./comments.json) beside \`project.json\` (no file means no
comments). They are notes for the people making the course: learners never see
them and exports leave them out.

\`\`\`json
{
  "version": 1,
  "threads": [
    {
      "id": "c-1",
      "blockId": "<id of a block in project.json>",
      "resolved": false,
      "updatedAt": "2026-11-09T10:00:00.000Z",
      "comments": [
        { "id": "m-1", "author": "Olena", "text": "Shorten this paragraph.", "createdAt": "2026-11-09T10:00:00.000Z" }
      ]
    }
  ]
}
\`\`\`

- A thread is about one block (\`blockId\`): its first comment opens it, the
  rest are replies, oldest first. An edited comment has \`editedAt\`; a resolved
  thread has \`resolvedBy\` and \`resolvedAt\`. Times are ISO 8601 (UTC).
- Read the open threads before you change a block: they often say what the
  author wants changed there.
- When the author asks you to work through the comments: make the change in
  \`project.json\`, add a reply saying what you did (\`author\`: e.g. "AI
  assistant"), and set \`resolved: true\`, \`resolvedBy\`, \`resolvedAt\` and
  \`updatedAt\`. Leave threads you didn't act on open.
- Don't delete or reword other people's comments, keep ids unique, and keep a
  block's \`id\` when you edit the block: it's how its comments find it.

## Working from a .zip

The author may hand you the project as a \`.zip\` (Scormly: **Save .zip** or
**Download project**). It holds \`project.json\`, this \`AGENTS.md\` and the
\`assets/\` folder (and \`comments.json\` when there are review comments). To
work on it:

1. Unzip it and edit \`project.json\` as described above (valid JSON, unique
   ids). Put any new media under \`assets/images/\`, \`assets/videos/\`,
   \`assets/audio/\`, \`assets/captions/\`, \`assets/files/\` or
   \`assets/html/<folder>/\` (custom HTML pages) and reference it
   by that relative path; don't embed files as base64 \`data:\` URLs.
2. Keep \`user-instructions.md\` in the archive, and the course \`id\` as it is: when the \`.zip\` comes back, Scormly uses
   it to recognize the project and offers to update the author's copy (a
   changed id opens as a separate project).
3. Zip it again with \`project.json\` at the root of the archive (zipping the
   project folder itself also works), keeping \`AGENTS.md\`, \`comments.json\`
   and \`assets/\`.
4. Give the \`.zip\` back to the author, who opens it with **Open .zip** on
   Scormly's start screen or in the project menu, no folder needed, in any
   browser. Small structural slips (missing or duplicate ids, missing fields)
   are repaired on open and reported; still, follow the shapes above.

## Minimal example

\`\`\`json
{
  "id": "${course.id}",
  "title": "${course.title.replace(/"/g, '\\"')}",
  "description": "",
  "theme": "${course.theme}",
  "settings": { "completion": "quiz", "scored": true, "passingScore": 80, "navigation": "free" },
  "lessons": [
    {
      "id": "${firstLesson}",
      "title": "Lesson 1",
      "status": "draft",
      "blocks": [
        { "id": "block-1", "type": "heading", "settings": {}, "data": { "level": 1, "text": "Welcome" } },
        { "id": "block-2", "type": "paragraph", "settings": {}, "data": { "html": "<p>Hello, learner!</p>" } }
      ]
    }
  ]
}
\`\`\`

_Generated by Scormly. It is rewritten whenever the project is opened in a newer
version, so don't keep notes here: edits will be replaced. Scormly never reads
it back; deleting it is harmless (it is recreated on the next open)._
`
}
