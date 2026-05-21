import { useState } from 'react'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import Workspace from './layout/Workspace'
import WelcomeScreen from './welcome/WelcomeScreen'
import PreviewOverlay from './preview/PreviewOverlay'
import ThemeProvider from '../theme/ThemeProvider'
import { useUndoRedoShortcuts } from '../hooks/useUndoRedoShortcuts'
import { useAutosave } from '../hooks/useAutosave'
import { useCourseStore } from '../store/courseStore'

// Course builder (editor). Rendered on the #/app route. Shows the welcome screen
// until a project folder is opened (or the user opts to continue without saving).
export default function Builder() {
  useUndoRedoShortcuts()
  useAutosave()
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  const previewOpen = useCourseStore((s) => s.previewOpen)
  const [skipped, setSkipped] = useState(false)

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
