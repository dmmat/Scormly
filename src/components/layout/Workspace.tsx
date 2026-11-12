import { Fragment, useRef } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useCourseStore, selectActiveLesson, INTRO_ID } from '../../store/courseStore'
import { CONTENT_WIDTH_PX, DEFAULT_CONTENT_WIDTH } from '../../types/course'
import IntroEditor from '../editor/IntroEditor'
import type { Block } from '../../types/course'

// Blocks with the same background (and width) join into one panel, like in
// the learner view.
function panelKey(b: Block | undefined): string | null {
  const bg = b?.settings.background ?? 'none'
  // Photo panels never join: each paints its own picture.
  return b && bg !== 'none' && bg !== 'image' ? `${bg}|${b.settings.width ?? 'normal'}` : null
}
import { usePageWidthVar } from '../../hooks/usePageWidthVar'
import BlockShell from '../editor/BlockShell'
import AddBlockMenu from '../editor/AddBlockMenu'
import { useT } from '../../i18n/I18nProvider'
import { AutoTextarea } from '../editor/controls'

export default function Workspace() {
  const activeLesson = useCourseStore(selectActiveLesson)
  const selectBlock = useCourseStore((s) => s.selectBlock)
  const introBlocks = useCourseStore((s) => s.course.intro?.blocks)
  const renameLesson = useCourseStore((s) => s.renameLesson)
  const addLesson = useCourseStore((s) => s.addLesson)
  const lessonCount = useCourseStore((s) => s.course.lessons.length)
  const lessonIndex = useCourseStore((s) => s.course.lessons.findIndex((l) => l.id === s.activeLessonId))
  const introActive = useCourseStore((s) => s.activeLessonId === INTRO_ID)
  const contentWidth = useCourseStore((s) => s.course.settings?.contentWidth ?? DEFAULT_CONTENT_WIDTH)
  const typography = useCourseStore((s) => s.course.settings?.typography ?? 'modern')
  const { t } = useT('common')
  const { t: td } = useT('design')
  const mainRef = useRef<HTMLElement>(null)
  usePageWidthVar(mainRef)

  return (
    <main
      ref={mainRef}
      data-tour="canvas"
      className={`canvas typo-${typography} flex-1 overflow-y-auto overflow-x-hidden`}
      style={{ '--col-w': `${CONTENT_WIDTH_PX[contentWidth]}px` } as React.CSSProperties}
      onClick={() => selectBlock(null)}
    >
      <div
        className="mx-auto px-4 py-6 sm:px-6 sm:py-12"
        // Lessons and the cover page share the course's content width (+ padding).
        style={{ maxWidth: CONTENT_WIDTH_PX[contentWidth] + 48 }}
      >
        {introActive ? (
          <IntroEditor>
            <BlockList lessonId={INTRO_ID} blocks={introBlocks ?? []} emptyHint={td('introBlocksHint')} />
          </IntroEditor>
        ) : activeLesson ? (
          <>
            <header className="canvas-lesson-head mb-10 px-4" onClick={(e) => e.stopPropagation()}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">
                {t('lesson')} {lessonIndex + 1}
              </p>
              <AutoTextarea
                value={activeLesson.title}
                aria-label={t('lessonTitle')}
                placeholder={t('lessonTitle')}
                onChange={(e) => renameLesson(activeLesson.id, e.target.value.replace(/\n/g, ' '))}
                className="lesson-title-input block -mx-2 w-[calc(100%+1rem)] rounded-lg bg-transparent px-2 py-1 text-4xl font-bold tracking-tight text-gray-900 outline-none transition hover:bg-white/60 focus:bg-white focus:ring-2 focus:ring-brand/30"
              />
            </header>

            <BlockList lessonId={activeLesson.id} blocks={activeLesson.blocks} emptyHint={t('emptyHint')} />
          </>
        ) : lessonCount === 0 ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-10 text-center">
            <p className="mb-4 max-w-xs text-sm text-gray-500">{t('noLessonsHint')}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addLesson()
              }}
              className="btn-primary text-sm"
            >
              + {t('addLesson')}
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">{t('chooseLesson')}</p>
        )}
      </div>
    </main>
  )
}

// The editable block column of a lesson or the cover page: drag to reorder,
// "+" between blocks, same-background blocks joined into one panel.
function BlockList({ lessonId, blocks, emptyHint }: { lessonId: string; blocks: Block[]; emptyHint: string }) {
  const moveBlock = useCourseStore((s) => s.moveBlock)
  // Small distance so a click still selects/edits; drag starts only past 5px.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Focus a drag handle, Space to pick up, arrows to move, Space to drop.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const from = blocks.findIndex((b) => b.id === e.active.id)
    const to = blocks.findIndex((b) => b.id === e.over!.id)
    if (from !== -1 && to !== -1) moveBlock(lessonId, from, to)
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-9 text-center">
        <p className="mb-4 max-w-xs text-xs text-gray-500">{emptyHint}</p>
        <div onClick={(e) => e.stopPropagation()}>
          <AddBlockMenu lessonId={lessonId} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div>
            {blocks.map((block, index) => {
              const key = panelKey(block)
              const joinPrev = key !== null && key === panelKey(blocks[index - 1])
              const joinNext = key !== null && key === panelKey(blocks[index + 1])
              return (
                <Fragment key={block.id}>
                  <AddBlockMenu variant="inline" tight={joinPrev} lessonId={lessonId} atIndex={index} />
                  <BlockShell
                    block={block}
                    lessonId={lessonId}
                    index={index}
                    total={blocks.length}
                    joinPrev={joinPrev}
                    joinNext={joinNext}
                  />
                </Fragment>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
      <div className="pt-3">
        <AddBlockMenu lessonId={lessonId} />
      </div>
    </div>
  )
}
