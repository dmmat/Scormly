import type { BlockComponentProps } from '../types'
import type { BlockOfType, ContinueMode } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function ContinueBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'continue'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('scenario')
  const { mode, label } = block.data
  const restricted = mode === 'restricted'

  function setLabel(value: string) {
    update(lessonId, block.id, { label: value }, `continue-label-${block.id}`)
  }

  function setMode(value: ContinueMode) {
    update(lessonId, block.id, { mode: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center py-2">
        <button
          type="button"
          className="btn-primary"
          disabled={restricted}
          title={restricted ? t('continueLocked') : undefined}
        >
          {restricted && <span aria-hidden>🔒 </span>}
          {label || t('continueDefault')}
        </button>
      </div>

      {selected && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              {t('buttonLabel')}
            </span>
            <input
              type="text"
              value={label}
              placeholder={t('continueDefault')}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs font-medium text-gray-500">
              {t('mode')}
            </span>
            <div className="inline-flex overflow-hidden rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => setMode('unrestricted')}
                className={`px-3 py-2 text-sm font-medium ${
                  !restricted
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('modeUnrestricted')}
              </button>
              <button
                type="button"
                onClick={() => setMode('restricted')}
                className={`px-3 py-2 text-sm font-medium ${
                  restricted
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('modeRestricted')}
              </button>
            </div>
          </div>

          {restricted && (
            <p className="text-xs text-gray-500">{t('restrictedHelp')}</p>
          )}
        </div>
      )}
    </div>
  )
}
