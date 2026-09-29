import { useEffect, useState } from 'react'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import Workspace from './layout/Workspace'
import WelcomeScreen from './welcome/WelcomeScreen'
import PreviewOverlay from './preview/PreviewOverlay'
import ProjectSettings from './editor/ProjectSettings'
import Toaster from './editor/Toaster'
import ShortcutsHelp from './editor/ShortcutsHelp'
import ExportCheckDialog from './editor/ExportCheckDialog'
import HelpLayer from './help/HelpLayer'
import { runExport, useExportStore } from '../export/runExport'
import ThemeProvider from '../theme/ThemeProvider'
import { useUndoRedoShortcuts } from '../hooks/useUndoRedoShortcuts'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'
import { useAutosave } from '../hooks/useAutosave'
import { useProjectWatcher } from '../hooks/useProjectWatcher'
import { useCourseStore } from '../store/courseStore'
import { flushSave, hasPendingSave, restoreOpenProject } from '../lib/projectService'
import { useRoute, navigate } from '../hooks/useRoute'
import { useT } from '../i18n/I18nProvider'

// Course builder (editor). Rendered on the #/app route. Shows the welcome screen
// until a project folder is opened (or the user opts to continue without saving).
export default function Builder() {
  useUndoRedoShortcuts()
  useEditorShortcuts()
  useAutosave()
  useProjectWatcher()
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  const previewOpen = useCourseStore((s) => s.previewOpen)
  const settingsOpen = useCourseStore((s) => s.settingsOpen)
  const setSettingsOpen = useCourseStore((s) => s.setSettingsOpen)
  const shortcutsOpen = useCourseStore((s) => s.shortcutsOpen)
  const exportPending = useExportStore((s) => s.pending !== null)
  const { projectKey } = useRoute()
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const [skipped, setSkipped] = useState(false)
  // Try to restore the project named in the URL (after a page refresh / shared link).
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    let active = true
    void restoreOpenProject(projectKey).then((ok) => {
      // No project could be restored — fall back to a clean /#/app URL.
      if (!ok && projectKey) navigate('app')
      if (active) setRestoring(false)
    })
    return () => {
      active = false
    }
    // Run once on mount; projectKey is read from the initial URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Warn before closing the tab while edits would be lost: unsaved or failed
  // writes to the project folder, or any edits in no-folder ("try anyway") mode.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const s = useCourseStore.getState()
      const atRisk = s.directoryHandle
        ? hasPendingSave() || s.saveState === 'error'
        : skipped && s.past.length > 0
      if (!atRisk) return
      if (s.directoryHandle) void flushSave()
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [skipped])

  if (restoring && !directoryHandle) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50" role="status">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
        <span className="sr-only">{t('opening')}</span>
      </div>
    )
  }

  if (!directoryHandle && !skipped) {
    return (
      <WelcomeScreen
        onSkip={() => {
          // Regenerate the demo course in the current UI language (the module-load
          // default may not match the user's selected language).
          useCourseStore.getState().newDemoCourse()
          setSkipped(true)
        }}
      />
    )
  }

  return (
    <ThemeProvider>
      <Header />
      {!directoryHandle && (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
          <span>{tw('noFolderBanner')}</span>
          <button
            type="button"
            onClick={() => void runExport('project')}
            className="font-semibold underline underline-offset-2 hover:text-amber-700"
          >
            {t('downloadProject')}
          </button>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Workspace />
      </div>
      {previewOpen && <PreviewOverlay />}
      {settingsOpen && <ProjectSettings onClose={() => setSettingsOpen(false)} />}
      {shortcutsOpen && <ShortcutsHelp />}
      {exportPending && <ExportCheckDialog />}
      <HelpLayer />
      <Toaster />
    </ThemeProvider>
  )
}
