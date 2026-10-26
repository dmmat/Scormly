import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { PreviewProps } from '../types'
import type { BeforeAfterData } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function BeforeAfterPreview({ block }: PreviewProps<'beforeAfter'>) {
  const { before, after } = block.data
  if (!before || !after) return null
  return <BeforeAfterSlider data={block.data} />
}

const KEY_STEP: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }

// The "before" picture is clipped over the "after" one up to the handle. Mouse
// and pen jump to the pointer; touch moves on horizontal drags only, so a
// vertical swipe still scrolls the page. Same markup as the player.
export function BeforeAfterSlider({ data }: { data: BeforeAfterData }) {
  const { t } = useT('explainers')
  const beforeUrl = useAssetUrl(data.before)
  const afterUrl = useAssetUrl(data.after)
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function moveTo(clientX: number) {
    const r = ref.current?.getBoundingClientRect()
    if (!r?.width) return
    setPos(Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100))))
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    if (e.pointerType !== 'touch') moveTo(e.clientX)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 100 : KEY_STEP[e.key] != null ? pos + KEY_STEP[e.key] : null
    if (next == null) return
    e.preventDefault()
    setPos(Math.min(100, Math.max(0, next)))
  }

  return (
    <div
      ref={ref}
      className="sc-ba"
      style={{ '--pos': `${pos}%` } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img className="sc-ba-after" src={afterUrl || undefined} alt={data.afterAlt} draggable={false} />
      <div className="sc-ba-before">
        <img src={beforeUrl || undefined} alt={data.beforeAlt} draggable={false} />
      </div>
      {data.beforeLabel && <span className="sc-ba-label sc-ba-label-before" aria-hidden>{data.beforeLabel}</span>}
      {data.afterLabel && <span className="sc-ba-label sc-ba-label-after" aria-hidden>{data.afterLabel}</span>}
      <div
        className="sc-ba-handle"
        role="slider"
        tabIndex={0}
        aria-label={t('sliderLabel', { before: data.beforeLabel, after: data.afterLabel })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pos}
        aria-valuetext={`${pos}%`}
        onKeyDown={onKeyDown}
      >
        <span className="sc-ba-knob" />
      </div>
    </div>
  )
}
