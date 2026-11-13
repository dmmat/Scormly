// Built-in sample course (src/lib/sampleCourse.ts).

import { describe, test, expect } from 'vitest'
import { LANGUAGES, type Language } from '../src/i18n/types'
import { makeSampleCourse } from '../src/lib/sampleCourse'
import { checkCourse } from '../src/export/courseCheck'
import { blankAnswers } from '../src/blocks/fillBlanks'

describe('sample course', () => {
  for (const { id: lang } of LANGUAGES) {
    test(`${lang}: passes the pre-export course check`, () => {
      expect(checkCourse(makeSampleCourse(lang))).toEqual([])
    })
  }

  test('every language has the same structure', () => {
    const shape = (lang: Language) =>
      makeSampleCourse(lang).lessons.map((l) => l.blocks.map((b) => b.type))
    for (const { id: lang } of LANGUAGES) expect(shape(lang), lang).toEqual(shape('en'))
  })

  test('fill-in-the-blanks has three blanks in each language', () => {
    for (const { id: lang } of LANGUAGES) {
      const b = makeSampleCourse(lang).lessons.flatMap((l) => l.blocks).find((x) => x.type === 'fillBlanks')
      expect(b?.type === 'fillBlanks' && blankAnswers(b.data.text).length).toBe(3)
    }
  })

  test('shows the newer blocks; Do / Don’t is a comparison, not a table', () => {
    const types = makeSampleCourse('en').lessons.flatMap((l) => l.blocks.map((b) => b.type))
    for (const t of ['comparison', 'process', 'steps', 'beforeAfter', 'reflection', 'continue', 'html'] as const) {
      expect(types).toContain(t)
    }
    expect(types).not.toContain('table')
  })

  test('the widget is a whole page whose script compiles in each language', () => {
    for (const { id: lang } of LANGUAGES) {
      const b = makeSampleCourse(lang).lessons.flatMap((l) => l.blocks).find((x) => x.type === 'html')
      if (b?.type !== 'html') throw new Error('no widget')
      expect(b.data.source).toBe('code')
      expect(b.data.code).toMatch(/^<!doctype html>/)
      const script = b.data.code.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? ''
      expect(script).toContain('var R = [')
      expect(() => new Function(script)).not.toThrow()
    }
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

describe('sample course pictures', () => {
  test('every picture it uses has a source in the library and is referenced', async () => {
    const { existsSync } = await import('node:fs')
    const { SAMPLE_ASSET_SOURCES } = await import('../src/lib/sampleAssets')
    for (const source of Object.values(SAMPLE_ASSET_SOURCES)) {
      expect(existsSync(`public/library/${source}`), source).toBe(true)
    }
    const json = JSON.stringify(makeSampleCourse('en'))
    for (const path of Object.keys(SAMPLE_ASSET_SOURCES)) expect(json, path).toContain(path)
    // The scene and the chat: a library character, a background, a learner avatar.
    const scenarios = makeSampleCourse('en').lessons.flatMap((l) => l.blocks).filter((b) => b.type === 'scenario')
    expect(scenarios.map((b) => b.type === 'scenario' && b.data.layout)).toEqual(['scene', 'chat'])
  })
})

describe('sample course export', () => {
  test('a SCORM package carries the library pictures the sample uses', async () => {
    const JSZip = (await import('jszip')).default
    const { putMemoryAsset, clearMemoryAssets } = await import('../src/lib/assets')
    const { SAMPLE_ASSET_SOURCES } = await import('../src/lib/sampleAssets')
    const { addAssets } = await import('../src/export/packageCommon')
    clearMemoryAssets()
    for (const path of Object.keys(SAMPLE_ASSET_SOURCES)) putMemoryAsset(path, new Blob(['x'], { type: 'image/webp' }))
    const zip = new JSZip()
    const added = await addAssets(zip, null, makeSampleCourse('de'))
    expect([...added].sort()).toEqual(Object.keys(SAMPLE_ASSET_SOURCES).sort())
    clearMemoryAssets()
  })
})
