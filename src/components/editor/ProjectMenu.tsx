import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMenu } from '../../hooks/useMenu'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { flushSave } from '../../lib/projectService'
import { hasUnsavedZipChanges } from '../../lib/exportProjectZip'
import { runExport } from '../../export/runExport'
import { useDialog } from '../../hooks/useDialog'

// Dropdown on the project name: back to the projects screen (to create, open
// or switch projects — see WelcomeScreen), or download this one as a .zip.
// Without a project name it reads "Not saving to disk" (work in this tab only).
export default function ProjectMenu() {
  const projectName = useCourseStore((s) => s.projectName)
  const hasFolder = useCourseStore((s) => s.directoryHandle !== null)
  const closeProject = useCourseStore((s) => s.closeProject)
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef })

  // Why leaving needs an answer first: 'zip' — no folder and edits since the
  // last .zip download; 'folder' — the last write to the folder failed.
  const [leaveAsk, setLeaveAsk] = useState<'zip' | 'folder' | null>(null)

  // Leaving the project: write pending edits first, and ask before discarding
  // any that would be lost.
  async function leave() {
    if (!hasFolder) {
      if (hasUnsavedZipChanges()) setLeaveAsk('zip')
      else closeProject()
      return
    }
    if (await flushSave()) closeProject()
    else setLeaveAsk('folder')
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('manageProject')}
        className={`flex min-w-0 max-w-[min(14rem,100%)] items-center whitespace-nowrap gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
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
        <div role="menu" className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('manageProject')}
          </p>
          <MenuItem
            icon={<ProjectsIcon />}
            hint={t('allProjectsHint')}
            onClick={() => {
              setOpen(false)
              void leave()
            }}
          >
            {t('allProjects')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem icon={<DownloadIcon />} onClick={() => {
              setOpen(false)
              void runExport('project')
            }}>
            {t('downloadProject')}
          </MenuItem>
        </div>
      )}
      {/* Portalled to the themed builder root: the header's backdrop filter
          would otherwise confine a fixed overlay to the header. */}
      {leaveAsk &&
        createPortal(
        <LeaveDialog
          title={tw('leaveTitle')}
          text={leaveAsk === 'zip' ? tw('leaveUnsavedZip') : t('leaveUnsaved')}
          stay={tw('leaveStay')}
          discard={tw('leaveDiscard')}
          download={leaveAsk === 'zip' ? tw('leaveDownload') : undefined}
          onStay={() => setLeaveAsk(null)}
          onDiscard={() => {
            setLeaveAsk(null)
            closeProject()
          }}
          onDownload={() => {
            setLeaveAsk(null)
            // Leave only if the download went through (a failure is toasted).
            void runExport('project').then(() => {
              if (!hasUnsavedZipChanges()) closeProject()
            })
          }}
        />,
          rootRef.current?.closest('[data-theme]') ?? document.body,
        )}
    </div>
  )
}

// Asks before leaving a project whose latest changes would be lost.
function LeaveDialog({
  title,
  text,
  stay,
  discard,
  download,
  onStay,
  onDiscard,
  onDownload,
}: {
  title: string
  text: string
  stay: string
  discard: string
  download?: string
  onStay: () => void
  onDiscard: () => void
  onDownload: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDialog(ref, onStay)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onStay}>
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-text"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg whitespace-normal rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="leave-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p id="leave-text" className="mt-2 text-sm leading-relaxed text-gray-600">
          {text}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onStay} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            {stay}
          </button>
          <button type="button" onClick={onDiscard} className={download ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
            {discard}
          </button>
          {download && (
            <button type="button" onClick={onDownload} className="btn-primary text-sm">
              {download}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  hint,
  onClick,
  children,
}: {
  icon?: React.ReactNode
  hint?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${hint ? 'items-start' : 'items-center'}`}
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center text-gray-400 ${hint ? 'mt-0.5' : ''}`}>
        {icon}
      </span>
      <span className="min-w-0">
        {children}
        {hint && <span className="mt-0.5 block text-xs text-gray-400">{hint}</span>}
      </span>
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

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M17.5 14v7M14 17.5h7" />
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
