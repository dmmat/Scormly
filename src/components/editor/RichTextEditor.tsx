import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useT } from '../../i18n/I18nProvider'

interface RichTextEditorProps {
  html: string
  /** Called with the new HTML on every edit. The caller handles coalescing. */
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Lightweight rich-text editor: a contentEditable area plus a formatting toolbar
// (bold / italic / underline, lists, alignment). Dependency-free — uses
// document.execCommand, which produces clean, SCORM-friendly HTML. The toolbar
// shows while the field is focused.
export default function RichTextEditor({
  html,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const { t } = useT('richtext')
  const ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  // Seed/resync innerHTML only when the field is NOT focused, so typing never
  // moves the caret.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement !== el && el.innerHTML !== html) {
      el.innerHTML = html
    }
  }, [html])

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value)
    ref.current?.focus()
    emit()
  }

  function insertImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      // TODO (Phase 3): copy into the project's assets/ instead of a data URL.
      exec('insertImage', String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={className}>
      {focused && (
        <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
          <ToolButton label={t('bold')} onClick={() => exec('bold')}>
            <span className="font-bold">B</span>
          </ToolButton>
          <ToolButton label={t('italic')} onClick={() => exec('italic')}>
            <span className="italic">I</span>
          </ToolButton>
          <ToolButton label={t('underline')} onClick={() => exec('underline')}>
            <span className="underline">U</span>
          </ToolButton>
          <Divider />
          <ToolButton label={t('bulletList')} onClick={() => exec('insertUnorderedList')}>
            •☰
          </ToolButton>
          <ToolButton label={t('numberedList')} onClick={() => exec('insertOrderedList')}>
            1.
          </ToolButton>
          <Divider />
          <ToolButton label={t('alignLeft')} onClick={() => exec('justifyLeft')}>
            ⇤
          </ToolButton>
          <ToolButton label={t('alignCenter')} onClick={() => exec('justifyCenter')}>
            ↔
          </ToolButton>
          <ToolButton label={t('alignRight')} onClick={() => exec('justifyRight')}>
            ⇥
          </ToolButton>
          <Divider />
          <ToolButton
            label={t('insertImage')}
            onClick={() => fileInputRef.current?.click()}
          >
            🖼
          </ToolButton>
          <ToolButton label={t('clearFormat')} onClick={() => exec('removeFormat')}>
            ⌫
          </ToolButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={insertImage}
          />
        </div>
      )}

      <div
        ref={ref}
        className="rich-text leading-relaxed text-gray-800"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
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
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // Keep the editor's selection: don't let the button steal focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm text-gray-600 hover:bg-gray-100"
    >
      {children}
    </button>
  )
}
