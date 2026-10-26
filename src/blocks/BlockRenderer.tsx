import type { ComponentType } from 'react'
import type { BlockType } from '../types/course'
import type { BlockComponentProps } from './types'
import { useT } from '../i18n/I18nProvider'
import HeadingBlock from './components/HeadingBlock'
import ParagraphBlock from './components/ParagraphBlock'
import ListBlock from './components/ListBlock'
import NoteBlock from './components/NoteBlock'
import ImageBlock from './components/ImageBlock'
import GalleryBlock from './components/GalleryBlock'
import VideoBlock from './components/VideoBlock'
import AudioBlock from './components/AudioBlock'
import EmbedBlock from './components/EmbedBlock'
import CodeBlock from './components/CodeBlock'
import TableBlock from './components/TableBlock'
import QuoteBlock from './components/QuoteBlock'
import ContinueBlock from './components/ContinueBlock'
import DividerBlock from './components/DividerBlock'
import CourseOutlineBlock from './components/CourseOutlineBlock'
import TabsBlock from './components/TabsBlock'
import AccordionBlock from './components/AccordionBlock'
import FlashcardsBlock from './components/FlashcardsBlock'
import ScenarioBlock from './components/ScenarioBlock'
import QuizBlock from './components/QuizBlock'
import HotspotBlock from './components/HotspotBlock'
import TimelineBlock from './components/TimelineBlock'
import OrderingBlock from './components/OrderingBlock'
import FillBlanksBlock from './components/FillBlanksBlock'
import ImageTextBlock from './components/ImageTextBlock'
import AttachmentBlock from './components/AttachmentBlock'
import ColumnsBlock from './components/ColumnsBlock'
import ProcessBlock from './components/ProcessBlock'
import StepsBlock from './components/StepsBlock'
import ComparisonBlock from './components/ComparisonBlock'
import BeforeAfterBlock from './components/BeforeAfterBlock'
import ReflectionBlock from './components/ReflectionBlock'

// Dispatcher: block type → editor component. Each component lives in its own
// file under ./components/ and implements the BlockComponentProps contract.
const BLOCK_COMPONENTS: Record<
  BlockType,
  ComponentType<BlockComponentProps>
> = {
  heading: HeadingBlock as ComponentType<BlockComponentProps>,
  paragraph: ParagraphBlock as ComponentType<BlockComponentProps>,
  list: ListBlock as ComponentType<BlockComponentProps>,
  note: NoteBlock as ComponentType<BlockComponentProps>,
  image: ImageBlock as ComponentType<BlockComponentProps>,
  gallery: GalleryBlock as ComponentType<BlockComponentProps>,
  video: VideoBlock as ComponentType<BlockComponentProps>,
  audio: AudioBlock as ComponentType<BlockComponentProps>,
  embed: EmbedBlock as ComponentType<BlockComponentProps>,
  code: CodeBlock as ComponentType<BlockComponentProps>,
  table: TableBlock as ComponentType<BlockComponentProps>,
  quote: QuoteBlock as ComponentType<BlockComponentProps>,
  continue: ContinueBlock as ComponentType<BlockComponentProps>,
  divider: DividerBlock as ComponentType<BlockComponentProps>,
  courseOutline: CourseOutlineBlock as ComponentType<BlockComponentProps>,
  tabs: TabsBlock as ComponentType<BlockComponentProps>,
  accordion: AccordionBlock as ComponentType<BlockComponentProps>,
  flashcards: FlashcardsBlock as ComponentType<BlockComponentProps>,
  scenario: ScenarioBlock as ComponentType<BlockComponentProps>,
  quiz: QuizBlock as ComponentType<BlockComponentProps>,
  hotspot: HotspotBlock as ComponentType<BlockComponentProps>,
  timeline: TimelineBlock as ComponentType<BlockComponentProps>,
  ordering: OrderingBlock as ComponentType<BlockComponentProps>,
  fillBlanks: FillBlanksBlock as ComponentType<BlockComponentProps>,
  imageText: ImageTextBlock as ComponentType<BlockComponentProps>,
  attachment: AttachmentBlock as ComponentType<BlockComponentProps>,
  columns: ColumnsBlock as ComponentType<BlockComponentProps>,
  process: ProcessBlock as ComponentType<BlockComponentProps>,
  steps: StepsBlock as ComponentType<BlockComponentProps>,
  comparison: ComparisonBlock as ComponentType<BlockComponentProps>,
  beforeAfter: BeforeAfterBlock as ComponentType<BlockComponentProps>,
  reflection: ReflectionBlock as ComponentType<BlockComponentProps>,
}

export default function BlockRenderer(props: BlockComponentProps) {
  // A type this version doesn't know (e.g. invented in a hand- or AI-edited
  // project.json) is kept in the data; it can still be moved or deleted.
  const Component = Object.prototype.hasOwnProperty.call(BLOCK_COMPONENTS, props.block.type)
    ? BLOCK_COMPONENTS[props.block.type]
    : UnknownBlock
  return <Component {...props} />
}

function UnknownBlock({ block }: BlockComponentProps) {
  const { t } = useT('blocks')
  const type = typeof block.type === 'string' && block.type ? block.type : '?'
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm">
      <p className="font-medium text-gray-700">{t('unknownBlock', { type })}</p>
      <p className="mt-1 text-gray-500">{t('unknownBlockHelp')}</p>
    </div>
  )
}
