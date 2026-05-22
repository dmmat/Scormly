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
        className="flex items-center gap-1 truncate rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
      >
        / {projectName} <span aria-hidden className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <MenuItem onClick={() => pick(createNewProject)}>
            {t('newProject')}
          </MenuItem>
          <MenuItem onClick={() => pick(openExistingProject)}>
            {t('openProject')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem onClick={() => pick(downloadProjectZip)}>
            {t('downloadProject')}
          </MenuItem>
          <div className="my-1 h-px bg-gray-100" />
          <MenuItem
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
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
    >
      {children}
    </button>
  )
}
