import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LANGUAGE, type Language } from './types'
import { DICTIONARY, type Namespace } from './dictionary'

const STORAGE_KEY = 'scormly-language'

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectInitial(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'uk') return stored
  return navigator.language.toLowerCase().startsWith('uk')
    ? 'uk'
    : DEFAULT_LANGUAGE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectInitial)

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

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
  const table = DICTIONARY[namespace][lang]

  const t = useCallback<TFunction>(
    (key, vars) => {
      let str = table[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return str
    },
    [table],
  )

  return { t, lang }
}
