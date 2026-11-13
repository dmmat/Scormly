// Interface languages. ONLY the editor shell (chrome) is localized, not the
// course content — block text stays exactly as the author entered it.
export type Language = 'en' | 'uk' | 'fr' | 'es' | 'de'

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'uk', label: 'Українська' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
]

// Default is English (landing and interface default to English; another
// language turns on automatically if the browser prefers it, or manually).
export const DEFAULT_LANGUAGE: Language = 'en'

// Translation table for a single namespace: key → string, for each language.
export type LocaleTable = Record<Language, Record<string, string>>
