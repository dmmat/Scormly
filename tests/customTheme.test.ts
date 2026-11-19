// Custom theme palette (src/theme/customTheme.ts) and its export.

import { describe, test, expect } from 'vitest'
import { contrastRatio, customThemeTokens, normalizeHex, accentAdjusted, readableText } from '../src/theme/customTheme'
import { withThemeTokens } from '../src/export/packageCommon'
import type { Course } from '../src/types/course'
import { readFileSync } from 'node:fs'
import { THEME_LIST } from '../src/theme/themes'

describe('customThemeTokens', () => {
  test('any accent keeps white-on-brand and brand-dark-on-white at AA', () => {
    for (const accent of ['#ffff00', '#ffffff', '#f9a8d4', '#22c55e', '#000000', '#0369a1', '#ff8800', '#7dd3fc']) {
      const t = customThemeTokens({ accent, shape: 'soft' })
      expect(contrastRatio(t.brand, '#ffffff'), accent).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(t.brandDark, '#ffffff'), accent).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('a readable accent is kept as is; a light one is darkened', () => {
    expect(customThemeTokens({ accent: '#0369a1', shape: 'pill' }).brand).toBe('#0369a1')
    expect(accentAdjusted({ accent: '#0369a1', shape: 'pill' })).toBe(false)
    expect(accentAdjusted({ accent: '#ffcc00', shape: 'pill' })).toBe(true)
  })

  test('the second accent keeps the same contrast and falls back to the accent', () => {
    for (const accent2 of ['#ffff00', '#f9a8d4', '#7dd3fc', '#1e40af']) {
      const t = customThemeTokens({ accent: '#0369a1', accent2, shape: 'soft' })
      expect(contrastRatio(t.accent2, '#ffffff'), accent2).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(t.accent2Dark, '#ffffff'), accent2).toBeGreaterThanOrEqual(4.5)
    }
    expect(customThemeTokens({ accent: '#0369a1', shape: 'soft' }).accent2).toBe('#0369a1')
  })

  test('every preset has a second accent readable under white text, the same in the builder and the player', () => {
    const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
    const player = readFileSync(new URL('../public/scorm-player/player.js', import.meta.url), 'utf8')
    for (const th of THEME_LIST) {
      expect(contrastRatio(th.accent2, '#ffffff'), th.id).toBeGreaterThanOrEqual(4.5)
      const block = css.slice(css.indexOf(`[data-theme="${th.id}"] {`))
      const dark = /--color-accent2-dark: (#[0-9a-f]{6});/.exec(block)![1]
      expect(block.slice(0, block.indexOf('}'))).toContain(`--color-accent2: ${th.accent2};`)
      expect(contrastRatio(dark, '#ffffff'), th.id).toBeGreaterThanOrEqual(4.5)
      expect(player).toContain(`${th.id}: ['${th.accent2}', '${dark}'],`)
    }
  })

  test('a color deepened for text reads on white, however light it starts', () => {
    for (const hex of ['#ffeb3b', '#7dd3fc', '#ffffff', '#004685', '#ef4444']) {
      expect(contrastRatio(readableText(hex)!, '#ffffff'), hex).toBeGreaterThanOrEqual(4.5)
    }
    expect(readableText('nope')).toBeNull()
  })

  test('shape sets the radii', () => {
    expect(customThemeTokens({ accent: '#0369a1', shape: 'pill' }).radiusBtn).toBe('9999px')
    expect(customThemeTokens({ accent: '#0369a1', shape: 'sharp' }).radiusBtn).toBe('0')
  })

  test('normalizeHex', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('0369A1')).toBe('#0369a1')
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('red')).toBeNull()
    expect(normalizeHex(0 as unknown as string)).toBeNull()
  })
})

describe('withThemeTokens', () => {
  const base = { id: 'c', title: 'C', description: '', lessons: [] } as unknown as Course
  test('embeds the palette only for a custom theme', () => {
    expect(withThemeTokens({ ...base, theme: 'ocean' })).not.toHaveProperty('themeTokens')
    const out = withThemeTokens({ ...base, theme: 'custom', customTheme: { accent: '#0369a1', shape: 'pill' } })
    expect(out.themeTokens?.brand).toBe('#0369a1')
    expect(out.themeTokens?.radiusBtn).toBe('9999px')
  })
})
