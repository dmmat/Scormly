import { useCourseStore, selectActiveLesson } from '../../store/courseStore'
import BlockShell from '../editor/BlockShell'
import AddBlockMenu from '../editor/AddBlockMenu'
import { useT } from '../../i18n/I18nProvider'

export default function Workspace() {
  const activeLesson = useCourseStore(selectActiveLesson)
  const selectBlock = useCourseStore((s) => s.selectBlock)
  const { t } = useT('common')

  return (
    <main
      className="flex-1 overflow-y-auto bg-gray-100"
      onClick={() => selectBlock(null)}
    >
      <div className="mx-auto max-w-3xl px-6 py-10">
        {activeLesson ? (
          <>
            <header className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('lesson')}
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeLesson.title}
              </h1>
            </header>

            {activeLesson.blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl text-brand">
                  +
                </div>
                <p className="text-base font-medium text-gray-700">
                  {t('empty')}
                </p>
                <p className="mb-5 mt-1 max-w-xs text-sm text-gray-500">
                  {t('emptyHint')}
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <AddBlockMenu lessonId={activeLesson.id} />
                </div>
              </div>
            ) : (
              <div
                className="space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                {activeLesson.blocks.map((block, index) => (
                  <BlockShell
                    key={block.id}
                    block={block}
                    lessonId={activeLesson.id}
                    index={index}
                    total={activeLesson.blocks.length}
                  />
                ))}
                <div className="pt-3">
                  <AddBlockMenu lessonId={activeLesson.id} />
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">{t('chooseLesson')}</p>
        )}
      </div>
    </main>
  )
}
