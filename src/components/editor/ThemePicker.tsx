import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { THEME_LIST, THEMES, DEFAULT_THEME } from '../../theme/themes'
import { useT } from '../../i18n/I18nProvider'

// Switcher for the project's global theme.
export default function ThemePicker() {
  const theme = useCourseStore((s) => s.course.theme)
  const setTheme = useCourseStore((s) => s.setTheme)
  const { t } = useT('common')
  const { t: tt } = useT('themes')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Fall back for legacy/unknown theme ids saved in older projects.
  const current = THEMES[theme] ?? THEMES[DEFAULT_THEME]

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('projectTheme')}
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        <span
          className="h-4 w-4 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: current.accent }}
        />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('projectTheme')}
          </p>
          {THEME_LIST.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => {
                setTheme(th.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50 ${
                th.id === theme ? 'bg-gray-50' : ''
              }`}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: th.accent }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-800">
                  {th.label}
                  {th.id === theme && <span className="ml-1.5 text-brand">✓</span>}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {tt(`${th.id}Desc`)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
