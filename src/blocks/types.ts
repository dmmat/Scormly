// Contract for a block editor component. Each block type implements this interface
// in its own file under src/blocks/components/ and registers in BlockRenderer.
// In the editor, blocks are rendered in inline-WYSIWYG mode.

import type { ComponentType } from 'react'
import type { Block, BlockOfType, BlockType } from '../types/course'

export interface BlockComponentProps<T extends Block = Block> {
  block: T
  lessonId: string
  /** Whether the block is selected (show inline editing controls). */
  selected: boolean
}

export type BlockComponent<T extends BlockType> = ComponentType<
  BlockComponentProps<BlockOfType<T>>
>
