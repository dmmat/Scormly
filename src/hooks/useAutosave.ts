import { useEffect, useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import { cancelScheduledSave, saveProject, scheduleSave } from '../lib/projectService'
import { runExport } from '../export/runExport'

const DEBOUNCE_MS = 1000

// Debounced autosave: whenever the course changes and a project folder is open,
// persist project.json (+ history) after a short pause. Also wires Ctrl/Cmd+S
// for an immediate save — without a folder, that downloads the project .zip.
export function useAutosave() {
  const course = useCourseStore((s) => s.course)
  const handle = useCourseStore((s) => s.directoryHandle)
  const skipNext = useRef(true)

  useEffect(() => {
    if (!handle) return
    // Skip the save triggered by loading/creating the project itself.
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    scheduleSave(DEBOUNCE_MS)
  }, [course, handle])

  // Leaving the editor drops a queued save; callers that switch projects
  // flush first (see flushSave).
  useEffect(() => cancelScheduledSave, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (useCourseStore.getState().directoryHandle) void saveProject()
        else void runExport('project')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
