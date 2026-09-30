import type { Block, Course } from '../types/course'
import { blankAnswers } from '../blocks/fillBlanks'

/**
 * How serious an issue is. 'warning' (default) opens the pre-export dialog;
 * 'info' is a hint listed alongside warnings but never opens it on its own.
 */
export type IssueSeverity = 'warning' | 'info'

/** A problem worth fixing before export; `key` is an i18n key in `common`. */
export interface CourseIssue {
  key: string
  vars?: Record<string, string | number>
  lessonId?: string
  lessonTitle?: string
  blockId?: string
  severity?: IssueSeverity
  /** Accessibility (WCAG) issue rather than a broken-content one. */
  a11y?: boolean
}

type BlockIssue = Pick<CourseIssue, 'key' | 'vars' | 'severity' | 'a11y'>

// Inline images in rich text with no alt attribute at all (alt="" is an
// explicit "decorative" and is fine).
function inlineImagesWithoutAlt(html: string): number {
  return (html.match(/<img\b[^>]*>/gi) ?? []).filter((tag) => !/\salt\s*=/i.test(tag)).length
}

// Accessibility gaps (WCAG 1.1.1 text alternatives, 1.2 captions/transcripts,
// 4.1.2 frame titles). The content works, but some learners can't perceive it.
function checkBlockA11y(block: Block): BlockIssue[] {
  const a11y = (key: string, vars?: BlockIssue['vars']): BlockIssue[] => [
    { key, vars, a11y: true },
  ]
  switch (block.type) {
    case 'image': {
      const d = block.data
      return d.src && !d.decorative && !d.alt.trim() ? a11y('chkA11yImageAlt') : []
    }
    case 'gallery': {
      const n = block.data.images.filter((i) => i.src && !i.decorative && !i.alt.trim()).length
      return n ? a11y('chkA11yGalleryAlt', { n }) : []
    }
    case 'hotspot':
      return block.data.src && !block.data.alt.trim() ? a11y('chkA11yHotspotAlt') : []
    case 'video': {
      const d = block.data
      return d.src && !d.captions && !d.transcript?.trim() ? a11y('chkA11yVideoCaptions') : []
    }
    case 'audio': {
      const d = block.data
      return d.src && !d.transcript?.trim() ? a11y('chkA11yAudioTranscript') : []
    }
    case 'embed': {
      const d = block.data
      return d.url.trim() && !d.title?.trim() ? a11y('chkA11yEmbedTitle') : []
    }
    case 'paragraph':
    case 'tabs':
    case 'accordion': {
      const html =
        block.type === 'paragraph'
          ? block.data.html
          : (block.type === 'tabs' ? block.data.tabs : block.data.items).map((x) => x.html).join('')
      const n = inlineImagesWithoutAlt(html)
      return n ? a11y('chkA11yInlineImageAlt', { n }) : []
    }
    default:
      return []
  }
}

// Content that exports fine but would confuse or block learners: empty media,
// quizzes that can't be answered correctly, dangling scenario links, …
function checkBlock(block: Block): BlockIssue[] {
  switch (block.type) {
    case 'image':
      return block.data.src ? [] : [{ key: 'chkMissingImage' }]
    case 'gallery':
      return block.data.images.some((i) => i.src) ? [] : [{ key: 'chkEmptyGallery' }]
    case 'video':
      return block.data.src ? [] : [{ key: 'chkMissingVideo' }]
    case 'audio':
      return block.data.src ? [] : [{ key: 'chkMissingAudio' }]
    case 'embed':
      return block.data.url.trim() ? [] : [{ key: 'chkMissingEmbed' }]
    case 'quiz': {
      const qs = block.data.questions
      if (qs.length === 0) return [{ key: 'chkQuizEmpty' }]
      const out: BlockIssue[] = []
      qs.forEach((q, i) => {
        const n = i + 1
        if (!q.prompt.trim()) out.push({ key: 'chkQuestionNoPrompt', vars: { n } })
        if (q.type === 'matching') {
          if (q.pairs.length < 2) out.push({ key: 'chkMatchingFewPairs', vars: { n } })
          // The learner picks answers by their right-hand text, so repeated
          // texts make the question impossible to score reliably.
          const rights = q.pairs.map((p) => p.right.trim())
          if (new Set(rights).size !== rights.length) {
            out.push({ key: 'chkMatchingDuplicate', vars: { n } })
          }
        } else {
          if (q.options.length < 2) out.push({ key: 'chkFewOptions', vars: { n } })
          if (!q.options.some((o) => o.correct)) out.push({ key: 'chkNoCorrect', vars: { n } })
        }
      })
      return out
    }
    case 'scenario': {
      const { nodes, startNodeId } = block.data
      const ids = new Set(nodes.map((n) => n.id))
      if (nodes.length === 0 || !ids.has(startNodeId)) return [{ key: 'chkScenarioStart' }]
      const broken = nodes.some((n) =>
        n.choices.some((c) => c.nextNodeId !== null && !ids.has(c.nextNodeId)),
      )
      return broken ? [{ key: 'chkScenarioLink' }] : []
    }
    case 'hotspot': {
      const out: BlockIssue[] = []
      if (!block.data.src) out.push({ key: 'chkHotspotNoImage' })
      if (block.data.hotspots.length === 0) out.push({ key: 'chkHotspotEmpty' })
      return out
    }
    case 'timeline':
      return block.data.items.length ? [] : [{ key: 'chkTimelineEmpty' }]
    case 'ordering': {
      const { mode, items, categories } = block.data
      const out: BlockIssue[] = []
      if (items.length < 2) out.push({ key: 'chkOrderingFewItems' })
      if (items.some((it) => !it.text.trim())) out.push({ key: 'chkOrderingEmptyItem' })
      if (mode === 'categories') {
        if (categories.length < 2) out.push({ key: 'chkOrderingFewCategories' })
        // A missing or deleted category makes the item impossible to score.
        const ids = new Set(categories.map((c) => c.id))
        if (items.some((it) => !it.categoryId || !ids.has(it.categoryId))) {
          out.push({ key: 'chkOrderingUncategorized' })
        }
      }
      return out
    }
    case 'fillBlanks':
      return blankAnswers(block.data.text).length ? [] : [{ key: 'chkFillBlanksEmpty' }]
    default:
      return []
  }
}

/** Lint the course before export. An empty list means nothing to report. */
export function checkCourse(course: Course): CourseIssue[] {
  if (course.lessons.length === 0) return [{ key: 'chkNoLessons' }]
  const issues: CourseIssue[] = []
  if (!course.settings?.contentLanguage?.trim()) {
    issues.push({ key: 'chkA11yContentLanguage', severity: 'info', a11y: true })
  }
  for (const lesson of course.lessons) {
    const at = { lessonId: lesson.id, lessonTitle: lesson.title }
    if (lesson.blocks.length === 0) {
      issues.push({ key: 'chkEmptyLesson', ...at })
      continue
    }
    for (const block of lesson.blocks) {
      for (const issue of [...checkBlock(block), ...checkBlockA11y(block)]) {
        issues.push({ ...issue, ...at, blockId: block.id })
      }
    }
  }
  return issues
}

/** Whether the issues warrant stopping the export to show the check dialog. */
export function hasBlockingIssues(issues: CourseIssue[]): boolean {
  return issues.some((i) => i.severity !== 'info')
}
