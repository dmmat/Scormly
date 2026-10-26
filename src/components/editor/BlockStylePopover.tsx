import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { Block, BlockBackground, BlockSettings, BlockWidth } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { BLOCK_BACKGROUNDS } from '../../blocks/styleClasses'
import { IMAGE_ACCEPT, Segmented, useAssetUpload } from './controls'
import { useAssetUrl } from '../../hooks/useAssetUrl'

type Spacing = NonNullable<BlockSettings['spacing']>

const MARGIN = 8 // px kept free around the popover at the edges of its area
const GAP = 6 // px between the toolbar button and the popover

// The visible area the popover stays in: the canvas scroll container (so it
// never covers the app header), within the viewport.
function boundsOf(anchor: HTMLElement): { top: number; bottom: number; left: number; right: number } {
  let el = anchor.parentElement
  while (el && el !== document.body) {
    const { overflowY } = getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) break
    el = el.parentElement
  }
  const r = el && el !== document.body ? el.getBoundingClientRect() : null
  return {
    top: Math.max(0, r?.top ?? 0),
    bottom: Math.min(window.innerHeight, r?.bottom ?? window.innerHeight),
    left: Math.max(0, r?.left ?? 0),
    right: Math.min(window.innerWidth, r?.right ?? window.innerWidth),
  }
}

// Block format: a background from the theme palette and the inner padding.
// Floats over the block, anchored to the toolbar's palette button: below it,
// or above when there's no room, always inside the viewport (it follows the
// button while the canvas scrolls). Rendered in the themed builder root so
// theme colors apply. Esc (focus back to the button), a click outside or
// tabbing out closes it.
export default function BlockStylePopover({
  block,
  lessonId,
  anchorRef,
  onClose,
}: {
  block: Block
  lessonId: string
  /** The toolbar button that opened the popover. */
  anchorRef: RefObject<HTMLElement | null>
  onClose: () => void
}) {
  const updateSettings = useCourseStore((s) => s.updateBlockSettings)
  const { t } = useT('design')
  const ref = useRef<HTMLDivElement>(null)
  const background = block.settings.background ?? 'none'
  const spacing = block.settings.spacing ?? 'normal'
  const width = block.settings.width ?? 'normal'
  const photo = block.settings.backgroundImage ?? ''
  const photoUrl = useAssetUrl(photo)
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useAssetUpload('image', (path) =>
    updateSettings(lessonId, block.id, { background: 'image', backgroundImage: path }),
  )

  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  // Position from the button's box and the popover's own size; re-placed on
  // scroll (any container), resize and when the content grows (photo row).
  useLayoutEffect(() => {
    function place() {
      const anchor = anchorRef.current
      const el = ref.current
      if (!anchor || !el) return
      const a = anchor.getBoundingClientRect()
      const b = boundsOf(anchor)
      const w = el.offsetWidth
      const h = el.offsetHeight
      // Below the button; above it when that doesn't fit; else as low as fits.
      let top = a.bottom + GAP
      if (top + h > b.bottom - MARGIN) {
        const above = a.top - GAP - h
        top = above >= b.top + MARGIN ? above : b.bottom - MARGIN - h
      }
      top = Math.max(b.top + MARGIN, top)
      const left = Math.max(b.left + MARGIN, Math.min(a.right - w, b.right - w - MARGIN))
      setPos((p) => (p && p.left === left && p.top === top ? p : { left, top }))
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    if (ref.current) ro?.observe(ref.current)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      ro?.disconnect()
    }
  }, [anchorRef])

  // Focus moves into the popover (the selected background) once it is placed.
  const placed = pos !== null
  useEffect(() => {
    if (!placed) return
    const el = ref.current
    const first = el?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]') ?? el?.querySelector<HTMLElement>('button')
    first?.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node
      // The palette button toggles the popover itself.
      if (ref.current?.contains(target) || anchorRef.current?.contains(target)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        anchorRef.current?.focus()
      }
    }
    // Deferred so the click that opened the popover doesn't close it.
    const id = setTimeout(() => document.addEventListener('mousedown', onDown))
    document.addEventListener('keydown', onKey, true)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [onClose, anchorRef])

  const host = anchorRef.current?.closest('[data-theme]') ?? document.body

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={t('blockStyle')}
      // React events bubble through the portal to the block: don't re-select
      // it or open its context menu from here.
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      // Tabbing past either end closes it (focus stays where it went). A null
      // relatedTarget (e.g. the OS file dialog for a photo) keeps it open.
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null
        if (next && !e.currentTarget.contains(next) && !anchorRef.current?.contains(next)) onClose()
      }}
      style={{
        position: 'fixed',
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        visibility: pos ? 'visible' : 'hidden',
        maxHeight: `calc(100vh - ${MARGIN * 2}px)`,
      }}
      className="pop-in z-50 w-[22rem] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 text-gray-700 shadow-xl"
    >
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t('background')}
      </p>
      <div role="radiogroup" aria-label={t('background')} className="grid grid-cols-7 gap-1.5">
        {BLOCK_BACKGROUNDS.map((bg: BlockBackground) => {
          const checked = bg === background
          return (
            <button
              key={bg}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={t(`bg_${bg}`)}
              title={t(`bg_${bg}`)}
              onClick={() => {
                // A photo panel needs a picture first: pick one right away.
                if (bg === 'image' && !photo) fileRef.current?.click()
                else updateSettings(lessonId, block.id, { background: bg })
              }}
              className={`swatch h-8 w-8 rounded-full ring-offset-2 transition hover:scale-105 ${
                checked ? 'ring-2 ring-brand' : 'ring-1 ring-gray-200'
              }`}
              data-bg={bg}
            />
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{t(`bg_${background}`)}</p>
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} onChange={upload.onPick} className="sr-only" tabIndex={-1} />
      {background === 'image' && photo && (
        <div className="mt-2 flex items-center gap-2.5">
          <img src={photoUrl || undefined} alt="" className="h-10 w-16 rounded-md object-cover ring-1 ring-gray-200" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            {t('replaceBgImage')}
          </button>
          <button
            type="button"
            onClick={() => updateSettings(lessonId, block.id, { background: 'none', backgroundImage: undefined })}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            {t('removeImage')}
          </button>
        </div>
      )}
      {upload.error && <p className="mt-1.5 text-xs text-red-600">{t('unsupportedImage')}</p>}

      <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
        <Segmented<BlockWidth>
          label={t('blockWidth')}
          value={width}
          onChange={(v) => updateSettings(lessonId, block.id, { width: v })}
          options={[
            ['narrow', t('width_narrowBlock')],
            ['normal', t('width_column')],
            ['wide', t('width_wideBlock')],
            ['full', t('width_fullBleed')],
          ]}
        />
        <Segmented<Spacing>
          label={t('padding')}
          value={spacing}
          onChange={(v) => updateSettings(lessonId, block.id, { spacing: v })}
          options={[
            ['compact', t('pad_compact')],
            ['normal', t('pad_normal')],
            ['spacious', t('pad_spacious')],
          ]}
        />
        <p className="text-xs leading-snug text-gray-500">{t('blockWidthHelp')}</p>
      </div>
    </div>,
    host,
  )
}
