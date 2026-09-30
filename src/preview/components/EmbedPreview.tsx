import type { PreviewProps } from '../types'
import { toEmbedUrl } from '../../lib/embed'
import { useT } from '../../i18n/I18nProvider'

export default function EmbedPreview({ block }: PreviewProps<'embed'>) {
  const { t } = useT('a11y')
  const embedUrl = toEmbedUrl(block.data.url)
  if (!embedUrl) return null
  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embedUrl}
        title={block.data.title?.trim() || t('embedTitle')}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
