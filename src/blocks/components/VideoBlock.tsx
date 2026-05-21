import type { ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function VideoBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'video'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { src, poster } = block.data

  function readAsDataUrl(
    e: ChangeEvent<HTMLInputElement>,
    key: 'src' | 'poster',
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      // TODO (Phase 3): replace the data URL with a relative path in assets/
      update(lessonId, block.id, { [key]: String(reader.result) })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (!src) {
    return (
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-gray-400 transition hover:border-brand hover:text-brand">
        <span className="text-3xl">🎬</span>
        <span className="text-sm font-medium">{t('uploadVideo')}</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => readAsDataUrl(e, 'src')}
          className="hidden"
        />
      </label>
    )
  }

  return (
    <div className="rounded-lg bg-white">
      <video controls poster={poster} src={src} className="w-full rounded-lg" />

      {selected && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {t('replaceVideo')}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => readAsDataUrl(e, 'src')}
              className="hidden"
            />
          </label>
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {poster ? t('replacePoster') : t('addPoster')}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => readAsDataUrl(e, 'poster')}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}
