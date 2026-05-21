import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, UnsupportedFormatError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'

const AUDIO_ACCEPT = 'audio/mpeg,audio/ogg,audio/wav'

export default function AudioBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'audio'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { src } = block.data
  const audioUrl = useAssetUrl(src)
  const [error, setError] = useState<string | null>(null)

  async function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const path = await saveAsset(file, 'audio')
      update(lessonId, block.id, { src: path })
    } catch (err) {
      if (err instanceof UnsupportedFormatError) setError(t('unsupportedAudio'))
    }
  }

  if (!src) {
    return (
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-gray-400 transition hover:border-brand hover:text-brand">
          <span className="text-3xl">♪</span>
          <span className="text-sm font-medium">{t('uploadAudio')}</span>
          <input type="file" accept={AUDIO_ACCEPT} onChange={handlePick} className="hidden" />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white">
      <audio controls className="w-full" src={audioUrl} />

      {selected && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {t('replaceAudio')}
            <input type="file" accept={AUDIO_ACCEPT} onChange={handlePick} className="hidden" />
          </label>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
