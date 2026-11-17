import type { Block } from '../types/course'

// Lesson pages: a `continue` block with `newPage` in the middle of a lesson
// ends a page. Mirrored by pagesOf() in public/scorm-player/player.js.

/** Whether blocks[i] ends a page (a Continue set to start a new page, not
 *  the lesson's last block — that one leads to the next lesson). */
export function isPageBreak(blocks: Block[], i: number): boolean {
  const b = blocks[i]
  return !!b && b.type === 'continue' && b.data.newPage === true && i < blocks.length - 1
}

/** The lesson's pages; each one ends with its page-break block. A lesson
 *  without page breaks is one page (an empty lesson: one empty page). */
export function splitPages(blocks: Block[]): Block[][] {
  const pages: Block[][] = [[]]
  blocks.forEach((b, i) => {
    pages[pages.length - 1].push(b)
    if (isPageBreak(blocks, i)) pages.push([])
  })
  return pages
}

/** Index of the page holding `blockId` (0 when it isn't in the lesson). */
export function pageOfBlock(blocks: Block[], blockId: string): number {
  let page = 0
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === blockId) return page
    if (isPageBreak(blocks, i)) page++
  }
  return 0
}
