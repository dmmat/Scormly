import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { isFileSystemAccessSupported } from '../../lib/fileSystem'
import { KEYS } from '../../lib/keyboard'
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

/** Where a new course lives. 'tab' (in memory, saved as a .zip) is only
 *  offered where the browser can't keep projects itself. */
type Storage = 'browser' | 'folder' | 'tab'

// The same rows for every storage, so switching between them shows the
// difference (texts: fact_<row> and fact_<row>_<storage>).
const FACT_ROWS = ['autosave', 'keeps', 'files', 'setup', 'browsers'] as const
type Mark = 'yes' | 'no' | 'some'
const MARKS: Record<Storage, Record<(typeof FACT_ROWS)[number], Mark>> = {
  browser: { autosave: 'yes', keeps: 'yes', files: 'no', setup: 'yes', browsers: 'yes' },
  folder: { autosave: 'yes', keeps: 'yes', files: 'yes', setup: 'some', browsers: 'some' },
  tab: { autosave: 'no', keeps: 'no', files: 'no', setup: 'yes', browsers: 'yes' },
}

/** A project to continue: one in this browser or a recently used folder. */
type ProjectItem =
  | { kind: 'browser'; key: string; title: string; at: number; project: BrowserProject }
  | { kind: 'folder'; key: string; title: string; at: number; recent: RecentProject }

export default function WelcomeScreen({ onSkip, onSample }: WelcomeScreenProps) {
  const { t } = useT('welcome')
  const folders = isFileSystemAccessSupported()
  // Projects kept in the browser's own storage (see browserProjects).
  const inBrowser = isBrowserStorageSupported()
  const available: Record<Storage, boolean> = { browser: inBrowser, folder: folders, tab: true }
  const storages: Storage[] = inBrowser ? ['browser', 'folder'] : ['tab', 'folder']
  const [choice, setChoice] = useState<Storage>(inBrowser ? 'browser' : 'tab')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recents, setRecents] = useState<RecentProject[]>([])
  const [browserProjects, setBrowserProjects] = useState<BrowserProject[]>([])
  const zipInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<Partial<Record<Storage, HTMLButtonElement | null>>>({})
  // Drag-and-drop of a .zip anywhere on the page (dragenter / leave fire for
  // every child, so count the depth).
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)

  // Returning authors get their projects first and the new-course choice
  // folded away, so wait for both lists before showing either layout.
  const [loaded, setLoaded] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const newRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let active = true
    void Promise.all([
      folders ? listRecentProjects().catch(() => []) : [],
      inBrowser ? listBrowserProjects() : [],
    ]).then(([r, b]) => {
      if (!active) return
      setRecents(r)
      setBrowserProjects(b)
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [folders, inBrowser])

  useEffect(() => {
    if (newOpen) newRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [newOpen])

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

  function create() {
    if (choice === 'browser') void run(createBrowserProject)
    else if (choice === 'folder') void run(createNewProject)
    else onSkip()
  }

  // Radio group keyboard behaviour: arrows move the choice.
  function onOptionsKey(e: KeyboardEvent) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = storages[(storages.indexOf(choice) + step + storages.length) % storages.length]
    setChoice(next)
    optionRefs.current[next]?.focus()
  }

  const hasFiles = (e: DragEvent) => e.dataTransfer.types.includes('Files')
  const dropHandlers = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current += 1
      setDragging(true)
    },
    onDragOver: (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragging(false)
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && !busy) void run(() => openProjectZip(file))
    },
  }

  const projects: ProjectItem[] = [
    ...browserProjects.map((p): ProjectItem => ({ kind: 'browser', key: `b:${p.id}`, title: p.title, at: p.updatedAt, project: p })),
    ...recents.map((r): ProjectItem => ({ kind: 'folder', key: `f:${r.name}`, title: r.name, at: r.lastOpened, recent: r })),
  ].sort((a, b) => b.at - a.at)
  const returning = projects.length > 0
  const showNew = !returning || newOpen

  return (
    <div className="welcome-bg relative h-full overflow-y-auto" {...dropHandlers}>
      <div className="flex items-center justify-between px-6 py-4">
        <Logo />
        <LanguagePicker />
      </div>

      <main className={`mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10 ${loaded ? '' : 'invisible'}`}>
        <div className="ws-in text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {returning ? t('heroBack') : t('heroTitle')}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            {returning ? t('heroBackText') : t('heroText')}
          </p>
          <button
            type="button"
            onClick={onSample}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-sm text-gray-700 shadow-sm backdrop-blur transition hover:border-brand/40 hover:text-brand-dark disabled:opacity-50"
          >
            <CapIcon />
            {t('demoLink')}
            <span aria-hidden className="text-brand">→</span>
          </button>
        </div>

        {error && (
          <div role="alert" className="mx-auto mt-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Returning authors see their projects first. */}
        {returning && (
          <section className="ws-in mt-10" aria-labelledby="ws-projects">
            <SectionTitle id="ws-projects">{t('continueTitle')}</SectionTitle>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <li className="min-w-0">
                <button
                  type="button"
                  aria-expanded={newOpen}
                  aria-controls="ws-new-section"
                  onClick={() => setNewOpen((v) => !v)}
                  className={`flex h-full w-full items-center gap-3 rounded-2xl border-2 border-dashed p-4 text-left transition ${
                    newOpen ? 'border-brand bg-brand/5' : 'border-gray-300 bg-white/60 hover:border-brand/50 hover:bg-white'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${
                    newOpen ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                  }`}>
                    <span aria-hidden className={`transition-transform ${newOpen ? 'rotate-45' : ''}`}>+</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-gray-900">{t('newCourse')}</span>
                    <span className="block truncate text-xs text-gray-500">{t('newCourseText')}</span>
                  </span>
                </button>
              </li>
              {projects.map((item) => (
                <ProjectCard key={item.key} item={item} busy={busy} run={run}
                  onRemoved={async () => {
                    if (item.kind === 'browser') setBrowserProjects(await listBrowserProjects())
                    else setRecents(await listRecentProjects())
                  }}
                />
              ))}
            </ul>
            {browserProjects.length > 0 && <p className="mt-2 text-xs text-gray-400">{t('browserListHint')}</p>}
          </section>
        )}

        {showNew && (
        <section ref={newRef} id="ws-new-section" className="ws-in mt-12 scroll-mt-6" aria-labelledby="ws-new" style={{ animationDelay: returning ? undefined : '0.08s' }}>
          <SectionTitle id="ws-new" large={!returning}>{t('newTitle')}</SectionTitle>

          <div role="radiogroup" aria-labelledby="ws-new" onKeyDown={onOptionsKey} className="mt-4 grid gap-3 sm:grid-cols-2">
            {storages.map((s) => (
              <StorageOption
                key={s}
                storage={s}
                selected={choice === s}
                available={available[s]}
                buttonRef={(el) => { optionRefs.current[s] = el }}
                onSelect={() => setChoice(s)}
                onActivate={create}
              />
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="ws-scene-bg flex min-h-[15rem] items-center justify-center border-b border-gray-100 p-8 md:border-b-0 md:border-r">
                <Scene key={choice} storage={choice} />
              </div>
              <div key={choice} className="ws-in p-6 sm:p-8" aria-live="polite">
                <p className="text-[15px] leading-relaxed text-gray-700">{t(`st_${choice}_text`)}</p>
                <dl className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
                  {FACT_ROWS.map((row) => (
                    <div key={row} className="flex items-start gap-3 py-2.5 text-sm">
                      <MarkIcon mark={MARKS[choice][row]} />
                      <dt className="w-40 shrink-0 font-medium text-gray-900 max-sm:w-28">{t(`fact_${row}`)}</dt>
                      <dd className="min-w-0 text-gray-600">{t(`fact_${row}_${choice}`)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <button
                    type="button"
                    onClick={create}
                    disabled={!available[choice] || busy}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 shadow-sm shadow-brand/20"
                  >
                    {t(`st_${choice}_cta`)}
                    <span aria-hidden>→</span>
                  </button>
                  <p className={`min-w-0 flex-1 basis-56 text-xs leading-relaxed ${available[choice] ? 'text-gray-500' : 'text-amber-700'}`}>
                    {available[choice] ? t(`st_${choice}_hint`, { key: KEYS.save }) : t(`st_${choice}_unsupported`)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {inBrowser && (
            <p className="mt-4 flex gap-2 text-sm text-gray-500">
              <span aria-hidden>💡</span>
              <span>{t('newHint')}</span>
            </p>
          )}
        </section>
        )}

        <section className="ws-in mt-12" aria-labelledby="ws-open" style={{ animationDelay: '0.16s' }}>
          <SectionTitle id="ws-open">{t('haveTitle')}</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <OpenTile
              icon={<FolderOpenIcon />}
              title={t('openFolderTitle')}
              text={folders ? t('openFolderText') : t('openFolderUnsupported')}
              disabled={!folders || busy}
              onClick={() => run(openExistingProject)}
            />
            <OpenTile
              icon={<ZipIcon />}
              title={t('openZipTitle')}
              text={t('openZipText')}
              disabled={busy}
              dashed
              onClick={() => zipInputRef.current?.click()}
            />
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
        </section>

        {busy && (
          <p role="status" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
            {t('opening')}
          </p>
        )}

        <p className="mt-12 text-center text-xs text-gray-400">
          🔒 {t('privacyNote')}
        </p>
      </main>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand/10 p-6 backdrop-blur-sm">
          <div className="pop-in flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-brand bg-white/90 px-12 py-10 text-center shadow-xl">
            <span className="ws-bounce flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
              <ZipIcon className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold text-gray-900">{t('dropTitle')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ id, large, children }: { id: string; large?: boolean; children: ReactNode }) {
  return large ? (
    <h2 id={id} className="text-center text-xl font-semibold text-gray-900">{children}</h2>
  ) : (
    <h2 id={id} className="text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</h2>
  )
}

function StorageOption({
  storage,
  selected,
  available,
  buttonRef,
  onSelect,
  onActivate,
}: {
  storage: Storage
  selected: boolean
  available: boolean
  buttonRef: (el: HTMLButtonElement | null) => void
  onSelect: () => void
  onActivate: () => void
}) {
  const { t } = useT('welcome')
  const badge =
    storage === 'browser' ? { text: t('st_browser_badge'), strong: true }
    : storage === 'folder' ? { text: available ? t('st_folder_badge') : t('st_folder_badgeUnsupported'), strong: false }
    : null
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      // A double click goes straight on: the choice is obvious by then.
      onDoubleClick={() => available && onActivate()}
      className={`group relative flex flex-col items-start rounded-2xl border-2 bg-white p-5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
        selected
          ? 'border-brand shadow-lg shadow-brand/10 sm:-translate-y-1'
          : 'border-transparent shadow-sm ring-1 ring-gray-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-gray-300'
      }`}
    >
      {badge && (
        <span className={`absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${
          badge.strong ? 'bg-brand text-white' : 'border border-gray-200 bg-white text-gray-600'
        }`}>
          {badge.text}
        </span>
      )}
      <span className="flex w-full items-start justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          selected ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
        } ${available ? '' : 'opacity-60'}`}>
          <StorageIcon storage={storage} />
        </span>
        <span aria-hidden className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white'
        }`}>
          {selected && (
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
          )}
        </span>
      </span>
      <span className={`mt-4 text-base font-semibold ${available ? 'text-gray-900' : 'text-gray-500'}`}>{t(`st_${storage}_title`)}</span>
      <span className="mt-1 text-sm text-gray-500">{t(`st_${storage}_tagline`)}</span>
    </button>
  )
}

function ProjectCard({
  item,
  busy,
  run,
  onRemoved,
}: {
  item: ProjectItem
  busy: boolean
  run: (action: () => Promise<void>) => Promise<void>
  onRemoved: () => Promise<void>
}) {
  const { t, lang } = useT('welcome')
  const when = formatWhen(item.at, lang)
  const removeLabel = item.kind === 'browser' ? t('deleteBrowserProject') : t('removeRecent')
  return (
    <li className="relative min-w-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => item.kind === 'browser' ? openBrowserProject(item.project.id) : openRecentProject(item.recent.handle))}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 pr-10 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md disabled:opacity-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <StorageIcon storage={item.kind} small />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-gray-900">{item.title}</span>
          <span className="block truncate text-xs text-gray-500">
            {item.kind === 'browser' ? t('kindBrowser') : t('kindFolder')}
            {' · '}
            {item.kind === 'browser' ? t('updatedAgo', { when }) : t('openedAgo', { when })}
          </span>
        </span>
      </button>
      <button
        type="button"
        title={removeLabel}
        aria-label={`${removeLabel}: ${item.title}`}
        onClick={async () => {
          if (item.kind === 'browser') {
            if (!window.confirm(t('deleteBrowserConfirm', { title: item.title }))) return
            await deleteBrowserProject(item.project.id)
          } else {
            await forgetRecentProject(item.recent.name)
          }
          await onRemoved()
        }}
        className="absolute right-2 top-2 rounded-md p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="m4 4 8 8M12 4l-8 8" />
        </svg>
      </button>
    </li>
  )
}

// Today: just the time; earlier: the date.
function formatWhen(at: number, lang: string): string {
  const d = new Date(at)
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString(lang, { timeStyle: 'short' })
    : d.toLocaleDateString(lang, { dateStyle: 'medium' })
}

function OpenTile({
  icon,
  title,
  text,
  disabled,
  dashed,
  onClick,
}: {
  icon: ReactNode
  title: string
  text: string
  disabled?: boolean
  dashed?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-4 rounded-2xl border bg-white/70 p-4 text-left transition hover:border-brand/50 hover:bg-white disabled:opacity-50 disabled:hover:border-gray-300 ${
        dashed ? 'border-2 border-dashed border-gray-300' : 'border-gray-200'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-gray-900">{title}</span>
        <span className="mt-0.5 block text-sm text-gray-500">{text}</span>
      </span>
      <span aria-hidden className="text-gray-400">→</span>
    </button>
  )
}

function MarkIcon({ mark }: { mark: Mark }) {
  const style =
    mark === 'yes' ? 'bg-emerald-100 text-emerald-700' : mark === 'no' ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700'
  return (
    <span aria-hidden className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style}`}>
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {mark === 'yes' ? <path d="m3.5 8.5 3 3 6-7" /> : mark === 'no' ? <path d="m5 5 6 6M11 5l-6 6" /> : <path d="M4.5 8h7" />}
      </svg>
    </span>
  )
}

// ── Scenes: a small animated picture of where the course goes ──

function Scene({ storage }: { storage: Storage }) {
  return (
    <div className="ws-in w-full max-w-[16rem]" aria-hidden>
      {storage === 'browser' ? <BrowserScene /> : storage === 'folder' ? <FolderScene /> : <TabScene />}
    </div>
  )
}

function BrowserScene() {
  const { t } = useT('welcome')
  return (
    <div className="ws-float relative rounded-xl border border-gray-200 bg-white shadow-xl shadow-brand/10">
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-gray-200" />
        <span className="h-2 w-2 rounded-full bg-gray-200" />
        <span className="h-2 w-2 rounded-full bg-gray-200" />
        <span className="ml-2 h-4 flex-1 rounded-full bg-gray-100 px-2 text-[9px] leading-4 text-gray-400">scormly</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-1/2 rounded bg-gray-700" />
        <div className="h-2 w-full rounded bg-gray-200" />
        <div className="h-2 w-5/6 rounded bg-gray-200" />
        <div className="ws-typing h-2 rounded bg-brand/50" />
      </div>
      <div className="relative mx-3 mb-3 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-[11px] font-medium text-brand-dark">
        <span className="ws-drop absolute -top-3 left-6 h-2.5 w-6 rounded-sm bg-brand" />
        <DatabaseIcon />
        {t('scene_storage')}
        <span className="ws-saved ml-auto rounded-full bg-emerald-500 px-1.5 py-px text-[10px] text-white">✓ {t('saved')}</span>
      </div>
    </div>
  )
}

function FolderScene() {
  const { t } = useT('welcome')
  const files: [ReactNode, string][] = [
    [<FileIcon key="f" />, 'project.json'],
    [<FolderSmallIcon key="d" />, 'assets/'],
    [<SparkIcon key="s" />, 'AGENTS.md'],
    [<FileIcon key="u" />, 'user-instructions.md'],
  ]
  return (
    <div className="ws-float rounded-xl border border-gray-200 bg-white shadow-xl shadow-brand/10">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-[12px] font-semibold text-gray-800">
        <span className="text-amber-500"><FolderSmallIcon filled /></span>
        {t('scene_folder')}
      </div>
      <ul className="space-y-1.5 p-3 font-mono text-[11px] text-gray-600">
        {files.map(([icon, name], i) => (
          <li key={name} className="ws-line flex items-center gap-2 rounded-md px-1.5 py-1" style={{ animationDelay: `${0.15 + i * 0.16}s` }}>
            <span className="text-gray-400">{icon}</span>
            <span className="truncate">{name}</span>
            {i === 0 && <span className="ws-pulse ml-auto h-2 w-2 shrink-0 rounded-full bg-brand" />}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-3 py-2">
        {['Dropbox', 'Git', 'AI'].map((tag, i) => (
          <span key={tag} className="ws-line rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600" style={{ animationDelay: `${0.9 + i * 0.12}s` }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function TabScene() {
  return (
    <div className="ws-float">
      <div className="flex items-end gap-1 pl-2">
        <span className="flex items-center gap-2 rounded-t-lg border border-b-0 border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
          Scormly
          <span className="text-gray-400">✕</span>
        </span>
        <span className="px-1.5 pb-1 text-sm text-gray-400">+</span>
      </div>
      <div className="rounded-xl rounded-tl-none border border-gray-200 bg-white p-4 shadow-xl shadow-brand/10">
        <div className="ws-vanish space-y-2">
          <div className="h-2.5 w-1/2 rounded bg-gray-700" />
          <div className="h-2 w-full rounded bg-gray-200" />
          <div className="h-2 w-4/5 rounded bg-gray-200" />
          <div className="h-2 w-2/3 rounded bg-brand/40" />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <span className="ws-bounce inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg">
          <DownloadIcon />
          project.zip
        </span>
      </div>
    </div>
  )
}

// ── Icons ──

function StorageIcon({ storage, small }: { storage: Storage; small?: boolean }) {
  const cls = small ? 'h-5 w-5' : 'h-6 w-6'
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: cls, 'aria-hidden': true }
  if (storage === 'browser') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M3 9h18M6.5 6.5h.01M9 6.5h.01" />
        <path d="M8 14.5c0-1 1.8-1.8 4-1.8s4 .8 4 1.8-1.8 1.8-4 1.8-4-.8-4-1.8z" />
      </svg>
    )
  }
  if (storage === 'folder') {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M8 13h8M8 16h5" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-brand" aria-hidden>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </svg>
  )
}

function FolderOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M4 19h14.5a1.5 1.5 0 0 0 1.4-1l2-6A1.5 1.5 0 0 0 20.5 10H8a1.5 1.5 0 0 0-1.4 1L4 19zM4 19a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2 2h7a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function ZipIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M11 5h1M11 8h1M11 11h1M10.5 14h2v3h-2z" />
    </svg>
  )
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" />
    </svg>
  )
}

function FolderSmallIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  )
}
