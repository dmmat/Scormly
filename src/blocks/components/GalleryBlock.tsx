import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, ImageRef } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, UnsupportedFormatError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

export default function GalleryBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'gallery'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { images } = block.data
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setError(null)
    const added: ImageRef[] = []
    for (const file of files) {
      try {
        const src = await saveAsset(file, 'image')
        added.push({ src, alt: '' })
      } catch (err) {
        if (err instanceof UnsupportedFormatError) setError(t('unsupportedImage'))
      }
    }
    if (added.length) update(lessonId, block.id, { images: [...images, ...added] })
  }

  function removeAt(index: number) {
    update(lessonId, block.id, { images: images.filter((_, i) => i !== index) })
  }

  const addButton = (
    <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand">
      + {t('addImages')}
      <input type="file" accept={IMAGE_ACCEPT} multiple onChange={handleAdd} className="hidden" />
    </label>
  )

  if (images.length === 0) {
    return (
      <div className="rounded-lg bg-white">
        {addButton}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <div key={i} className="group relative">
            <GalleryThumb src={img.src} alt={img.alt} />
            {selected && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={t('removeImage')}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3">{addButton}</div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function GalleryThumb({ src, alt }: { src: string; alt: string }) {
  const url = useAssetUrl(src)
  return (
    <img src={url} alt={alt} className="aspect-square w-full rounded-lg object-cover" />
  )
}
