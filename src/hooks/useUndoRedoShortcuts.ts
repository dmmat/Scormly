import { useEffect } from 'react'
import { useCourseStore } from '../store/courseStore'
import { editorShortcutsBlocked, isEditableTarget } from '../lib/keyboard'

// Global hotkeys: Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z or Ctrl+Y to redo.
// Ignores events coming from input fields (let the browser handle text undo)
// and while an overlay (preview / settings) covers the editor.
export function useUndoRedoShortcuts() {
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (!mod || (key !== 'z' && key !== 'y')) return
      if (isEditableTarget(e.target) || editorShortcutsBlocked()) return

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
