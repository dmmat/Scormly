import { INTRO_ID, type Course } from '../types/course'
import { collectAssetPaths, fetchPlayerFile, withThemeTokens } from '../export/packageCommon'
import { resolveAssetUrl } from './assets'

// Layout review: render the course in the real learner player (hidden frames,
// one per screen width) and measure where text runs off the screen, spills out
// of its block or is cut off. The result goes into review.md in the project
// .zip, so any AI assistant can fix layout problems without running anything.

export type LayoutIssueKind = 'offscreen' | 'spill' | 'clipped' | 'scroll' | 'image'

export interface LayoutIssue {
  kind: LayoutIssueKind
  /** A lesson id, or INTRO_ID for the cover page. */
  lessonId: string
  /** '' = text outside any block (the lesson heading, the cover title). */
  blockId: string
  /** Screen widths (px) the problem shows at. */
  widths: number[]
  /** Up to a few of the affected texts (or the image src), shortened. */
  samples: string[]
}

export interface LayoutReview {
  widths: number[]
  issues: LayoutIssue[]
}

/** Phone and desktop. */
export const REVIEW_WIDTHS = [375, 1280]

const FRAME_HEIGHT = 900
const IMAGE_TIMEOUT_MS = 3000
const TOTAL_TIMEOUT_MS = 30_000

export async function reviewLayout(course: Course): Promise<LayoutReview> {
  const { html, pathByUrl } = await reviewDocument(course)
  const perWidth = await withTimeout(
    Promise.all(REVIEW_WIDTHS.map((w) => reviewAtWidth(html, course, w))),
    TOTAL_TIMEOUT_MS,
  )
  const issues = mergeWidths(perWidth.flat())
  // Name broken images by their project path, not the temporary object URL.
  for (const issue of issues) issue.samples = issue.samples.map((s) => pathByUrl.get(s) ?? s)
  return { widths: REVIEW_WIDTHS, issues }
}

// The player page as one self-contained document: CSS and scripts inlined,
// media paths swapped for object URLs (the frame shares the editor's origin).
async function reviewDocument(course: Course): Promise<{ html: string; pathByUrl: Map<string, string> }> {
  const base = import.meta.env.BASE_URL
  const [css, scorm, player] = await Promise.all(
    ['player.css', 'scorm.js', 'player.js'].map((name) => fetchPlayerFile(base, name)),
  )
  let json = JSON.stringify(withThemeTokens(course))
  const pathByUrl = new Map<string, string>()
  const paths = [...collectAssetPaths(course)].sort((a, b) => b.length - a.length)
  for (const path of paths) {
    const url = await resolveAssetUrl(path)
    if (!url || url === path) continue
    json = json.split(path).join(url)
    pathByUrl.set(url, path)
  }
  const script = (js: string) => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${css}</style></head><body><div id="app"></div>
${script(scorm)}
${script(`window.__SCORMLY_COURSE__ = ${json.replace(/</g, '\\u003c')}; window.__SCORMLY_REVIEW__ = {};`)}
${script(player)}
</body></html>`
  return { html, pathByUrl }
}

type FrameIssue = Omit<LayoutIssue, 'widths'> & { width: number }

async function reviewAtWidth(html: string, course: Course, width: number): Promise<FrameIssue[]> {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${FRAME_HEIGHT}px;border:0;visibility:hidden;pointer-events:none`
  const loaded = new Promise<void>((resolve) => frame.addEventListener('load', () => resolve(), { once: true }))
  frame.srcdoc = html
  document.body.appendChild(frame)
  try {
    await loaded
    const win = frame.contentWindow as (Window & { __SCORMLY_REVIEW__?: { show?: (i: number) => void } }) | null
    const show = win?.__SCORMLY_REVIEW__?.show
    const doc = frame.contentDocument
    if (!win || !doc || !show) throw new Error('The player did not start')

    const pages = [
      ...(course.intro?.enabled ? [{ index: -1, lessonId: INTRO_ID }] : []),
      ...course.lessons.map((l, index) => ({ index, lessonId: l.id })),
    ]
    const issues: FrameIssue[] = []
    for (const page of pages) {
      show(page.index)
      await settleImages(doc)
      // Layout is synchronous; this only lets fonts and late styles apply.
      await delay(30)
      for (const found of measure(doc)) issues.push({ ...found, lessonId: page.lessonId, width })
    }
    return issues
  } finally {
    frame.remove()
  }
}

// Load every image now (lazy ones included) so the layout is final and broken
// files can be told apart from ones still loading.
async function settleImages(doc: Document): Promise<void> {
  const pending = [...doc.images].map((img) => {
    img.loading = 'eager'
    if (img.complete) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true })
      img.addEventListener('error', () => resolve(), { once: true })
    })
  })
  await Promise.race([Promise.all(pending), delay(IMAGE_TIMEOUT_MS)])
}

type Found = Pick<LayoutIssue, 'kind' | 'blockId' | 'samples'>

/** Measure the lesson (or cover page) the frame shows. */
function measure(doc: Document): Found[] {
  const win = doc.defaultView!
  const vw = doc.documentElement.clientWidth
  const found = new Map<string, Found>()
  const add = (kind: LayoutIssueKind, blockId: string, sample: string) => {
    const key = `${kind}|${blockId}`
    const entry = found.get(key) ?? { kind, blockId, samples: [] }
    const short = sample.length > 80 ? `${sample.slice(0, 77)}…` : sample
    if (short && entry.samples.length < 3 && !entry.samples.includes(short)) entry.samples.push(short)
    found.set(key, entry)
  }
  const styles = new Map<Element, CSSStyleDeclaration>()
  const style = (el: Element) => {
    let s = styles.get(el)
    if (!s) styles.set(el, (s = win.getComputedStyle(el)))
    return s
  }
  // The nearest ancestor (up to the block) that clips or scrolls its content.
  const clipper = (el: Element, block: Element): Element | null => {
    for (let cur: Element | null = el; cur; cur = cur.parentElement) {
      const s = style(cur)
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') return cur
      if (cur === block) return null
    }
    return null
  }
  const scrolls = (el: Element) => /auto|scroll/.test(style(el).overflowX + style(el).overflowY)
  const PX = 1

  const outsideX = (r: DOMRect, b: DOMRect) => r.right > b.right + PX || r.left < b.left - PX
  const outsideY = (r: DOMRect, b: DOMRect) => r.bottom > b.bottom + PX || r.top < b.top - PX
  // A box really cuts its text off only if its content overflows it: a glyph's
  // box can stick out of a tight line height without anything being hidden.
  const cuts = (r: DOMRect, clip: Element, b: DOMRect) =>
    (outsideX(r, b) && clip.scrollWidth > clip.clientWidth + PX) ||
    (outsideY(r, b) && clip.scrollHeight > clip.clientHeight + PX)

  // Text under `root`: past the screen edge, outside `root`, or cut off / made
  // to scroll by a box that clips it.
  const checkText = (root: Element, blockId: string) => {
    const box = root.getBoundingClientRect()
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      const el = node.parentElement
      if (!text || !el) continue
      // With the page as root, only text outside blocks (the lesson heading,
      // the cover title). The "Next lesson" card's title is checked in its lesson.
      if (!blockId && el.closest('.blk, .next-card')) continue
      // Decorations (quote marks, ornaments) may sit outside on purpose.
      if (el.closest('[aria-hidden="true"]')) continue
      const range = doc.createRange()
      range.selectNodeContents(node)
      // Narrow fragments are the spaces that hang past a line's end.
      const rects = [...range.getClientRects()].filter((r) => r.width > 6 && r.height > 0)
      if (!rects.length) continue
      const clip = clipper(el, root)
      const clipBox = clip?.getBoundingClientRect()
      // Visually hidden helper text (sr-only) lives in a 1px clipped box.
      if (clipBox && (clipBox.width <= 2 || clipBox.height <= 2)) continue
      for (const r of rects) {
        if (clip && clipBox && cuts(r, clip, clipBox)) {
          add(scrolls(clip) ? 'scroll' : 'clipped', blockId, text)
          break
        }
        if (!clip && (r.right > vw + PX || r.left < -PX)) {
          add('offscreen', blockId, text)
          break
        }
        // Vertically only whole lines outside (a fixed-height card whose text
        // overflows it): a large first letter's box overhangs harmlessly.
        if (!clip && blockId && (outsideX(r, box) || r.top >= box.bottom || r.bottom <= box.top)) {
          add('spill', blockId, text)
          break
        }
      }
    }
  }

  for (const block of doc.querySelectorAll<HTMLElement>('.blk[data-block]')) {
    const blockId = block.getAttribute('data-block')!
    checkText(block, blockId)

    for (const el of block.querySelectorAll('img, table, pre, video, iframe, svg')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.right <= vw + PX) continue
      // Images and SVGs clip their own content: look from the parent (e.g. the
      // slides of a carousel sit outside its clipped viewport by design).
      if (el.parentElement && clipper(el.parentElement, block)) continue
      add('offscreen', blockId, `<${el.tagName.toLowerCase()}>`)
    }

    for (const img of block.querySelectorAll('img')) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        add('image', blockId, img.getAttribute('src')!)
      }
    }
  }
  const page = doc.querySelector('.lesson')
  if (page) checkText(page, '')
  return [...found.values()]
}

function mergeWidths(issues: FrameIssue[]): LayoutIssue[] {
  const merged = new Map<string, LayoutIssue>()
  for (const { width, ...issue } of issues) {
    const key = `${issue.kind}|${issue.lessonId}|${issue.blockId}`
    const prev = merged.get(key)
    if (!prev) {
      merged.set(key, { ...issue, widths: [width] })
      continue
    }
    if (!prev.widths.includes(width)) prev.widths.push(width)
    for (const s of issue.samples) if (prev.samples.length < 3 && !prev.samples.includes(s)) prev.samples.push(s)
  }
  return [...merged.values()]
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    delay(ms).then(() => {
      throw new Error(`The layout check took longer than ${ms / 1000} s`)
    }),
  ])
}
