import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import Transcript from './Transcript'

export default function AudioPreview({ block }: PreviewProps<'audio'>) {
  const url = useAssetUrl(block.data.src)
  if (!block.data.src) return null
  return (
    <div>
      <audio controls className="w-full" src={url} />
      <Transcript text={block.data.transcript} />
    </div>
  )
}
