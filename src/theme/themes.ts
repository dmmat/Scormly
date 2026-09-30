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
    accent: '#db2777',
    description: 'Рожевий акцент, м’які заокруглені кнопки',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    accent: '#0369a1',
    description: 'Блакитний акцент, кнопки-пігулки',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    accent: '#15803d',
    description: 'Зелений акцент, кутасті кнопки',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    accent: '#c2410c',
    description: 'Помаранчевий акцент, виразні кнопки',
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    accent: '#334155',
    description: 'Графітовий акцент, гострі прямі кути',
  },
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    accent: '#4f46e5',
    description: 'Індиго-акцент, чіткі прямокутні кнопки',
  },
  crimson: {
    id: 'crimson',
    label: 'Crimson',
    accent: '#dc2626',
    description: 'Малиново-червоний акцент, гострі кути',
  },
  mint: {
    id: 'mint',
    label: 'Mint',
    accent: '#0f766e',
    description: 'Бірюзовий акцент, дуже м’які великі заокруглення',
  },
  grape: {
    id: 'grape',
    label: 'Grape',
    accent: '#9333ea',
    description: 'Фіолетовий акцент, кнопки-пігулки й чіткі картки',
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    accent: '#15803d',
    description: 'Хакерський термінал: моноширинний шрифт, зелений фосфор',
  },
}

export const THEME_LIST: ThemeMeta[] = Object.values(THEMES)

export const DEFAULT_THEME: ThemeId = 'rose'
