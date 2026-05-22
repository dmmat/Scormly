import { useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n/I18nProvider'
import { exportScorm } from '../../export/exportScorm'
import { exportCmi5 } from '../../export/exportCmi5'
import type { ScormVersion } from '../../export/scormManifest'

// Export button with a SCORM version menu (1.2 / 2004).
export default function ExportMenu() {
  const { t } = useT('common')
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  async function runScorm(version: ScormVersion) {
    setOpen(false)
    setExporting(true)
    try {
      await exportScorm(version)
    } finally {
      setExporting(false)
    }
  }

  async function runCmi5() {
    setOpen(false)
    setExporting(true)
    try {
      await exportCmi5()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="btn-primary flex items-center gap-1 text-sm disabled:opacity-50"
      >
        {exporting ? t('exporting') : t('export')}
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => runScorm('2004')}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('export2004')}
          </button>
          <button
            type="button"
            onClick={() => runScorm('1.2')}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('export12')}
          </button>
          <button
            type="button"
            onClick={runCmi5}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('exportCmi5')}
          </button>
        </div>
      )}
    </div>
  )
}
