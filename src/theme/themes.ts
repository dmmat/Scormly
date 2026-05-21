// Global project themes (spec extension requested by the user).
// There is one theme per course; it affects the accent color, button shape and
// the style of interactive blocks (tabs/accordion/flashcards). Implemented via
// data-theme on the root container + CSS variables in index.css.

import type { ThemeId } from '../types/course'

export interface ThemeMeta {
  id: ThemeId
  label: string
  /** Swatch color for the preview in the theme switcher. */
  accent: string
  /** Short description of the style. */
  description: string
}

export const THEMES: Record<ThemeId, ThemeMeta> = {
  rose: {
    id: 'rose',
    label: 'Rose',
    accent: '#ec4899',
    description: 'Рожевий акцент, м’які заокруглені кнопки',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    accent: '#0ea5e9',
    description: 'Блакитний акцент, кнопки-пігулки',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    accent: '#16a34a',
    description: 'Зелений акцент, кутасті кнопки',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    accent: '#f97316',
    description: 'Помаранчевий акцент, виразні кнопки',
  },
}

export const THEME_LIST: ThemeMeta[] = Object.values(THEMES)

export const DEFAULT_THEME: ThemeId = 'rose'
