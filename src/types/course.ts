// Declarative course data model (spec §4–5).
// A course is described as hierarchical JSON: Course → Lesson[] → Block[].
// Block is a discriminated union on the `type` field: each type has its own
// `data` shape, which gives type-safe rendering and editing. Adding a new block
// type = a new union variant + a matching renderer component.

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'note'
  | 'image'
  | 'gallery'
  | 'video'
  | 'audio'
  | 'embed'
  | 'code'
  | 'table'
  | 'quote'
  | 'continue'
  | 'divider'
  | 'courseOutline'
  | 'tabs'
  | 'accordion'
  | 'flashcards'
  | 'scenario'
  | 'quiz'
  | 'hotspot'
  | 'timeline'
  | 'ordering'
  | 'fillBlanks'
  | 'imageText'
  | 'attachment'
  | 'columns'
  | 'process'
  | 'steps'
  | 'comparison'
  | 'beforeAfter'
  | 'reflection'

/** Block background, drawn from the course theme (soft/accent/gradient follow
 *  the theme accent), so recoloring the theme recolors every block. */
export type BlockBackground =
  | 'none'
  | 'muted'
  | 'soft'
  | 'accent'
  | 'gradient'
  | 'dark'
  | 'image'

export type BlockWidth = 'narrow' | 'normal' | 'wide' | 'full'

// Shared visual settings for a block (spacing, background, etc.).
export interface BlockSettings {
  /** Inner padding of the block (most visible with a background). */
  spacing?: 'compact' | 'normal' | 'spacious'
  /** Background color of the block; 'none' (default) = transparent. */
  background?: BlockBackground
  /** Photo for background 'image' (assets/ path); dimmed so text stays readable. */
  backgroundImage?: string
  /** Block width: narrow (~60% of the column), normal (the column, default),
   *  wide (breaks out past the column) or full — edge to edge of the page: a
   *  full-width band (with a background the content stays in the column;
   *  without one, media such as text on image or a carousel spans the page). */
  width?: BlockWidth
}

interface BaseBlock {
  id: string
  settings: BlockSettings
}

// ── Text blocks ───────────────────────────────────────────────────────────────

export type HeadingLevel = 1 | 2 | 3
export type TextAlign = 'left' | 'center' | 'right'

export interface HeadingData {
  level: HeadingLevel
  text: string
  align?: TextAlign
}

/** normal · lead (larger intro text) · dropcap (big first letter) ·
 *  columns (two columns on wide screens). */
export type ParagraphVariant = 'normal' | 'lead' | 'dropcap' | 'columns'

export interface ParagraphData {
  /** Rich text as HTML (bold, italic, links). */
  html: string
  /** Default 'normal'. */
  variant?: ParagraphVariant
}

export interface ListData {
  ordered: boolean
  items: string[]
}

export type NoteVariant = 'note' | 'tip' | 'success' | 'warning'

export interface NoteData {
  variant: NoteVariant
  text: string
}

// ── Multimedia ────────────────────────────────────────────────────────────────

export interface ImageRef {
  /** Relative path to the file in assets/, or a data URL while editing. */
  src: string
  alt: string
  caption?: string
  /** Purely decorative: rendered with empty alt so screen readers skip it. */
  decorative?: boolean
}

/** Image width: small/medium/large (= the content column) or full-bleed
 *  (edge to edge of the page, wider than the content column). */
export type ImageSize = 'small' | 'medium' | 'large' | 'full'

export interface ImageData extends ImageRef {
  /** Default 'large' (legacy images). */
  size?: ImageSize
  /** Horizontal placement of small/medium images (default 'center'). */
  align?: TextAlign
}

export type GalleryLayout = 'grid' | 'carousel'

export interface GalleryData {
  images: ImageRef[]
  /** Default 'grid'. The carousel shows one image (with its caption) at a time. */
  layout?: GalleryLayout
  /** Grid columns on wide screens (default 3). */
  columns?: 2 | 3 | 4
}

export interface VideoData {
  /** Relative path to the file in assets/videos/. */
  src: string
  poster?: string
  /** Require the learner to watch the video (~95%) before advancing. */
  requireWatch?: boolean
  /** Relative path to a WebVTT captions file in assets/ (accessibility). */
  captions?: string
  /** Text transcript shown under the video (accessibility). */
  transcript?: string
}

export interface AudioData {
  /** Relative path to the file in assets/audio/. */
  src: string
  /** Text transcript shown under the player (accessibility). */
  transcript?: string
}

export interface EmbedData {
  /** URL to embed in an iframe (e.g. a YouTube video). */
  url: string
  title?: string
}

export interface CodeData {
  code: string
  language?: string
}

export interface TableData {
  /** Whether the first row is a header. */
  header: boolean
  /** Rows of cell text; every row has the same number of columns. */
  rows: string[][]
  /** 'full' (default) spans the block; 'auto' fits the content. */
  width?: 'full' | 'auto'
  /** Where an 'auto' table sits (default 'left'). */
  align?: TextAlign
}

/** Quote presentation:
 *  - classic: accent bar on the left
 *  - statement: large centered text between accent rules
 *  - card: testimonial card with a round author photo
 *  - photo: large author photo beside the quote (left or right: photoSide)
 *  - image: white text over a full background image */
export type QuoteVariant = 'classic' | 'statement' | 'card' | 'photo' | 'image'

export interface QuoteData {
  text: string
  author?: string
  /** Default 'classic'. */
  variant?: QuoteVariant
  /** Author's role / company, shown under the name. */
  role?: string
  /** Author photo (card/photo) or background image (image variant). */
  image?: string
  /** 'photo' variant: which side the photo is on (default 'left'). */
  photoSide?: 'left' | 'right'
}

// ── Image & text ────────────────────────────────────────────────────────────

/** left/right: image beside the text; overlay: text on top of the image. */
export type ImageTextLayout = 'left' | 'right' | 'overlay'

export interface ImageTextData extends ImageRef {
  layout: ImageTextLayout
  /** Rich text shown next to (or over) the image. */
  html: string
}

// ── Text columns ────────────────────────────────────────────────────────────

export interface TextColumn {
  id: string
  /** Optional column heading. */
  title: string
  /** Rich text like a paragraph. */
  html: string
}

/** plain: text side by side · cards: each column on a white card ·
 *  lines: thin vertical rules between columns. */
export type ColumnsStyle = 'plain' | 'cards' | 'lines'

export interface ColumnsData {
  /** 2–4 columns; they stack on phones. */
  columns: TextColumn[]
  style: ColumnsStyle
}

// ── Attachments ─────────────────────────────────────────────────────────────

export interface AttachmentFile {
  id: string
  /** Relative path under assets/files/ (or a data URL in no-folder mode). */
  src: string
  /** Original file name, offered as the download name. */
  name: string
  /** Size in bytes (display only). */
  size?: number
}

export interface AttachmentData {
  title?: string
  files: AttachmentFile[]
}

// ── Continue ─────────────────────────────────────────────────────────────────

export type ContinueMode = 'unrestricted' | 'restricted'

/** Mid-lesson, the blocks after a Continue stay hidden until it is clicked
 *  (any mode); 'restricted' also must be clicked before the lesson is left. */
export interface ContinueData {
  mode: ContinueMode
  label: string
  /** As the lesson's last block it replaces the "Next lesson" card, which
   *  would do the same; true shows the card as well. */
  nextCard?: boolean
}

// ── Divider ──────────────────────────────────────────────────────────────────

/** Lines (solid/dashed/dotted/gradient), decorative separators (dots,
 *  ornament, wave), a line with a centered text label, or empty space. */
export type DividerStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'gradient'
  | 'dots'
  | 'ornament'
  | 'wave'
  | 'label'
  | 'spacer'

export interface DividerData {
  style: DividerStyle
  /** Text in the middle of a 'label' divider, e.g. "Part 2". */
  label?: string
}

// ── Course outline ──────────────────────────────────────────────────────────

export interface CourseOutlineData {
  /** Optional heading shown above the list; empty string hides it. */
  title: string
  /** Number the lessons (1., 2., …) instead of plain links. */
  numbered: boolean
}

// ── Interactive UI elements ─────────────────────────────────────────────────

export interface TabItem {
  id: string
  title: string
  html: string
}

export interface TabsData {
  tabs: TabItem[]
}

export interface AccordionItem {
  id: string
  title: string
  html: string
}

export interface AccordionData {
  items: AccordionItem[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
}

export interface FlashcardsData {
  cards: Flashcard[]
}

// Dialogue trainer (spec §5.2).
export type ScenarioEmotion = 'neutral' | 'happy' | 'concerned'

export interface ScenarioChoice {
  id: string
  text: string
  /** ID of the next node, or null to end the scenario. */
  nextNodeId: string | null
  /** Character emotion after this choice. */
  setEmotion?: ScenarioEmotion
}

export interface ScenarioNode {
  id: string
  /** The character's line of dialogue. */
  text: string
  emotion: ScenarioEmotion
  choices: ScenarioChoice[]
}

/** Visual presentation of a scenario in the player/preview. */
export type ScenarioLayout =
  /** Avatar + dialogue line + choice buttons (replaces the line each step). */
  | 'classic'
  /** Phone-style messenger: an accumulating chat with reply bubbles. */
  | 'chat'

export interface ScenarioData {
  /** Character images by emotion (relative paths). */
  characterImages: Partial<Record<ScenarioEmotion, string>>
  characterName: string
  startNodeId: string
  nodes: ScenarioNode[]
  /** Presentation layout; defaults to 'classic' when omitted (legacy scenarios). */
  layout?: ScenarioLayout
  /** Learner's avatar in chat layout (relative path); shown on their replies. */
  userAvatar?: string
}

// ── Quizzes (spec §5.1) ─────────────────────────────────────────────────────

export type QuestionType = 'single' | 'multiple' | 'matching' | 'sequence' | 'fillBlanks'

export interface ChoiceOption {
  id: string
  text: string
  correct: boolean
  /** Explanatory feedback for this option. */
  feedback?: string
}

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface BaseQuestion {
  id: string
  prompt: string
  /** Overall feedback for the question. */
  feedback?: string
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single'
  options: ChoiceOption[]
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple'
  options: ChoiceOption[]
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  pairs: MatchingPair[]
}

export interface SequenceItem {
  id: string
  text: string
}

/** Put the items in order; authored in the correct order, shown shuffled. */
export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence'
  items: SequenceItem[]
}

/** Same blank syntax and modes as the fill-in-the-blanks block. Correct only
 *  when every blank is. */
export interface FillBlanksQuestion extends BaseQuestion {
  type: 'fillBlanks'
  text: string
  mode: 'type' | 'select'
  caseSensitive?: boolean
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion
  | SequenceQuestion
  | FillBlanksQuestion

export interface QuizData {
  questions: Question[]
  /** Passing score as a percentage (0–100). */
  passingScore: number
  /**
   * Reveal which answers are correct after submitting (highlighting + per-option
   * and per-question feedback). When false, only the score is shown. Defaults to
   * true when omitted (legacy quizzes).
   */
  showAnswers?: boolean
}

// ── Image hotspots ──────────────────────────────────────────────────────────

export interface Hotspot {
  id: string
  /** Marker position as a percentage (0–100) of the image width. */
  x: number
  /** Marker position as a percentage (0–100) of the image height. */
  y: number
  title: string
  text: string
}

export interface HotspotData {
  /** Relative path to the image in assets/images/ (or a data URL). */
  src: string
  alt: string
  hotspots: Hotspot[]
}

// ── Timeline / process steps ────────────────────────────────────────────────

export type TimelineLayout =
  /** All items in a vertical timeline. */
  | 'vertical'
  /** One step at a time with Previous/Next and step dots. */
  | 'stepper'

export interface TimelineItem {
  id: string
  /** Short marker label, e.g. a date or "Step 1". */
  label: string
  title: string
  text: string
}

export interface TimelineData {
  layout: TimelineLayout
  items: TimelineItem[]
}

// ── Scored exercises (count toward the course score like quizzes) ──────────

export interface OrderingItem {
  id: string
  text: string
  /** 'categories' mode: the id of the category this item belongs to. */
  categoryId?: string
}

export interface OrderingCategory {
  id: string
  title: string
}

export interface OrderingData {
  /** 'sequence': items are authored in the correct order and shown shuffled.
   *  'categories': the learner sorts each item into a category. */
  mode: 'sequence' | 'categories'
  prompt: string
  items: OrderingItem[]
  categories: OrderingCategory[]
  /** Passing score as a percentage (0–100). */
  passingScore: number
  /** Reveal correct positions/categories after submitting (default true). */
  showAnswers?: boolean
}

export interface FillBlanksData {
  /** Text with blanks in square brackets: "The capital is [Paris|paris]."
   *  Alternatives are separated by `|`; the first one is canonical. */
  text: string
  /** 'type': free-text inputs; 'select': a dropdown of every blank's answer. */
  mode: 'type' | 'select'
  /** Passing score as a percentage (0–100). */
  passingScore: number
  /** Reveal correct answers after submitting (default true). */
  showAnswers?: boolean
  /** Compare typed answers case-sensitively (default false). */
  caseSensitive?: boolean
}

// ── Process diagram ─────────────────────────────────────────────────────────

export type ProcessLayout =
  /** Numbered cards joined by arrows (a column on narrow screens). */
  | 'flow'
  /** A row of arrow-shaped segments with the text under each. */
  | 'chevrons'
  /** Steps around a ring; the learner opens each one to read it. */
  | 'cycle'
  /** Stacked levels, narrowest on top, with the text beside each. */
  | 'pyramid'

export interface ProcessStep {
  id: string
  title: string
  /** Plain description (older steps; kept in sync as the plain version of html). */
  text: string
  /** Description as inline rich text (bold, italic, underline, links); wins over text. */
  html?: string
}

/** Look of the shapes: solid fills (default), soft tints (flow: tinted
 *  cards) or outlines (flow only). See PROCESS_VARIANTS. */
export type ProcessVariant = 'solid' | 'soft' | 'outline'

export interface ProcessData {
  layout: ProcessLayout
  /** Absent = 'solid'. */
  variant?: ProcessVariant
  steps: ProcessStep[]
}

// ── Step-by-step guide ──────────────────────────────────────────────────────

export type StepsLayout =
  /** Every step in a numbered column. */
  | 'list'
  /** One step at a time with Back/Next and a progress bar. */
  | 'slides'

export interface GuideStep {
  id: string
  title: string
  /** Rich text, like a paragraph. */
  html: string
  /** Optional picture: relative path under assets/images/. */
  src?: string
  alt?: string
}

export interface StepsData {
  layout: StepsLayout
  steps: GuideStep[]
}

// ── Comparison (pros & cons, A vs B) ────────────────────────────────────────

/** Item marker: pro = check, con = cross, neutral = dot. */
export type ComparisonTone = 'pro' | 'con' | 'neutral'

export interface ComparisonColumn {
  id: string
  title: string
  tone: ComparisonTone
  items: string[]
}

export interface ComparisonData {
  /** 2–4 columns. */
  columns: ComparisonColumn[]
  /** A "VS" badge between two columns. */
  versus?: boolean
}

// ── Before / after slider ───────────────────────────────────────────────────

export interface BeforeAfterData {
  /** Relative paths under assets/images/. The "after" picture sets the size;
   *  the "before" one is cropped to it. */
  before: string
  beforeAlt: string
  beforeLabel: string
  after: string
  afterAlt: string
  afterLabel: string
}

// ── Reflection (free-text answer, not scored) ───────────────────────────────

export interface ReflectionData {
  prompt: string
  /** Shown once the learner submits; empty = none. */
  sample: string
}

// ── Block: discriminated union ──────────────────────────────────────────────

export type Block =
  | (BaseBlock & { type: 'heading'; data: HeadingData })
  | (BaseBlock & { type: 'paragraph'; data: ParagraphData })
  | (BaseBlock & { type: 'list'; data: ListData })
  | (BaseBlock & { type: 'note'; data: NoteData })
  | (BaseBlock & { type: 'image'; data: ImageData })
  | (BaseBlock & { type: 'gallery'; data: GalleryData })
  | (BaseBlock & { type: 'video'; data: VideoData })
  | (BaseBlock & { type: 'audio'; data: AudioData })
  | (BaseBlock & { type: 'embed'; data: EmbedData })
  | (BaseBlock & { type: 'code'; data: CodeData })
  | (BaseBlock & { type: 'table'; data: TableData })
  | (BaseBlock & { type: 'quote'; data: QuoteData })
  | (BaseBlock & { type: 'continue'; data: ContinueData })
  | (BaseBlock & { type: 'divider'; data: DividerData })
  | (BaseBlock & { type: 'courseOutline'; data: CourseOutlineData })
  | (BaseBlock & { type: 'tabs'; data: TabsData })
  | (BaseBlock & { type: 'accordion'; data: AccordionData })
  | (BaseBlock & { type: 'flashcards'; data: FlashcardsData })
  | (BaseBlock & { type: 'scenario'; data: ScenarioData })
  | (BaseBlock & { type: 'quiz'; data: QuizData })
  | (BaseBlock & { type: 'hotspot'; data: HotspotData })
  | (BaseBlock & { type: 'timeline'; data: TimelineData })
  | (BaseBlock & { type: 'ordering'; data: OrderingData })
  | (BaseBlock & { type: 'fillBlanks'; data: FillBlanksData })
  | (BaseBlock & { type: 'imageText'; data: ImageTextData })
  | (BaseBlock & { type: 'attachment'; data: AttachmentData })
  | (BaseBlock & { type: 'columns'; data: ColumnsData })
  | (BaseBlock & { type: 'process'; data: ProcessData })
  | (BaseBlock & { type: 'steps'; data: StepsData })
  | (BaseBlock & { type: 'comparison'; data: ComparisonData })
  | (BaseBlock & { type: 'beforeAfter'; data: BeforeAfterData })
  | (BaseBlock & { type: 'reflection'; data: ReflectionData })

/** Narrow Block to a specific type (for renderers/editors). */
export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>

/** Block types that produce a score (0–100) and count toward the course score,
 *  per-block objectives and the 'quiz' completion rule. */
export const SCORED_BLOCK_TYPES: readonly BlockType[] = ['quiz', 'ordering', 'fillBlanks']

export function isScoredBlock(block: Block): boolean {
  return SCORED_BLOCK_TYPES.includes(block.type)
}

/** Blocks the learner has to finish before a restricted Continue below them
 *  unlocks: scored blocks, reflections and videos that require watching. */
export function isTaskBlock(block: Block): boolean {
  return (
    isScoredBlock(block) ||
    block.type === 'reflection' ||
    (block.type === 'video' && !!block.data.requireWatch)
  )
}

/** Block types allowed on the cover page: content only. Questions, gates and
 *  lesson lists belong to lessons (scoring, progress, navigation). */
export const INTRO_BLOCK_TYPES: readonly BlockType[] = [
  'heading', 'paragraph', 'list', 'note', 'quote', 'columns', 'table', 'code',
  'image', 'gallery', 'imageText', 'video', 'audio', 'embed', 'attachment', 'divider',
  'process', 'steps', 'comparison', 'beforeAfter',
]

/** `activeLessonId` (and block actions' lesson id) that addresses the course
 *  cover page rather than a lesson. */
export const INTRO_ID = '__intro__'

export type LessonStatus = 'draft' | 'published'

export interface Lesson {
  id: string
  title: string
  status: LessonStatus
  blocks: Block[]
}

/** Built-in theme IDs (see src/theme). */
export type PresetThemeId =
  | 'rose'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'mono'
  | 'indigo'
  | 'crimson'
  | 'mint'
  | 'grape'
  | 'terminal'

/** Global project theme ID (button and interactive styles): a preset, or
 *  'custom' for the course's own CustomTheme. */
export type ThemeId = PresetThemeId | 'custom'

/** Corner style of buttons and cards. */
export type ThemeShape = 'sharp' | 'soft' | 'rounded' | 'pill'

/** The author's own theme (Course.theme === 'custom'). Shades derive from the
 *  accent, darkened when needed so text on it stays readable (WCAG AA). */
export interface CustomTheme {
  /** #rrggbb */
  accent: string
  shape: ThemeShape
}

/** What marks the course complete in the LMS. */
export type CompletionRule =
  /** Complete once every lesson is viewed (and restricted gates passed). */
  | 'view'
  /** Additionally requires every quiz to be answered. */
  | 'quiz'

/** How the learner may move between lessons in the player. */
export type NavigationMode =
  /** Free movement: Next/Previous always available. */
  | 'free'
  /** Linear: Next unlocks only once the current lesson is complete (gates,
   *  required videos, and — under the 'quiz' rule — its quizzes answered).
   *  Previous stays available. */
  | 'linear'

/** Course-level SCORM completion and scoring settings. */
export interface CourseSettings {
  completion: CompletionRule
  /** Report a pass/fail result against `passingScore`. Off = completion only. */
  scored: boolean
  /** Overall passing score as a percentage (0–100); used when `scored`. */
  passingScore: number
  /** Lesson navigation behaviour in the player. */
  navigation: NavigationMode
  /** Player UI language; 'auto' = the content language if the player supports
   *  it, else the LMS preference, else the browser. */
  playerLanguage?: PlayerLanguage
  /** Show "Lesson n of N" in the player header (default true). */
  showProgress?: boolean
  /** Custom text on the completion screen; empty = the built-in message. */
  finishMessage?: string
  /** BCP 47 language of the course content (e.g. 'en', 'uk'); sets `lang`. */
  contentLanguage?: string
  /** Width of the lesson content column (default DEFAULT_CONTENT_WIDTH). */
  contentWidth?: ContentWidth
  /** How blocks appear as they scroll into view (default 'fade'). */
  blockAnimation?: BlockAnimation
  /** Transition between lessons (default 'fade'). */
  lessonTransition?: LessonTransition
  /** Font pairing for the learner-facing course (default 'modern'). */
  typography?: Typography
}

export type ContentWidth = 'narrow' | 'normal' | 'wide' | 'full'
export type BlockAnimation = 'none' | 'fade' | 'slide' | 'zoom'
export type LessonTransition = 'none' | 'fade' | 'slide'
/** modern: system sans · editorial: serif headings · rounded: rounded sans. */
export type Typography = 'modern' | 'editorial' | 'rounded'

/** Pixel widths of the content column (mirrored in the player's CSS). */
export const CONTENT_WIDTH_PX: Record<ContentWidth, number> = {
  narrow: 680,
  normal: 768,
  wide: 1024,
  full: 1400,
}

/** Course cover page shown before the first lesson. The title, description
 *  and cover image come from the course itself, so they stay in one place. */
export interface CourseIntro {
  enabled: boolean
  /** cover: text over the full-bleed image · split: image beside the text ·
   *  minimal: centered text, no image. */
  layout: 'cover' | 'split' | 'minimal'
  /** Small label above the title, e.g. "Onboarding · 15 min". */
  eyebrow?: string
  /** Start button label; empty = the player's built-in "Start course". */
  buttonLabel?: string
  /** List the lessons under the start button (default true). */
  showOutline?: boolean
  /** Extra content under the title (INTRO_BLOCK_TYPES only). */
  blocks?: Block[]
}

/** Cover page for new courses (legacy projects without `intro` have none). */
export const DEFAULT_INTRO: CourseIntro = {
  enabled: true,
  layout: 'cover',
  showOutline: true,
}

export type PlayerLanguage = 'auto' | 'en' | 'uk'

export const DEFAULT_CONTENT_WIDTH: ContentWidth = 'wide'

export const DEFAULT_COURSE_SETTINGS: CourseSettings = {
  completion: 'quiz',
  scored: true,
  passingScore: 80,
  navigation: 'free',
  contentWidth: DEFAULT_CONTENT_WIDTH,
}

export interface Course {
  id: string
  title: string
  description: string
  coverImage?: string
  /** Global project theme. Affects the accent, buttons, and interactive blocks. */
  theme: ThemeId
  /** Used when theme === 'custom'. */
  customTheme?: CustomTheme
  /** Completion/scoring settings. Optional in legacy projects (see migration). */
  settings?: CourseSettings
  /** Optional cover page before the first lesson (not a lesson itself). */
  intro?: CourseIntro
  lessons: Lesson[]
}
