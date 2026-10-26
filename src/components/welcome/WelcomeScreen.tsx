import { useEffect, useRef, useState, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { isFileSystemAccessSupported } from '../../lib/fileSystem'
import {
  createBrowserProject,
  createNewProject,
  openBrowserProject,
  openExistingProject,
  openRecentProject,
  NoProjectError,
} from '../../lib/projectService'
import {
  deleteBrowserProject,
  isBrowserStorageSupported,
  listBrowserProjects,
  type BrowserProject,
} from '../../lib/browserProjects'
import { openProjectZip, ZipProjectError } from '../../lib/importProjectZip'
import {
  listRecentProjects,
  forgetRecentProject,
  type RecentProject,
} from '../../lib/recentProjects'

interface WelcomeScreenProps {
  /** Continue into the builder without a folder (in-memory, no saving). */
  onSkip: () => void
  /** Open the built-in sample course (in memory). */
  onSample: () => void
}

export default function WelcomeScreen({ onSkip, onSample }: WelcomeScreenProps) {
  const { t } = useT('welcome')
  const supported = isFileSystemAccessSupported()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recents, setRecents] = useState<RecentProject[]>([])
  const zipInputRef = useRef<HTMLInputElement>(null)
  // Projects kept in the browser's own storage (see browserProjects).
  const inBrowser = isBrowserStorageSupported()
  const [browserProjects, setBrowserProjects] = useState<BrowserProject[]>([])

  useEffect(() => {
    if (supported) void listRecentProjects().then(setRecents)
  }, [supported])

  useEffect(() => {
    if (inBrowser) void listBrowserProjects().then(setBrowserProjects)
  }, [inBrowser])

  async function run(action: () => Promise<void>) {
    setError(null)
    setBusy(true)
    try {
      await action()
    } catch (err) {
      // User dismissing the OS picker is not an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        // ignore
      } else if (err instanceof ZipProjectError) {
        setError(t(`zip_${err.reason}`, { detail: err.detail }))
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
        <Logo />
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

          {/* Returning authors see their projects first. */}
          {browserProjects.length > 0 && (
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('browserListTitle')}
              </p>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {browserProjects.map((p) => (
                  <li key={p.id} className="flex items-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => openBrowserProject(p.id))}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span aria-hidden className="text-brand">🗂️</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-800">{p.title}</span>
                        <span className="block text-xs text-gray-400">
                          {t('updatedAgo', { when: new Date(p.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) })}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      title={t('deleteBrowserProject')}
                      aria-label={`${t('deleteBrowserProject')}: ${p.title}`}
                      onClick={async () => {
                        if (!window.confirm(t('deleteBrowserConfirm', { title: p.title }))) return
                        await deleteBrowserProject(p.id)
                        setBrowserProjects(await listBrowserProjects())
                      }}
                      className="px-3 py-3 text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-400">{t('browserListHint')}</p>
            </div>
          )}

          {recents.length > 0 && (
            <div className="mb-8">
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

          {/* No folder access needed: a .zip project, or a project that lives in
              this tab and is saved by downloading a .zip. */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <WelcomeRow icon="📦" title={t('zipTitle')} text={t('zipText')} disabled={busy} onClick={() => zipInputRef.current?.click()} />
            {inBrowser ? (
              <WelcomeRow icon="🗂️" title={t('browserTitle')} text={t('browserText')} disabled={busy} onClick={() => run(createBrowserProject)} />
            ) : (
              <WelcomeRow icon="📝" title={t('startTitle')} text={t('startText')} disabled={busy} onClick={onSkip} />
            )}
          </div>
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void run(() => openProjectZip(file))
            }}
          />

          <WelcomeRow
            icon="🎓"
            title={t('sampleTitle')}
            text={t('sampleText')}
            disabled={busy}
            onClick={onSample}
            className="mt-5"
          />

          {busy && (
            <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
              {t('opening')}
            </p>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            🔒 {t('privacyNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

// A full-width row button: icon, title and a line of text.
function WelcomeRow({
  icon,
  title,
  text,
  disabled,
  onClick,
  className = '',
}: {
  icon: ReactNode
  title: string
  text: string
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`interactive-surface flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-brand/40 disabled:opacity-50 ${className}`}
    >
      <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-gray-900">{title}</span>
        <span className="mt-1 block text-sm text-gray-600">{text}</span>
      </span>
      <span aria-hidden className="text-brand">→</span>
    </button>
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
