import { useRef, useState, type ChangeEvent, type MouseEvent, type PointerEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType, Hotspot } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT, translate } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import { saveAsset, UnsupportedFormatError, toastUploadError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import ContextMenu from '../../components/editor/ContextMenu'
import { KEYS } from '../../lib/keyboard'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

const clampPct = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10

export default function HotspotBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'hotspot'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('hotspotTimeline')
  const { t: tm } = useT('media')
  const { src, alt, hotspots } = block.data
  const displayUrl = useAssetUrl(src)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  // Marker right-click menu; replaces the block menu while over a marker.
  const [markerMenu, setMarkerMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // Marker being dragged (pointer captured); `gesture` makes each drag its own undo step.
  const drag = useRef<{ id: string; gesture: number } | null>(null)
  const gestures = useRef(0)

  async function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const path = await saveAsset(file, 'image')
      update(lessonId, block.id, { src: path })
    } catch (err) {
      if (err instanceof UnsupportedFormatError) setError(tm('unsupportedImage'))
      else toastUploadError(err)
    }
  }

  function pointToPct(clientX: number, clientY: number) {
    const rect = boxRef.current!.getBoundingClientRect()
    return {
      x: clampPct(((clientX - rect.left) / rect.width) * 100),
      y: clampPct(((clientY - rect.top) / rect.height) * 100),
    }
  }

  function patchHotspot(id: string, patch: Partial<Hotspot>, coalesceKey?: string) {
    const next = hotspots.map((h) => (h.id === id ? { ...h, ...patch } : h))
    update(lessonId, block.id, { hotspots: next }, coalesceKey)
  }

  function addAt(e: MouseEvent<HTMLDivElement>) {
    if (!selected) return
    const { x, y } = pointToPct(e.clientX, e.clientY)
    const n = hotspots.length + 1
    const id = uid('hs')
    update(lessonId, block.id, {
      hotspots: [
        ...hotspots,
        {
          id,
          x,
          y,
          title: translate('content', 'hotspotTitle', { n }),
          text: translate('content', 'hotspotText'),
        },
      ],
    })
    setActiveId(id)
  }

  function removeHotspot(id: string) {
    update(lessonId, block.id, { hotspots: hotspots.filter((h) => h.id !== id) })
    if (activeId === id) setActiveId(null)
  }

  function onMarkerDown(e: PointerEvent<HTMLButtonElement>, id: string) {
    // Only the primary button drags; a right-click opens the marker menu.
    if (!selected || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id, gesture: ++gestures.current }
    setActiveId(id)
  }

  function onMarkerMove(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current
    if (!d) return
    patchHotspot(d.id, pointToPct(e.clientX, e.clientY), `hotspot-drag-${d.id}-${d.gesture}`)
  }

  function onMarkerUp() {
    drag.current = null
  }

  if (!src) {
    return (
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-gray-400 transition hover:border-brand hover:text-brand">
          <span className="text-3xl">◎</span>
          <span className="text-sm font-medium">{tm('uploadImage')}</span>
          <input type="file" accept={IMAGE_ACCEPT} onChange={handlePick} className="hidden" />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  const inputCls =
    'w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none placeholder-gray-300 focus:border-brand'

  return (
    <div className="rounded-lg bg-white">
      <div
        ref={boxRef}
        onClick={addAt}
        className={`relative select-none ${selected ? 'cursor-crosshair' : ''}`}
      >
        <img
          src={displayUrl}
          alt={alt}
          draggable={false}
          className="block w-full rounded-lg"
        />
        {hotspots.map((h, i) => (
          <button
            key={h.id}
            type="button"
            onPointerDown={(e) => onMarkerDown(e, h.id)}
            onPointerMove={onMarkerMove}
            onPointerUp={onMarkerUp}
            onPointerCancel={onMarkerUp}
            onClick={(e) => {
              if (selected) e.stopPropagation()
            }}
            onContextMenu={(e) => {
              if (!selected) return
              e.preventDefault()
              e.stopPropagation()
              setActiveId(h.id)
              setMarkerMenu({ id: h.id, x: e.clientX, y: e.clientY })
            }}
            onKeyDown={(e) => {
              // Remove just this marker; stop the editor's delete-block shortcut.
              if (selected && (e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault()
                e.stopPropagation()
                removeHotspot(h.id)
              }
            }}
            aria-label={t('hotspotMarker', { n: i + 1, title: h.title })}
            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 text-sm font-bold shadow-md ${
              selected ? 'cursor-grab active:cursor-grabbing' : ''
            } ${
              selected && activeId === h.id
                ? 'border-brand bg-white text-brand ring-4 ring-white/70'
                : 'border-white bg-brand text-white'
            }`}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {markerMenu && (
        <ContextMenu
          x={markerMenu.x}
          y={markerMenu.y}
          onClose={() => setMarkerMenu(null)}
          items={[
            {
              label: t('removeHotspot'),
              icon: '✕',
              shortcut: KEYS.delete,
              danger: true,
              onClick: () => removeHotspot(markerMenu.id),
            },
          ]}
        />
      )}

      {selected && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            {hotspots.length ? t('hotspotAddHint') : t('hotspotEmptyHint')}
          </p>

          {hotspots.map((h, i) => (
            <div
              key={h.id}
              onFocus={() => setActiveId(h.id)}
              className={`space-y-2 rounded-lg border p-3 ${
                activeId === h.id ? 'border-brand' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={h.title}
                  placeholder={t('hotspotTitlePlaceholder')}
                  aria-label={t('hotspotTitlePlaceholder')}
                  onChange={(e) =>
                    patchHotspot(h.id, { title: e.target.value }, `hotspot-title-${h.id}`)
                  }
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeHotspot(h.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('removeHotspot')}
                  title={t('removeHotspot')}
                >
                  ✕
                </button>
              </div>
              <textarea
                value={h.text}
                rows={2}
                placeholder={t('hotspotTextPlaceholder')}
                aria-label={t('hotspotTextPlaceholder')}
                onChange={(e) =>
                  patchHotspot(h.id, { text: e.target.value }, `hotspot-text-${h.id}`)
                }
                className={`${inputCls} resize-y`}
              />
              <div className="flex gap-3">
                {(['x', 'y'] as const).map((axis) => (
                  <label key={axis} className="flex items-center gap-2 text-xs text-gray-500">
                    {t(axis === 'x' ? 'hotspotX' : 'hotspotY')}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={h[axis]}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (Number.isFinite(v)) {
                          patchHotspot(h.id, { [axis]: clampPct(v) }, `hotspot-${axis}-${h.id}`)
                        }
                      }}
                      className="w-20 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">{tm('altLabel')}</span>
            <input
              type="text"
              value={alt}
              placeholder={tm('altPlaceholder')}
              onChange={(e) =>
                update(lessonId, block.id, { alt: e.target.value }, `hotspot-alt-${block.id}`)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            {tm('replaceImage')}
            <input type="file" accept={IMAGE_ACCEPT} onChange={handlePick} className="hidden" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
