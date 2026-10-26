import { useRef, useState } from 'react'
import { useMenu } from '../../hooks/useMenu'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import {
  createBrowserProject,
  createNewProject,
  flushSave,
  NoProjectError,
  openExistingProject,
} from '../../lib/projectService'
import { isFileSystemAccessSupported } from '../../lib/fileSystem'
import { isBrowserStorageSupported } from '../../lib/browserProjects'
import { hasUnsavedZipChanges } from '../../lib/exportProjectZip'
import { openProjectZip, ZipProjectError } from '../../lib/importProjectZip'
import { runExport } from '../../export/runExport'
import { toast } from '../../store/toastStore'

// Dropdown on the project name: switch to another project (a folder or a
// .zip), download it as a .zip, or close it. Without a project name it reads
// "Not saving to disk" (work in this tab only).
export default function ProjectMenu() {
  const projectName = useCourseStore((s) => s.projectName)
  const hasFolder = useCourseStore((s) => s.directoryHandle !== null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const folders = isFileSystemAccessSupported()
  const closeProject = useCourseStore((s) => s.closeProject)
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef })

  // Switching or closing the project: write pending edits first, and ask
  // before discarding them if the write failed — or, without a folder, if
  // there are edits since the last .zip download.
  async function leave(): Promise<boolean> {
    if (!hasFolder) {
      const s = useCourseStore.getState()
      return !(s.past.length > 0 && hasUnsavedZipChanges()) || window.confirm(tw('leaveUnsavedZip'))
    }
    if (await flushSave()) return true
    return window.confirm(t('leaveUnsaved'))
  }

  async function pick(action: () => Promise<void>, leaving = false) {
    setOpen(false)
    if (leaving && !(await leave())) return
    try {
      await action()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      toast({
        tone: 'error',
        message:
          err instanceof ZipProjectError
            ? tw(`zip_${err.reason}`, { detail: err.detail })
            : err instanceof NoProjectError
              ? tw('noProject')
              : t('openFailed'),
      })
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('manageProject')}
        className={`flex max-w-[14rem] items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
          open
            ? 'border-brand bg-brand/5 text-gray-900'
            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <FolderIcon />
        <span className={`truncate ${projectName ? 'font-medium' : 'text-gray-500'}`}>
          {projectName ?? tw('noFolderTitle')}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 top-full z-30 mt-1.5 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('manageProject')}
          </p>
          {folders && (
            <>
              <MenuItem icon="+" onClick={() => pick(createNewProject, true)}>
                {t('newProject')}
              </MenuItem>
              <MenuItem icon={<FolderIcon />} onClick={() => pick(openExistingProject, true)}>
                {t('openProject')}
              </MenuItem>
            </>
          )}
          {isBrowserStorageSupported() && (
            <MenuItem icon="+" onClick={() => pick(createBrowserProject, true)}>
              {tw('browserTitle')}
            </MenuItem>
          )}
          <MenuItem
            icon={<ZipIcon />}
            onClick={() => {
              setOpen(false)
              zipInputRef.current?.click()
            }}
          >
            {tw('openZip')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem icon={<DownloadIcon />} onClick={() => {
              setOpen(false)
              void runExport('project')
            }}>
            {t('downloadProject')}
          </MenuItem>
          {projectName && (
            <>
              <div className="my-1 h-px bg-gray-100" />
              <MenuItem
                icon="✕"
                onClick={() => {
                  setOpen(false)
                  void leave().then((ok) => ok && closeProject())
                }}
              >
                {t('closeProject')}
              </MenuItem>
            </>
          )}
        </div>
      )}
      {/* Outside the menu so it survives the menu closing while the picker is open. */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void pick(() => openProjectZip(file), true)
        }}
      />
    </div>
  )
}

function MenuItem({
  icon,
  onClick,
  children,
}: {
  icon?: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
        {icon}
      </span>
      {children}
    </button>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function ZipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M11 5h1M11 8h1M11 11h1M10.5 14h2v3h-2z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
      className={`ml-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
