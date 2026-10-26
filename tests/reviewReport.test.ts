// review.md written into the project .zip (src/lib/reviewReport.ts).

import { describe, test, expect } from 'vitest'
import { buildReviewReport } from '../src/lib/reviewReport'
import { INTRO_ID, type Course } from '../src/types/course'

const course = {
  id: 'c1',
  title: 'Course',
  description: '',
  theme: 'rose',
  settings: { completion: 'view', scored: false, passingScore: 80, navigation: 'free' },
  lessons: [
    {
      id: 'l1',
      title: 'Welcome',
      blocks: [{ id: 'b1', type: 'flashcards', settings: {}, data: { cards: [] } }],
    },
  ],
} as unknown as Course

const date = new Date('2026-10-26T12:00:00Z')

describe('buildReviewReport', () => {
  test('lists layout problems by lesson and block, worst first, with a fix hint', () => {
    const md = buildReviewReport(course, {
      checkIssues: [],
      date,
      layout: {
        widths: [375, 1280],
        issues: [
          { kind: 'scroll', lessonId: 'l1', blockId: 'b1', widths: [375], samples: ['wide'] },
          { kind: 'offscreen', lessonId: 'l1', blockId: '', widths: [1280, 375], samples: ['Averyveryverylongword'] },
          { kind: 'clipped', lessonId: INTRO_ID, blockId: 'x', widths: [375], samples: [] },
        ],
      },
    })
    expect(md).toContain('2026-10-26 12:00 UTC')
    expect(md).toContain('phone 375px and desktop 1280px')
    expect(md.indexOf('### Runs past the screen edge (1)')).toBeLessThan(md.indexOf('### Text is cut off (1)'))
    expect(md.indexOf('### Text is cut off (1)')).toBeLessThan(md.indexOf('### Scrolls sideways'))
    expect(md).toContain('- lesson 1 “Welcome” (`l1`), lesson heading — at phone 375px, desktop 1280px: “Averyveryverylongword”')
    expect(md).toContain('- lesson 1 “Welcome” (`l1`), block `b1` (flashcards) — at phone 375px: “wide”')
    expect(md).toContain('- cover page, block `x` — at phone 375px')
  })

  test('says when the layout is clean or the check failed, and adds the content check in English', () => {
    let md = buildReviewReport(course, {
      checkIssues: [{ key: 'chkEmptyLesson', lessonId: 'l1', lessonTitle: 'Welcome' }],
      layout: { widths: [375], issues: [] },
      date,
    })
    expect(md).toContain('No layout problems found.')
    expect(md).toContain('- **Problem:** Empty lesson — lesson 1 “Welcome” (`l1`)\n')

    md = buildReviewReport(course, { checkIssues: [], layout: { error: 'boom' }, date })
    expect(md).toContain('The layout check could not run: boom')
    expect(md).toContain('## Content check\n\nThe same checks Scormly runs before exporting.\n\nNo issues found.')
  })
})
