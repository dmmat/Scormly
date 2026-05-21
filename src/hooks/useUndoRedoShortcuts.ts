import { useEffect } from 'react'
import { useCourseStore } from '../store/courseStore'

// Global hotkeys: Ctrl/Cmd+Z — undo, Ctrl/Cmd+Shift+Z or Ctrl+Y — redo.
// Ignores events coming from input fields (let the browser handle text undo).
export function useUndoRedoShortcuts() {
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (!mod || (key !== 'z' && key !== 'y')) return
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA'
      if (isEditable) return

      if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault()
        redo()
      } else if (key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])
}
