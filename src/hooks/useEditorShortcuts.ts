import { useEffect } from 'react'
import { useCourseStore } from '../store/courseStore'

// Editor keyboard shortcuts acting on the selected block:
//   Delete            — delete block
//   Ctrl/Cmd + D      — duplicate block
//   Alt + ↑ / ↓       — move block up / down
//   Escape            — deselect
// Ignored while typing in inputs / textareas / contentEditable.
export function useEditorShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const editable =
        !!target &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')

      const s = useCourseStore.getState()
      const id = s.selectedBlockId
      if (!id) return
      const lesson = s.course.lessons.find((l) => l.id === s.activeLessonId)
      if (!lesson) return
      const index = lesson.blocks.findIndex((b) => b.id === id)
      if (index === -1) return

      if (e.key === 'Escape') {
        s.selectBlock(null)
        return
      }
      if (!editable && e.key === 'Delete') {
        e.preventDefault()
        s.deleteBlock(lesson.id, id)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        s.duplicateBlock(lesson.id, id)
      } else if (e.altKey && e.key === 'ArrowUp' && index > 0) {
        e.preventDefault()
        s.moveBlock(lesson.id, index, index - 1)
      } else if (
        e.altKey &&
        e.key === 'ArrowDown' &&
        index < lesson.blocks.length - 1
      ) {
        e.preventDefault()
        s.moveBlock(lesson.id, index, index + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
