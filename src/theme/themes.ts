// Global project themes (spec extension requested by the user).
// There is one theme per course; it affects the accent color, button shape and
// the style of interactive blocks (tabs/accordion/flashcards). Implemented via
// data-theme on the root container + CSS variables in index.css.

import type { Course, PresetThemeId, ThemeId, ThemeShape } from '../types/course'
import { customThemeTokens, DEFAULT_CUSTOM_THEME } from './customTheme'

export interface ThemeMeta {
  id: PresetThemeId
  label: string
  /** Swatch color for the preview in the theme switcher. */
  accent: string
  /** Second accent (details: labels, numbers, table and card headers); the
   *  same value as --color-accent2 in index.css. */
  accent2: string
  /** Closest corner shape (seeds a custom theme started from this one). */
  shape: ThemeShape
  /** Short description of the style. */
  description: string
}

export const THEMES: Record<PresetThemeId, ThemeMeta> = {
  rose: {
    id: 'rose',
    label: 'Rose',
    accent: '#db2777',
    accent2: '#7c3aed',
    shape: 'soft',
    description: 'Рожевий акцент, м’які заокруглені кнопки',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    accent: '#0369a1',
    accent2: '#c2410c',
    shape: 'pill',
    description: 'Блакитний акцент, кнопки-пігулки',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    accent: '#15803d',
    accent2: '#b45309',
    shape: 'sharp',
    description: 'Зелений акцент, кутасті кнопки',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    accent: '#c2410c',
    accent2: '#7e22ce',
    shape: 'rounded',
    description: 'Помаранчевий акцент, виразні кнопки',
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    accent: '#334155',
    accent2: '#2563eb',
    shape: 'sharp',
    description: 'Графітовий акцент, гострі прямі кути',
  },
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    accent: '#4f46e5',
    accent2: '#db2777',
    shape: 'sharp',
    description: 'Індиго-акцент, чіткі прямокутні кнопки',
  },
  crimson: {
    id: 'crimson',
    label: 'Crimson',
    accent: '#dc2626',
    accent2: '#1e40af',
    shape: 'sharp',
    description: 'Малиново-червоний акцент, гострі кути',
  },
  mint: {
    id: 'mint',
    label: 'Mint',
    accent: '#0f766e',
    accent2: '#be185d',
    shape: 'rounded',
    description: 'Бірюзовий акцент, дуже м’які великі заокруглення',
  },
  grape: {
    id: 'grape',
    label: 'Grape',
    accent: '#9333ea',
    accent2: '#0f766e',
    shape: 'pill',
    description: 'Фіолетовий акцент, кнопки-пігулки й чіткі картки',
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    accent: '#15803d',
    accent2: '#b45309',
    shape: 'sharp',
    description: 'Хакерський термінал: моноширинний шрифт, зелений фосфор',
  },
}

export const THEME_LIST: ThemeMeta[] = Object.values(THEMES)

export const DEFAULT_THEME: PresetThemeId = 'rose'

/** The course's accent for swatches: the preset's, or the custom brand color. */
export function themeAccent(course: Pick<Course, 'theme' | 'customTheme'>): string {
  if (course.theme === 'custom') return customThemeTokens(course.customTheme ?? DEFAULT_CUSTOM_THEME).brand
  return (THEMES[course.theme] ?? THEMES[DEFAULT_THEME]).accent
}

export function isThemeId(id: string): id is ThemeId {
  return id === 'custom' || id in THEMES
}
