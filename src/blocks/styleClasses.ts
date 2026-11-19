// Class names shared by the editor canvas and the learner preview for block
// styling. The SCORM player (public/scorm-player) builds the same class names
// and attributes, and player.css mirrors the rules from index.css.

import type { CSSProperties } from 'react'
import { contrastRatio, normalizeHex } from '../theme/customTheme'
import type { BlockBackground, BlockSettings, ImageSize, TableRowMark, TableStyle, TextAlign } from '../types/course'

/** Backgrounds with light text on a dark/saturated fill. */
export const DARK_BACKGROUNDS: readonly BlockBackground[] = ['accent', 'gradient', 'dark', 'image']

export const BLOCK_BACKGROUNDS: readonly BlockBackground[] = [
  'none',
  'muted',
  'soft',
  'accent',
  'gradient',
  'dark',
  'image',
]

/** Inline background for a photo panel: the image under a dimming gradient
 *  (the player builds the same string). */
export function photoBackground(url: string): string {
  return `linear-gradient(rgb(10 12 20 / 0.55), rgb(10 12 20 / 0.62)), url("${url.replace(/"/g, '%22')}")`
}

/**
 * Wrapper attributes for a block: `blk` + padding class, plus `data-bg` when
 * the block has a background (neighbours with the same background are joined
 * into one panel by CSS).
 */
export function blockWrapperProps(
  settings: BlockSettings | undefined,
  /** Resolved URL of settings.backgroundImage (asset paths need resolving). */
  imageUrl?: string,
): {
  className: string
  'data-bg'?: BlockBackground
  style?: { backgroundImage: string }
} {
  const bg = settings?.background ?? 'none'
  const pad = settings?.spacing ?? 'normal'
  let className = `blk blk-pad-${pad}`
  const width = settings?.width ?? 'normal'
  if (width !== 'normal') className += ` blk-${width}`
  if (bg === 'none') return { className }
  className += ' blk-has-bg'
  if (DARK_BACKGROUNDS.includes(bg)) className += ' blk-on-dark'
  if (bg === 'image' && imageUrl) return { className, 'data-bg': bg, style: { backgroundImage: photoBackground(imageUrl) } }
  return { className, 'data-bg': bg }
}

/** Classes for a table: full width, or fitted to its content and placed. */
export function tableClass(width: 'full' | 'auto' = 'full', align: TextAlign = 'left', style: TableStyle = 'grid') {
  const design = TABLE_STYLES.includes(style) && style !== 'grid' ? ` sc-table-${style}` : ''
  return (width === 'auto' ? `sc-table sc-table-auto sc-table-${align}` : 'sc-table') + design
}

export const TABLE_STYLES: readonly TableStyle[] = ['grid', 'lines', 'stripes', 'panel']

/** A table cell is plain text where **double asterisks** mark bold. Splits it
 *  into runs; the player's cellNodes does the same. */
export function cellRuns(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*([\s\S]+?)\*\*/)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((run) => run.text)
}

/** Class of a marked table row (TableData.rowMarks), or ''. */
export function rowMarkClass(marks: TableRowMark[] | undefined, r: number) {
  const mark = marks?.[r]
  return mark === 'highlight' ? 'sc-row-hl' : mark === 'muted' ? 'sc-row-muted' : ''
}

const HEAD_DARK = '#1f2937'
const HEAD_INK = '#111827'

/** Inline variables for a table's header color (TableData.headerColor);
 *  undefined = the theme accent, which the stylesheet falls back to. Keep in
 *  sync with the player's tableHead. */
export function tableHeadStyle(headerColor?: string): CSSProperties | undefined {
  const bg = headerColor === 'dark' ? HEAD_DARK : normalizeHex(headerColor ?? '')
  if (!bg) return undefined
  const fg = contrastRatio(bg, '#ffffff') >= contrastRatio(bg, HEAD_INK) ? '#fff' : HEAD_INK
  return { '--sc-thead-bg': bg, '--sc-thead-fg': fg } as CSSProperties
}

/** Inline variables for a card label with its own color (CardItem.badgeColor). */
export function badgeStyle(color?: string): CSSProperties | undefined {
  const hex = normalizeHex(color ?? '')
  if (!hex) return undefined
  return { '--sc-badge': hex, '--sc-badge-text': `color-mix(in srgb, ${hex} 72%, #000)` } as CSSProperties
}

/** A table shown as cards (layout 'cards'): one card per column after the
 *  first. Null when there is nothing to make a card of. */
export function tableCards(rows: string[][]) {
  const count = (rows[0]?.length ?? 0) - 1
  if (count < 1) return null
  return {
    labels: rows.slice(1).map((row) => row[0] ?? ''),
    cards: Array.from({ length: count }, (_, i) => ({
      title: rows[0][i + 1] ?? '',
      values: rows.slice(1).map((row) => row[i + 1] ?? ''),
    })),
  }
}

/** Classes for a sized image figure. */
export function imageFigureClass(size: ImageSize = 'large', align: TextAlign = 'center') {
  return `sc-img sc-img-${size}${size === 'small' || size === 'medium' ? ` sc-img-${align}` : ''}`
}
