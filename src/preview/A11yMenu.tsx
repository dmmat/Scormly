import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useT } from '../i18n/I18nProvider'
import type { A11yPrefs, TextSize } from './a11y'

const SIZES: { id: TextSize; key: string }[] = [
  { id: 'normal', key: 'sizeNormal' },
  { id: 'large', key: 'sizeLarge' },
  { id: 'xlarge', key: 'sizeXLarge' },
]

// Header "Aa" button with a disclosure panel of learner accessibility
// settings. Esc closes the panel (without closing the preview) and returns
// focus to the button.
export default function A11yMenu({
  prefs,
  reduceMotion,
  onChange,
}: {
  prefs: A11yPrefs
  reduceMotion: boolean
  onChange: (patch: Partial<A11yPrefs>) => void
}) {
  const { t } = useT('a11y')
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const sizeName = useId()

  // Move focus into the panel on open; close on a click outside it.
  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('input')?.focus()
    function onPointer(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  function close() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      // Keep the preview dialog's own Esc handler (on document) from firing.
      e.stopPropagation()
      e.preventDefault()
      close()
    }
  }

  const toggles: { key: string; checked: boolean; patch: (v: boolean) => Partial<A11yPrefs> }[] = [
    { key: 'highContrast', checked: prefs.highContrast, patch: (v) => ({ highContrast: v }) },
    { key: 'spacing', checked: prefs.spacing, patch: (v) => ({ spacing: v }) },
    { key: 'reduceMotion', checked: reduceMotion, patch: (v) => ({ reduceMotion: v }) },
    { key: 'captions', checked: prefs.captions, patch: (v) => ({ captions: v }) },
  ]

  return (
    <div ref={wrapRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('menu')}
        title={t('menu')}
        className="flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 px-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
      >
        <span aria-hidden>Aa</span>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        role="group"
        aria-label={t('menu')}
        hidden={!open}
        className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-lg"
      >
        <fieldset>
          <legend className="mb-2 font-semibold">{t('textSize')}</legend>
          <div className="flex gap-1">
            {SIZES.map((s) => (
              <label
                key={s.id}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-2 py-1.5 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark ${
                  prefs.textSize === s.id
                    ? 'border-brand bg-brand/10 font-semibold text-brand-dark'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name={sizeName}
                  value={s.id}
                  checked={prefs.textSize === s.id}
                  onChange={() => onChange({ textSize: s.id })}
                  className="sr-only"
                />
                {t(s.key)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 space-y-2.5">
          {toggles.map((tg) => (
            <label key={tg.key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={tg.checked}
                onChange={(e) => onChange(tg.patch(e.target.checked))}
                className="h-4 w-4 accent-brand"
              />
              <span>{t(tg.key)}</span>
            </label>
          ))}
        </div>
        <button type="button" onClick={close} className="btn-secondary mt-4 w-full text-sm">
          {t('close')}
        </button>
      </div>
    </div>
  )
}
