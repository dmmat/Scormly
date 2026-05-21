import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function AudioPreview({ block }: PreviewProps<'audio'>) {
  const url = useAssetUrl(block.data.src)
  if (!block.data.src) return null
  return <audio controls className="w-full" src={url} />
}
