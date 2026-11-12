// Every interface language has every string (src/i18n/locales/*).

import { describe, test, expect } from 'vitest'
import { DICTIONARY } from '../src/i18n/dictionary'
import { LANGUAGES } from '../src/i18n/types'
import { RELEASES } from '../src/help/releaseNotes'
import { chatScenarios } from '../src/components/landing/demos/chatScenarios'

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
const tags = (s: string) => [...s.matchAll(/<\/?[a-z][^>]*>/gi)].map((m) => m[0]).sort()
const others = LANGUAGES.map((l) => l.id).filter((id) => id !== 'en')

describe.each(Object.entries(DICTIONARY))('namespace %s', (_name, table) => {
  test.each(others)('%s has the same keys, placeholders and markup as en', (lang) => {
    expect(Object.keys(table[lang] ?? {}).sort()).toEqual(Object.keys(table.en).sort())
    for (const [key, en] of Object.entries(table.en)) {
      const str = table[lang][key]
      expect(str.trim(), `${lang} ${key}`).not.toBe('')
      expect(placeholders(str), `${lang} ${key}`).toEqual(placeholders(en))
      expect(tags(str), `${lang} ${key}`).toEqual(tags(en))
    }
  })
})

describe('content outside the locale files', () => {
  test.each(others)('release notes: %s has every item', (lang) => {
    for (const r of RELEASES) {
      expect(r.items[lang], `${r.id} ${lang}`).toHaveLength(r.items.en.length)
      for (const item of r.items[lang]) expect(item.trim()).not.toBe('')
    }
  })

  test.each(others)('landing chat scenarios: %s has every line', (lang) => {
    for (const s of chatScenarios) {
      const texts = [s.name, s.status, ...s.steps.flatMap((st) => (st.kind === 'bot' ? [st.text] : st.opts))]
      for (const t of texts) expect(t[lang]?.trim(), `${s.id} ${lang}: ${t.en}`).toBeTruthy()
    }
  })
})
