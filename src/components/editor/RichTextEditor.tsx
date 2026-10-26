import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useT } from '../../i18n/I18nProvider'
import { saveAsset, resolveAssetUrl } from '../../lib/assets'
import { KEYS } from '../../lib/keyboard'
import ContextMenu, { type ContextMenuItem } from './ContextMenu'
import {
  RT_TABLE_STYLES,
  adjacentCell,
  cellAt,
  createTable,
  deleteColumn,
  deleteRow,
  deleteTable,
  hasHeader,
  insertColumn,
  insertRow,
  insertTable,
  isFit,
  placeCaret,
  setFit,
  setHeaderRow,
  setTableStyle,
  tableStyle,
  type RtTableStyle,
} from './richTable'

type Action = 'bold' | 'italic' | 'underline' | 'ul' | 'ol' | 'left' | 'center' | 'right' | 'clear' | 'link'

const COMMANDS: Partial<Record<Action, string>> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  ul: 'insertUnorderedList',
  ol: 'insertOrderedList',
  left: 'justifyLeft',
  center: 'justifyCenter',
  right: 'justifyRight',
  clear: 'removeFormat',
}

// Ctrl / Cmd + key → action. Matched on the physical key (event.code), so the
// shortcuts work on any keyboard layout (on a Ukrainian layout B types "и").
const INLINE_ACTIONS = new Set<Action>(['bold', 'italic', 'underline', 'link', 'clear'])

const HOTKEYS: Record<string, Action> = {
  KeyB: 'bold',
  KeyI: 'italic',
  KeyU: 'underline',
  KeyK: 'link',
  'Shift+Digit7': 'ol',
  'Shift+Digit8': 'ul',
  'Shift+KeyL': 'left',
  'Shift+KeyE': 'center',
  'Shift+KeyR': 'right',
  Backslash: 'clear',
}

// Links leave the course in a new tab; only web, mail and phone links.
function normalizeUrl(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  if (/^(javascript|data|vbscript|file):/i.test(v)) return null
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v
  if (/^[^\s@/]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`
  if (/^[a-z][\w+.-]*:(?!\d)/i.test(v)) return null // some other scheme
  return `https://${v.replace(/^\/+/, '')}`
}

function queryState(command: string): boolean {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function isDirectUrl(src: string): boolean {
  return /^(data:|blob:|https?:)/.test(src)
}

interface RichTextEditorProps {
  html: string
  /** Called with the new HTML on every edit. The caller handles coalescing. */
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  /** Inline formatting only (bold, italic, underline, links): for short
   *  texts inside shapes, such as process diagram steps. */
  inline?: boolean
}

// Lightweight rich-text editor: a contentEditable area plus a formatting toolbar
// (bold / italic / underline, lists, alignment, image). Dependency-free — uses
// document.execCommand, which produces clean, SCORM-friendly HTML.
export default function RichTextEditor({
  html,
  onChange,
  placeholder,
  className,
  inline = false,
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
  // Right-click menu for an inline image (the block menu would delete the block).
  const [imgMenu, setImgMenu] = useState<{ x: number; y: number } | null>(null)
  const altRef = useRef<HTMLInputElement>(null)
  // Formatting at the caret (toolbar pressed states) and the table cell it is in.
  const [fmt, setFmt] = useState<Partial<Record<Action, boolean>>>({})
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null)
  const [tableMenu, setTableMenu] = useState<{ x: number; y: number; cell: HTMLTableCellElement } | null>(null)
  const [picker, setPicker] = useState(false)
  // Link editor: the URL being typed, and the link the caret was in (if any).
  const [link, setLink] = useState<{ url: string; anchor: HTMLAnchorElement | null } | null>(null)
  // Re-render after table edits that change the DOM but not React state.
  const [, bump] = useReducer((n: number) => n + 1, 0)

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

  function selectImage(el: HTMLImageElement) {
    imgSel?.el.classList.remove('rte-selected-img')
    el.classList.add('rte-selected-img')
    setImgSel(boxFor(el))
  }

  function onEditorClick(e: ReactMouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && rootRef.current) selectImage(target as HTMLImageElement)
    else clearImageSelection()
  }

  // Images and table cells get their own menus; text keeps the browser's.
  function onEditorContextMenu(e: ReactMouseEvent) {
    const target = e.target as HTMLElement
    const c = ref.current ? cellAt(target, ref.current) : null
    if (c && target.tagName !== 'IMG') {
      e.preventDefault()
      setTableMenu({ x: e.clientX, y: e.clientY, cell: c })
      return
    }
    if (target.tagName !== 'IMG' || !rootRef.current) return
    e.preventDefault()
    selectImage(target as HTMLImageElement)
    setImgMenu({ x: e.clientX, y: e.clientY })
  }

  function removeImage() {
    if (!imgSel) return
    imgSel.el.remove()
    clearImageSelection()
    emit()
  }

  function setImageAlt(alt: string) {
    if (!imgSel) return
    imgSel.el.setAttribute('alt', alt)
    emit()
  }

  function setImageWidth(pct: number) {
    if (!imgSel) return
    imgSel.el.style.width = pct + '%'
    imgSel.el.style.height = 'auto'
    emit()
    setImgSel(boxFor(imgSel.el))
  }

  // Track the caret: formatting for the toolbar, and whether it is in a table.
  useEffect(() => {
    if (!focused) return
    function onSelection() {
      const el = ref.current
      const node = window.getSelection()?.anchorNode ?? null
      if (!el || !node || !el.contains(node)) return
      setCell(cellAt(node, el))
      const inLink = !!(node instanceof Element ? node : node.parentElement)?.closest('a')
      setFmt({
        bold: queryState('bold'),
        italic: queryState('italic'),
        // Links are underlined by CSS, which the browser reports as underline.
        underline: !inLink && queryState('underline'),
        ul: queryState('insertUnorderedList'),
        ol: queryState('insertOrderedList'),
        link: inLink,
      })
    }
    onSelection()
    document.addEventListener('selectionchange', onSelection)
    return () => document.removeEventListener('selectionchange', onSelection)
  }, [focused])

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

  function run(action: Action) {
    if (action === 'link') openLink()
    else exec(COMMANDS[action]!)
  }

  // Put the caret back where it was before a popover took focus.
  function restoreSelection() {
    const el = ref.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  // ── Links ──
  function openLink() {
    saveSelection()
    const node = savedRange.current?.startContainer ?? null
    const anchor = ((node instanceof Element ? node : node?.parentElement)?.closest('a') ?? null) as HTMLAnchorElement | null
    setLink({ url: anchor?.getAttribute('href') ?? '', anchor: anchor && ref.current?.contains(anchor) ? anchor : null })
  }

  function applyLink(raw: string) {
    const href = normalizeUrl(raw)
    const current = link?.anchor ?? null
    setLink(null)
    restoreSelection()
    if (!href) return
    if (current) {
      current.setAttribute('href', href)
    } else {
      const sel = window.getSelection()
      if (sel && sel.rangeCount && !sel.isCollapsed) {
        document.execCommand('createLink', false, href)
      } else {
        // Nothing selected: the address itself becomes the link text.
        const a = document.createElement('a')
        a.href = href
        a.textContent = raw.trim()
        const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null
        if (range && ref.current?.contains(range.startContainer)) {
          range.insertNode(a)
          range.setStartAfter(a)
          range.collapse(true)
          sel!.removeAllRanges()
          sel!.addRange(range)
        } else {
          ref.current?.appendChild(a)
        }
      }
    }
    ref.current?.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    })
    emit()
  }

  function removeLink() {
    const anchor = link?.anchor
    setLink(null)
    restoreSelection()
    if (!anchor) return
    anchor.replaceWith(...Array.from(anchor.childNodes))
    emit()
  }

  // ── Tables ──
  function insertTableOf(cols: number, rows: number) {
    setPicker(false)
    const el = ref.current
    if (!el) return
    restoreSelection()
    const table = createTable(cols, rows)
    insertTable(el, savedRange.current, table)
    placeCaret(table.rows[0].cells[0])
    emit()
  }

  // Row / column edits: `op` returns the cell to continue in (null when the
  // table is gone).
  function tableOp(op: (c: HTMLTableCellElement) => HTMLTableCellElement | null, target = cell) {
    const el = ref.current
    if (!target || !el || !el.contains(target)) return
    const next = op(target)
    el.focus()
    if (next) placeCaret(next)
    setCell(next)
    emit()
    bump()
  }

  // Table-wide settings; the caret returns to the same row and column (the
  // header toggle re-creates that row's cells).
  function tableEdit(edit: (table: HTMLTableElement) => void, target = cell) {
    const el = ref.current
    const table = target?.closest('table')
    if (!target || !el || !table || !el.contains(table)) return
    const row = Array.from(table.rows).indexOf(target.parentElement as HTMLTableRowElement)
    const col = target.cellIndex
    edit(table)
    const again = table.rows[row]?.cells[col] ?? null
    el.focus()
    if (again) placeCaret(again)
    setCell(again)
    emit()
    bump()
  }

  function onEditorKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    // Tab moves between table cells; past the last one it adds a row.
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const c = cellAt(window.getSelection()?.anchorNode ?? null, el)
      if (!c) return
      let next = adjacentCell(c, e.shiftKey)
      if (!next && !e.shiftKey) {
        next = (insertRow(c, true).parentElement as HTMLTableRowElement).cells[0]
        emit()
      }
      if (!next) return
      e.preventDefault()
      placeCaret(next)
      return
    }
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return
    const action = HOTKEYS[(e.shiftKey ? 'Shift+' : '') + e.code]
    if (!action || (inline && !INLINE_ACTIONS.has(action))) return
    e.preventDefault()
    run(action)
  }

  function tableMenuItems(c: HTMLTableCellElement): ContextMenuItem[] {
    const table = c.closest('table') as HTMLTableElement
    const inHeader = (c.parentElement as HTMLElement).parentElement?.tagName === 'THEAD'
    return [
      { label: t('rowAbove'), disabled: inHeader, onClick: () => tableOp((x) => insertRow(x, false), c) },
      { label: t('rowBelow'), onClick: () => tableOp((x) => insertRow(x, true), c) },
      { label: t('colLeft'), onClick: () => tableOp((x) => insertColumn(x, false), c) },
      { label: t('colRight'), onClick: () => tableOp((x) => insertColumn(x, true), c) },
      { label: t('deleteRow'), onClick: () => tableOp(deleteRow, c) },
      { label: t('deleteColumn'), onClick: () => tableOp(deleteColumn, c) },
      {
        label: t('headerRow'),
        icon: hasHeader(table) ? '✓' : undefined,
        onClick: () => tableEdit((tb) => setHeaderRow(tb, !hasHeader(tb)), c),
      },
      { label: t('deleteTable'), icon: '✕', danger: true, onClick: () => tableOp((x) => deleteTable(x.closest('table')!), c) },
    ]
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
          <input
            ref={altRef}
            type="text"
            value={imgSel.el.getAttribute('alt') ?? ''}
            onChange={(e) => {
              setImageAlt(e.target.value)
              setImgSel(boxFor(imgSel.el))
            }}
            aria-label={t('altText')}
            placeholder={t('altPlaceholder')}
            className="w-56 rounded border border-gray-200 px-2 py-0.5 text-xs outline-none focus:border-brand"
          />
        </div>
      )}
      {imgMenu && imgSel && (
        <ContextMenu
          x={imgMenu.x}
          y={imgMenu.y}
          onClose={() => setImgMenu(null)}
          items={[
            ...[25, 50, 75, 100].map((n) => ({
              label: t('widthPct', { n }),
              disabled: currentWidth === n,
              onClick: () => setImageWidth(n),
            })),
            // After the menu closes, so its focus handling doesn't steal it back.
            { label: t('altText'), onClick: () => setTimeout(() => altRef.current?.focus()) },
            { label: t('removeImage'), icon: '✕', danger: true, onClick: removeImage },
          ]}
        />
      )}
      {tableMenu && (
        <ContextMenu
          x={tableMenu.x}
          y={tableMenu.y}
          onClose={() => setTableMenu(null)}
          items={tableMenuItems(tableMenu.cell)}
        />
      )}
      {(focused || link || picker) && (
        <div className="relative mb-2 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
          <div className="flex flex-wrap items-center gap-0.5">
            <ToolButton label={t('bold')} keys={KEYS.bold} active={fmt.bold} onClick={() => run('bold')}>
              <IconBold />
            </ToolButton>
            <ToolButton label={t('italic')} keys={KEYS.italic} active={fmt.italic} onClick={() => run('italic')}>
              <IconItalic />
            </ToolButton>
            <ToolButton label={t('underline')} keys={KEYS.underline} active={fmt.underline} onClick={() => run('underline')}>
              <IconUnderline />
            </ToolButton>
            <ToolButton label={t('link')} keys={KEYS.link} active={fmt.link || !!link} onClick={() => (link ? setLink(null) : openLink())}>
              <IconLink />
            </ToolButton>
            {inline ? (
              <ToolButton label={t('clearFormat')} keys={KEYS.clearFormat} onClick={() => run('clear')}>
                <IconClear />
              </ToolButton>
            ) : (
              <>
                <Divider />
                <ToolButton label={t('bulletList')} keys={KEYS.bulletList} active={fmt.ul} onClick={() => run('ul')}>
                  <IconBullet />
                </ToolButton>
                <ToolButton label={t('numberedList')} keys={KEYS.numberedList} active={fmt.ol} onClick={() => run('ol')}>
                  <IconNumbered />
                </ToolButton>
                <Divider />
                <ToolButton label={t('alignLeft')} keys={KEYS.alignLeft} onClick={() => run('left')}>
                  <IconAlign align="left" />
                </ToolButton>
                <ToolButton label={t('alignCenter')} keys={KEYS.alignCenter} onClick={() => run('center')}>
                  <IconAlign align="center" />
                </ToolButton>
                <ToolButton label={t('alignRight')} keys={KEYS.alignRight} onClick={() => run('right')}>
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
                <ToolButton
                  label={t('insertTable')}
                  active={picker}
                  onClick={() => {
                    saveSelection()
                    setLink(null)
                    setPicker((v) => !v)
                  }}
                >
                  <IconTable />
                </ToolButton>
                <ToolButton label={t('clearFormat')} keys={KEYS.clearFormat} onClick={() => run('clear')}>
                  <IconClear />
                </ToolButton>
              </>
            )}
          </div>

          {cell?.isConnected && cell.closest('table') && focused && !picker && !link && (
            <TableBar
              table={cell.closest('table') as HTMLTableElement}
              inHeader={(cell.parentElement as HTMLElement).parentElement?.tagName === 'THEAD'}
              onRow={(below) => tableOp((x) => insertRow(x, below))}
              onColumn={(right) => tableOp((x) => insertColumn(x, right))}
              onDeleteRow={() => tableOp(deleteRow)}
              onDeleteColumn={() => tableOp(deleteColumn)}
              onDeleteTable={() => tableOp((x) => deleteTable(x.closest('table')!))}
              onHeader={(on) => tableEdit((tb) => setHeaderRow(tb, on))}
              onStyle={(style) => tableEdit((tb) => setTableStyle(tb, style))}
              onFit={(fit) => tableEdit((tb) => setFit(tb, fit))}
            />
          )}

          {picker && (
            <TablePicker
              onPick={insertTableOf}
              onCancel={() => {
                setPicker(false)
                restoreSelection()
              }}
              onDismiss={() => setPicker(false)}
            />
          )}

          {link && (
            <LinkEditor
              initial={link.url}
              existing={!!link.anchor}
              onApply={applyLink}
              onRemove={removeLink}
              onCancel={() => {
                setLink(null)
                restoreSelection()
              }}
              onDismiss={() => setLink(null)}
            />
          )}
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
        onKeyDown={onEditorKeyDown}
        onClick={onEditorClick}
        onContextMenu={onEditorContextMenu}
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
  keys,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  /** Shortcut shown in the tooltip. */
  keys?: string
  /** Pressed state (formatting at the caret, an open popover). */
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={keys ? `${label} (${keys})` : label}
      aria-label={label}
      aria-keyshortcuts={keys?.replace('⌘', 'Meta').replace(/ \/ .*$/, '')}
      aria-pressed={active === undefined ? undefined : active}
      // Keep the editor's selection: don't let the button steal focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded disabled:opacity-30 ${
        active ? 'bg-brand/10 text-brand-dark' : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
      }`}
    >
      {children}
    </button>
  )
}

// Table tools, shown while the caret is in a table.
function TableBar({
  table,
  inHeader,
  onRow,
  onColumn,
  onDeleteRow,
  onDeleteColumn,
  onDeleteTable,
  onHeader,
  onStyle,
  onFit,
}: {
  table: HTMLTableElement
  inHeader: boolean
  onRow: (below: boolean) => void
  onColumn: (right: boolean) => void
  onDeleteRow: () => void
  onDeleteColumn: () => void
  onDeleteTable: () => void
  onHeader: (on: boolean) => void
  onStyle: (style: RtTableStyle) => void
  onFit: (fit: boolean) => void
}) {
  const { t } = useT('richtext')
  const style = tableStyle(table)
  const header = hasHeader(table)
  const fit = isFit(table)
  const keep = (e: ReactMouseEvent) => e.preventDefault()
  return (
    <div className="mt-1 flex flex-wrap items-center gap-0.5 border-t border-gray-100 pt-1">
      <span className="px-1.5 text-xs font-medium text-gray-500">{t('table')}</span>
      <ToolButton label={t('rowAbove')} disabled={inHeader} onClick={() => onRow(false)}>
        <IconRow above />
      </ToolButton>
      <ToolButton label={t('rowBelow')} onClick={() => onRow(true)}>
        <IconRow />
      </ToolButton>
      <ToolButton label={t('colLeft')} onClick={() => onColumn(false)}>
        <IconCol left />
      </ToolButton>
      <ToolButton label={t('colRight')} onClick={() => onColumn(true)}>
        <IconCol />
      </ToolButton>
      <ToolButton label={t('deleteRow')} onClick={onDeleteRow}>
        <IconDeleteRow />
      </ToolButton>
      <ToolButton label={t('deleteColumn')} onClick={onDeleteColumn}>
        <IconDeleteCol />
      </ToolButton>
      <Divider />
      <ToolButton label={t('headerRow')} active={header} onClick={() => onHeader(!header)}>
        <IconHeaderRow />
      </ToolButton>
      <ToolButton label={t('fullWidth')} active={!fit} onClick={() => onFit(!fit)}>
        <IconFullWidth />
      </ToolButton>
      <span role="radiogroup" aria-label={t('tableStyle')} className="ml-1 inline-flex rounded-md bg-gray-100 p-0.5">
        {RT_TABLE_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={style === s}
            onMouseDown={keep}
            onClick={() => onStyle(s)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              style === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t(`style_${s}`)}
          </button>
        ))}
      </span>
      <Divider />
      <ToolButton label={t('deleteTable')} onClick={onDeleteTable}>
        <IconTrash />
      </ToolButton>
    </div>
  )
}

const PICK_COLS = 8
const PICK_ROWS = 8

// Hover (or arrow keys) to choose the table size; rows count the header row.
// Esc cancels (back to the text); clicking elsewhere just closes it.
function TablePicker({
  onPick,
  onCancel,
  onDismiss,
}: {
  onPick: (cols: number, rows: number) => void
  onCancel: () => void
  onDismiss: () => void
}) {
  const { t } = useT('richtext')
  const [size, setSize] = useState({ cols: 3, rows: 3 })
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])

  function onKeyDown(e: ReactKeyboardEvent) {
    const d: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }
    if (d[e.key]) {
      e.preventDefault()
      setSize((s) => ({
        cols: Math.min(PICK_COLS, Math.max(1, s.cols + d[e.key][0])),
        rows: Math.min(PICK_ROWS, Math.max(2, s.rows + d[e.key][1])),
      }))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPick(size.cols, size.rows)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCancel()
    }
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label={t('tableSizeHint')}
      onKeyDown={onKeyDown}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && onDismiss()}
      className="mt-1 inline-flex flex-col gap-1.5 border-t border-gray-100 p-1.5 pt-2 outline-none"
    >
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${PICK_COLS}, 1.125rem)` }}>
        {Array.from({ length: PICK_ROWS * PICK_COLS }, (_, i) => {
          const col = (i % PICK_COLS) + 1
          const row = Math.floor(i / PICK_COLS) + 1
          const on = col <= size.cols && row <= size.rows
          return (
            <span
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setSize({ cols: col, rows: Math.max(2, row) })}
              onClick={() => onPick(col, Math.max(2, row))}
              className={`h-[1.125rem] cursor-pointer rounded-[3px] border ${
                on ? 'border-brand bg-brand/20' : 'border-gray-200 bg-white'
              } ${row === 1 && on ? 'bg-brand/40' : ''}`}
            />
          )
        })}
      </div>
      <span aria-live="polite" className="text-xs text-gray-500">
        {t('tableSize', { cols: size.cols, rows: size.rows })}
      </span>
    </div>
  )
}

// URL field for adding or changing a link (Enter applies, Esc cancels,
// clicking elsewhere closes it).
function LinkEditor({
  initial,
  existing,
  onApply,
  onRemove,
  onCancel,
  onDismiss,
}: {
  initial: string
  existing: boolean
  onApply: (url: string) => void
  onRemove: () => void
  onCancel: () => void
  onDismiss: () => void
}) {
  const { t } = useT('richtext')
  const [url, setUrl] = useState(initial)
  const valid = !url.trim() || normalizeUrl(url) !== null
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onApply(url)
      }}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && onDismiss()}
      className="mt-1 flex flex-wrap items-center gap-2 border-t border-gray-100 px-1 pt-2 pb-1"
    >
      <input
        autoFocus
        type="text"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            onCancel()
          }
        }}
        aria-label={t('linkUrl')}
        aria-invalid={!valid}
        placeholder={t('linkPlaceholder')}
        className={`min-w-0 flex-1 rounded border px-2 py-1 text-sm outline-none ${
          valid ? 'border-gray-300 focus:border-brand' : 'border-red-400'
        }`}
      />
      <button type="submit" disabled={!valid || !url.trim()} className="btn-primary px-3 py-1 text-sm">
        {existing ? t('linkUpdate') : t('linkAdd')}
      </button>
      {existing && (
        <button type="button" onClick={onRemove} className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
          {t('linkRemove')}
        </button>
      )}
      {!valid && <span className="basis-full text-xs text-red-600">{t('linkInvalid')}</span>}
    </form>
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
const IconLink = () => (
  <SVG>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </SVG>
)
const IconTable = () => (
  <SVG>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9.5 4v16M15 4v16" />
  </SVG>
)
const IconRow = ({ above }: { above?: boolean }) => (
  <SVG>
    <rect x="3" y={above ? 12 : 3} width="18" height="9" rx="1.5" />
    <path d={above ? 'M12 3v6M9 6h6' : 'M12 15v6M9 18h6'} />
  </SVG>
)
const IconCol = ({ left }: { left?: boolean }) => (
  <SVG>
    <rect x={left ? 12 : 3} y="3" width="9" height="18" rx="1.5" />
    <path d={left ? 'M3 12h6M6 9v6' : 'M15 12h6M18 9v6'} />
  </SVG>
)
const IconDeleteRow = () => (
  <SVG>
    <rect x="3" y="7.5" width="18" height="9" rx="1.5" />
    <path d="M10 10l4 4M14 10l-4 4" />
  </SVG>
)
const IconDeleteCol = () => (
  <SVG>
    <rect x="7.5" y="3" width="9" height="18" rx="1.5" />
    <path d="M10 10l4 4M14 10l-4 4" />
  </SVG>
)
const IconHeaderRow = () => (
  <SVG>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M3 7h18" strokeWidth="5" opacity="0.35" />
  </SVG>
)
const IconFullWidth = () => (
  <SVG>
    <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
  </SVG>
)
const IconTrash = () => (
  <SVG>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </SVG>
)
const IconClear = () => (
  <SVG>
    <path d="M6 4h12M9 4l-1 16M15 4l1 16M4 8h16" />
  </SVG>
)
