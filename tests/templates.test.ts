// Ready-made blocks in the "+ Add block" menu (src/blocks/templates.ts).

import { describe, test, expect } from 'vitest'
import { LANGUAGES } from '../src/i18n/types'
import { BLOCK_TEMPLATES, TEMPLATE_GROUPS } from '../src/blocks/templates'
import design from '../src/i18n/locales/design'
import content from '../src/i18n/locales/content'

describe('block templates', () => {
  test('ids are unique and every group is known', () => {
    const ids = BLOCK_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of BLOCK_TEMPLATES) expect(TEMPLATE_GROUPS).toContain(t.group)
  })

  test('every template and group has a label and description in both languages', () => {
    for (const { id: lang } of LANGUAGES) {
      for (const t of BLOCK_TEMPLATES) {
        expect(design[lang][`tpl_${t.id}`], `${lang} tpl_${t.id}`).toBeTruthy()
        expect(design[lang][`tpl_${t.id}Desc`], `${lang} tpl_${t.id}Desc`).toBeTruthy()
      }
      for (const g of TEMPLATE_GROUPS) expect(design[lang][`tplGroup_${g}`]).toBeTruthy()
    }
  })

  test('content keys exist in both languages', () => {
    expect(Object.keys(content.uk).sort()).toEqual(Object.keys(content.en).sort())
    expect(Object.keys(design.uk).sort()).toEqual(Object.keys(design.en).sort())
  })

  test('each template creates blocks with fresh unique ids and no missing text', () => {
    for (const t of BLOCK_TEMPLATES) {
      const a = t.create()
      const b = t.create()
      expect(a.length).toBeGreaterThan(0)
      const ids = [...a, ...b].map((x) => x.id)
      expect(new Set(ids).size).toBe(ids.length)
      // translate() returns the key itself when a string is missing.
      expect(JSON.stringify(a)).not.toMatch(/\btpl[A-Z]\w+/)
    }
  })
})
