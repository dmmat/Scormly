import { useEffect } from 'react'
import { useCourseStore } from '../store/courseStore'
import { checkExternalChange } from '../lib/projectService'

const POLL_MS = 2000

// Chromium's FileSystemObserver (not yet in the TS DOM lib).
interface FileSystemObserverLike {
  observe(handle: FileSystemHandle): Promise<void>
  disconnect(): void
}
type FileSystemObserverCtor = new (callback: () => void) => FileSystemObserverLike

// Pick up edits made to project.json outside the builder (MCP server, AI agent,
// text editor) while a project folder is open. Polls the file's lastModified
// while the tab is visible; FileSystemObserver, where available, just makes it
// react sooner. The reload/conflict logic lives in checkExternalChange().
export function useProjectWatcher() {
  const handle = useCourseStore((s) => s.directoryHandle)

  useEffect(() => {
    if (!handle) return
    const check = () => {
      if (document.visibilityState === 'visible') void checkExternalChange()
    }
    const timer = window.setInterval(check, POLL_MS)
    document.addEventListener('visibilitychange', check)

    let observer: FileSystemObserverLike | undefined
    const Observer = (window as { FileSystemObserver?: FileSystemObserverCtor })
      .FileSystemObserver
    if (Observer) {
      try {
        // Observe the folder, not the file: atomic writers replace project.json.
        observer = new Observer(check)
        observer.observe(handle).catch(() => undefined)
      } catch {
        observer = undefined
      }
    }

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
      observer?.disconnect()
    }
  }, [handle])
}
