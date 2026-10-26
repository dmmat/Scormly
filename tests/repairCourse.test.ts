// Structural repair of loaded project.json files (src/lib/repairCourse.ts):
// hand- or AI-edited projects must load without crashing the editor.

import { describe, test, expect } from 'vitest'
import { repairCourse } from '../src/lib/repairCourse'
import { checkCourse } from '../src/export/courseCheck'
import type { Course } from '../src/types/course'

type Any = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const keys = (fixes: { key: string }[]) => fixes.map((f) => f.key)
const blockIds = (c: Course) => [
  ...(c.intro?.blocks ?? []).map((b) => b.id),
  ...c.lessons.flatMap((l) => l.blocks.map((b) => b.id)),
]

describe('repairCourse', () => {
  test('a well-formed course needs no fixes and is unchanged', () => {
    const course = {
      id: 'c', title: 'T', description: '', theme: 'rose', settings: {},
      lessons: [{ id: 'l1', title: 'L1', status: 'draft', blocks: [
        { id: 'b1', type: 'heading', settings: {}, data: { level: 2, text: 'Hi' } },
        { id: 'b2', type: 'list', settings: {}, data: { ordered: false, items: ['a', 'b'] } },
      ] }],
    }
    const { course: out, fixes } = repairCourse(structuredClone(course))
    expect(fixes).toEqual([])
    expect(out).toEqual(course)
  })

  test('legacy omissions (no settings, no intro, no description) are not reported', () => {
    const { course, fixes } = repairCourse({ id: 'c', title: 'T', theme: 'rose', lessons: [] })
    expect(fixes).toEqual([])
    expect(course.description).toBe('')
    expect(course.intro).toBeUndefined()
  })

  test('missing and duplicate lesson and block ids get new ones, unique across the course', () => {
    const { course, fixes } = repairCourse({
      id: 'c', title: 'T', theme: 'rose',
      intro: { enabled: true, layout: 'cover', blocks: [{ id: 'x', type: 'paragraph', settings: {}, data: { html: '<p>a</p>' } }] },
      lessons: [
        { id: 'l1', title: 'A', status: 'draft', blocks: [
          { id: 'x', type: 'paragraph', settings: {}, data: { html: '<p>b</p>' } },
          { type: 'paragraph', settings: {}, data: { html: '<p>c</p>' } },
        ] },
        { id: 'l1', title: 'B', status: 'draft', blocks: [{ id: 'x', type: 'divider', settings: {}, data: { style: 'solid' } }] },
        { title: 'C', status: 'draft', blocks: [] },
      ],
    })
    const ids = blockIds(course)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('x') // the first owner keeps its id
    const lessonIds = course.lessons.map((l) => l.id)
    expect(new Set(lessonIds).size).toBe(3)
    expect(lessonIds[0]).toBe('l1')
    expect(keys(fixes).filter((k) => k === 'repairBlockId').length).toBe(3)
    expect(keys(fixes).filter((k) => k === 'repairLessonId').length).toBe(2)
  })

  test('nested item ids: missing or duplicate within their list', () => {
    const { course, fixes } = repairCourse({
      id: 'c', title: 'T', theme: 'rose',
      lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [
        { id: 'p', type: 'process', settings: {}, data: { layout: 'flow', steps: [{ title: 'A', text: '' }, { id: 's', title: 'B', text: '' }, { id: 's', title: 'C', text: '' }] } },
        { id: 'q', type: 'quiz', settings: {}, data: { passingScore: 80, showAnswers: true, questions: [
          { type: 'single', prompt: 'P', options: [{ text: 'a', correct: true }, { text: 'b', correct: false }] },
        ] } },
        { id: 'sc', type: 'scenario', settings: {}, data: { characterName: 'A', characterImages: {}, startNodeId: 'n1', nodes: [
          { id: 'n1', text: 'Hi', emotion: 'neutral', choices: [{ text: 'Go', nextNodeId: null }] },
        ] } },
      ] }],
    }) as { course: Any; fixes: { key: string }[] }
    const [proc, quiz, scen] = course.lessons[0].blocks
    const stepIds = proc.data.steps.map((s: Any) => s.id)
    expect(new Set(stepIds).size).toBe(3)
    expect(stepIds[1]).toBe('s')
    expect(quiz.data.questions[0].id).toEqual(expect.any(String))
    expect(quiz.data.questions[0].options.every((o: Any) => typeof o.id === 'string' && o.id)).toBe(true)
    expect(scen.data.nodes[0].choices[0].id).toEqual(expect.any(String))
    expect(scen.data.nodes[0].choices[0].nextNodeId).toBeNull()
    expect(keys(fixes).every((k) => k === 'repairItemId')).toBe(true)
  })

  test('missing settings and data; missing data keys come from the defaults without overwriting', () => {
    const { course, fixes } = repairCourse({
      id: 'c', title: 'T', theme: 'rose',
      lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [
        { id: 'a', type: 'heading', data: { text: 'Kept' } },
        { id: 'b', type: 'note', settings: 'big' },
        { id: 'c', type: 'process', settings: {}, data: { layout: 'chevrons' } },
      ] }],
    }) as { course: Any; fixes: { key: string }[] }
    const [heading, note, proc] = course.lessons[0].blocks
    expect(heading.settings).toEqual({})
    expect(heading.data.text).toBe('Kept')
    expect(heading.data.level).toBe(2)
    expect(note.settings).toEqual({})
    expect(typeof note.data.text).toBe('string')
    expect(proc.data.layout).toBe('chevrons')
    expect(Array.isArray(proc.data.steps) && proc.data.steps.length).toBeGreaterThan(0)
    expect(keys(fixes)).toEqual(expect.arrayContaining(['repairBlockSettings', 'repairBlockData', 'repairDataKey']))
  })

  test('wrong types are coerced: arrays, numbers, strings, item fields', () => {
    const { course } = repairCourse({
      id: 'c', title: 'T', theme: 'rose',
      lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [
        { id: 'a', type: 'list', settings: {}, data: { ordered: 'true', items: ['a', 2, null] } },
        { id: 'b', type: 'tabs', settings: {}, data: { tabs: 'none' } },
        { id: 'c', type: 'heading', settings: {}, data: { level: '3', text: null } },
        { id: 'd', type: 'hotspot', settings: {}, data: { src: '', alt: '', hotspots: [{ id: 'h', x: '10', title: 'T' }, 'junk'] } },
        { id: 'e', type: 'table', settings: {}, data: { header: true, rows: [['a', 1], 'x'] } },
        { id: 'f', type: 'comparison', settings: {}, data: { columns: [{ id: 'k', title: 'Pros', tone: 'pro', items: 'nope' }] } },
      ] }],
    }) as { course: Any }
    const [list, tabs, heading, hot, table, cmp] = course.lessons[0].blocks
    expect(list.data).toEqual({ ordered: true, items: ['a', '2', ''] })
    expect(Array.isArray(tabs.data.tabs)).toBe(true)
    expect(heading.data).toEqual({ level: 3, text: '' })
    expect(hot.data.hotspots).toEqual([{ id: 'h', x: 10, y: 50, title: 'T', text: '' }])
    expect(table.data.rows).toEqual([['a', '1'], []])
    expect(cmp.data.columns[0].items).toEqual([])
  })

  test('unknown block types are kept as they are and reported by the pre-export check', () => {
    const block = { id: 'u', type: 'mindmap', settings: {}, data: { nodes: [1, 2, 3] } }
    const { course, fixes } = repairCourse({ id: 'c', title: 'T', theme: 'rose', lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [block] }] })
    expect(fixes).toEqual([])
    expect(course.lessons[0].blocks[0]).toEqual(block)
    expect(checkCourse(course).map((i) => i.key)).toContain('chkUnknownBlock')
  })

  test('non-objects in lists are dropped; lesson fields are coerced', () => {
    const { course, fixes } = repairCourse({
      id: 7, title: 42, theme: 'rose', settings: 'x', intro: 'y',
      lessons: [null, 'text', { status: 'live', blocks: 'none' }, { id: 'l2', title: 'B', status: 'published', blocks: [null, 3] }],
    })
    expect(course.title).toBe('42')
    expect(typeof course.id).toBe('string')
    expect(course.settings).toBeUndefined()
    expect(course.intro).toBeUndefined()
    expect(course.lessons.length).toBe(2)
    expect(course.lessons[0]).toMatchObject({ status: 'draft', blocks: [], title: expect.any(String) })
    expect(course.lessons[1].blocks).toEqual([])
    expect(keys(fixes)).toEqual(expect.arrayContaining([
      'repairCourseId', 'repairCourseTitle', 'repairSettings', 'repairIntro',
      'repairLessonDropped', 'repairLessonId', 'repairLessonTitle', 'repairLessonStatus', 'repairLessonBlocks', 'repairBlockDropped',
    ]))
  })

  test('quiz questions of an unknown type get one inferred from their fields', () => {
    const { course, fixes } = repairCourse({
      id: 'c', title: 'T', theme: 'rose',
      lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [{ id: 'q', type: 'quiz', settings: {}, data: { passingScore: 80, questions: [
        { id: 'a', prompt: 'Match', pairs: [{ id: 'p', left: 'x', right: 'y' }] },
        { id: 'b', type: 'essay', prompt: 'Order', items: [{ id: 'i', text: 'one' }] },
        { id: 'c', prompt: 'Fill', text: 'The [cat] sat.', mode: 'type' },
        { id: 'd', type: 'single', prompt: 'Pick' },
      ] } }] }],
    }) as { course: Any; fixes: { key: string }[] }
    const qs = course.lessons[0].blocks[0].data.questions
    expect(qs.map((q: Any) => q.type)).toEqual(['matching', 'sequence', 'fillBlanks', 'single'])
    expect(qs[3].options).toEqual([])
    expect(keys(fixes).filter((k) => k === 'repairQuestionType').length).toBe(3)
  })

  test('idempotent: a repaired course needs no further fixes', () => {
    const sloppy = {
      title: 'T', theme: 'rose', settings: 'x',
      intro: { enabled: true, layout: 'cover', blocks: [{ type: 'image', data: { src: 'assets/images/a.png' } }, 'junk'] },
      lessons: [{ blocks: [
        { type: 'quiz', data: { questions: [{ prompt: 'P', options: [{ text: 'a' }] }, { prompt: 'Q', pairs: 'x' }] } },
        { type: 'scenario', data: { nodes: [{ text: 'Hi', choices: [{ text: 'Go' }] }] } },
        { type: 'comparison', data: { columns: [{ title: 'Pros', items: ['a', 1] }] } },
        { type: 'table', data: { rows: [['a'], 'b'] } },
        { type: 'gallery', data: { images: [{ src: 'x' }, 'y'] } },
        { type: 'mystery', data: 'z' },
      ] }],
    }
    const first = repairCourse(sloppy)
    expect(first.fixes.length).toBeGreaterThan(0)
    const second = repairCourse(structuredClone(first.course))
    expect(second.fixes).toEqual([])
    expect(second.course).toEqual(first.course)
  })

  test('a ChatGPT-style lesson written from AGENTS.md shapes loads and checks cleanly', () => {
    const fromAi = {
      id: 'course-1', title: 'Phishing basics', description: 'Spot the phish', theme: 'ocean',
      settings: { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' },
      lessons: [{
        id: 'lesson-1', title: 'How phishing works', status: 'draft',
        blocks: [
          { id: 'b1', type: 'heading', data: { level: 2, text: 'The anatomy of a phish' } },
          { id: 'b2', type: 'paragraph', settings: {}, data: { html: '<p>Attackers <strong>pretend</strong> to be someone you trust.</p>' } },
          { id: 'b3', type: 'process', settings: {}, data: { layout: 'flow', steps: [
            { title: 'Bait', text: 'An urgent email arrives.' },
            { title: 'Hook', text: 'You click the link.' },
            { title: 'Catch', text: 'Your password is stolen.' },
          ] } },
          { id: 'b4', type: 'comparison', settings: {}, data: { columns: [
            { title: 'Real', tone: 'pro', items: ['Known sender', 'No pressure'] },
            { title: 'Phish', tone: 'con', items: ['Look-alike domain', 'Urgency'] },
          ] } },
          { id: 'b5', type: 'quiz', settings: {}, data: { passingScore: 80, questions: [
            { type: 'single', prompt: 'Which is a red flag?', options: [
              { text: 'Urgent deadline', correct: true },
              { text: 'Your colleague’s name', correct: false },
            ] },
          ] } },
          { id: 'b6', type: 'reflection', settings: {}, data: { prompt: 'When did you last get a suspicious email?' } },
        ],
      }],
    }
    const { course, fixes } = repairCourse(fromAi)
    expect(fixes.length).toBeGreaterThan(0)
    expect(keys(fixes)).not.toContain('repairBlockData')
    const blocks = course.lessons[0].blocks as Any[]
    expect(blocks[0].settings).toEqual({})
    expect(blocks[2].data.steps.map((s: Any) => s.title)).toEqual(['Bait', 'Hook', 'Catch'])
    expect(blocks[3].data.columns.every((c: Any) => c.id)).toBe(true)
    expect(blocks[5].data.sample).toBe('')
    // The AI's content survives, and the course passes the export check.
    expect(checkCourse(course).filter((i) => i.severity !== 'info')).toEqual([])
  })
})
