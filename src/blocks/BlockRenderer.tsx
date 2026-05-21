import type { ComponentType } from 'react'
import type { BlockType } from '../types/course'
import type { BlockComponentProps } from './types'
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
import TabsBlock from './components/TabsBlock'
import AccordionBlock from './components/AccordionBlock'
import FlashcardsBlock from './components/FlashcardsBlock'
import ScenarioBlock from './components/ScenarioBlock'
import QuizBlock from './components/QuizBlock'

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
  tabs: TabsBlock as ComponentType<BlockComponentProps>,
  accordion: AccordionBlock as ComponentType<BlockComponentProps>,
  flashcards: FlashcardsBlock as ComponentType<BlockComponentProps>,
  scenario: ScenarioBlock as ComponentType<BlockComponentProps>,
  quiz: QuizBlock as ComponentType<BlockComponentProps>,
}

export default function BlockRenderer(props: BlockComponentProps) {
  const Component = BLOCK_COMPONENTS[props.block.type]
  return <Component {...props} />
}
