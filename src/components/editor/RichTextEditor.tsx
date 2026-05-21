import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, resolveAssetUrl } from '../../lib/assets'

function isDirectUrl(src: string): boolean {
  return /^(data:|blob:|https?:)/.test(src)
}

interface RichTextEditorProps {
  html: string
  /** Called with the new HTML on every edit. The caller handles coalescing. */
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Lightweight rich-text editor: a contentEditable area plus a formatting toolbar
// (bold / italic / underline, lists, alignment, image). Dependency-free — uses
// document.execCommand, which produces clean, SCORM-friendly HTML.
export default function RichTextEditor({
  html,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const { t } = useT('richtext')
  const ref = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedRange = useRef<Range | null>(null)
  const [focused, setFocused] = useState(false)
  // Currently selected image + its position relative to the root, for the
  // floating resize control (contentEditable has no native image handles).
  const [imgSel, setImgSel] = useState<{ el: HTMLImageElement; left: number; top: number } | null>(null)

  function clearImageSelection() {
    setImgSel((prev) => {
      prev?.el.classList.remove('rte-selected-img')
      return null
    })
  }

  function boxFor(el: HTMLImageElement) {
    const root = rootRef.current!
    const r = el.getBoundingClientRect()
    const rr = root.getBoundingClientRect()
    return { el, left: r.left - rr.left, top: r.top - rr.top }
  }

  function onEditorClick(e: ReactMouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && rootRef.current) {
      imgSel?.el.classList.remove('rte-selected-img')
      const el = target as HTMLImageElement
      el.classList.add('rte-selected-img')
      setImgSel(boxFor(el))
    } else {
      clearImageSelection()
    }
  }

  function setImageWidth(pct: number) {
    if (!imgSel) return
    imgSel.el.style.width = pct + '%'
    imgSel.el.style.height = 'auto'
    emit()
    setImgSel(boxFor(imgSel.el))
  }

  // Hide the resize control when clicking outside the editor.
  useEffect(() => {
    if (!imgSel) return
    function onDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) clearImageSelection()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [imgSel])

  // Seed/resync from the model only when NOT focused (so typing never moves the
  // caret). Compares against modelHtml() — the DOM shows resolved object URLs for
  // asset images while the model stores relative paths.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement !== el && modelHtml() !== html) {
      el.innerHTML = html
      resolveAssetImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html])

  // Serialize the editor to model HTML: inline asset images carry their stored
  // path in data-asset; emit that path as src (not the temporary object URL).
  function modelHtml(): string {
    const el = ref.current
    if (!el) return ''
    const clone = el.cloneNode(true) as HTMLElement
    clone.querySelectorAll('img[data-asset]').forEach((img) => {
      const path = img.getAttribute('data-asset')
      if (path) {
        img.setAttribute('src', path)
        img.removeAttribute('data-asset')
      }
    })
    return clone.innerHTML
  }

  // For images whose src is a stored asset path, resolve to an object URL for
  // display and tag the element with data-asset so emit() can restore the path.
  function resolveAssetImages() {
    const el = ref.current
    if (!el) return
    el.querySelectorAll('img').forEach((img) => {
      const raw = img.getAttribute('src') || ''
      if (raw && !isDirectUrl(raw) && !img.getAttribute('data-asset')) {
        void resolveAssetUrl(raw).then((url) => {
          if (url) {
            img.setAttribute('data-asset', raw)
            img.src = url
          }
        })
      }
    })
  }

  function emit() {
    onChange(modelHtml())
  }

  function exec(command: string, value?: string) {
    ref.current?.focus()
    document.execCommand(command, false, value)
    emit()
  }

  // Remember the caret/selection before the file dialog steals focus, so the
  // image is inserted where the user was typing.
  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  async function insertImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    let path: string
    try {
      // Stored in assets/ when a project is open (relative path), else a data URL.
      path = await saveAsset(file, 'image')
    } catch {
      return // unsupported format — ignore
    }
    const displaySrc = (await resolveAssetUrl(path)) ?? path

    const el = ref.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
    const img = document.createElement('img')
    img.src = displaySrc
    if (!isDirectUrl(path)) img.setAttribute('data-asset', path)

    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null
    if (range) {
      range.collapse(false)
      range.insertNode(img)
      range.setStartAfter(img)
      range.collapse(true)
      sel!.removeAllRanges()
      sel!.addRange(range)
    } else {
      el.appendChild(img)
    }
    emit()
  }

  const currentWidth = imgSel
    ? parseInt(imgSel.el.style.width, 10) || 100
    : 100

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative' }}>
      {imgSel && (
        <div
          className="absolute z-20 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm"
          style={{ left: imgSel.left, top: Math.max(0, imgSel.top - 40) }}
        >
          <span className="text-xs text-gray-500">{t('width')}</span>
          <input
            type="range"
            min={10}
            max={100}
            value={currentWidth}
            onChange={(e) => setImageWidth(Number(e.target.value))}
            className="accent-brand"
          />
          <span className="w-8 text-xs text-gray-500">{currentWidth}%</span>
        </div>
      )}
      {focused && (
        <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
          <ToolButton label={t('bold')} onClick={() => exec('bold')}>
            <IconBold />
          </ToolButton>
          <ToolButton label={t('italic')} onClick={() => exec('italic')}>
            <IconItalic />
          </ToolButton>
          <ToolButton label={t('underline')} onClick={() => exec('underline')}>
            <IconUnderline />
          </ToolButton>
          <Divider />
          <ToolButton label={t('bulletList')} onClick={() => exec('insertUnorderedList')}>
            <IconBullet />
          </ToolButton>
          <ToolButton label={t('numberedList')} onClick={() => exec('insertOrderedList')}>
            <IconNumbered />
          </ToolButton>
          <Divider />
          <ToolButton label={t('alignLeft')} onClick={() => exec('justifyLeft')}>
            <IconAlign align="left" />
          </ToolButton>
          <ToolButton label={t('alignCenter')} onClick={() => exec('justifyCenter')}>
            <IconAlign align="center" />
          </ToolButton>
          <ToolButton label={t('alignRight')} onClick={() => exec('justifyRight')}>
            <IconAlign align="right" />
          </ToolButton>
          <Divider />
          <ToolButton
            label={t('insertImage')}
            onClick={() => {
              saveSelection()
              fileInputRef.current?.click()
            }}
          >
            <IconImage />
          </ToolButton>
          <ToolButton label={t('clearFormat')} onClick={() => exec('removeFormat')}>
            <IconClear />
          </ToolButton>
        </div>
      )}

      {/* Kept outside the toolbar so it survives the blur when the OS file
          dialog opens (otherwise the change event would never fire). */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={insertImage}
      />

      <div
        ref={ref}
        className="rich-text leading-relaxed text-gray-800"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onClick={onEditorClick}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-gray-200" />
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // Keep the editor's selection: don't let the button steal focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100"
    >
      {children}
    </button>
  )
}

// ── Inline SVG icons (consistent across platforms, unlike emoji) ──

const SVG = (props: { children: ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {props.children}
  </svg>
)

const IconBold = () => (
  <span className="text-sm font-bold">B</span>
)
const IconItalic = () => <span className="text-sm italic">I</span>
const IconUnderline = () => <span className="text-sm underline">U</span>

const IconBullet = () => (
  <SVG>
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1.2" fill="currentColor" />
    <circle cx="4" cy="12" r="1.2" fill="currentColor" />
    <circle cx="4" cy="18" r="1.2" fill="currentColor" />
  </SVG>
)
const IconNumbered = () => (
  <SVG>
    <line x1="10" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="10" y1="18" x2="20" y2="18" />
    <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1</text>
    <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2</text>
    <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3</text>
  </SVG>
)
const IconAlign = ({ align }: { align: 'left' | 'center' | 'right' }) => {
  // Middle line is shorter and positioned per alignment.
  const mid =
    align === 'center'
      ? { x1: '6', x2: '18' }
      : align === 'right'
        ? { x1: '9', x2: '21' }
        : { x1: '3', x2: '15' }
  return (
    <SVG>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1={mid.x1} y1="12" x2={mid.x2} y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </SVG>
  )
}
const IconImage = () => (
  <SVG>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="M21 16l-5-5L5 20" />
  </SVG>
)
const IconClear = () => (
  <SVG>
    <path d="M6 4h12M9 4l-1 16M15 4l1 16M4 8h16" />
  </SVG>
)
