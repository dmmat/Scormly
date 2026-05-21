import type { ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, ImageRef } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function GalleryBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'gallery'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('media')
  const { images } = block.data

  function handleAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    Promise.all(
      files.map(
        (file) =>
          new Promise<ImageRef>((resolve) => {
            const reader = new FileReader()
            reader.onload = () =>
              // TODO (Phase 3): replace the data URL with a relative path in assets/
              resolve({ src: String(reader.result), alt: '' })
            reader.readAsDataURL(file)
          }),
      ),
    ).then((added) => {
      update(lessonId, block.id, { images: [...images, ...added] })
    })
    e.target.value = ''
  }

  function removeAt(index: number) {
    update(lessonId, block.id, {
      images: images.filter((_, i) => i !== index),
    })
  }

  const addButton = (
    <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand">
      + {t('addImages')}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className="hidden"
      />
    </label>
  )

  if (images.length === 0) {
    return <div className="rounded-lg bg-white">{addButton}</div>
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <div key={i} className="group relative">
            <img
              src={img.src}
              alt={img.alt}
              className="aspect-square w-full rounded-lg object-cover"
            />
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
    </div>
  )
}
