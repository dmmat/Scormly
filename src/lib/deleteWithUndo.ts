import { useCourseStore, blocksOf } from '../store/courseStore'
import { toast } from '../store/toastStore'
import { translate } from '../i18n/I18nProvider'

// Deletes are undoable via history, but silently so; these wrappers confirm the
// delete with a toast that offers a one-click Undo.

function offerUndo(message: string) {
  // Only undo if nothing else was recorded since, otherwise Undo would revert
  // an unrelated later edit.
  const depth = useCourseStore.getState().past.length
  toast({
    message,
    action: {
      label: translate('common', 'undoAction'),
      onClick: () => {
        const s = useCourseStore.getState()
        if (s.past.length === depth) s.undo()
      },
    },
  })
}

export function deleteBlockWithUndo(lessonId: string, blockId: string): void {
  const s = useCourseStore.getState()
  const blocks = blocksOf(s.course, lessonId) ?? []
  const i = blocks.findIndex((b) => b.id === blockId)
  // Keep a selection on the next block (or the previous one at the end) so
  // the keyboard can carry on from where the deleted block was.
  const neighbour = blocks[i + 1] ?? blocks[i - 1]
  s.deleteBlock(lessonId, blockId)
  if (neighbour) useCourseStore.getState().selectBlock(neighbour.id)
  offerUndo(translate('common', 'blockDeleted'))
}

export function deleteLessonWithUndo(lessonId: string): void {
  const s = useCourseStore.getState()
  const title = s.course.lessons.find((l) => l.id === lessonId)?.title ?? ''
  s.deleteLesson(lessonId)
  offerUndo(translate('common', 'lessonDeleted', { title }))
}

export function deleteUnitWithUndo(unitId: string): void {
  const s = useCourseStore.getState()
  const title = s.course.units?.find((u) => u.id === unitId)?.title ?? ''
  s.deleteUnit(unitId)
  offerUndo(translate('common', 'unitDeleted', { title }))
}
