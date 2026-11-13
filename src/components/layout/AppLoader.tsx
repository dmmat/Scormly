import { LOGO_GLYPH } from './logoMark'
import { useLang } from '../../i18n/I18nProvider'
import type { Language } from '../../i18n/types'

// Its own text: this screen shows while the interface strings are still loading.
const LOADING: Record<Language, string> = {
  en: 'Loading the editor…',
  uk: 'Завантажуємо редактор…',
  fr: 'Chargement de l’éditeur…',
  es: 'Cargando el editor…',
  de: 'Der Editor wird geladen …',
}

// Shown while the builder's code downloads (App.tsx). /app and /demo ship the
// same screen in their HTML (scripts/seoPrerender.ts), so the page doesn't
// change between the first paint and this one: keep the markup in step.
export default function AppLoader() {
  const { lang } = useLang()
  return (
    <div className="app-loader" role="status">
      <div className="app-loader-mark">
        <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="#EC4899" />
          <path d={LOGO_GLYPH} fill="#fff" />
        </svg>
        <span className="app-loader-brand">
          Scorm<span>ly</span>
        </span>
      </div>
      <div className="app-loader-page" aria-hidden="true">
        <i className="app-loader-title" />
        <i className="app-loader-line" />
        <i className="app-loader-line short" />
        <i className="app-loader-image" />
        <i className="app-loader-btn" />
      </div>
      <span className="sr-only">{LOADING[lang]}</span>
    </div>
  )
}
