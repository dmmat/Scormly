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

// Shared visual settings for a block (spacing, background, etc.).
export interface BlockSettings {
  /** Vertical spacing around the block. */
  spacing?: 'compact' | 'normal' | 'spacious'
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

export interface ParagraphData {
  /** Rich text as HTML (bold, italic, links). */
  html: string
}

export interface ListData {
  ordered: boolean
  items: string[]
}

export type NoteVariant = 'note' | 'warning'

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

export interface ImageData extends ImageRef {}

export interface GalleryData {
  images: ImageRef[]
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
}

export interface QuoteData {
  text: string
  author?: string
}

// ── Continue ─────────────────────────────────────────────────────────────────

export type ContinueMode = 'unrestricted' | 'restricted'

export interface ContinueData {
  mode: ContinueMode
  label: string
}

// ── Divider ──────────────────────────────────────────────────────────────────

export type DividerStyle = 'solid' | 'dashed' | 'dotted'

export interface DividerData {
  style: DividerStyle
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

export type QuestionType = 'single' | 'multiple' | 'matching'

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

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion

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

/** Narrow Block to a specific type (for renderers/editors). */
export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>

/** Block types that produce a score (0–100) and count toward the course score,
 *  per-block objectives and the 'quiz' completion rule. */
export const SCORED_BLOCK_TYPES: readonly BlockType[] = ['quiz', 'ordering', 'fillBlanks']

export function isScoredBlock(block: Block): boolean {
  return SCORED_BLOCK_TYPES.includes(block.type)
}

export type LessonStatus = 'draft' | 'published'

export interface Lesson {
  id: string
  title: string
  status: LessonStatus
  blocks: Block[]
}

/** Global project theme ID (button and interactive styles). See src/theme. */
export type ThemeId =
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
  /** Player UI language; 'auto' = LMS preference, else the browser. */
  playerLanguage?: PlayerLanguage
  /** Show "Lesson n of N" in the player header (default true). */
  showProgress?: boolean
  /** Custom text on the completion screen; empty = the built-in message. */
  finishMessage?: string
  /** BCP 47 language of the course content (e.g. 'en', 'uk'); sets `lang`. */
  contentLanguage?: string
}

export type PlayerLanguage = 'auto' | 'en' | 'uk'

export const DEFAULT_COURSE_SETTINGS: CourseSettings = {
  completion: 'quiz',
  scored: true,
  passingScore: 80,
  navigation: 'free',
}

export interface Course {
  id: string
  title: string
  description: string
  coverImage?: string
  /** Global project theme. Affects the accent, buttons, and interactive blocks. */
  theme: ThemeId
  /** Completion/scoring settings. Optional in legacy projects (see migration). */
  settings?: CourseSettings
  lessons: Lesson[]
}
