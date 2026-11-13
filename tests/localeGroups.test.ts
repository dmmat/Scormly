// How the interface strings are split into chunks (src/i18n/groups.ts).

import { describe, test, expect } from 'vitest'
import { DICTIONARY } from '../src/i18n/dictionary'
import { LOCALE_GROUPS } from '../src/i18n/groups'
import { withLocalePreload } from '../scripts/seoPrerender.ts'

describe('locale groups', () => {
  test('every namespace is loaded by exactly one group', () => {
    const grouped = Object.values(LOCALE_GROUPS).flat()
    expect([...grouped].sort()).toEqual(Object.keys(DICTIONARY).sort())
    expect(new Set(grouped).size).toBe(grouped.length)
  })
})

describe('withLocalePreload', () => {
  const page = '<html><head></head><body></body></html>'
  const chunks = { en: '/assets/en.js', uk: '/assets/uk.js', de: '/assets/de.js' }

  test('a page with a fixed language names its chunk and the English fallback', () => {
    const out = withLocalePreload(page, chunks, 'uk')
    expect(out).toContain('href="/assets/en.js"')
    expect(out).toContain('href="/assets/uk.js"')
    expect(out).not.toContain('<script>')
  })

  test('a page for any language preloads English and picks the rest at run time', () => {
    const out = withLocalePreload(page, chunks)
    expect(out).toContain('<link rel="modulepreload" crossorigin href="/assets/en.js">')
    expect(out).not.toContain('<link rel="modulepreload" crossorigin href="/assets/uk.js">')
    expect(out).toContain('scormly-language')
    expect(out).toContain('"/assets/de.js"')
  })
})
