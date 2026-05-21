import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { toEmbedUrl } from '../../lib/embed'

export default function EmbedBlock({
  block,
  lessonId,
}: BlockComponentProps<BlockOfType<'embed'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const { url, title } = block.data
  const embedUrl = toEmbedUrl(url)

  return (
    <div className="rounded-lg bg-white">
      {url.trim() && embedUrl && (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedUrl}
            title={title || ''}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {url.trim() && !embedUrl && (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-red-600">
          {t('embedInvalid')}
        </p>
      )}

      {!url.trim() && (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
          {t('embedHint')}
        </p>
      )}

      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
        <input
          type="text"
          value={url}
          placeholder={t('embedUrlPlaceholder')}
          onChange={(e) =>
            update(lessonId, block.id, { url: e.target.value }, `embed-url-${block.id}`)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          type="text"
          value={title ?? ''}
          placeholder={t('embedTitlePlaceholder')}
          onChange={(e) =>
            update(lessonId, block.id, { title: e.target.value }, `embed-title-${block.id}`)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
    </div>
  )
}
