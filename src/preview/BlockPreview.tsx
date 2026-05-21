import type { Block } from '../types/course'
import ImagePreview from './components/ImagePreview'
import GalleryPreview from './components/GalleryPreview'
import VideoPreview from './components/VideoPreview'
import TabsPreview from './components/TabsPreview'
import AccordionPreview from './components/AccordionPreview'
import FlashcardsPreview from './components/FlashcardsPreview'
import ScenarioPreview from './components/ScenarioPreview'
import QuizPreview from './components/QuizPreview'

// Read-only learner rendering of a single block (no editing affordances).
export default function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const { level, text, align = 'left' } = block.data
      const Tag = `h${level}` as const
      const cls =
        level === 1
          ? 'text-3xl font-bold'
          : level === 2
            ? 'text-2xl font-bold'
            : 'text-xl font-semibold'
      return (
        <Tag className={`text-gray-900 ${cls}`} style={{ textAlign: align }}>
          {text}
        </Tag>
      )
    }
    case 'paragraph':
      return (
        <div
          className="rich-text leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: block.data.html }}
        />
      )
    case 'list': {
      const { ordered, items } = block.data
      const List = ordered ? 'ol' : 'ul'
      return (
        <List
          className={`space-y-1 pl-6 text-gray-800 ${ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </List>
      )
    }
    case 'note': {
      const isWarning = block.data.variant === 'warning'
      return (
        <div
          className={`flex gap-3 rounded-lg border p-4 ${
            isWarning
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          <span aria-hidden>{isWarning ? '⚠' : 'ℹ'}</span>
          <p className="leading-relaxed">{block.data.text}</p>
        </div>
      )
    }
    case 'image':
      return <ImagePreview block={block} />
    case 'gallery':
      return <GalleryPreview block={block} />
    case 'video':
      return <VideoPreview block={block} />
    case 'continue':
      return (
        <div className="flex justify-center py-2">
          <button type="button" className="btn-primary">
            {block.data.label}
          </button>
        </div>
      )
    case 'divider':
      return (
        <hr
          className="my-2 border-0 border-t-2 border-gray-300"
          style={{ borderTopStyle: block.data.style }}
        />
      )
    case 'tabs':
      return <TabsPreview block={block} />
    case 'accordion':
      return <AccordionPreview block={block} />
    case 'flashcards':
      return <FlashcardsPreview block={block} />
    case 'scenario':
      return <ScenarioPreview block={block} />
    case 'quiz':
      return <QuizPreview block={block} />
  }
}
