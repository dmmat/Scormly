import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, UnsupportedFormatError, toastUploadError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'

const VIDEO_ACCEPT = 'video/mp4,video/webm'
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
const CAPTIONS_ACCEPT = '.vtt,text/vtt'

export default function VideoBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'video'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { src, poster, requireWatch, captions, transcript } = block.data
  const videoUrl = useAssetUrl(src)
  const posterUrl = useAssetUrl(poster ?? '')
  const [error, setError] = useState<string | null>(null)

  const kindByKey = { src: 'video', poster: 'image', captions: 'captions' } as const
  const unsupportedByKey = {
    src: 'unsupportedVideo',
    poster: 'unsupportedImage',
    captions: 'unsupportedCaptions',
  } as const

  async function pick(e: ChangeEvent<HTMLInputElement>, key: 'src' | 'poster' | 'captions') {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const path = await saveAsset(file, kindByKey[key])
      update(lessonId, block.id, { [key]: path })
    } catch (err) {
      if (err instanceof UnsupportedFormatError) {
        setError(t(unsupportedByKey[key]))
      } else {
        toastUploadError(err)
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
      <video
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        poster={posterUrl || undefined}
        src={videoUrl}
        className="w-full rounded-lg"
      />

      {selected && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <div className="flex flex-wrap gap-2">
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
              {t('replaceVideo')}
              <input type="file" accept={VIDEO_ACCEPT} onChange={(e) => pick(e, 'src')} className="hidden" />
            </label>
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
              {poster ? t('replacePoster') : t('addPoster')}
              <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => pick(e, 'poster')} className="hidden" />
            </label>
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
              {captions ? t('replaceCaptions') : t('addCaptions')}
              <input type="file" accept={CAPTIONS_ACCEPT} onChange={(e) => pick(e, 'captions')} className="hidden" />
            </label>
          </div>
          {captions ? (
            <p className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="break-all">
                {t('captionsAttached', {
                  name: captions.startsWith('data:') ? '.vtt' : captions.split('/').pop() ?? '',
                })}
              </span>
              <button
                type="button"
                onClick={() => update(lessonId, block.id, { captions: '' })}
                className="font-medium text-red-600 hover:underline"
              >
                {t('removeCaptions')}
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500">{t('captionsHelp')}</p>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">{t('transcriptLabel')}</span>
            <textarea
              value={transcript ?? ''}
              rows={3}
              placeholder={t('transcriptPlaceholder')}
              onChange={(e) =>
                update(lessonId, block.id, { transcript: e.target.value }, `video-transcript-${block.id}`)
              }
              className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={!!requireWatch}
              onChange={(e) => update(lessonId, block.id, { requireWatch: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{t('requireWatch')}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{t('requireWatchHelp')}</span>
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
