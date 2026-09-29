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

  test('ids are unique', () => {
    const json = JSON.stringify(makeSampleCourse('en'))
    const ids = [...json.matchAll(/"id":"([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
  })
})
