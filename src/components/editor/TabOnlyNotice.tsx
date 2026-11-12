import { useRef, useState } from 'react'
import { useMenu } from '../../hooks/useMenu'
import { useT } from '../../i18n/I18nProvider'
import { runExport } from '../../export/runExport'

// The "this project lives only in this tab" warning, folded into an amber
// badge in the header; clicking it opens the explanation and the download
// button. It pulses until it has been opened once.
export default function TabOnlyNotice() {
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef })

  return (
    <div ref={rootRef} className="relative shrink-0">
      {open && (
        <div
          role="dialog"
          aria-label={tw('noFolderTitle')}
          className="absolute left-0 top-full z-40 mt-2 w-72 max-sm:fixed max-sm:inset-x-3 max-sm:top-14 max-sm:w-auto rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-lg"
        >
          <p className="font-semibold">{tw('noFolderTitle')}</p>
          <p className="mt-1 leading-relaxed">{tw('noFolderBanner')}</p>
          <button
            type="button"
            onClick={() => {
              void runExport('project')
              setOpen(false)
            }}
            className="mt-3 inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 font-semibold text-amber-950 hover:bg-amber-400"
          >
            {t('downloadProject')}
          </button>
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={tw('noFolderTitle')}
        title={tw('noFolderTitle')}
        onClick={() => {
          setOpen((v) => !v)
          setSeen(true)
        }}
        className="relative flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-amber-950 shadow-md shadow-amber-500/40 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      >
        {!seen && (
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-60 motion-reduce:animate-none" />
        )}
        <span aria-hidden className="relative">!</span>
      </button>
    </div>
  )
}
