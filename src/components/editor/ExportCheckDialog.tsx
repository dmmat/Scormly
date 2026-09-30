import { useRef } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { runExport, useExportStore } from '../../export/runExport'
import { useDialog } from '../../hooks/useDialog'
import { useT } from '../../i18n/I18nProvider'

// Shown by requestExport() when the course has content problems: lists them
// (each one jumps to its lesson/block) and lets the author export anyway.
export default function ExportCheckDialog() {
  // Rendered only while an export is pending (see Builder).
  const pending = useExportStore((s) => s.pending)!
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const selectBlock = useCourseStore((s) => s.selectBlock)
  const { t } = useT('common')
  const dialogRef = useRef<HTMLDivElement>(null)
  const close = () => useExportStore.setState({ pending: null })
  useDialog(dialogRef, close)

  const { target, issues } = pending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-check-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="export-check-title" className="text-lg font-semibold text-gray-900">
          {t('chkTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t('chkIntro', { n: issues.length })}</p>

        <ul className="-mx-2 mt-4 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {issues.map((issue, i) => (
            <li key={i}>
              <button
                type="button"
                disabled={!issue.lessonId}
                onClick={() => {
                  if (!issue.lessonId) return
                  setActiveLesson(issue.lessonId)
                  selectBlock(issue.blockId ?? null)
                  close()
                }}
                className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand disabled:hover:bg-transparent"
              >
                <span
                  aria-hidden
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    issue.severity === 'info' ? 'bg-sky-500' : 'bg-amber-400'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-gray-800">
                    {(issue.a11y || issue.severity === 'info') && (
                      <span className="mr-1.5 inline-block rounded bg-gray-100 px-1.5 py-px align-[1px] text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                        {t(issue.a11y ? 'chkA11yTag' : 'chkInfoTag')}
                        {issue.a11y && issue.severity === 'info' && ` · ${t('chkInfoTag')}`}
                      </span>
                    )}
                    {t(issue.key, issue.vars)}
                  </span>
                  {issue.lessonTitle !== undefined && (
                    <span className="block truncate text-xs text-gray-400">{issue.lessonTitle}</span>
                  )}
                </span>
                {issue.lessonId && (
                  <span className="shrink-0 text-xs font-medium text-brand">{t('chkShow')}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={close} className="btn-secondary text-sm">
            {t('chkCancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              void runExport(target)
            }}
            className="btn-primary text-sm"
          >
            {t('chkExportAnyway')}
          </button>
        </div>
      </div>
    </div>
  )
}
