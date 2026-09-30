import { createContext, useCallback, useContext, useState } from 'react'

// Learner accessibility preferences. Shared shape and storage key with the
// SCORM player so a learner's choices behave the same in preview and export.
export type TextSize = 'normal' | 'large' | 'xlarge'

export interface A11yPrefs {
  textSize: TextSize
  highContrast: boolean
  spacing: boolean
  /** Undefined = follow the OS `prefers-reduced-motion` setting. */
  reduceMotion?: boolean
  captions: boolean
}

const STORAGE_KEY = 'scormly-a11y'

const DEFAULTS: A11yPrefs = {
  textSize: 'normal',
  highContrast: false,
  spacing: false,
  captions: false,
}

function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const p = JSON.parse(raw) as Partial<A11yPrefs>
    return {
      textSize: p.textSize === 'large' || p.textSize === 'xlarge' ? p.textSize : 'normal',
      highContrast: p.highContrast === true,
      spacing: p.spacing === true,
      reduceMotion: typeof p.reduceMotion === 'boolean' ? p.reduceMotion : undefined,
      captions: p.captions === true,
    }
  } catch {
    return DEFAULTS
  }
}

function osPrefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Preferences state persisted to localStorage (every access guarded: storage
// can be blocked in private windows or sandboxed frames).
export function useA11yPrefs() {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs)

  const update = useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Not persisted; the setting still applies for this session.
      }
      return next
    })
  }, [])

  const reduceMotion = prefs.reduceMotion ?? osPrefersReducedMotion()
  return { prefs, reduceMotion, update }
}

/** CSS classes for the preview root (styles live in src/index.css). */
export function a11yClasses(prefs: A11yPrefs, reduceMotion: boolean): string {
  return [
    'a11y-root',
    prefs.textSize !== 'normal' && `a11y-text-${prefs.textSize}`,
    prefs.highContrast && 'a11y-contrast',
    prefs.spacing && 'a11y-spacing',
    reduceMotion && 'a11y-reduce-motion',
    // Explicit opt-out: don't force the OS reduced-motion fallback in CSS.
    prefs.reduceMotion === false && 'a11y-motion-ok',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Learner media preferences read by block previews (e.g. video captions). */
export const A11yContext = createContext<{ captions: boolean }>({ captions: false })

export function useA11yContext() {
  return useContext(A11yContext)
}
