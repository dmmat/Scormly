import { useEffect, useState } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { isFileSystemAccessSupported } from '../../lib/fileSystem'
import {
  createNewProject,
  openExistingProject,
  openRecentProject,
  NoProjectError,
} from '../../lib/projectService'
import {
  listRecentProjects,
  forgetRecentProject,
  type RecentProject,
} from '../../lib/recentProjects'

interface WelcomeScreenProps {
  /** Continue into the builder without a folder (in-memory, no saving). */
  onSkip: () => void
}

export default function WelcomeScreen({ onSkip }: WelcomeScreenProps) {
  const { t } = useT('welcome')
  const supported = isFileSystemAccessSupported()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recents, setRecents] = useState<RecentProject[]>([])

  useEffect(() => {
    if (supported) void listRecentProjects().then(setRecents)
  }, [supported])

  async function run(action: () => Promise<void>) {
    setError(null)
    setBusy(true)
    try {
      await action()
    } catch (err) {
      // User dismissing the OS picker is not an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        // ignore
      } else if (err instanceof NoProjectError) {
        setError(t('noProject'))
      } else {
        setError(t('genericError'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="#/" aria-label="Scormly">
          <Logo />
        </a>
        <LanguagePicker />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Scorm<span className="text-brand">ly</span>
            </h1>
            <p className="mt-2 text-gray-500">{t('tagline')}</p>
          </div>

          {!supported && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">{t('unsupportedTitle')}</p>
              <p className="mt-1">{t('unsupportedText')}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <WelcomeCard
              icon="✚"
              title={t('createTitle')}
              text={t('createText')}
              cta={t('createCta')}
              disabled={!supported || busy}
              onClick={() => run(createNewProject)}
            />
            <WelcomeCard
              icon="📂"
              title={t('openTitle')}
              text={t('openText')}
              cta={t('openCta')}
              disabled={!supported || busy}
              onClick={() => run(openExistingProject)}
            />
          </div>

          {recents.length > 0 && (
            <div className="mt-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('recentTitle')}
              </p>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {recents.map((r) => (
                  <li key={r.name} className="flex items-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => openRecentProject(r.handle))}
                      className="flex flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span aria-hidden className="text-brand">📁</span>
                      <span className="truncate text-sm font-medium text-gray-800">
                        {r.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      title={t('removeRecent')}
                      aria-label={t('removeRecent')}
                      onClick={async () => {
                        await forgetRecentProject(r.name)
                        setRecents(await listRecentProjects())
                      }}
                      className="px-3 py-3 text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!supported && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onSkip}
                className="btn-secondary text-sm"
              >
                {t('tryAnyway')}
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            🔒 {t('privacyNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

interface WelcomeCardProps {
  icon: string
  title: string
  text: string
  cta: string
  disabled?: boolean
  onClick: () => void
}

function WelcomeCard({ icon, title, text, cta, disabled, onClick }: WelcomeCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl text-brand">
        <span aria-hidden>{icon}</span>
      </div>
      <h2 className="mt-5 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{text}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="btn-primary mt-5 text-sm disabled:opacity-40"
      >
        {cta}
      </button>
    </div>
  )
}
