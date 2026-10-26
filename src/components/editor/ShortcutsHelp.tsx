import { useEffect, useRef } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { KEYS } from '../../lib/keyboard'
import { useDialog } from '../../hooks/useDialog'

const GROUPS: { title: string; items: { label: string; keys: string }[] }[] = [
  {
    title: 'scGeneral',
    items: [
      { label: 'undo', keys: KEYS.undo },
      { label: 'redo', keys: KEYS.redo },
      { label: 'scSave', keys: KEYS.save },
      { label: 'scHelp', keys: KEYS.help },
    ],
  },
  {
    title: 'scSelectedBlock',
    items: [
      { label: 'duplicate', keys: KEYS.duplicate },
      { label: 'delete', keys: KEYS.delete },
      { label: 'moveUp', keys: KEYS.moveUp },
      { label: 'moveDown', keys: KEYS.moveDown },
      { label: 'scDeselect', keys: KEYS.deselect },
      { label: 'scDragKeys', keys: 'Space' },
    ],
  },
  {
    title: 'scText',
    items: [
      { label: 'scBold', keys: KEYS.bold },
      { label: 'scItalic', keys: KEYS.italic },
      { label: 'scUnderline', keys: KEYS.underline },
      { label: 'scLink', keys: KEYS.link },
      { label: 'scNumbered', keys: KEYS.numberedList },
      { label: 'scBullets', keys: KEYS.bulletList },
      { label: 'scAlign', keys: `${KEYS.alignLeft} / E / R` },
      { label: 'scClear', keys: KEYS.clearFormat },
      { label: 'scNextCell', keys: KEYS.nextCell },
    ],
  },
  {
    title: 'scFocusedLesson',
    items: [
      { label: 'renameLesson', keys: 'F2' },
      { label: 'moveUp', keys: KEYS.moveUp },
      { label: 'moveDown', keys: KEYS.moveDown },
    ],
  },
]

// Modal listing the editor's keyboard shortcuts (opened with "?" or the
// header button).
export default function ShortcutsHelp() {
  const setOpen = useCourseStore((s) => s.setShortcutsOpen)
  const { t } = useT('common')
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialog(dialogRef, () => setOpen(false))

  // "?" toggles the help closed again.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900">
            {t('shortcuts')}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('dismiss')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 outline-none hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-brand"
          >
            ✕
          </button>
        </div>
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t(group.title)}
              </h3>
              <ul className="divide-y divide-gray-100">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-700">{t(item.label)}</span>
                    <span className="flex gap-1">
                      {item.keys.split('+').map((k) => (
                        <kbd
                          key={k}
                          className="min-w-6 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-center font-mono text-xs text-gray-600 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
