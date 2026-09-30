import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { PreviewProps } from '../types'
import type { Hotspot } from '../../types/course'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { useT } from '../../i18n/I18nProvider'

// Keep the popover inside the image: anchor it to the marker's nearer edge.
function popoverPosition(h: Hotspot): CSSProperties {
  const tx = h.x < 33 ? '0%' : h.x > 67 ? '-100%' : '-50%'
  const below = h.y <= 55
  return {
    left: `${h.x}%`,
    top: `${h.y}%`,
    transform: `translate(${tx}, ${below ? '1.5rem' : 'calc(-100% - 1.5rem)'})`,
  }
}

export default function HotspotPreview({ block }: PreviewProps<'hotspot'>) {
  const { t } = useT('hotspotTimeline')
  const { t: ta } = useT('a11y')
  const { src, alt, hotspots } = block.data
  const url = useAssetUrl(src)
  const [openId, setOpenId] = useState<string | null>(null)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  if (!src) return null

  const open = hotspots.find((h) => h.id === openId) ?? null

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id))
    setVisited((prev) => new Set(prev).add(id))
  }

  function close() {
    if (!openId) return
    markerRefs.current[openId]?.focus()
    setOpenId(null)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && openId) {
      e.stopPropagation()
      close()
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <div className="relative">
        <img src={url} alt={alt} className="block w-full rounded-lg" />
        {hotspots.map((h, i) => {
          const seen = visited.has(h.id)
          const active = h.id === openId
          return (
            <button
              key={h.id}
              ref={(el) => {
                markerRefs.current[h.id] = el
              }}
              type="button"
              onClick={() => toggle(h.id)}
              aria-expanded={active}
              aria-label={
                t('hotspotMarker', { n: i + 1, title: h.title }) +
                (seen ? ` (${ta('visited')})` : '')
              }
              className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {!seen && (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60"
                />
              )}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold shadow-md transition ${
                  active || !seen
                    ? 'border-white bg-brand text-white'
                    : 'border-brand bg-white text-brand'
                }`}
              >
                {i + 1}
              </span>
            </button>
          )
        })}
        {open && (
          <div
            role="dialog"
            aria-label={open.title}
            className="interactive-surface absolute z-10 w-64 max-w-[80%] border border-gray-200 bg-white p-4 shadow-lg"
            style={popoverPosition(open)}
          >
            <div className="flex items-start gap-2">
              <p className="flex-1 font-semibold text-gray-900">{open.title}</p>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {open.text && (
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {open.text}
              </p>
            )}
          </div>
        )}
      </div>
      {hotspots.length > 0 && (
        <p aria-live="polite" className="mt-2 text-center text-sm text-gray-500">
          {t('hotspotProgress', { n: visited.size, total: hotspots.length })}
        </p>
      )}
    </div>
  )
}
