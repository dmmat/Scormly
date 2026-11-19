// Block registry (src/blocks/registry.ts): add-menu categories and the style
// variants a block offers there.

import { describe, test, expect } from 'vitest'
import { LANGUAGES } from '../src/i18n/types'
import { BLOCK_CATEGORIES, BLOCK_REGISTRY, blockVariants, createBlock } from '../src/blocks/registry'
import { checkCourse } from '../src/export/courseCheck'
import { toggleBold } from '../src/blocks/components/TableBlock'
import { cellRuns, tableCards } from '../src/blocks/styleClasses'
import blocks from '../src/i18n/locales/blocks'
import common from '../src/i18n/locales/common'
import type { Block, BlockType, Course } from '../src/types/course'

const TYPES = Object.keys(BLOCK_REGISTRY) as BlockType[]
const CAT_KEY = { text: 'catText', media: 'catMedia', structure: 'catStructure', interactive: 'catInteractive', assessment: 'catAssessment', navigation: 'catNavigation' }

const issueKeys = (block: Block) =>
  checkCourse({
    title: 'C',
    settings: { contentLanguage: 'en' },
    lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [block] }],
  } as unknown as Course).map((i) => i.key)

describe('block registry', () => {
  test('every type sits in a known category, and every category has blocks and a label', () => {
    const cats = BLOCK_CATEGORIES.map((c) => c.category)
    for (const type of TYPES) {
      expect(BLOCK_REGISTRY[type].type).toBe(type)
      expect(cats).toContain(BLOCK_REGISTRY[type].category)
    }
    for (const cat of cats) {
      expect(TYPES.some((t) => BLOCK_REGISTRY[t].category === cat), cat).toBe(true)
      for (const { id: lang } of LANGUAGES) expect(common[lang][CAT_KEY[cat]], `${lang} ${cat}`).toBeTruthy()
    }
  })

  test('variant ids are unique, the first is the plain default, and each has a label in both languages', () => {
    for (const type of TYPES) {
      const variants = blockVariants(type)
      if (!variants.length) continue
      const ids = variants.map((v) => v.id)
      expect(new Set(ids).size, type).toBe(ids.length)
      expect(variants[0].data, `${type}: first variant is the default`).toBeUndefined()
      expect(variants[0].settings).toBeUndefined()
      for (const id of ids) {
        for (const { id: lang } of LANGUAGES) {
          expect(blocks[lang][`variant_${type}_${id}`], `${lang} variant_${type}_${id}`).toBeTruthy()
        }
      }
    }
    expect(Object.keys(blocks.uk).sort()).toEqual(Object.keys(blocks.en).sort())
  })

  test('each variant makes a complete block of its type, with fresh ids', () => {
    for (const type of TYPES) {
      const base = createBlock(type)
      for (const v of blockVariants(type)) {
        const a = createBlock(type, v.id)
        const b = createBlock(type, v.id)
        expect(a.type).toBe(type)
        expect(a.id).not.toBe(b.id)
        // Nothing of the default data goes missing; the block stays JSON.
        for (const key of Object.keys(base.data)) expect(a.data, `${type}/${v.id}: ${key}`).toHaveProperty(key)
        expect(JSON.parse(JSON.stringify(a))).toEqual(a)
      }
    }
  })

  test('variants change what they say they change', () => {
    expect(createBlock('process', 'pyramid').data).toMatchObject({ layout: 'pyramid' })
    expect(createBlock('list', 'numbered').data).toMatchObject({ ordered: true })
    expect(createBlock('continue', 'restricted').data).toMatchObject({ mode: 'restricted' })
    const vs = createBlock('comparison', 'versus')
    expect(vs.type === 'comparison' && vs.data.versus).toBe(true)
    expect(vs.type === 'comparison' && vs.data.columns.every((c) => c.tone === 'neutral')).toBe(true)
    const cards = createBlock('table', 'cards')
    expect(cards.type === 'table' && cards.data.layout).toBe('cards')
    // Cards need a title row and a label column to draw from.
    expect(cards.type === 'table' && tableCards(cards.data.rows)?.cards.length).toBe(2)
    expect(tableCards([['only']])).toBeNull()
    expect(cellRuns('**Yes:** linked')).toEqual([{ text: 'Yes:', bold: true }, { text: ' linked', bold: false }])
    expect(cellRuns('**two\nlines**')).toEqual([{ text: 'two\nlines', bold: true }])
    expect(toggleBold('Yes: ok', 0, 4)).toBe('**Yes:** ok')
    // Already bold: the markers inside the selection or just around it come off.
    expect(toggleBold('**Yes:** ok', 0, 8)).toBe('Yes: ok')
    expect(toggleBold('**Yes:** ok', 2, 6)).toBe('Yes: ok')
    expect(cellRuns('2 * 3 ** 4')).toEqual([{ text: '2 * 3 ** 4', bold: false }])
    expect(tableCards([['', 'A'], ['Price', '$1']])).toEqual({ labels: ['Price'], cards: [{ title: 'A', values: ['$1'] }] })
    expect(createBlock('heading', 'section').data).toMatchObject({ level: 2, eyebrow: expect.any(String), subtitle: expect.any(String) })
    expect(createBlock('cards', 'rows').data).toMatchObject({ layout: 'rows', numbered: true })
    const labelled = createBlock('cards', 'labels')
    expect(labelled.type === 'cards' && labelled.data.items.every((it) => it.badge)).toBe(true)
    // An unknown style falls back to the default block.
    expect(createBlock('note', 'nope').data).toEqual(createBlock('note').data)
  })

  test('no variant adds a pre-export problem its default block does not have', () => {
    // A quote on an image needs its image, like the ready-made one; the
    // upload style of the code block needs its upload.
    const allowed = new Set(['chkQuoteNoImage', 'chkMissingHtml'])
    for (const type of TYPES) {
      const base = new Set(issueKeys(createBlock(type)))
      for (const v of blockVariants(type)) {
        const extra = issueKeys(createBlock(type, v.id)).filter((k) => !base.has(k) && !allowed.has(k))
        expect(extra, `${type}/${v.id}`).toEqual([])
      }
    }
  })
})
