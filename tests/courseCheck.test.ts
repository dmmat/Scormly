// Pre-export course lint (src/export/courseCheck.ts).

import { describe, test, expect } from 'vitest'
import { checkCourse, hasBlockingIssues } from '../src/export/courseCheck'
import type { Block, Course } from '../src/types/course'

function course(blocks: Block[][], settings: Record<string, unknown> = { contentLanguage: 'en' }): Course {
  return {
    title: 'C',
    settings,
    lessons: blocks.map((b, i) => ({ id: `l${i}`, title: `L${i}`, status: 'draft', blocks: b })),
  } as unknown as Course
}
const block = (type: string, data: unknown, id = 'b') => ({ id, type, settings: {}, data }) as unknown as Block
const keys = (c: Course) => checkCourse(c).map((i) => i.key)

describe('checkCourse', () => {
  test('a course with content passes', () => {
    const quiz = block('quiz', {
      passingScore: 80,
      questions: [{ id: 'q', type: 'single', prompt: 'P', options: [{ id: 'a', text: 'A', correct: true }, { id: 'b', text: 'B', correct: false }] }],
    })
    expect(checkCourse(course([[block('heading', { level: 1, text: 'Hi' }), quiz]]))).toEqual([])
  })

  test('no lessons / empty lesson', () => {
    expect(keys(course([]))).toEqual(['chkNoLessons'])
    const issues = checkCourse(course([[]]))
    expect(issues).toEqual([{ key: 'chkEmptyLesson', lessonId: 'l0', lessonTitle: 'L0' }])
  })

  test('media without a file', () => {
    expect(keys(course([[
      block('image', { src: '', alt: '' }),
      block('gallery', { images: [{ src: '', alt: '' }] }),
      block('video', { src: '' }),
      block('audio', { src: '' }),
      block('embed', { url: '  ' }),
    ]]))).toEqual(['chkMissingImage', 'chkEmptyGallery', 'chkMissingVideo', 'chkMissingAudio', 'chkMissingEmbed'])
  })

  test('unanswerable quiz questions are reported with their number', () => {
    const quiz = block('quiz', {
      passingScore: 80,
      questions: [
        { id: 'q1', type: 'multiple', prompt: '', options: [{ id: 'a', text: 'A', correct: false }] },
        { id: 'q2', type: 'matching', prompt: 'M', pairs: [{ id: 'p1', left: 'x', right: 'same' }, { id: 'p2', left: 'y', right: 'same ' }] },
      ],
    }, 'quiz1')
    const issues = checkCourse(course([[quiz]]))
    expect(issues.map((i) => [i.key, i.vars?.n])).toEqual([
      ['chkQuestionNoPrompt', 1], ['chkFewOptions', 1], ['chkNoCorrect', 1], ['chkMatchingDuplicate', 2],
    ])
    expect(issues[0].blockId).toBe('quiz1')
    expect(keys(course([[block('quiz', { passingScore: 80, questions: [] })]]))).toEqual(['chkQuizEmpty'])
  })

  test('ordering: too few items, empty items, categories problems', () => {
    const item = (id: string, text = id, categoryId?: string) => ({ id, text, categoryId })
    const ordering = (mode: string, items: unknown[], categories: unknown[] = []) =>
      block('ordering', { mode, prompt: 'P', items, categories, passingScore: 80 })
    expect(keys(course([[ordering('sequence', [item('a'), item('b')])]]))).toEqual([])
    expect(keys(course([[ordering('sequence', [item('a')])]]))).toEqual(['chkOrderingFewItems'])
    expect(keys(course([[ordering('sequence', [item('a'), item('b', ' ')])]]))).toEqual(['chkOrderingEmptyItem'])
    const cats = [{ id: 'x', title: 'X' }, { id: 'y', title: 'Y' }]
    expect(keys(course([[ordering('categories', [item('a', 'A', 'x'), item('b', 'B', 'y')], cats)]]))).toEqual([])
    expect(keys(course([[ordering('categories', [item('a'), item('b')])]])))
      .toEqual(['chkOrderingFewCategories', 'chkOrderingUncategorized'])
    // An item pointing at a deleted category counts as uncategorized.
    expect(keys(course([[ordering('categories', [item('a', 'A', 'x'), item('b', 'B', 'gone')], cats)]])))
      .toEqual(['chkOrderingUncategorized'])
  })

  test('fill in the blanks without blanks', () => {
    const fb = (text: string) => block('fillBlanks', { text, mode: 'type', passingScore: 80 })
    expect(keys(course([[fb('The capital is [Paris].')]]))).toEqual([])
    expect(keys(course([[fb('No blanks [] here.')]]))).toEqual(['chkFillBlanksEmpty'])
  })

  test('scenario start and dangling links', () => {
    const node = (id: string, next: string | null) => ({ id, text: 't', emotion: 'neutral', choices: [{ id: 'c', text: 'go', nextNodeId: next }] })
    expect(keys(course([[block('scenario', { characterImages: {}, characterName: 'A', startNodeId: 'x', nodes: [node('n1', null)] })]])))
      .toEqual(['chkScenarioStart'])
    expect(keys(course([[block('scenario', { characterImages: {}, characterName: 'A', startNodeId: 'n1', nodes: [node('n1', 'gone')] })]])))
      .toEqual(['chkScenarioLink'])
    expect(keys(course([[block('scenario', { characterImages: {}, characterName: 'A', startNodeId: 'n1', nodes: [node('n1', null)] })]])))
      .toEqual([])
  })

  test('hotspots without an image or markers', () => {
    const spot = { id: 'h1', x: 10, y: 20, title: 'T', text: '' }
    expect(keys(course([[block('hotspot', { src: '', alt: '', hotspots: [] })]])))
      .toEqual(['chkHotspotNoImage', 'chkHotspotEmpty'])
    expect(keys(course([[block('hotspot', { src: 'assets/images/a.png', alt: 'Email', hotspots: [] })]])))
      .toEqual(['chkHotspotEmpty'])
    expect(keys(course([[block('hotspot', { src: 'assets/images/a.png', alt: 'Email', hotspots: [spot] })]])))
      .toEqual([])
  })

  test('timeline without items', () => {
    expect(keys(course([[block('timeline', { layout: 'vertical', items: [] })]]))).toEqual(['chkTimelineEmpty'])
    const item = { id: 's1', label: '2024', title: 'T', text: '' }
    expect(keys(course([[block('timeline', { layout: 'stepper', items: [item] })]]))).toEqual([])
  })

  test('accessibility: alt text, captions/transcripts, embed titles', () => {
    const img = { src: 'assets/images/a.png', alt: '' }
    const issues = checkCourse(course([[
      block('image', img, 'i1'),
      block('image', { ...img, decorative: true }),
      block('image', { ...img, alt: 'A chart' }),
      block('gallery', { images: [img, { ...img, decorative: true }, { ...img, alt: 'x' }, img] }),
      block('hotspot', { src: 'assets/images/h.png', alt: ' ', hotspots: [{ id: 'h', x: 1, y: 1, title: 't', text: 't' }] }),
      block('video', { src: 'assets/videos/v.mp4' }),
      block('video', { src: 'assets/videos/v.mp4', captions: 'assets/captions/v.vtt' }),
      block('video', { src: 'assets/videos/v.mp4', transcript: 'Hello' }),
      block('audio', { src: 'assets/audio/a.mp3' }),
      block('audio', { src: 'assets/audio/a.mp3', transcript: 'Hi' }),
      block('embed', { url: 'https://example.com' }),
      block('embed', { url: 'https://example.com', title: 'Example' }),
      block('paragraph', { html: '<p><img src="a.png"><img src="b.png" alt=""><IMG SRC="c.png" ALT="C"></p>' }),
      block('tabs', { tabs: [{ id: 't', title: 'T', html: '<img src="x.png"><img src="y.png">' }] }),
    ]]))
    expect(issues.map((i) => [i.key, i.vars?.n])).toEqual([
      ['chkA11yImageAlt', undefined],
      ['chkA11yGalleryAlt', 2],
      ['chkA11yHotspotAlt', undefined],
      ['chkA11yVideoCaptions', undefined],
      ['chkA11yAudioTranscript', undefined],
      ['chkA11yEmbedTitle', undefined],
      ['chkA11yInlineImageAlt', 1],
      ['chkA11yInlineImageAlt', 2],
    ])
    expect(issues.every((i) => i.a11y && i.severity !== 'info')).toBe(true)
    expect(issues[0].blockId).toBe('i1')
  })

  test('missing content language is an info-level hint that does not block', () => {
    const issues = checkCourse(course([[block('heading', { level: 1, text: 'Hi' })]], {}))
    expect(issues).toEqual([{ key: 'chkA11yContentLanguage', severity: 'info', a11y: true }])
    expect(hasBlockingIssues(issues)).toBe(false)
    expect(hasBlockingIssues([...issues, { key: 'chkEmptyLesson' }])).toBe(true)
  })
})
