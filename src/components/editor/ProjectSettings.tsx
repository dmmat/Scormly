import {
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { useDialog } from '../../hooks/useDialog'
import { useCourseStore } from '../../store/courseStore'
import { useLang, useT } from '../../i18n/I18nProvider'
import { THEME_LIST } from '../../theme/themes'
import { saveAsset, toastUploadError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import {
  DEFAULT_COURSE_SETTINGS,
  isScoredBlock,
  type CompletionRule,
  type NavigationMode,
  type PlayerLanguage,
} from '../../types/course'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

type TabId = 'general' | 'appearance' | 'learner' | 'completion'
const TABS: TabId[] = ['general', 'appearance', 'learner', 'completion']
const TAB_LABEL_KEY: Record<TabId, string> = {
  general: 'tabGeneral',
  appearance: 'tabAppearance',
  learner: 'tabLearner',
  completion: 'tabCompletion',
}

// Suggestions for the content language field (any BCP 47 tag is accepted).
const COMMON_LANGUAGES = [
  'en', 'uk', 'de', 'fr', 'es', 'it', 'pl', 'pt', 'pt-BR', 'nl', 'cs', 'sk',
  'ro', 'hu', 'bg', 'hr', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'da', 'no',
  'el', 'tr', 'ka', 'kk', 'ar', 'he', 'hi', 'ja', 'ko', 'zh-Hans', 'zh-Hant',
]

function isValidLanguageTag(tag: string): boolean {
  try {
    return Intl.getCanonicalLocales(tag).length === 1
  } catch {
    return false
  }
}

// Module-level so the last opened tab survives closing/reopening the dialog
// within the same session.
let lastTab: TabId = 'general'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20'

// Tabs sit on top (horizontal) on phones and on the left (vertical) from `sm`.
const DESKTOP_QUERY = '(min-width: 640px)'
function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches

// Project settings modal: tabbed sections for course info, theme, learner
// experience (player behaviour) and SCORM completion/scoring rules.
export default function ProjectSettings({ onClose }: { onClose: () => void }) {
  const { t } = useT('settings')
  const [tab, setTabState] = useState<TabId>(lastTab)
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({})
  const vertical = useSyncExternalStore(subscribeDesktop, isDesktop, () => true)

  const dialogRef = useRef<HTMLDivElement>(null)
  useDialog(dialogRef, onClose)

  function setTab(id: TabId) {
    lastTab = id
    setTabState(id)
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = TABS.indexOf(tab)
    let next: number
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (i + 1) % TABS.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (i - 1 + TABS.length) % TABS.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = TABS.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    setTab(TABS[next])
    tabRefs.current[TABS[next]]?.focus()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="flex h-[min(820px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <h2 id="settings-title" className="text-lg font-semibold text-gray-900">
            {t('title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <div
            role="tablist"
            aria-label={t('tabsLabel')}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-3 py-2 sm:w-64 sm:flex-col sm:overflow-x-visible sm:border-b-0 sm:border-r sm:px-3 sm:py-4"
          >
            {TABS.map((id) => {
              const selected = tab === id
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`settings-tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`settings-panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={onTabKey}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-brand sm:py-2.5 ${
                    selected
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                  }`}
                >
                  <span className={selected ? 'text-brand' : 'text-gray-400'}>
                    <TabIcon id={id} />
                  </span>
                  {t(TAB_LABEL_KEY[id])}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`settings-panel-${tab}`}
            aria-labelledby={`settings-tab-${tab}`}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8"
          >
            {tab === 'general' && <GeneralPanel />}
            {tab === 'appearance' && <AppearancePanel />}
            {tab === 'learner' && <LearnerPanel />}
            {tab === 'completion' && <CompletionPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralPanel() {
  const course = useCourseStore((s) => s.course)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const updateSettings = useCourseStore((s) => s.updateSettings)
  const { t } = useT('settings')
  const { lang } = useLang()
  const contentLanguage = course.settings?.contentLanguage ?? ''
  const languageInvalid = contentLanguage.trim() !== '' && !isValidLanguageTag(contentLanguage.trim())
  let languageNames: Intl.DisplayNames | null = null
  try {
    languageNames = new Intl.DisplayNames([lang], { type: 'language' })
  } catch {
    // Older engines: suggestions fall back to the bare codes.
  }
  const coverUrl = useAssetUrl(course.coverImage ?? '')

  async function pickCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      updateCourseMeta({ coverImage: src })
    } catch (err) {
      toastUploadError(err)
    }
  }

  return (
    <Panel intro={t('generalIntro')}>
      <Field label={t('courseTitle')} htmlFor="settings-course-title">
        <input
          id="settings-course-title"
          type="text"
          value={course.title}
          placeholder={t('titlePlaceholder')}
          onChange={(e) => updateCourseMeta({ title: e.target.value })}
          className={inputClass}
        />
      </Field>

      <Field label={t('description')} htmlFor="settings-course-description">
        <textarea
          id="settings-course-description"
          rows={4}
          value={course.description}
          placeholder={t('descriptionPlaceholder')}
          onChange={(e) => updateCourseMeta({ description: e.target.value })}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field
        label={t('contentLanguage')}
        htmlFor="settings-content-language"
        help={t('contentLanguageHelp')}
      >
        <input
          id="settings-content-language"
          type="text"
          list="settings-content-language-list"
          value={contentLanguage}
          placeholder="en"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={languageInvalid || undefined}
          aria-describedby={languageInvalid ? 'settings-content-language-error' : undefined}
          onChange={(e) => updateSettings({ contentLanguage: e.target.value.trim() }, 'content-language')}
          className={`${inputClass} sm:w-auto sm:min-w-80`}
        />
        <datalist id="settings-content-language-list">
          {COMMON_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {languageNames?.of(code) ?? code}
            </option>
          ))}
        </datalist>
        {languageInvalid && (
          <span id="settings-content-language-error" className="mt-1.5 block text-sm text-red-600">
            {t('contentLanguageInvalid')}
          </span>
        )}
      </Field>

      <Group label={t('cover')} help={t('coverHelp')}>
        {course.coverImage ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <img
              src={coverUrl}
              alt=""
              className="aspect-video w-full rounded-xl border border-gray-200 bg-gray-50 object-cover shadow-sm sm:w-96"
            />
            <div className="flex gap-2">
              <label className="btn-secondary cursor-pointer text-sm focus-within:outline-2 focus-within:outline-brand">
                {t('replaceCover')}
                <input type="file" accept={IMAGE_ACCEPT} onChange={pickCover} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={() => updateCourseMeta({ coverImage: undefined })}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                {t('removeCover')}
              </button>
            </div>
          </div>
        ) : (
          <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 text-gray-500 transition focus-within:border-brand hover:border-brand hover:text-brand sm:w-96">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-8 w-8" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.8" />
              <path d="m21 16-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium">{t('addCover')}</span>
            <span className="text-xs text-gray-400">{t('coverDrop')}</span>
            <input type="file" accept={IMAGE_ACCEPT} onChange={pickCover} className="sr-only" />
          </label>
        )}
      </Group>
    </Panel>
  )
}

function AppearancePanel() {
  const theme = useCourseStore((s) => s.course.theme)
  const setTheme = useCourseStore((s) => s.setTheme)
  const { t } = useT('settings')

  return (
    <Panel intro={t('appearanceIntro')}>
      <Group label={t('theme')} radio>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEME_LIST.map((th) => {
            const checked = theme === th.id
            return (
              <label
                key={th.id}
                // data-theme scopes the theme's accent and radius tokens to
                // this card, so the sample button renders in that theme.
                data-theme={th.id}
                className={`relative flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-brand/40 ${
                  checked ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="settings-theme"
                  value={th.id}
                  checked={checked}
                  onChange={() => setTheme(th.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 shrink-0 rounded-full bg-brand shadow-inner ring-4 ring-brand-light/50" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-gray-900">{th.label}</span>
                    {checked && (
                      <span className="block text-xs font-medium text-brand-dark">{t('themeCurrent')}</span>
                    )}
                  </span>
                  <RadioDot checked={checked} />
                </div>
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="btn-primary pointer-events-none text-sm">{t('themeSample')}</span>
                  <span className="btn-secondary pointer-events-none text-sm">{t('themeSample')}</span>
                </div>
              </label>
            )
          })}
        </div>
      </Group>
    </Panel>
  )
}

function LearnerPanel() {
  const stored = useCourseStore((s) => s.course.settings)
  const updateSettings = useCourseStore((s) => s.updateSettings)
  const { t } = useT('settings')
  const settings = stored ?? DEFAULT_COURSE_SETTINGS

  return (
    <Panel intro={t('learnerIntro')}>
      <Group label={t('navigationLabel')} radio>
        <RadioCards<NavigationMode>
          name="settings-navigation"
          value={settings.navigation ?? 'free'}
          onChange={(navigation) => updateSettings({ navigation })}
          options={[
            ['free', t('navFree'), t('navFreeHelp')],
            ['linear', t('navLinear'), t('navLinearHelp')],
          ]}
        />
      </Group>

      <Field label={t('playerLanguage')} htmlFor="settings-player-language" help={t('playerLanguageHelp')}>
        <select
          id="settings-player-language"
          value={settings.playerLanguage ?? 'auto'}
          onChange={(e) => updateSettings({ playerLanguage: e.target.value as PlayerLanguage })}
          className={`${inputClass} sm:w-auto sm:min-w-80`}
        >
          <option value="auto">{t('playerLangAuto')}</option>
          <option value="en">{t('playerLangEn')}</option>
          <option value="uk">{t('playerLangUk')}</option>
        </select>
      </Field>

      <Toggle
        checked={settings.showProgress !== false}
        onChange={(showProgress) => updateSettings({ showProgress })}
        label={t('showProgressLabel')}
        help={t('showProgressHelp')}
      />

      <Field label={t('finishMessage')} htmlFor="settings-finish-message" help={t('finishMessageHelp')}>
        <textarea
          id="settings-finish-message"
          rows={3}
          value={settings.finishMessage ?? ''}
          placeholder={t('finishMessageDefault')}
          onChange={(e) => updateSettings({ finishMessage: e.target.value }, 'finish-message')}
          className={`${inputClass} resize-y`}
        />
      </Field>
    </Panel>
  )
}

function CompletionPanel() {
  const course = useCourseStore((s) => s.course)
  const updateSettings = useCourseStore((s) => s.updateSettings)
  const { t } = useT('settings')
  const settings = course.settings ?? DEFAULT_COURSE_SETTINGS
  const hasQuiz = course.lessons.some((l) => l.blocks.some(isScoredBlock))

  const setScore = (v: number) =>
    updateSettings({ passingScore: Math.max(0, Math.min(100, Math.round(v) || 0)) }, 'passing-score')

  return (
    <Panel intro={t('completionIntro')}>
      <Group label={t('completionLabel')} radio>
        <RadioCards<CompletionRule>
          name="settings-completion"
          value={settings.completion}
          onChange={(completion) => updateSettings({ completion })}
          options={[
            ['view', t('completionView'), t('completionViewHelp')],
            ['quiz', t('completionQuiz'), t('completionQuizHelp')],
          ]}
        />
      </Group>

      <Toggle
        checked={settings.scored}
        onChange={(scored) => updateSettings({ scored })}
        label={t('scoredLabel')}
        help={t('scoredHelp')}
      />

      {settings.scored && (
        <Group label={t('passingScore')} help={t('passingScoreHelp')}>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.passingScore}
              aria-label={t('passingScore')}
              onChange={(e) => setScore(Number(e.target.value))}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-brand"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={100}
                value={settings.passingScore}
                aria-label={t('passingScore')}
                onChange={(e) => setScore(Number(e.target.value))}
                className={`${inputClass} w-20 text-center tabular-nums`}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          {!hasQuiz && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
              {t('noQuizNote')}
            </p>
          )}
        </Group>
      )}
    </Panel>
  )
}

// ── Building blocks ─────────────────────────────────────────────────────────

function Panel({ intro, children }: { intro: string; children: ReactNode }) {
  return (
    <div className="space-y-7">
      <p className="text-sm text-gray-500">{intro}</p>
      {children}
    </div>
  )
}

function Help({ children }: { children: ReactNode }) {
  return <span className="mt-1.5 block text-sm text-gray-500">{children}</span>
}

// A single labelled control.
function Field({
  label,
  htmlFor,
  help,
  children,
}: {
  label: string
  htmlFor: string
  help?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-900">
        {label}
      </label>
      {children}
      {help && <Help>{help}</Help>}
    </div>
  )
}

// A labelled group of controls (radiogroup when `radio`).
function Group({
  label,
  help,
  radio,
  children,
}: {
  label: string
  help?: string
  radio?: boolean
  children: ReactNode
}) {
  return (
    <fieldset role={radio ? 'radiogroup' : undefined} className="min-w-0">
      <legend className="mb-2 block text-sm font-medium text-gray-900">{label}</legend>
      {children}
      {help && <Help>{help}</Help>}
    </fieldset>
  )
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        checked ? 'border-brand' : 'border-gray-300'
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
    </span>
  )
}

function RadioCards<V extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string
  value: V
  onChange: (v: V) => void
  options: [V, string, string][]
}) {
  return (
    <div className="grid gap-3">
      {options.map(([v, label, help]) => {
        const checked = value === v
        return (
          <label
            key={v}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 transition focus-within:ring-2 focus-within:ring-brand/40 ${
              checked ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={checked}
              onChange={() => onChange(v)}
              className="sr-only"
            />
            <span className="mt-0.5">
              <RadioDot checked={checked} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-medium text-gray-900">{label}</span>
              <span className="mt-0.5 block text-sm text-gray-500">{help}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  help: string
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-gray-50">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <span className="mt-0.5 block text-sm text-gray-500">{help}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 ${
          checked ? 'bg-brand' : 'bg-gray-300'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`}
        />
      </span>
    </label>
  )
}

function TabIcon({ id }: { id: TabId }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-5 w-5',
    'aria-hidden': true,
  }
  switch (id) {
    case 'general':
      return (
        <svg {...common}>
          <path d="M4 5h16M4 10h16M4 15h10M4 20h6" />
        </svg>
      )
    case 'appearance':
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.3-4-7.7-9-7.7Z" />
          <circle cx="7.5" cy="11" r="1" />
          <circle cx="10.5" cy="7" r="1" />
          <circle cx="15" cy="7.5" r="1" />
        </svg>
      )
    case 'learner':
      return (
        <svg {...common}>
          <path d="M2 9l10-5 10 5-10 5L2 9Z" />
          <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
        </svg>
      )
    case 'completion':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      )
  }
}
