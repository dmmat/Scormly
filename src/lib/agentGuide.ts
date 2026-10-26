// Generates an AGENTS.md dropped into a new project folder. It documents the
// project.json data model and every block type so that AI agents (and humans)
// can read, edit, and author Scormly courses by editing project.json directly.
//
// BLOCK_DOCS is typed as Record<BlockType, ...>, so adding a new block type to
// the union forces a matching entry here — the guide can't silently fall behind.

import type { BlockType, Course } from '../types/course'
import { GITHUB_URL } from './links'

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
    data: `{ level: 1 | 2 | 3, text: string, align?: 'left' | 'center' | 'right' }`,
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
    data: `{ variant: 'note' | 'tip' | 'success' | 'warning', text: string }  // note = blue info, tip = theme color, success = green, warning = amber`,
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
  code: {
    summary: 'Monospaced code snippet.',
    data: `{ code: string, language?: string }`,
  },
  table: {
    summary: 'Simple table; every row has the same number of columns.',
    data: `{ header: boolean, rows: string[][], width?: 'full' | 'auto', align?: 'left' | 'center' | 'right' }  // header=true → first row is <th>; width: full (default) or fit content; align places an 'auto' table`,
  },
  quote: {
    summary: 'Highlighted quotation in one of five styles.',
    data: `{ text: string, author?: string, role?: string, variant?: 'classic' | 'statement' | 'card' | 'photo' | 'image', image?: string, photoSide?: 'left' | 'right' }  // variant default 'classic' (accent bar); statement = big centered text; card = testimonial with round author photo; photo = large author photo beside the quote (photoSide, default 'left'); image = white text over a background image. image: assets/images/ path (author photo or background); role: author's job title/company`,
  },
  continue: {
    summary: 'Continue button / page gate.',
    data: `{ mode: 'unrestricted' | 'restricted', label: string, nextCard?: boolean }  // hides later blocks until clicked (restricted: locked until the quizzes, exercises, reflections and required videos above are done, and required to leave the lesson); as the lesson's last block it replaces the "Next lesson" card unless nextCard is true`,
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
    layout?: 'classic' | 'chat',  // 'chat' = phone-messenger style (default 'classic')
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
    text: string,  // blanks in square brackets: "The capital of France is [Paris|Paname]." — '|' separates accepted answers, the first is canonical
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
    variant?: 'solid' | 'soft' | 'outline',  // default 'solid'; 'soft' = tinted shapes (flow: tinted cards); 'outline' = outlined number circles (flow only — other layouts show solid)
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
  comparison: {
    summary: 'Comparison cards: pros and cons, or options side by side.',
    data: `{
    columns: { id: string, title: string, tone: 'pro' | 'con' | 'neutral', items: string[] }[],  // 2–4 columns; tone sets the item marker: pro = green check, con = red cross, neutral = dot
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

  return `# Scormly course — agent guide

This folder is a **Scormly** project. The entire course lives in
[\`project.json\`](./project.json) — a single JSON file you can read and edit
directly to author or modify the course. Scormly is a local-first course builder
that exports to SCORM 1.2 / 2004 and cmi5 (xAPI).

> Edit \`project.json\` while the project is **closed** in the Scormly app (or
> reopen it afterwards), so your changes aren't overwritten by autosave. Keep the
> JSON valid and every \`id\` unique.

## Read first: the author's instructions

[\`user-instructions.md\`](./user-instructions.md) holds the author's own
notes for you — who the learners are, tone and style, terms to use or avoid,
house rules. Read it before you change anything and follow it. Where it
conflicts with the data format described here, the format wins. Scormly never
rewrites that file (unlike this one); edit it only when the author asks you to.

## Then: \`review.md\` (in a .zip)

A \`.zip\` saved by Scormly also holds [\`review.md\`](./review.md): what
Scormly found when it was saved. The course was rendered in the real learner
player on a phone and a desktop screen, and the report lists, by lesson and
block \`id\`, text that runs past the screen edge, spills out of its block or
is cut off, images that don't load, plus the pre-export content check. You
can't see the course, so treat it as your eyes: fix what it lists in
\`project.json\`, and keep it in mind when you add content (long unbroken
words, URLs and wide tables break phone layouts; cards, buttons and tabs have
little room). It describes the course as saved, not your edits; the author
re-saves the \`.zip\` in Scormly to get a fresh one.

## Scormly source

Scormly is open source: ${GITHUB_URL}. When this guide isn't enough, read the
code there (you never need to run it): the data model in
\`src/types/course.ts\`, how the learner sees each block in
\`public/scorm-player/player.js\` and \`player.css\`, the content check in
\`src/export/courseCheck.ts\`.

## Data model

\`\`\`
Course
└─ lessons: Lesson[]
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
  customTheme?: { accent: string, shape: 'sharp' | 'soft' | 'rounded' | 'pill' },  // used by theme 'custom'; accent '#rrggbb' (darkened automatically if white text on it would be hard to read)
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
    lessonTransition?: 'none' | 'fade' | 'slide'           // animation between lessons (default 'fade')
  },
  intro?: {                        // optional cover page before the first lesson (not a lesson)
    enabled: boolean,
    layout: 'cover' | 'split' | 'minimal',  // cover = text over coverImage; split = image beside text; minimal = no image
    eyebrow?: string,              // small label above the title, e.g. "Onboarding · 15 min"
    buttonLabel?: string,          // start button text; empty = built-in "Start course"
    showOutline?: boolean,         // list the lessons under the button (default true)
    blocks?: Block[]               // extra content under the title: text and media blocks only
                                   // (heading, paragraph, list, note, quote, columns, table, code, image,
                                   // gallery, imageText, video, audio, embed, attachment, divider,
                                   // process, steps, comparison, beforeAfter)
  },                               // the cover page shows the course title, description and coverImage
  lessons: Lesson[]
}
\`\`\`

### Lesson

\`\`\`ts
{ id: string, title: string, status: 'draft' | 'published', blocks: Block[] }
\`\`\`

### Block

Every block is \`{ id: string, type: BlockType, settings: { spacing?: 'compact' | 'normal' | 'spacious', background?: 'none' | 'muted' | 'soft' | 'accent' | 'gradient' | 'dark' | 'image', backgroundImage?: string, width?: 'narrow' | 'normal' | 'wide' | 'full' }, data: <type-specific> }\`.
The \`type\` field selects the shape of \`data\` (a discriminated union).

\`settings.background\` paints the block as a panel in a color derived from the
theme (muted = light gray, soft = accent tint, accent / gradient = accent color
with white text, dark = near-black with white text, image = \`backgroundImage\`
(assets/images/ path) dimmed under white text); consecutive blocks with
the same background join into one panel. \`settings.spacing\` is its inner padding.
\`settings.width\`: 'narrow' (~60% of the column, centered), 'normal' (default),
'wide' (breaks out past the column), 'full' stretches the block edge to edge of the page: with a
background it becomes a full-width band (content stays in the column); without
one, media blocks (text on image, carousel, quote on image) span the page.

## Block types

${blockReference()}

## Authoring rules

- **IDs**: every \`id\` (course, lesson, block, and nested items like quiz
  options, scenario nodes, tabs) must be unique within the file. Any unique
  string works; the app uses a short prefix + random suffix (e.g. \`block-x7f3a9\`).
- **Adding content**: append a block object to a lesson's \`blocks\` array, or a
  whole lesson to \`lessons\`. Order in the array = order shown to the learner.
- **Rich text** (the \`html\` of \`paragraph\`, \`tabs\`, \`accordion\`, \`columns\`,
  \`imageText\` and \`steps\`) is a small subset of HTML: paragraphs, bold /
  italic / underline, lists, links (\`<a href … target="_blank" rel="noopener
  noreferrer">\`; web, mailto: or tel: addresses only) and inline images with
  relative \`assets/\` paths, plus tables as described under \`paragraph\`.
  A process step's \`html\` is inline only (bold, italic, underline, links,
  line breaks) — no lists, tables or images inside diagram shapes.
- **Media**: reference files by relative path under \`assets/images/\`,
  \`assets/videos/\`, \`assets/audio/\`, \`assets/captions/\` (WebVTT) or \`assets/files/\`
  (attachments). Put the files there too. A \`data:\` URL
  also works but bloats the file.
- **Media formats**: images PNG/JPEG/WebP/GIF/SVG, video MP4/WebM, audio
  MP3/OGG/WAV/M4A, captions WebVTT (.vtt). Other formats are rejected by the app.
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
  reflections and required videos above it. One at the very end of a lesson
  leads to the next lesson.
- **Scenarios**: \`startNodeId\` and every non-null \`nextNodeId\` must be the
  \`id\` of a node in the same scenario.
- **Don't** invent block \`type\`s or \`data\` fields beyond those listed above —
  unknown blocks are ignored by the player.

## Before you finish — quality checklist

Scormly runs these checks before exporting and warns the author; a course that
passes them is ready to export:

- the course has at least one lesson, and no lesson is empty;
- image / video / audio blocks have a \`src\`, galleries have at least one
  image, embeds have a \`url\`;
- quizzes have questions; every question has text, enough options/pairs and a
  correct answer (sequence questions: 2+ items; fill-in questions: a blank);
- ordering blocks have at least 2 items with text; in categories mode at least
  2 categories and every item assigned to one;
- fill-in-the-blanks blocks contain at least one \`[blank]\`;
- scenarios start at an existing node and have no links to missing nodes;
- process diagrams have at least 2 steps, step-by-step guides at least one
  step, every comparison column at least one point, before / after blocks
  both images, and reflections a question;
- accessibility: non-decorative images (image, gallery, hotspot, before /
  after, step-by-step pictures, images in rich text) have alt text, videos
  have captions or a transcript, audio has a transcript, embeds have a title,
  and the course content language is set.

## Typical agent workflow

1. Read \`project.json\` (and this guide) to understand the current course,
   and \`review.md\` if there is one.
2. Make your edits — add lessons/blocks, rewrite text, build quizzes — keeping
   ids unique and the JSON valid.
3. Walk through the checklist above.
4. Ask the author to reopen the project in Scormly (the folder, or the \`.zip\`
   you return — see below) to review, preview and export (SCORM 2004 / 1.2 or
   cmi5). Exporting happens in the app, not from the file.

## Working from a .zip

The author may hand you the project as a \`.zip\` (Scormly: **Save .zip** or
**Download project**). It holds \`project.json\`, this \`AGENTS.md\` and the
\`assets/\` folder, \`user-instructions.md\` and \`review.md\`. To work on it:

1. Unzip it and edit \`project.json\` as described above (valid JSON, unique
   ids). Put any new media under \`assets/images/\`, \`assets/videos/\`,
   \`assets/audio/\`, \`assets/captions/\` or \`assets/files/\` and reference it
   by that relative path — don't embed files as base64 \`data:\` URLs.
2. Keep \`user-instructions.md\` in the archive, and the course \`id\` as it is: when the \`.zip\` comes back, Scormly uses
   it to recognize the project and offers to update the author's copy (a
   changed id opens as a separate project).
3. Zip it again with \`project.json\` at the root of the archive (zipping the
   project folder itself also works), keeping \`AGENTS.md\` and \`assets/\`.
4. Give the \`.zip\` back to the author, who opens it with **Open .zip** on
   Scormly's start screen or in the project menu — no folder needed, in any
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
version, so don't keep notes here — edits will be replaced. Scormly never reads
it back; deleting it is harmless (it is recreated on the next open)._
`
}
