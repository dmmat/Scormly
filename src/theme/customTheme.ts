// The author's own theme: an accent color and a corner shape. Every shade is
// derived here (the editor applies it as CSS variables, exports embed the
// result for the player), keeping the theme contract from index.css: white
// text on the brand color and brand-dark text on white reach 4.5:1.

import type { Course, CustomTheme, ThemeShape } from '../types/course'

export interface ThemeTokens {
  brand: string
  brandLight: string
  brandDark: string
  radiusBtn: string
  radiusInteractive: string
}

/** [button radius, card / interactive radius] per shape. */
export const SHAPE_RADII: Record<ThemeShape, [string, string]> = {
  sharp: ['0', '2px'],
  soft: ['0.5rem', '0.5rem'],
  rounded: ['0.875rem', '1rem'],
  pill: ['9999px', '1rem'],
}

export const THEME_SHAPES = Object.keys(SHAPE_RADII) as ThemeShape[]

export const DEFAULT_CUSTOM_THEME: CustomTheme = { accent: '#0f766e', shape: 'rounded' }

const AA = 4.5

type Rgb = [number, number, number]

/** '#rgb' / '#rrggbb' → [r, g, b]; null when not a hex color. */
export function parseHex(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}

function toHex(rgb: Rgb): string {
  return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

/** Blend `rgb` toward `to` by `t` (0–1). */
function mix(rgb: Rgb, to: Rgb, t: number): Rgb {
  return rgb.map((v, i) => v + (to[i] - v) * t) as Rgb
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio of two colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(parseHex(a) ?? [0, 0, 0])
  const lb = luminance(parseHex(b) ?? [0, 0, 0])
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

/** The accent, darkened just enough for white text on it to reach AA. */
function readableBrand(accent: Rgb): Rgb {
  let c = accent
  for (let i = 0; i < 40 && contrastRatio(toHex(c), '#ffffff') < AA; i++) c = mix(c, BLACK, 0.05)
  return c
}

export function customThemeTokens(theme: CustomTheme): ThemeTokens {
  const accent = parseHex(theme.accent) ?? parseHex(DEFAULT_CUSTOM_THEME.accent)!
  const brand = readableBrand(accent)
  const [radiusBtn, radiusInteractive] = SHAPE_RADII[theme.shape] ?? SHAPE_RADII.rounded
  return {
    brand: toHex(brand),
    brandLight: toHex(mix(brand, WHITE, 0.6)),
    brandDark: toHex(mix(brand, BLACK, 0.2)),
    radiusBtn,
    radiusInteractive,
  }
}

/** Whether the accent had to be darkened to keep text readable. */
export function accentAdjusted(theme: CustomTheme): boolean {
  return customThemeTokens(theme).brand.toLowerCase() !== (theme.accent || '').toLowerCase()
}

/** Inline CSS variables for a custom theme (undefined for presets, whose
 *  tokens come from [data-theme] rules in index.css). */
export function themeStyle(course: Pick<Course, 'theme' | 'customTheme'>): React.CSSProperties | undefined {
  if (course.theme !== 'custom') return undefined
  const t = customThemeTokens(course.customTheme ?? DEFAULT_CUSTOM_THEME)
  return {
    '--color-brand': t.brand,
    '--color-brand-light': t.brandLight,
    '--color-brand-dark': t.brandDark,
    '--radius-btn': t.radiusBtn,
    '--radius-interactive': t.radiusInteractive,
  } as React.CSSProperties
}

/** '#abc' / 'abc' / '#aabbcc' → '#aabbcc' (lowercase); null when invalid. */
export function normalizeHex(hex: string): string | null {
  const rgb = parseHex(hex)
  return rgb ? toHex(rgb) : null
}
