import { useEffect, useState } from 'react'
import type { ThemeShape } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { DEFAULT_THEME, THEME_LIST, THEMES } from '../../theme/themes'
import {
  accentAdjusted,
  DEFAULT_CUSTOM_THEME,
  normalizeHex,
  THEME_SHAPES,
  themeStyle,
} from '../../theme/customTheme'
import { Segmented } from './controls'

// Compact theme choice for Project settings: a swatch per preset plus
// "Custom" (the author's accent color and corner shape), then one live
// sample of the current theme.
export default function ThemeChooser() {
  const theme = useCourseStore((s) => s.course.theme)
  const custom = useCourseStore((s) => s.course.customTheme)
  const setTheme = useCourseStore((s) => s.setTheme)
  const { t } = useT('settings')
  const isCustom = theme === 'custom'
  // Before the first switch, the Custom swatch previews the current preset's
  // color and shape, which is what it starts from.
  const preset = THEMES[theme === 'custom' ? DEFAULT_THEME : theme] ?? THEMES[DEFAULT_THEME]
  const customDraft = custom ?? { accent: preset.accent, shape: preset.shape }

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label={t('theme')} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {THEME_LIST.map((th) => (
          <Swatch
            key={th.id}
            label={th.label}
            checked={theme === th.id}
            onSelect={() => setTheme(th.id)}
            dataTheme={th.id}
          />
        ))}
        <Swatch
          label={t('themeCustom')}
          checked={isCustom}
          onSelect={() => setTheme('custom')}
          dataTheme="custom"
          style={themeStyle({ theme: 'custom', customTheme: customDraft })}
          rainbow={!custom}
        />
      </div>

      {isCustom && <CustomThemeEditor />}

      <div aria-hidden className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
        <span className="text-xs font-medium text-gray-500">{t('themePreview')}</span>
        <span className="btn-primary pointer-events-none text-sm">{t('themeSample')}</span>
        <span className="btn-secondary pointer-events-none text-sm">{t('themeSample')}</span>
        <span className="interactive-surface border border-brand/30 bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand-dark">
          {t('themeSampleCard')}
        </span>
      </div>
    </div>
  )
}

function Swatch({
  label,
  checked,
  onSelect,
  dataTheme,
  style,
  rainbow = false,
}: {
  label: string
  checked: boolean
  onSelect: () => void
  /** Scopes the theme's tokens to the swatch so it shows that theme. */
  dataTheme: string
  style?: React.CSSProperties
  /** "Any color" hint for a custom theme not set up yet. */
  rainbow?: boolean
}) {
  return (
    <label
      data-theme={dataTheme}
      style={style}
      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition focus-within:ring-2 focus-within:ring-brand/40 ${
        checked ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-gray-50'
      }`}
    >
      <input type="radio" name="settings-theme" checked={checked} onChange={onSelect} className="sr-only" />
      {/* The theme's button: its color and corner shape. */}
      <span
        aria-hidden
        className="h-7 w-full bg-brand shadow-inner"
        style={{
          borderRadius: 'var(--radius-btn)',
          ...(rainbow ? { background: 'conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)' } : {}),
        }}
      />
      <span className={`text-xs ${checked ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
    </label>
  )
}

function CustomThemeEditor() {
  const custom = useCourseStore((s) => s.course.customTheme) ?? DEFAULT_CUSTOM_THEME
  const update = useCourseStore((s) => s.updateCustomTheme)
  const { t } = useT('settings')
  const accent = normalizeHex(custom.accent) ?? DEFAULT_CUSTOM_THEME.accent
  // The hex field edits a draft; only valid colors reach the course.
  const [draft, setDraft] = useState(accent)
  useEffect(() => setDraft(accent), [accent])

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{t('customAccent')}</span>
          <input
            type="color"
            value={accent}
            aria-label={t('customAccent')}
            onChange={(e) => update({ accent: e.target.value }, 'custom-theme-accent')}
            className="h-8 w-10 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
          />
          <input
            type="text"
            value={draft}
            aria-label={t('customHex')}
            spellCheck={false}
            maxLength={7}
            onChange={(e) => {
              setDraft(e.target.value)
              const hex = normalizeHex(e.target.value)
              if (hex && e.target.value.replace('#', '').length === 6) update({ accent: hex }, 'custom-theme-accent')
            }}
            onBlur={() => setDraft(accent)}
            className="w-24 rounded-md border border-gray-300 px-2 py-1 font-mono text-sm outline-none focus:border-brand"
          />
        </div>
        <Segmented<ThemeShape>
          label={t('customShape')}
          value={custom.shape}
          onChange={(shape) => update({ shape })}
          options={THEME_SHAPES.map((s) => [s, t(`shape_${s}`)] as const)}
        />
      </div>
      {accentAdjusted({ ...custom, accent }) && <p className="text-xs text-amber-700">{t('customAdjusted')}</p>}
    </div>
  )
}
