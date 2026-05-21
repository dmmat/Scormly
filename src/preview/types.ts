import type { BlockOfType, BlockType } from '../types/course'

// Read-only learner-facing rendering of a block (no editing affordances).
export interface PreviewProps<T extends BlockType = BlockType> {
  block: BlockOfType<T>
}
