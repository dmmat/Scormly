import { useEffect } from 'react'
import { useCourseStore, blocksOf } from '../store/courseStore'
import { editorShortcutsBlocked, isEditableTarget } from '../lib/keyboard'
import { deleteBlockWithUndo } from '../lib/deleteWithUndo'

// Editor keyboard shortcuts acting on the selected block:
//   Delete, Backspace — delete block
//   Ctrl/Cmd + D      — duplicate block
//   Alt + ↑ / ↓       — move block up / down
//   Escape            — deselect
//   ?                 — keyboard shortcuts help
// Ignored while typing in inputs / textareas / contentEditable (except Escape),
// and while the preview or settings overlay is open.
export function useEditorShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editorShortcutsBlocked()) return
      const s = useCourseStore.getState()
      if (e.key === '?' && !isEditableTarget(e.target)) {
        e.preventDefault()
        s.setShortcutsOpen(true)
        return
      }
      const id = s.selectedBlockId
      if (!id) return
      const lessonId = s.activeLessonId
      const blocks = blocksOf(s.course, lessonId)
      if (!lessonId || !blocks) return
      const index = blocks.findIndex((b) => b.id === id)
      if (index === -1) return

      if (e.key === 'Escape') {
        s.selectBlock(null)
        return
      }
      if (isEditableTarget(e.target)) return
      // Keys pressed inside a popover or menu (e.g. on a style swatch) belong
      // to it, not to the block behind it.
      if ((e.target as Element | null)?.closest?.('[role="dialog"], [role="menu"]')) return
      // Macs have no Delete key on laptops, so Backspace deletes too.
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteBlockWithUndo(lessonId, id)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        s.duplicateBlock(lessonId, id)
      } else if (e.altKey && e.key === 'ArrowUp' && index > 0) {
        e.preventDefault()
        s.moveBlock(lessonId, index, index - 1)
      } else if (
        e.altKey &&
        e.key === 'ArrowDown' &&
        index < blocks.length - 1
      ) {
        e.preventDefault()
        s.moveBlock(lessonId, index, index + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
