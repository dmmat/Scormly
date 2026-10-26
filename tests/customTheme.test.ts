// Custom theme palette (src/theme/customTheme.ts) and its export.

import { describe, test, expect } from 'vitest'
import { contrastRatio, customThemeTokens, normalizeHex, accentAdjusted } from '../src/theme/customTheme'
import { withThemeTokens } from '../src/export/packageCommon'
import type { Course } from '../src/types/course'

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

  test('shape sets the radii', () => {
    expect(customThemeTokens({ accent: '#0369a1', shape: 'pill' }).radiusBtn).toBe('9999px')
    expect(customThemeTokens({ accent: '#0369a1', shape: 'sharp' }).radiusBtn).toBe('0')
  })

  test('normalizeHex', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('0369A1')).toBe('#0369a1')
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('red')).toBeNull()
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
