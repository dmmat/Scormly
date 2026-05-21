import type { PreviewProps } from '../types'
import { toEmbedUrl } from '../../lib/embed'

export default function EmbedPreview({ block }: PreviewProps<'embed'>) {
  const embedUrl = toEmbedUrl(block.data.url)
  if (!embedUrl) return null
  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embedUrl}
        title={block.data.title || ''}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
