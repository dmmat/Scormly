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
  | 'continue'
  | 'tabs'
  | 'accordion'
  | 'flashcards'
  | 'scenario'
  | 'quiz'

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

export interface HeadingData {
  level: HeadingLevel
  text: string
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
}

export interface ImageData extends ImageRef {}

export interface GalleryData {
  images: ImageRef[]
}

export interface VideoData {
  /** Relative path to the file in assets/videos/. */
  src: string
  poster?: string
}

// ── Continue ─────────────────────────────────────────────────────────────────

export type ContinueMode = 'unrestricted' | 'restricted'

export interface ContinueData {
  mode: ContinueMode
  label: string
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

export interface ScenarioData {
  /** Character images by emotion (relative paths). */
  characterImages: Partial<Record<ScenarioEmotion, string>>
  characterName: string
  startNodeId: string
  nodes: ScenarioNode[]
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
  | (BaseBlock & { type: 'continue'; data: ContinueData })
  | (BaseBlock & { type: 'tabs'; data: TabsData })
  | (BaseBlock & { type: 'accordion'; data: AccordionData })
  | (BaseBlock & { type: 'flashcards'; data: FlashcardsData })
  | (BaseBlock & { type: 'scenario'; data: ScenarioData })
  | (BaseBlock & { type: 'quiz'; data: QuizData })

/** Narrow Block to a specific type (for renderers/editors). */
export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>

export type LessonStatus = 'draft' | 'published'

export interface Lesson {
  id: string
  title: string
  status: LessonStatus
  blocks: Block[]
}

/** Global project theme ID (button and interactive styles). See src/theme. */
export type ThemeId = 'rise' | 'ocean' | 'forest' | 'sunset'

export interface Course {
  id: string
  title: string
  description: string
  coverImage?: string
  /** Global project theme. Affects the accent, buttons, and interactive blocks. */
  theme: ThemeId
  lessons: Lesson[]
}
