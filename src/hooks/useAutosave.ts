import { useEffect, useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import { saveProject } from '../lib/projectService'

const DEBOUNCE_MS = 1000

// Debounced autosave: whenever the course changes and a project folder is open,
// persist project.json (+ history) after a short pause. Also wires Ctrl/Cmd+S
// for an immediate save.
export function useAutosave() {
  const course = useCourseStore((s) => s.course)
  const handle = useCourseStore((s) => s.directoryHandle)
  const timer = useRef<number | undefined>(undefined)
  const skipNext = useRef(true)

  useEffect(() => {
    if (!handle) return
    // Skip the save triggered by loading/creating the project itself.
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void saveProject(), DEBOUNCE_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [course, handle])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (useCourseStore.getState().directoryHandle) void saveProject()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
