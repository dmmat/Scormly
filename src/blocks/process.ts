import type { CSSProperties } from 'react'
import type { ProcessLayout, ProcessVariant } from '../types/course'

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** A step's description as HTML: its rich text, or its plain text (older
 *  steps) escaped with line breaks kept. The player mirrors this. */
export function stepHtml(step: { text: string; html?: string }): string {
  return step.html ?? escapeHtml(step.text || '').replace(/\n/g, '<br>')
}

// Geometry shared by the process diagram's renderers (the SCORM player
// mirrors it in renderProcess).

/** Pyramid level i of n: width, and its side slant relative to itself
 *  (--cut, for clip-path) and to the column (--pad, for padding). Levels
 *  run from 40% of the column at the top to 100% at the bottom. */
export function pyramidVars(i: number, n: number): CSSProperties {
  const top = 0.4 + (0.6 * i) / n
  const bottom = 0.4 + (0.6 * (i + 1)) / n
  const slant = (bottom - top) / 2
  return {
    '--w': pct(bottom),
    '--cut': pct(slant / bottom),
    '--pad': pct(slant),
    // Soft style: the tint deepens toward the base.
    '--tint': pct(0.1 + 0.22 * (n > 1 ? i / (n - 1) : 1)),
  } as CSSProperties
}

/** Style variants each layout offers; the first is the default. */
export const PROCESS_VARIANTS: Record<ProcessLayout, ProcessVariant[]> = {
  flow: ['solid', 'soft', 'outline'],
  chevrons: ['solid', 'soft'],
  pyramid: ['solid', 'soft'],
  cycle: ['solid', 'soft'],
}

/** The variant a layout actually shows (one it doesn't offer → solid). */
export function processVariant(layout: ProcessLayout, variant?: ProcessVariant): ProcessVariant {
  return variant && PROCESS_VARIANTS[layout]?.includes(variant) ? variant : 'solid'
}

/** Point k of n on the cycle ring (radius 38%, first step at the top). */
export function ringPoint(k: number, n: number): { x: number; y: number; deg: number } {
  const a = (k / n) * 2 * Math.PI - Math.PI / 2
  return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a), deg: (a * 180) / Math.PI }
}

/** Flow layout: steps per row, at most 4, rows balanced (5 → 3 + 2). */
export function flowCols(n: number): number {
  return n <= 4 ? n : Math.ceil(n / Math.ceil(n / 4))
}

export function processClass(layout: ProcessLayout, n: number, variant?: ProcessVariant): string {
  const size = layout === 'flow' ? ` sc-process-cols-${flowCols(n)}` : `${n > 4 ? ' sc-process-many' : ''}${n > 6 ? ' sc-process-lots' : ''}`
  const v = processVariant(layout, variant)
  return `sc-process sc-process-${layout}${size}${v === 'solid' ? '' : ` sc-process-${v}`}`
}
