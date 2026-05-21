import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, UnsupportedFormatError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'

const VIDEO_ACCEPT = 'video/mp4,video/webm'
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

export default function VideoBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'video'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { src, poster } = block.data
  const videoUrl = useAssetUrl(src)
  const posterUrl = useAssetUrl(poster ?? '')
  const [error, setError] = useState<string | null>(null)

  async function pick(e: ChangeEvent<HTMLInputElement>, key: 'src' | 'poster') {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const path = await saveAsset(file, key === 'src' ? 'video' : 'image')
      update(lessonId, block.id, { [key]: path })
    } catch (err) {
      if (err instanceof UnsupportedFormatError) {
        setError(t(key === 'src' ? 'unsupportedVideo' : 'unsupportedImage'))
      }
    }
  }

  if (!src) {
    return (
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-gray-400 transition hover:border-brand hover:text-brand">
          <span className="text-3xl">🎬</span>
          <span className="text-sm font-medium">{t('uploadVideo')}</span>
          <input type="file" accept={VIDEO_ACCEPT} onChange={(e) => pick(e, 'src')} className="hidden" />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white">
      <video controls poster={posterUrl || undefined} src={videoUrl} className="w-full rounded-lg" />

      {selected && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {t('replaceVideo')}
            <input type="file" accept={VIDEO_ACCEPT} onChange={(e) => pick(e, 'src')} className="hidden" />
          </label>
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {poster ? t('replacePoster') : t('addPoster')}
            <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => pick(e, 'poster')} className="hidden" />
          </label>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
