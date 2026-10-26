// Built-in sample course (src/lib/sampleCourse.ts).

import { describe, test, expect } from 'vitest'
import { makeSampleCourse } from '../src/lib/sampleCourse'
import { checkCourse } from '../src/export/courseCheck'
import { blankAnswers } from '../src/blocks/fillBlanks'

describe('sample course', () => {
  for (const lang of ['en', 'uk'] as const) {
    test(`${lang}: passes the pre-export course check`, () => {
      expect(checkCourse(makeSampleCourse(lang))).toEqual([])
    })
  }

  test('both languages have the same structure', () => {
    const shape = (lang: 'en' | 'uk') =>
      makeSampleCourse(lang).lessons.map((l) => l.blocks.map((b) => b.type))
    expect(shape('uk')).toEqual(shape('en'))
  })

  test('fill-in-the-blanks has three blanks in each language', () => {
    for (const lang of ['en', 'uk'] as const) {
      const b = makeSampleCourse(lang).lessons.flatMap((l) => l.blocks).find((x) => x.type === 'fillBlanks')
      expect(b?.type === 'fillBlanks' && blankAnswers(b.data.text).length).toBe(3)
    }
  })

  test('shows the newer blocks; Do / Don’t is a comparison, not a table', () => {
    const types = makeSampleCourse('en').lessons.flatMap((l) => l.blocks.map((b) => b.type))
    for (const t of ['comparison', 'process', 'steps', 'beforeAfter', 'reflection', 'continue'] as const) {
      expect(types).toContain(t)
    }
    expect(types).not.toContain('table')
  })

  test('a Blocking Continue has tasks above it that the learner can finish', () => {
    for (const lesson of makeSampleCourse('en').lessons) {
      lesson.blocks.forEach((b, i) => {
        if (b.type !== 'continue' || b.data.mode !== 'restricted') return
        const above = lesson.blocks.slice(0, i)
        expect(above.some((x) => x.type === 'ordering' || x.type === 'fillBlanks' || x.type === 'quiz')).toBe(true)
      })
    }
  })

  test('ids are unique', () => {
    const json = JSON.stringify(makeSampleCourse('en'))
    const ids = [...json.matchAll(/"id":"([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
  })
})
