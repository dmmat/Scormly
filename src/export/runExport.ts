import { create } from 'zustand'
import { downloadProjectZip } from '../lib/exportProjectZip'
import { toast } from '../store/toastStore'
import { translate } from '../i18n/I18nProvider'
import { useCourseStore } from '../store/courseStore'
import { checkCourse, hasBlockingIssues, type CourseIssue } from './courseCheck'
import { PlayerFilesError } from './packageCommon'

export type ExportTarget = 'scorm2004' | 'scorm12' | 'cmi5' | 'project'

// One export at a time, shared by the desktop menu, the mobile menu and the
// project menu, so repeated clicks can't start parallel packaging runs.
// `pending` holds a package export waiting on the pre-export check dialog.
export const useExportStore = create<{
  exporting: boolean
  pending: { target: ExportTarget; issues: CourseIssue[] } | null
}>()(() => ({ exporting: false, pending: null }))

const RUN: Record<ExportTarget, () => Promise<string>> = {
  // The packagers load on the first export, not with the editor.
  scorm2004: async () => (await import('./exportScorm')).exportScorm('2004'),
  scorm12: async () => (await import('./exportScorm')).exportScorm('1.2'),
  cmi5: async () => (await import('./exportCmi5')).exportCmi5(),
  project: downloadProjectZip,
}

/**
 * Export a course package, first listing content problems (empty lessons,
 * missing media, unanswerable questions, accessibility gaps, …) in a dialog
 * if there are any.
 */
export function requestExport(target: ExportTarget): void {
  const issues = checkCourse(useCourseStore.getState().course)
  // Info-level hints alone don't interrupt the export; they're listed only when
  // the dialog opens for a real warning.
  if (hasBlockingIssues(issues)) useExportStore.setState({ pending: { target, issues } })
  else void runExport(target)
}

/** Build + download a package, reporting the outcome as a toast. */
export async function runExport(target: ExportTarget): Promise<void> {
  if (useExportStore.getState().exporting) return
  useExportStore.setState({ exporting: true })
  const progress = toast({ id: 'export', message: translate('common', 'exporting') })
  try {
    const filename = await RUN[target]()
    toast({ id: progress, tone: 'success', message: translate('common', 'exportDone', { file: filename }) })
  } catch (err) {
    console.error('[export]', err)
    const key = err instanceof PlayerFilesError ? 'exportFailedPlayer' : 'exportFailed'
    toast({ id: progress, tone: 'error', message: translate('common', key) })
  } finally {
    useExportStore.setState({ exporting: false })
  }
}
