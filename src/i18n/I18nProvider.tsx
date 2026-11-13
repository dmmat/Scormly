import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_STORAGE_KEY as STORAGE_KEY, type Language } from './types'
import type { Namespace } from './dictionary'
import { TABLES } from './registry'
import { loadLanguage } from './load'
import { parseRoute, ROUTE_EVENT } from '../lib/route'

// A string in `lang`, else in English (always loaded beside it), else undefined.
const lookup = (namespace: string, lang: Language, key: string): string | undefined =>
  TABLES[namespace]?.[lang]?.[key] ?? TABLES[namespace]?.[DEFAULT_LANGUAGE]?.[key]

export function getCurrentLanguage(): Language {
  return currentLanguage
}

function interpolate(
  str: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return str
  let out = str
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
  }
  return out
}

/** Translate outside React (uses the last-known UI language). */
export function translate(
  namespace: Namespace,
  key: string,
  vars?: Record<string, string | number>,
): string {
  return interpolate(lookup(namespace, currentLanguage, key) ?? key, vars)
}

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

const asLanguage = (code: string | null | undefined): Language | undefined =>
  LANGUAGES.find((l) => l.id === code?.toLowerCase().split('-')[0])?.id

// The language named in the URL ('/uk'), else the saved choice, else the first
// browser language the interface has.
function detectInitial(): Language {
  const fromUrl = parseRoute(window.location).lang
  if (fromUrl) return fromUrl
  const stored = LANGUAGES.find((l) => l.id === localStorage.getItem(STORAGE_KEY))
  if (stored) return stored.id
  for (const code of navigator.languages ?? [navigator.language]) {
    const match = asLanguage(code)
    if (match) return match
  }
  return DEFAULT_LANGUAGE
}

// Current UI language mirrored at module scope so non-React code (the store,
// services) can localize default content via translate(), and so the first
// view knows which strings to load before anything renders (App.tsx).
let currentLanguage: Language = typeof window === 'undefined' ? DEFAULT_LANGUAGE : detectInitial()

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(currentLanguage)

  // Switching waits for the new language's strings (a small chunk per view in
  // use); the last request wins, and a failed download leaves the language as is.
  const pending = useRef<Language | null>(null)
  const switchTo = useCallback((next: Language, remember: boolean) => {
    pending.current = next
    loadLanguage(next).then(
      () => {
        if (pending.current !== next) return
        currentLanguage = next
        setLangState(next)
        if (remember) localStorage.setItem(STORAGE_KEY, next)
      },
      () => {},
    )
  }, [])
  const setLang = useCallback((next: Language) => switchTo(next, true), [switchTo])

  useEffect(() => {
    currentLanguage = lang
    document.documentElement.lang = lang
  }, [lang])

  // Moving to a landing URL that names a language ('/uk': a link, Back /
  // Forward) switches to it for this visit; the saved choice is left alone.
  useEffect(() => {
    const onRoute = () => {
      const fromUrl = parseRoute(window.location).lang
      if (fromUrl) switchTo(fromUrl, false)
    }
    window.addEventListener('popstate', onRoute)
    window.addEventListener(ROUTE_EVENT, onRoute)
    return () => {
      window.removeEventListener('popstate', onRoute)
      window.removeEventListener(ROUTE_EVENT, onRoute)
    }
  }, [switchTo])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useLang(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLang must be used within I18nProvider')
  return ctx
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string

// Translation hook bound to a namespace. Returns t(key) → string in the current
// language (falling back to the key itself) and the current language. Supports {var} substitution.
export function useT(namespace: Namespace): { t: TFunction; lang: Language } {
  const { lang } = useLang()
  const t = useCallback<TFunction>(
    (key, vars) => {
      let str = lookup(namespace, lang, key) ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return str
    },
    [namespace, lang],
  )

  return { t, lang }
}
