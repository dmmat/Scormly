import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { createNewProject, openExistingProject } from '../../lib/projectService'
import { downloadProjectZip } from '../../lib/exportProjectZip'

// Dropdown on the project name: switch to another project or close the current.
export default function ProjectMenu() {
  const projectName = useCourseStore((s) => s.projectName)
  const closeProject = useCourseStore((s) => s.closeProject)
  const { t } = useT('common')
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

  async function pick(action: () => Promise<void>) {
    setOpen(false)
    try {
      await action()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      // Opening another project can fail (e.g. no project.json); ignore here,
      // the welcome screen handles first-run errors.
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
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
        <span className="truncate font-medium">{projectName}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('manageProject')}
          </p>
          <MenuItem icon="+" onClick={() => pick(createNewProject)}>
            {t('newProject')}
          </MenuItem>
          <MenuItem icon={<FolderIcon />} onClick={() => pick(openExistingProject)}>
            {t('openProject')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem icon={<DownloadIcon />} onClick={() => pick(downloadProjectZip)}>
            {t('downloadProject')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem
            icon="✕"
            onClick={() => {
              setOpen(false)
              closeProject()
            }}
          >
            {t('closeProject')}
          </MenuItem>
        </div>
      )}
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
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
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
