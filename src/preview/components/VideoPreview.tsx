import { useEffect, useRef } from 'react'
import type { PreviewProps } from '../types'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { useA11yContext } from '../a11y'
import Transcript from './Transcript'
import { useMarkDone } from '../progress'

export default function VideoPreview({ block }: PreviewProps<'video'>) {
  const { t } = useT('a11y')
  const url = useAssetUrl(block.data.src)
  const poster = useAssetUrl(block.data.poster ?? '')
  const captionsUrl = useAssetUrl(block.data.captions ?? '')
  const lang = useCourseStore((s) => s.course.settings?.contentLanguage?.trim())
  const { captions: captionsOn } = useA11yContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const markDone = useMarkDone()
  // Watching ~95% (or to the end) counts as watched, like the player.
  const watched = () => block.data.requireWatch && markDone(block.id)

  // `default` only applies when the track loads; keep an already-loaded track
  // in sync when the learner flips the "captions on by default" setting.
  useEffect(() => {
    const track = videoRef.current?.textTracks[0]
    if (track) track.mode = captionsOn ? 'showing' : 'hidden'
  }, [captionsOn, captionsUrl])

  if (!block.data.src) return null
  return (
    <div>
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (v.duration && v.currentTime / v.duration >= 0.95) watched()
        }}
        onEnded={watched}
        src={url}
        poster={poster || undefined}
        className="w-full rounded-lg"
      >
        {block.data.captions && captionsUrl && (
          <track
            kind="captions"
            src={captionsUrl}
            srcLang={lang || undefined}
            label={t('captionsLabel')}
            default={captionsOn}
          />
        )}
      </video>
      <Transcript text={block.data.transcript} />
    </div>
  )
}
