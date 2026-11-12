import { useRef, useState } from 'react'
import { useMenu } from '../../hooks/useMenu'
import { useT } from '../../i18n/I18nProvider'
import { requestExport, useExportStore, type ExportTarget } from '../../export/runExport'

// Export button with a SCORM version menu (1.2 / 2004).
export default function ExportMenu() {
  const { t } = useT('common')
  const [open, setOpen] = useState(false)
  const exporting = useExportStore((s) => s.exporting)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef })

  function run(target: ExportTarget) {
    setOpen(false)
    requestExport(target)
  }

  return (
    <div ref={rootRef} className="relative" data-tour="export">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={exporting}
        className="btn-primary flex items-center gap-1 whitespace-nowrap text-sm disabled:opacity-50"
      >
        {exporting ? t('exporting') : t('export')}
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <button
            type="button"
            role="menuitem"
            onClick={() => run('scorm2004')}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            {t('export2004')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run('scorm12')}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            {t('export12')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run('cmi5')}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            {t('exportCmi5')}
          </button>
        </div>
      )}
    </div>
  )
}
