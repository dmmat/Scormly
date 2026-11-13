import { useRef, useState } from 'react'
import { useDialog } from '../../hooks/useDialog'
import { useT } from '../../i18n/I18nProvider'
import { toastUploadError } from '../../lib/assets'
import LibraryGrid, { type LibraryKind } from './LibraryGrid'

// Modal over LibraryGrid: choosing a picture runs `onPick` (which copies the
// files into the project) and closes the dialog when it finishes.
export default function LibraryPickerDialog({
  kind,
  onPick,
  onClose,
}: {
  kind: LibraryKind
  onPick: (id: string) => Promise<void>
  onClose: () => void
}) {
  const { t } = useT('scenario')
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  useDialog(ref, onClose)

  async function pick(id: string) {
    if (busy) return
    setBusy(true)
    try {
      await onPick(id)
      onClose()
    } catch (err) {
      toastUploadError(err)
      setBusy(false)
    }
  }

  const title = t(kind === 'character' ? 'libraryCharacters' : kind === 'avatar' ? 'libraryAvatars' : 'libraryBackgrounds')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="library-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="btn-secondary text-sm">{t('wizClose')}</button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto ${busy ? 'pointer-events-none opacity-60' : ''}`} aria-busy={busy}>
          <LibraryGrid kind={kind} value={null} onSelect={pick} />
        </div>
      </div>
    </div>
  )
}
