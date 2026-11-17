// Lesson units (src/lib/units.ts), lesson pages (src/lib/lessonPages.ts) and
// their repair on load.

import { describe, test, expect } from 'vitest'
import type { Block, Course, Lesson } from '../src/types/course'
import {
  deleteUnit,
  dropLesson,
  lessonGroups,
  lessonKicker,
  lessonNumber,
  moveLessonStep,
  moveUnit,
  normalizeUnits,
  outlineNumbers,
  setLessonUnit,
} from '../src/lib/units'
import { isPageBreak, pageOfBlock, splitPages } from '../src/lib/lessonPages'
import { repairCourse } from '../src/lib/repairCourse'

const lesson = (id: string, unitId?: string): Lesson => ({ id, title: id, status: 'draft', blocks: [], ...(unitId ? { unitId } : {}) })

function course(lessons: Lesson[], units?: string[]): Course {
  return {
    id: 'c', title: 'C', description: '', theme: 'rose', lessons,
    ...(units ? { units: units.map((id) => ({ id, title: id.toUpperCase() })) } : {}),
  }
}

const order = (c: Course) => c.lessons.map((l) => `${l.id}${l.unitId ? `@${l.unitId}` : ''}`)

describe('units', () => {
  test('without units every lesson is in one group, numbered through the course', () => {
    const c = course([lesson('a'), lesson('b')])
    expect(lessonGroups(c)).toHaveLength(1)
    expect(lessonNumber(c, 1)).toBe('2')
    expect(lessonKicker(c, 1, (k) => k)).toBeNull()
  })

  test('groups: lessons without a unit first, then every unit (empty ones too)', () => {
    const c = course([lesson('x'), lesson('a', 'u1'), lesson('b', 'u1'), lesson('c', 'u3')], ['u1', 'u2', 'u3'])
    const groups = lessonGroups(c)
    expect(groups.map((g) => [g.unit?.id ?? null, g.number, g.lessons.map((e) => `${e.lesson.id}${e.n}`)])).toEqual([
      [null, 0, ['x1']],
      ['u1', 1, ['a1', 'b2']],
      ['u2', 2, []],
      ['u3', 3, ['c1']],
    ])
  })

  test('numbering styles', () => {
    const c = course([lesson('x'), lesson('a', 'u1'), lesson('b', 'u2'), lesson('c', 'u2')], ['u1', 'u2'])
    const t = (k: string, v?: Record<string, string | number>) => `${k}:${JSON.stringify(v ?? {})}`
    expect(lessonNumber(c, 3)).toBe('2')
    expect(lessonKicker(c, 3, t)).toBe('unitLesson:{"unit":"unitWord:{}","u":2,"n":2}')
    expect(lessonKicker(c, 0, t)).toBe('lessonOnly:{"n":1}')
    c.settings = { completion: 'view', scored: false, passingScore: 0, navigation: 'free', unitNumbering: 'dotted', unitLabel: 'Module' }
    expect(lessonNumber(c, 3)).toBe('2.2')
    expect(lessonNumber(c, 0)).toBe('1')
    expect(lessonKicker(c, 3, t)).toBe('dottedLesson:{"u":2,"n":2}')
    c.settings.unitNumbering = 'unit'
    expect(lessonKicker(c, 1, t)).toBe('unitLesson:{"unit":"Module","u":1,"n":1}')
    c.settings.unitNumbering = 'none'
    expect(lessonNumber(c, 3)).toBe('4')
    expect(lessonKicker(c, 3, t)).toBeNull()
  })

  test('outline numbers skip the current lesson only without units', () => {
    expect([...outlineNumbers(course([lesson('a'), lesson('b'), lesson('c')]), 'a').values()]).toEqual(['1', '2'])
    const c = course([lesson('a', 'u1'), lesson('b', 'u1')], ['u1'])
    expect([...outlineNumbers(c, 'a').entries()]).toEqual([['b', '2']])
  })

  test('normalizeUnits regroups lessons, drops dangling unit ids and an empty list', () => {
    const c = course([lesson('a', 'u2'), lesson('b'), lesson('c', 'u1'), lesson('d', 'gone'), lesson('e', 'u2')], ['u1', 'u2'])
    expect(normalizeUnits(c)).toBe(true)
    expect(order(c)).toEqual(['b', 'd', 'c@u1', 'a@u2', 'e@u2'])
    expect(normalizeUnits(c)).toBe(false)
    const empty = course([lesson('a', 'u1')], [])
    normalizeUnits(empty)
    expect(empty.units).toBeUndefined()
    expect(order(empty)).toEqual(['a'])
  })

  test('setLessonUnit moves a lesson to the end of the unit', () => {
    const c = course([lesson('x'), lesson('a', 'u1'), lesson('b', 'u2')], ['u1', 'u2'])
    setLessonUnit(c, 'x', 'u2')
    expect(order(c)).toEqual(['a@u1', 'b@u2', 'x@u2'])
    setLessonUnit(c, 'b', null)
    expect(order(c)).toEqual(['b', 'a@u1', 'x@u2'])
    setLessonUnit(c, 'b', 'nope') // unknown unit: no change
    expect(order(c)).toEqual(['b', 'a@u1', 'x@u2'])
  })

  test('keyboard steps cross into neighbouring units, empty ones included', () => {
    const c = course([lesson('a', 'u1'), lesson('b', 'u1'), lesson('c', 'u3')], ['u1', 'u2', 'u3'])
    moveLessonStep(c, 'b', 1) // last of u1 → into empty u2
    expect(order(c)).toEqual(['a@u1', 'b@u2', 'c@u3'])
    moveLessonStep(c, 'b', 1) // → first of u3
    expect(order(c)).toEqual(['a@u1', 'b@u3', 'c@u3'])
    moveLessonStep(c, 'b', 1) // swap within u3
    expect(order(c)).toEqual(['a@u1', 'c@u3', 'b@u3'])
    moveLessonStep(c, 'b', 1) // already last: nothing
    expect(order(c)).toEqual(['a@u1', 'c@u3', 'b@u3'])
    moveLessonStep(c, 'a', -1) // first of u1 → out of the units
    expect(order(c)).toEqual(['a', 'c@u3', 'b@u3'])
    moveLessonStep(c, 'a', -1) // top: nothing
    expect(order(c)).toEqual(['a', 'c@u3', 'b@u3'])
  })

  test('keyboard steps without units just swap', () => {
    const c = course([lesson('a'), lesson('b')])
    moveLessonStep(c, 'a', 1)
    expect(order(c)).toEqual(['b', 'a'])
  })

  test('dropping onto a lesson takes its place and unit; onto a header makes it the first', () => {
    const c = course([lesson('a', 'u1'), lesson('b', 'u1'), lesson('c', 'u2'), lesson('d', 'u2')], ['u1', 'u2'])
    dropLesson(c, 'a', { lessonId: 'c' })
    expect(order(c)).toEqual(['b@u1', 'c@u2', 'a@u2', 'd@u2'])
    dropLesson(c, 'd', { lessonId: 'b' })
    expect(order(c)).toEqual(['d@u1', 'b@u1', 'c@u2', 'a@u2'])
    dropLesson(c, 'a', { unitId: 'u1' })
    expect(order(c)).toEqual(['a@u1', 'd@u1', 'b@u1', 'c@u2'])
  })

  test('dropping without units is a plain reorder', () => {
    const c = course([lesson('a'), lesson('b'), lesson('c')])
    dropLesson(c, 'c', { lessonId: 'a' })
    expect(order(c)).toEqual(['c', 'a', 'b'])
  })

  test('deleting a unit keeps its lessons in place', () => {
    const c = course([lesson('x'), lesson('a', 'u1'), lesson('b', 'u2'), lesson('c', 'u3')], ['u1', 'u2', 'u3'])
    deleteUnit(c, 'u2')
    expect(order(c)).toEqual(['x', 'a@u1', 'b@u1', 'c@u3'])
    deleteUnit(c, 'u1')
    expect(order(c)).toEqual(['x', 'a', 'b', 'c@u3'])
    deleteUnit(c, 'u3')
    expect(order(c)).toEqual(['x', 'a', 'b', 'c'])
    expect(c.units).toBeUndefined()
  })

  test('moving a unit moves its lessons', () => {
    const c = course([lesson('a', 'u1'), lesson('b', 'u2'), lesson('c', 'u2')], ['u1', 'u2'])
    moveUnit(c, 'u2', -1)
    expect(c.units!.map((u) => u.id)).toEqual(['u2', 'u1'])
    expect(order(c)).toEqual(['b@u2', 'c@u2', 'a@u1'])
    moveUnit(c, 'u2', -1) // already first
    expect(c.units!.map((u) => u.id)).toEqual(['u2', 'u1'])
  })
})

const text = (id: string): Block => ({ id, type: 'heading', settings: {}, data: { level: 2, text: id } })
const cont = (id: string, newPage?: boolean): Block => ({
  id, type: 'continue', settings: {}, data: { mode: 'unrestricted', label: 'Go', ...(newPage ? { newPage } : {}) },
})

describe('lesson pages', () => {
  test('only a mid-lesson Continue with newPage ends a page', () => {
    const blocks = [text('a'), cont('p1', true), text('b'), cont('g'), text('c'), cont('end', true)]
    expect(blocks.map((_, i) => isPageBreak(blocks, i))).toEqual([false, true, false, false, false, false])
    expect(splitPages(blocks).map((p) => p.map((b) => b.id))).toEqual([['a', 'p1'], ['b', 'g', 'c', 'end']])
    expect(pageOfBlock(blocks, 'c')).toBe(1)
    expect(pageOfBlock(blocks, 'p1')).toBe(0)
    expect(pageOfBlock(blocks, 'missing')).toBe(0)
  })

  test('a lesson without page breaks (or no blocks) is one page', () => {
    expect(splitPages([text('a'), cont('g')])).toHaveLength(1)
    expect(splitPages([])).toEqual([[]])
  })
})

describe('repairCourse: units', () => {
  const base = { id: 'c', title: 'T', description: '', theme: 'rose' }

  test('a well-formed course with units needs no fixes', () => {
    const input = { ...base, units: [{ id: 'u1', title: 'One' }], lessons: [
      { id: 'l0', title: 'L0', status: 'draft', blocks: [] },
      { id: 'l1', title: 'L1', status: 'draft', blocks: [], unitId: 'u1' },
    ] }
    const { course: out, fixes } = repairCourse(structuredClone(input))
    expect(fixes).toEqual([])
    expect(out).toEqual(input)
  })

  test('broken units, dangling unit ids and scattered lessons are repaired', () => {
    const { course: out, fixes } = repairCourse({ ...base, units: [
      { id: 'u1', title: 'One' }, 'junk', { id: 'u1' }, { title: 7 },
    ], lessons: [
      { id: 'a', title: 'A', status: 'draft', blocks: [], unitId: 'u1' },
      { id: 'b', title: 'B', status: 'draft', blocks: [] },
      { id: 'c', title: 'C', status: 'draft', blocks: [], unitId: 'nope' },
      { id: 'd', title: 'D', status: 'draft', blocks: [], unitId: 5 },
    ] })
    expect(out.units!.map((u) => typeof u.id === 'string' && typeof u.title === 'string')).toEqual([true, true, true])
    expect(new Set(out.units!.map((u) => u.id)).size).toBe(3)
    expect(out.units![2].title).toBe('7')
    expect(order(out)).toEqual(['b', 'c', 'd', 'a@u1'])
    expect(fixes.map((f) => f.key)).toEqual(expect.arrayContaining([
      'repairUnitDropped', 'repairUnitId', 'repairUnitTitle', 'repairLessonUnit', 'repairUnitOrder',
    ]))
    // Idempotent.
    expect(repairCourse(structuredClone(out)).fixes).toEqual([])
  })

  test('units that are not a list are removed', () => {
    const { course: out, fixes } = repairCourse({ ...base, units: 'x', lessons: [
      { id: 'a', title: 'A', status: 'draft', blocks: [], unitId: 'u1' },
    ] })
    expect(out.units).toBeUndefined()
    expect(out.lessons[0].unitId).toBeUndefined()
    expect(fixes.map((f) => f.key)).toEqual(['repairUnits', 'repairLessonUnit'])
  })
})
