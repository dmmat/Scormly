// The structured-data text that seoPrerender translates on each language page.

import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { LANGUAGES } from '../src/i18n/types'
import { LD } from '../scripts/seoLd.ts'

describe('seo structured data', () => {
  const html = readFileSync('index.html', 'utf8')

  test('the English text is the text in index.html', () => {
    expect(html).toContain(LD.en.description)
    expect(html).toContain(LD.en.siteDescription)
    expect(html).toContain(LD.en.imageAlt.replace('&', '&amp;'))
    for (const feature of LD.en.features) expect(html, feature).toContain(feature)
  })

  test('every language has the same set, with no double quotes (they sit inside JSON)', () => {
    for (const { id } of LANGUAGES) {
      const ld = LD[id]
      expect(ld.features.length, id).toBe(LD.en.features.length)
      for (const text of [ld.description, ld.siteDescription, ld.imageAlt, ...ld.features]) {
        expect(text.trim(), id).not.toBe('')
        expect(text, id).not.toContain('"')
      }
    }
  })
})
