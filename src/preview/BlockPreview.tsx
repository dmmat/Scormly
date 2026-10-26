import { useId } from 'react'
import type { Block } from '../types/course'
import { useT } from '../i18n/I18nProvider'
import RichHtml from './RichHtml'
import ImagePreview from './components/ImagePreview'
import GalleryPreview from './components/GalleryPreview'
import VideoPreview from './components/VideoPreview'
import AudioPreview from './components/AudioPreview'
import EmbedPreview from './components/EmbedPreview'
import CodePreview from './components/CodePreview'
import TablePreview from './components/TablePreview'
import QuotePreview from './components/QuotePreview'
import TabsPreview from './components/TabsPreview'
import AccordionPreview from './components/AccordionPreview'
import FlashcardsPreview from './components/FlashcardsPreview'
import ScenarioPreview from './components/ScenarioPreview'
import QuizPreview from './components/QuizPreview'
import OrderingPreview from './components/OrderingPreview'
import FillBlanksPreview from './components/FillBlanksPreview'
import CourseOutlinePreview from './components/CourseOutlinePreview'
import HotspotPreview from './components/HotspotPreview'
import TimelinePreview from './components/TimelinePreview'
import DividerView from './components/DividerView'
import NoteView from './components/NoteView'
import ImageTextPreview from './components/ImageTextPreview'
import AttachmentPreview from './components/AttachmentPreview'
import ColumnsPreview from './components/ColumnsPreview'
import ProcessPreview from './components/ProcessPreview'
import StepsPreview from './components/StepsPreview'
import ComparisonPreview from './components/ComparisonPreview'
import BeforeAfterPreview from './components/BeforeAfterPreview'
import ReflectionPreview from './components/ReflectionPreview'

// Read-only learner rendering of a single block (no editing affordances).
export default function BlockPreview({
  block,
  currentLessonId,
  onNavigate,
  onContinue,
  continueLocked,
}: {
  block: Block
  /** Lesson currently shown (so the outline can exclude it). */
  currentLessonId?: string
  /** Navigate to a lesson by index (used by the course outline block). */
  onNavigate?: (lessonIndex: number) => void
  /** Continue block click handler: reveals what follows, or leads on at the end. */
  onContinue?: (blockId: string) => void
  /** Restricted Continue whose tasks above aren't done yet. */
  continueLocked?: boolean
}) {
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
        <RichHtml
          html={block.data.html}
          className={`rich-text leading-relaxed text-gray-800 sc-para-${block.data.variant ?? 'normal'}`}
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
    case 'note':
      return <NoteView variant={block.data.variant} text={block.data.text} />
    case 'image':
      return <ImagePreview block={block} />
    case 'gallery':
      return <GalleryPreview block={block} />
    case 'video':
      return <VideoPreview block={block} />
    case 'audio':
      return <AudioPreview block={block} />
    case 'embed':
      return <EmbedPreview block={block} />
    case 'code':
      return <CodePreview block={block} />
    case 'table':
      return <TablePreview block={block} />
    case 'quote':
      return <QuotePreview block={block} />
    case 'continue':
      return (
        <ContinueButton
          label={block.data.label}
          locked={!!continueLocked}
          onClick={() => onContinue?.(block.id)}
        />
      )
    case 'divider':
      return <DividerView {...block.data} />
    case 'courseOutline':
      return (
        <CourseOutlinePreview
          block={block}
          currentLessonId={currentLessonId}
          onNavigate={onNavigate}
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
    case 'hotspot':
      return <HotspotPreview block={block} />
    case 'timeline':
      return <TimelinePreview block={block} />
    case 'ordering':
      return <OrderingPreview block={block} />
    case 'fillBlanks':
      return <FillBlanksPreview block={block} />
    case 'imageText':
      return <ImageTextPreview block={block} />
    case 'attachment':
      return <AttachmentPreview block={block} />
    case 'columns':
      return <ColumnsPreview block={block} />
    case 'process':
      return <ProcessPreview block={block} />
    case 'steps':
      return <StepsPreview block={block} />
    case 'comparison':
      return <ComparisonPreview block={block} />
    case 'beforeAfter':
      return <BeforeAfterPreview block={block} />
    case 'reflection':
      return <ReflectionPreview block={block} />
  }
}

// A locked (restricted) button says why, like the player's.
function ContinueButton({ label, locked, onClick }: { label: string; locked: boolean; onClick: () => void }) {
  const { t } = useT('scenario')
  const hintId = useId()
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        type="button"
        className="btn-primary"
        disabled={locked}
        aria-describedby={locked ? hintId : undefined}
        onClick={onClick}
      >
        {locked && <span aria-hidden>🔒 </span>}
        {label}
      </button>
      {locked && (
        <p id={hintId} className="text-sm text-gray-500">
          {t('continueLockedHint')}
        </p>
      )}
    </div>
  )
}
