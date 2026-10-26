import type { BlockComponentProps } from '../types'
import type { BeforeAfterData, BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { IMAGE_ACCEPT, SettingsBar, UploadButton, useAssetUpload } from '../../components/editor/controls'
import { BeforeAfterSlider } from '../../preview/components/BeforeAfterPreview'

// Before / after slider: works in the editor too, so authors can try it.
// Until both pictures are in, it shows two upload slots.
export default function BeforeAfterBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'beforeAfter'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('explainers')
  const d = block.data
  const set = (p: Partial<BeforeAfterData>, key?: string) => update(lessonId, block.id, p, key)
  const uploadBefore = useAssetUpload('image', (path) => set({ before: path }))
  const uploadAfter = useAssetUpload('image', (path) => set({ after: path }))
  const ready = !!d.before && !!d.after
  const field =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-brand'

  return (
    <div className="space-y-3">
      {selected && ready && (
        <SettingsBar>
          <UploadButton variant="subtle" label={t('replaceBefore')} accept={IMAGE_ACCEPT} onPick={uploadBefore.onPick} />
          <UploadButton variant="subtle" label={t('replaceAfter')} accept={IMAGE_ACCEPT} onPick={uploadAfter.onPick} />
        </SettingsBar>
      )}

      {ready ? (
        <BeforeAfterSlider data={d} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Slot src={d.before} label={t('uploadBefore')} onPick={uploadBefore.onPick} />
          <Slot src={d.after} label={t('uploadAfter')} onPick={uploadAfter.onPick} />
          <p className="text-xs text-gray-500 sm:col-span-2">{t('beforeAfterHint')}</p>
        </div>
      )}
      {(uploadBefore.error || uploadAfter.error) && <p className="text-sm text-red-600">{t('unsupportedImage')}</p>}

      {selected && (
        <div className="grid gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2">
          {(['before', 'after'] as const).map((side) => (
            <div key={side} className="space-y-2">
              <input
                type="text"
                value={side === 'before' ? d.beforeLabel : d.afterLabel}
                placeholder={t(`${side}Label`)}
                aria-label={t(`${side}Label`)}
                onChange={(e) =>
                  set(side === 'before' ? { beforeLabel: e.target.value } : { afterLabel: e.target.value }, `ba-label-${side}-${block.id}`)
                }
                className={field}
              />
              <input
                type="text"
                value={side === 'before' ? d.beforeAlt : d.afterAlt}
                placeholder={t(`${side}Alt`)}
                aria-label={t(`${side}Alt`)}
                onChange={(e) =>
                  set(side === 'before' ? { beforeAlt: e.target.value } : { afterAlt: e.target.value }, `ba-alt-${side}-${block.id}`)
                }
                className={field}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Slot({
  src,
  label,
  onPick,
}: {
  src: string
  label: string
  onPick: UploadPick
}) {
  const url = useAssetUrl(src)
  return (
    <label
      className="relative flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white/70 text-center text-gray-400 transition hover:border-brand hover:text-brand"
    >
      {src ? (
        <img src={url || undefined} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="px-4 text-sm font-medium">{label}</span>
      )}
      <input type="file" accept={IMAGE_ACCEPT} onChange={onPick} className="sr-only" />
    </label>
  )
}

type UploadPick = ReturnType<typeof useAssetUpload>['onPick']
