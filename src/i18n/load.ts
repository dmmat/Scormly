import { DEFAULT_LANGUAGE, type Language } from './types'
import type { LocaleGroup } from './groups'
import { registerLanguage } from './registry'

// Loads the interface strings on demand: one chunk per group of namespaces and
// language (built by scripts/localeChunks.ts), instead of every language at
// once. English is always loaded beside the chosen language: it is the
// fallback for a missing string and what the console reports use.

type Chunk = () => Promise<{ default: Record<string, Record<string, string>> }>

// Literal imports, so the bundler sees every chunk.
const CHUNKS: Record<LocaleGroup, Record<Language, Chunk>> = {
  landing: {
    en: () => import('virtual:locale/landing/en'),
    uk: () => import('virtual:locale/landing/uk'),
    fr: () => import('virtual:locale/landing/fr'),
    es: () => import('virtual:locale/landing/es'),
    de: () => import('virtual:locale/landing/de'),
  },
  app: {
    en: () => import('virtual:locale/app/en'),
    uk: () => import('virtual:locale/app/uk'),
    fr: () => import('virtual:locale/app/fr'),
    es: () => import('virtual:locale/app/es'),
    de: () => import('virtual:locale/app/de'),
  },
}

const loading = new Map<string, Promise<void>>()
/** Groups some view has asked for; a language switch loads them all. */
const wanted = new Set<LocaleGroup>()

function loadOne(group: LocaleGroup, lang: Language): Promise<void> {
  const key = `${group}/${lang}`
  let p = loading.get(key)
  if (!p) {
    p = CHUNKS[group][lang]().then((m) => registerLanguage(lang, m.default))
    // A failed download must be retried next time, not remembered.
    p.catch(() => loading.delete(key))
    loading.set(key, p)
  }
  return p
}

/** Makes a group's strings available in `lang` (and in English). */
export function loadGroup(group: LocaleGroup, lang: Language): Promise<void> {
  wanted.add(group)
  return Promise.all([loadOne(group, lang), loadOne(group, DEFAULT_LANGUAGE)]).then(() => undefined)
}

/** Makes every group in use available in `lang`: call before switching to it. */
export function loadLanguage(lang: Language): Promise<void> {
  return Promise.all([...wanted].map((group) => loadGroup(group, lang))).then(() => undefined)
}
