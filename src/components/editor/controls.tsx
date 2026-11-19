import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { saveAsset, UnsupportedFormatError, toastUploadError, type AssetKind } from '../../lib/assets'

// Small shared controls for block settings panels (shown while a block is
// selected), so every block's options look and behave the same.

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

/** Settings strip shown under/over a selected block. */
export function SettingsBar({ children }: { children: ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-gray-200/80 bg-white/90 px-3 py-2.5 text-gray-700 shadow-sm backdrop-blur"
    >
      {children}
    </div>
  )
}

/** Labelled segmented control (a radio group rendered as pills). */
export function Segmented<V extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: V
  options: readonly (readonly [V, string])[]
  onChange: (v: V) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="inline-flex rounded-lg bg-gray-100 p-0.5">
        {options.map(([v, text]) => {
          const checked = v === value
          return (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(v)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                checked
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {text}
            </button>
          )
        })}
      </span>
    </div>
  )
}

/**
 * Upload handler for a single asset: saves the picked file and passes the
 * stored path on. Unsupported formats set `error` (shown inline by the caller);
 * other failures are toasted.
 */
export function useAssetUpload(kind: AssetKind, onSaved: (path: string, file: File) => void) {
  const [error, setError] = useState(false)
  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setError(false)
    for (const file of files) {
      try {
        onSaved(await saveAsset(file, kind), file)
      } catch (err) {
        if (err instanceof UnsupportedFormatError) setError(true)
        else toastUploadError(err)
      }
    }
  }
  return { onPick, error }
}

/** A button-styled file input. */
export function UploadButton({
  label,
  accept,
  multiple,
  onPick,
  variant = 'secondary',
}: {
  label: string
  accept?: string
  multiple?: boolean
  onPick: (e: ChangeEvent<HTMLInputElement>) => void
  variant?: 'secondary' | 'subtle'
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 text-sm focus-within:outline-2 focus-within:outline-brand ${
        variant === 'secondary'
          ? 'btn-secondary'
          : 'rounded-md px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
      <input type="file" accept={accept} multiple={multiple} onChange={onPick} className="sr-only" />
    </label>
  )
}

/** Textarea that grows with its content (no inner scrollbar). */
export function AutoTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string },
) {
  return (
    <textarea
      rows={1}
      {...props}
      ref={(el) => {
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }}
      onInput={(e) => {
        const el = e.currentTarget
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }}
      style={{ resize: 'none', overflow: 'hidden', ...props.style }}
    />
  )
}

const RAINBOW = 'conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)'

export interface Swatch<K extends string> {
  key: K
  label: string
  /** Any CSS color (a theme variable works: the dot sits inside the themed canvas). */
  color: string
}

/**
 * One color dot that opens a small floating palette: a few named swatches
 * and, with `custom`, the author's own color. Takes little room in tight
 * places (a card corner, beside a label).
 */
export function SwatchPicker<K extends string>({
  label,
  value,
  options,
  onSelect,
  custom,
}: {
  label: string
  /** The chosen swatch; anything else with `custom` means the custom color. */
  value: K | 'custom'
  options: readonly Swatch<K>[]
  onSelect: (key: K) => void
  custom?: { label: string; color: string; onPick: (hex: string) => void }
}) {
  const [at, setAt] = useState<{ top: number; left: number } | null>(null)
  const anchor = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const colorField = useRef<HTMLInputElement>(null)
  const current = value === 'custom' ? custom?.color : options.find((o) => o.key === value)?.color

  useEffect(() => {
    if (!at) return
    const close = () => setAt(null)
    // The page may scroll or re-lay out while a color is being dragged in the
    // browser's own picker: closing then would take the picker away mid-choice.
    const onMove = () => document.activeElement !== colorField.current && close()
    const onDown = (e: MouseEvent) => {
      if (!pop.current?.contains(e.target as Node) && !anchor.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    // Fixed to the viewport (cards may clip their content), so it can't follow a scroll.
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [at])

  function toggle() {
    if (at) return setAt(null)
    const r = anchor.current!.getBoundingClientRect()
    const width = (options.length + (custom ? 1 : 0)) * 28 + 12
    setAt({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8)) })
  }

  const dot = 'h-5 w-5 rounded-full border border-black/15 shadow-[inset_0_0_0_2px_#fff]'
  return (
    <>
      <button
        ref={anchor}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        title={label}
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={!!at}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
      >
        {value === 'custom' ? (
          // Your own color: its dot inside the rainbow ring.
          <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: RAINBOW }}>
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ background: current }} />
          </span>
        ) : (
          <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ background: current ?? '#fff' }} />
        )}
      </button>
      {at && (
        <div
          ref={pop}
          role="radiogroup"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-1.5 py-1.5 shadow-lg"
          style={at}
        >
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={value === o.key}
              title={o.label}
              aria-label={o.label}
              onClick={() => {
                onSelect(o.key)
                setAt(null)
              }}
              className={`${dot} ${value === o.key ? 'ring-2 ring-gray-900/70' : 'hover:scale-110'} transition-transform`}
              style={{ background: o.color }}
            />
          ))}
          {custom && (
            // Always a rainbow ring (it means "any color"), with the chosen color
            // in its middle; the browser's own color field lies underneath.
            <label
              title={custom.label}
              className={`relative flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded-full ${value === 'custom' ? 'ring-2 ring-gray-900/70' : 'hover:scale-110'} transition-transform`}
              style={{ background: RAINBOW }}
            >
              <span aria-hidden className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ background: value === 'custom' ? custom.color : '#fff' }} />
              <input
                ref={colorField}
                type="color"
                value={custom.color}
                aria-label={custom.label}
                onChange={(e) => custom.onPick(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          )}
        </div>
      )}
    </>
  )
}
