import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function VideoPreview({ block }: PreviewProps<'video'>) {
  const url = useAssetUrl(block.data.src)
  const poster = useAssetUrl(block.data.poster ?? '')
  if (!block.data.src) return null
  return (
    <video
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      src={url}
      poster={poster || undefined}
      className="w-full rounded-lg"
    />
  )
}
