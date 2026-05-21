import { useEffect, useState } from 'react'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import Workspace from './layout/Workspace'
import WelcomeScreen from './welcome/WelcomeScreen'
import PreviewOverlay from './preview/PreviewOverlay'
import ThemeProvider from '../theme/ThemeProvider'
import { useUndoRedoShortcuts } from '../hooks/useUndoRedoShortcuts'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'
import { useAutosave } from '../hooks/useAutosave'
import { useCourseStore } from '../store/courseStore'
import { restoreOpenProject } from '../lib/projectService'
import { useRoute, navigate } from '../hooks/useRoute'

// Course builder (editor). Rendered on the #/app route. Shows the welcome screen
// until a project folder is opened (or the user opts to continue without saving).
export default function Builder() {
  useUndoRedoShortcuts()
  useEditorShortcuts()
  useAutosave()
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  const previewOpen = useCourseStore((s) => s.previewOpen)
  const { projectKey } = useRoute()
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

  if (restoring && !directoryHandle) {
    return <div className="h-full bg-gray-50" />
  }

  if (!directoryHandle && !skipped) {
    return <WelcomeScreen onSkip={() => setSkipped(true)} />
  }

  return (
    <ThemeProvider>
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Workspace />
      </div>
      {previewOpen && <PreviewOverlay />}
    </ThemeProvider>
  )
}
