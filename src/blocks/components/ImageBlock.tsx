import type { ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function ImageBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'image'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { src, alt, caption } = block.data

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      // TODO (Phase 3): replace the data URL with a relative path in assets/
      update(lessonId, block.id, { src: String(reader.result) })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (!src) {
    return (
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-gray-400 transition hover:border-brand hover:text-brand">
        <span className="text-3xl">🖼️</span>
        <span className="text-sm font-medium">{t('uploadImage')}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />
      </label>
    )
  }

  return (
    <div className="rounded-lg bg-white">
      <img src={src} alt={alt} className="max-w-full rounded-lg" />

      <input
        type="text"
        value={caption ?? ''}
        placeholder={t('captionPlaceholder')}
        onChange={(e) =>
          update(
            lessonId,
            block.id,
            { caption: e.target.value },
            `img-caption-${block.id}`,
          )
        }
        className="mt-3 w-full bg-transparent text-center text-sm italic text-gray-500 placeholder-gray-300 outline-none"
      />

      {selected && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">
              {t('altLabel')}
            </span>
            <input
              type="text"
              value={alt}
              placeholder={t('altPlaceholder')}
              onChange={(e) =>
                update(
                  lessonId,
                  block.id,
                  { alt: e.target.value },
                  `img-alt-${block.id}`,
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {t('replaceImage')}
            <input
              type="file"
              accept="image/*"
              onChange={handlePick}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}
