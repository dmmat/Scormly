// Декларативна модель даних курсу (ТЗ §4).
// Курс описується як ієрархічний JSON: Course → Lesson[] → Block[].

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'note'
  | 'image'
  | 'gallery'
  | 'video'
  | 'continue'
  | 'quiz'
  | 'tabs'
  | 'accordion'
  | 'flashcards'
  | 'scenario'

export type LessonStatus = 'draft' | 'published'

export interface Block {
  id: string
  type: BlockType
  settings: Record<string, unknown>
  data: Record<string, unknown>
}

export interface Lesson {
  id: string
  title: string
  status: LessonStatus
  blocks: Block[]
}

export interface Course {
  id: string
  title: string
  description: string
  coverImage?: string
  lessons: Lesson[]
}
