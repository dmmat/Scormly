import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function GalleryPreview({ block }: PreviewProps<'gallery'>) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {block.data.images.map((img, i) => (
        <GalleryImage key={i} src={img.src} alt={img.alt} />
      ))}
    </div>
  )
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const url = useAssetUrl(src)
  return (
    <img src={url} alt={alt} className="aspect-square w-full rounded-lg object-cover" />
  )
}
