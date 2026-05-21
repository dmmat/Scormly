import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import Workspace from './layout/Workspace'
import ThemeProvider from '../theme/ThemeProvider'
import { useUndoRedoShortcuts } from '../hooks/useUndoRedoShortcuts'

// Course builder (editor). Rendered at the #/app route.
export default function Builder() {
  useUndoRedoShortcuts()
  return (
    <ThemeProvider>
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Workspace />
      </div>
    </ThemeProvider>
  )
}
