import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function ImagePreview({ block }: PreviewProps<'image'>) {
  const url = useAssetUrl(block.data.src)
  if (!block.data.src) return null
  return (
    <figure>
      <img src={url} alt={block.data.alt} className="w-full rounded-lg" />
      {block.data.caption && (
        <figcaption className="mt-2 text-center text-sm italic text-gray-500">
          {block.data.caption}
        </figcaption>
      )}
    </figure>
  )
}
