import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { INTRO_BLOCK_TYPES, INTRO_ID, type BlockType } from '../../types/course'
import {
  BLOCK_CATEGORIES,
  BLOCK_REGISTRY,
  blockVariants,
  type BlockCategory,
} from '../../blocks/registry'
import { useCourseStore } from '../../store/courseStore'
import { useMenu } from '../../hooks/useMenu'
import { useT } from '../../i18n/I18nProvider'
import BlockIcon from '../../blocks/BlockIcon'
import { BLOCK_TEMPLATES, TEMPLATE_GROUPS, type BlockTemplate, type TemplateGroup } from '../../blocks/templates'
import { createBlock } from '../../blocks/registry'
import BlockHoverPreview from './BlockHoverPreview'
import type { Block } from '../../types/course'

interface AddBlockMenuProps {
  lessonId: string
  /** Insertion position; defaults to the end of the lesson. */
  atIndex?: number
  /** 'inline' = a hover-revealed "+" on a divider line between blocks. */
  variant?: 'button' | 'inline'
  /** Inline only: take no height (between blocks joined into one panel). */
  tight?: boolean
}

/** Menu width in rem. */
const MENU_REM = 40
/** Menu height in px: the largest group (basic Interactive blocks) fits
 *  without scrolling. The menu keeps this size whatever group or search
 *  results it shows (the list scrolls), capped to the window. */
const MENU_HEIGHT = 620
/** Fixed app header (h-14), for when the menu isn't inside the canvas. */
const HEADER_BOTTOM = 56
const MARGIN = 16

interface MenuItem {
  key: string
  icon: BlockType
  title: string
  description: string
  make: () => Block[]
  add: () => void
  /** Basic blocks: the block type and its styles (first = default). */
  type?: BlockType
  variants?: { id: string; label: string }[]
  /** Search matched only this style: the item inserts it. */
  matched?: string
}

interface MenuGroup {
  id: string
  section: 'tpl' | 'blk'
  sectionLabel: string
  label: string
  icon: BlockType
  /** Items in the group regardless of the search. */
  total: number
  items: MenuItem[]
}

const SECTIONS = ['tpl', 'blk'] as const

const TEMPLATE_GROUP_ICON: Record<TemplateGroup, BlockType> = {
  text: 'paragraph',
  quotes: 'quote',
  media: 'image',
  structure: 'divider',
}

const CATEGORY_ICON: Record<BlockCategory, BlockType> = {
  text: 'heading',
  media: 'gallery',
  structure: 'process',
  interactive: 'hotspot',
  assessment: 'quiz',
  navigation: 'continue',
}

// The last opened group, remembered while the app is open.
let lastGroup = 'tpl:text'

// Templates that only make cover-page-friendly blocks (computed once).
let introTemplates: Set<string> | null = null
function introTemplateIds(): Set<string> {
  introTemplates ??= new Set(
    BLOCK_TEMPLATES.filter((tpl) => tpl.create().every((b) => INTRO_BLOCK_TYPES.includes(b.type))).map(
      (tpl) => tpl.id,
    ),
  )
  return introTemplates
}

const CATEGORY_KEY: Record<BlockCategory, string> = {
  text: 'catText',
  media: 'catMedia',
  structure: 'catStructure',
  interactive: 'catInteractive',
  assessment: 'catAssessment',
  navigation: 'catNavigation',
}

export default function AddBlockMenu({
  lessonId,
  atIndex,
  variant = 'button',
  tight = false,
}: AddBlockMenuProps) {
  const addBlock = useCourseStore((s) => s.addBlock)
  const insertBlocks = useCourseStore((s) => s.insertBlocks)
  const { t } = useT('common')
  const { t: tb } = useT('blocks')
  const { t: td } = useT('design')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  // Fixed size and offset from the trigger's wrapper, set when the menu opens.
  const [box, setBox] = useState({ top: 0, left: 0, width: MENU_REM * 16, height: MENU_HEIGHT })
  // Hover preview: shown after a short pause on an item, beside the menu.
  // Positioned (fixed) next to the menu from its rect when it appears; null
  // when there's no room on either side.
  const [hover, setHover] = useState<
    { key: string; title: string; description: string; blocks: Block[]; left: number; top: number } | null
  >(null)
  // Key of the preview on screen, so moving to another item or style swaps it
  // at once instead of waiting again.
  const hoverShown = useRef<string | null>(null)
  // The item whose style chips are open (hover / focus), and on which side.
  const [chips, setChips] = useState<{ key: string; up: boolean } | null>(null)
  const chipsTimer = useRef<number | undefined>(undefined)
  const listRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Every item lives in exactly one group: ready-made templates by template
  // group, then basic blocks by registry category. Without a search the
  // selected group is shown; a search lists every match, grouped.
  const q = query.trim().toLowerCase()
  const hit = (title: string, description: string) =>
    !q || title.toLowerCase().includes(q) || description.toLowerCase().includes(q)
  // The cover page takes content blocks only.
  const forIntro = lessonId === INTRO_ID
  const groups: MenuGroup[] = [
    ...TEMPLATE_GROUPS.map((group) => {
      const all = BLOCK_TEMPLATES.filter(
        (tpl) => tpl.group === group && (!forIntro || introTemplateIds().has(tpl.id)),
      )
      return {
        id: `tpl:${group}`,
        section: 'tpl' as const,
        sectionLabel: td('catTemplates'),
        label: td(`tplGroup_${group}`),
        icon: TEMPLATE_GROUP_ICON[group],
        total: all.length,
        items: all
          .map((tpl) => ({
            key: `tpl-${tpl.id}`,
            icon: tpl.icon,
            title: td(`tpl_${tpl.id}`),
            description: td(`tpl_${tpl.id}Desc`),
            make: tpl.create,
            add: () => handleTemplate(tpl),
          }))
          .filter((it) => hit(it.title, it.description)),
      }
    }),
    ...BLOCK_CATEGORIES.map(({ category }) => {
      const all = Object.values(BLOCK_REGISTRY).filter(
        (m) => m.category === category && (!forIntro || INTRO_BLOCK_TYPES.includes(m.type)),
      )
      return {
        id: `blk:${category}`,
        section: 'blk' as const,
        sectionLabel: td('catBasicBlocks'),
        label: t(CATEGORY_KEY[category]),
        icon: CATEGORY_ICON[category],
        total: all.length,
        items: all
          .map((m): MenuItem => {
            const title = tb(m.type)
            const description = tb(`${m.type}Desc`)
            const variants = blockVariants(m.type).map((v) => ({ id: v.id, label: tb(`variant_${m.type}_${v.id}`) }))
            // Typing a style's name ("chevron") finds its block, set to that
            // style — unless the block's own name matches.
            const matched = q && !title.toLowerCase().includes(q)
              ? variants.find((v) => v.label.toLowerCase().includes(q))?.id
              : undefined
            return {
              key: m.type,
              icon: m.type,
              title,
              description,
              make: () => [createBlock(m.type, matched)],
              add: () => handleAdd(m.type, matched),
              type: m.type,
              variants: variants.length ? variants : undefined,
              matched,
            }
          })
          .filter((it) => hit(it.title, it.description) || it.matched),
      }
    }),
  ].filter((g) => g.total > 0)
  const [pickedGroup, setActiveGroup] = useState(lastGroup)
  // The remembered group may not exist here (e.g. Interactive on the cover page).
  const activeGroup = groups.some((g) => g.id === pickedGroup) ? pickedGroup : groups[0]?.id
  function selectGroup(id: string) {
    lastGroup = id
    setActiveGroup(id)
  }
  const visible = q ? groups.filter((g) => g.items.length > 0) : groups.filter((g) => g.id === activeGroup)

  // One size for the whole time the menu is open, so it never jumps as the
  // group or the search results change: MENU_REM × MENU_HEIGHT, or less when
  // the canvas / window is smaller. It opens below the trigger, else above it,
  // else wherever it fits fully on screen (covering the trigger rather than
  // shrinking); horizontally it stays inside the canvas, clear of the sidebar.
  function toggle() {
    if (!open) {
      setQuery('')
      const trigger = triggerRef.current?.getBoundingClientRect()
      const root = rootRef.current?.getBoundingClientRect()
      if (trigger && root) {
        // The canvas scrolls and clips its content, so the menu must fit in it
        // (below the app header and any banner over the canvas).
        const area = rootRef.current?.closest('.canvas')?.getBoundingClientRect() ?? {
          left: 0,
          right: window.innerWidth,
          top: HEADER_BOTTOM,
          bottom: window.innerHeight,
        }
        const minTop = Math.max(HEADER_BOTTOM, area.top) + MARGIN
        const maxBottom = Math.min(window.innerHeight, area.bottom) - MARGIN
        const height = Math.max(240, Math.min(MENU_HEIGHT, maxBottom - minTop))
        let top = trigger.bottom + 8
        if (top + height > maxBottom) {
          top = trigger.top - 8 - height
          if (top < minTop) top = Math.max(minTop, maxBottom - height)
        }
        const side = 8
        const width = Math.min(MENU_REM * 16, area.right - area.left - 2 * side)
        const center = (trigger.left + trigger.right) / 2
        const left = Math.min(Math.max(center - width / 2, area.left + side), area.right - side - width)
        setBox({ top: top - root.top, left: left - root.left, width, height })
      }
    }
    setOpen((v) => !v)
  }

  // Focus the search field when the menu opens (desktop convenience).
  useEffect(() => {
    if (open) searchRef.current?.focus()
    else {
      window.clearTimeout(hoverTimer.current)
      window.clearTimeout(chipsTimer.current)
      hoverShown.current = null
      setHover(null)
      setChips(null)
    }
  }, [open])
  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current)
      window.clearTimeout(chipsTimer.current)
    },
    [],
  )

  // Props for an item (or style chip) that previews `make()` after a short
  // hover / focus. Once a preview is up, the next item or chip swaps it at
  // once; leaving keeps it a moment, so the pointer can reach the chips.
  function previewProps(key: string, title: string, description: string, make: () => Block[]) {
    const show = () => {
      const pos = previewPosition()
      if (!pos) return
      hoverShown.current = key
      setHover({ key, title, description, blocks: make(), ...pos })
    }
    const start = () => {
      window.clearTimeout(hoverTimer.current)
      if (hoverShown.current) show()
      else hoverTimer.current = window.setTimeout(show, 450)
    }
    const stop = () => {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = window.setTimeout(() => {
        hoverShown.current = null
        setHover(null)
      }, 150)
    }
    return { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop }
  }

  // Style chips of an item: shown over the items below it (or above, near the
  // bottom of the list), so nothing in the menu moves. Keyboard focus opens
  // them at once; the pointer after a beat, so sweeping across items doesn't
  // flash them.
  function chipProps(item: MenuItem) {
    if (!item.variants) return {}
    const openNow = (el: HTMLElement) => {
      window.clearTimeout(chipsTimer.current)
      const list = listRef.current?.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const up = !!list && r.bottom > list.top + list.height * 0.62
      setChips((c) => (c?.key === item.key ? c : { key: item.key, up }))
    }
    const close = () => {
      window.clearTimeout(chipsTimer.current)
      setChips((c) => (c?.key === item.key ? null : c))
    }
    return {
      onMouseEnter: (e: MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        window.clearTimeout(chipsTimer.current)
        chipsTimer.current = window.setTimeout(() => openNow(el), 120)
      },
      onMouseLeave: (e: MouseEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(document.activeElement)) close()
        else window.clearTimeout(chipsTimer.current)
      },
      onFocus: (e: FocusEvent<HTMLDivElement>) => openNow(e.currentTarget),
      onBlur: (e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close()
      },
    }
  }

  // Beside the menu — right if the 22rem card fits in the window, else left —
  // aligned with its top and kept inside the viewport. It floats over the app
  // (sidebar included), so the canvas edge doesn't clip it.
  function previewPosition(): { left: number; top: number } | null {
    const rect = menuRef.current?.getBoundingClientRect()
    if (!rect || window.innerWidth < 1024) return null
    const width = 352
    const gap = 16
    const left =
      rect.right + gap + width <= window.innerWidth - 8
        ? rect.right + gap
        : rect.left - gap - width >= 8
          ? rect.left - gap - width
          : null
    if (left === null) return null
    const top = Math.max(64, Math.min(rect.top, window.innerHeight - 440))
    return { left, top }
  }

  // Search keeps focus on open; ↓ moves into the block list.
  useMenu({ open, onClose: () => setOpen(false), rootRef, triggerRef, focusFirst: false })

  // A style other than the default goes in as one ready-made block (one undo
  // step, selected, like the default).
  function handleAdd(type: BlockType, variantId?: string) {
    if (variantId && variantId !== blockVariants(type)[0]?.id) insertBlocks(lessonId, [createBlock(type, variantId)], atIndex)
    else addBlock(lessonId, type, atIndex)
    setOpen(false)
    setQuery('')
  }

  function handleTemplate(tpl: BlockTemplate) {
    insertBlocks(lessonId, tpl.create(), atIndex)
    setOpen(false)
    setQuery('')
  }

  const inline = variant === 'inline'
  // Inline trigger stays hidden until hovered/focused (always faintly visible
  // on touch screens, which have no hover) and while its menu is open.
  const reveal = open
    ? 'opacity-100'
    : 'opacity-0 group-hover/gap:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-60'

  return (
    <div
      ref={rootRef}
      data-tour={inline ? undefined : 'add-block'}
      className={
        inline
          ? `group/gap relative flex items-center justify-center ${tight ? 'z-10 h-0' : 'h-5'}`
          : 'relative flex justify-center'
      }
    >
      {inline ? (
        <>
          <div
            aria-hidden
            className={`absolute inset-x-4 top-1/2 h-px bg-brand/40 transition-opacity ${
              open ? 'opacity-100' : 'opacity-0 group-hover/gap:opacity-100'
            }`}
          />
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            title={t('insertBlock')}
            aria-label={t('insertBlock')}
            className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-brand/40 bg-white text-sm leading-none text-brand shadow-sm transition-opacity hover:bg-brand hover:text-white ${reveal}`}
          >
            +
          </button>
        </>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand"
        >
          <span className="text-base leading-none">+</span> {t('addBlock')}
        </button>
      )}

      {open &&
        hover &&
        createPortal(
          <div className="fixed z-50" style={{ left: hover.left, top: hover.top }}>
            <BlockHoverPreview key={hover.key} title={hover.title} description={hover.description} blocks={hover.blocks} />
          </div>,
          // Inside the themed builder root so the theme's colors apply.
          rootRef.current?.closest('[data-theme]') ?? document.body,
        )}
      {open && (
        <div
          ref={menuRef}
          style={box}
          className="pop-in absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          <div className="border-b border-gray-100 p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                const first = visible.flatMap((g) => g.items)[0]
                if (first) {
                  e.preventDefault()
                  first.add()
                }
              }}
              placeholder={t('searchBlocks')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            {/* Section rail: ready-made groups, then basic block categories. */}
            <nav
              aria-label={td('blockSections')}
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50/80 p-2 sm:w-52 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-2.5"
            >
              {SECTIONS.map((section) => (
                <div key={section} className="contents sm:block sm:pb-2">
                  <p className="hidden px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-gray-400 sm:flex sm:items-center sm:gap-1.5">
                    {section === 'tpl' && <span aria-hidden className="text-brand">✦</span>}
                    {section === 'tpl' ? td('catTemplates') : td('catBasicBlocks')}
                  </p>
                  {groups
                    .filter((g) => g.section === section)
                    .map((g) => {
                      const count = q ? g.items.length : g.total
                      const active = !q && g.id === activeGroup
                      return (
                        <button
                          key={g.id}
                          type="button"
                          aria-current={active || undefined}
                          disabled={q !== '' && count === 0}
                          onClick={() => {
                            setQuery('')
                            selectGroup(g.id)
                          }}
                          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 text-left text-[13px] transition sm:w-full ${
                            active
                              ? 'bg-white font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-600 hover:bg-white/70 hover:text-gray-900 disabled:opacity-35'
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                              section === 'tpl'
                                ? 'bg-gradient-to-br from-brand to-brand-dark text-white'
                                : active ? 'bg-brand/15 text-brand-dark' : 'bg-gray-200/70 text-gray-500'
                            }`}
                          >
                            <BlockIcon type={g.icon} className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate sm:whitespace-normal sm:leading-tight">{g.label}</span>
                          <span className="rounded-full px-1.5 text-[11px] tabular-nums text-gray-400">{count}</span>
                        </button>
                      )
                    })}
                </div>
              ))}
            </nav>

            <div
              ref={listRef}
              role="menu"
              className={`min-h-0 flex-1 overflow-y-auto p-3 ${visible.length === 0 ? 'flex items-center justify-center' : ''}`}
            >
              {visible.map((g) => (
                <section key={g.id} className="mb-4 last:mb-0" aria-label={`${g.sectionLabel}: ${g.label}`}>
                  <header className="sticky -top-3 z-10 -mx-3 mb-2 flex items-baseline gap-2 border-b border-gray-100 bg-white/95 px-3 pb-2 pt-1 backdrop-blur">
                    <span className={`text-[10.5px] font-semibold uppercase tracking-[0.12em] ${g.section === 'tpl' ? 'text-brand-dark' : 'text-gray-400'}`}>
                      {g.sectionLabel}
                    </span>
                    <span aria-hidden className="text-gray-300">/</span>
                    <h3 className="text-sm font-semibold text-gray-900">{g.label}</h3>
                    <span className="ml-auto text-xs tabular-nums text-gray-400">{g.items.length}</span>
                  </header>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {g.items.map((item) => {
                      const showChips = chips?.key === item.key && item.variants
                      const matchedLabel = item.variants?.find((v) => v.id === item.matched)?.label
                      return (
                        <div key={item.key} className="relative flex" {...chipProps(item)}>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={item.add}
                            {...previewProps(item.key, item.title, item.description, item.make)}
                            className={`flex w-full flex-col gap-1 rounded-xl border p-2.5 text-left transition focus:outline-none ${
                              g.section === 'tpl'
                                ? 'border-gray-100 bg-gradient-to-br from-white to-brand/[0.04] hover:-translate-y-px hover:border-brand/40 hover:shadow-sm focus:border-brand/40 focus:bg-brand/5'
                                : showChips
                                  ? 'border-brand/40 bg-brand/5'
                                  : 'border-gray-100 hover:border-brand/40 hover:bg-brand/5 focus:border-brand/40 focus:bg-brand/5'
                            }`}
                          >
                            <span className="flex w-full items-center gap-2">
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                  g.section === 'tpl'
                                    ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm'
                                    : 'bg-brand/10 text-brand'
                                }`}
                              >
                                <BlockIcon type={item.icon} />
                              </span>
                              <span className="min-w-0 flex-1 text-sm font-medium leading-tight text-gray-800">{item.title}</span>
                              {item.variants &&
                                (matchedLabel ? (
                                  <span className="shrink-0 rounded-full bg-brand/15 px-1.5 py-px text-[10.5px] font-medium text-brand-dark">
                                    {matchedLabel}
                                  </span>
                                ) : (
                                  // Compact "has styles" mark, so titles keep to one line.
                                  <span
                                    title={tb('variantsCount', { n: item.variants.length })}
                                    className="flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-px text-[10.5px] font-medium tabular-nums text-gray-500"
                                  >
                                    <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                                      <rect x="2" y="5.5" width="9" height="8" rx="1.5" />
                                      <path d="M5 3h7.5A1.5 1.5 0 0 1 14 4.5V11" />
                                    </svg>
                                    <span aria-hidden>{item.variants.length}</span>
                                    <span className="sr-only">{tb('variantsCount', { n: item.variants.length })}</span>
                                  </span>
                                ))}
                            </span>
                            <span className="text-xs leading-tight text-gray-500">{item.description}</span>
                          </button>
                          {showChips && item.type && (
                            // The transparent padding bridges the pointer from the card to the chips.
                            <div className={`absolute inset-x-0 z-20 ${chips.up ? 'bottom-full pb-1' : 'top-full pt-1'}`}>
                              <div
                                role="group"
                                aria-label={tb('variantStyles', { block: item.title })}
                                className="pop-in flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                              >
                                {item.variants!.map((v) => {
                                  const label = `${item.title} — ${v.label}`
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      role="menuitem"
                                      aria-label={label}
                                      onClick={() => handleAdd(item.type!, v.id)}
                                      {...previewProps(`${item.key}:${v.id}`, label, item.description, () => [
                                        createBlock(item.type!, v.id),
                                      ])}
                                      className={`rounded-full border px-2 py-0.5 text-[11.5px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                                        v.id === item.matched
                                          ? 'border-brand/50 bg-brand/10 text-brand-dark'
                                          : 'border-gray-200 text-gray-600 hover:border-brand/50 hover:bg-brand/5 hover:text-brand-dark focus:border-brand/50 focus:bg-brand/5 focus:text-brand-dark'
                                      }`}
                                    >
                                      {v.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
              {visible.length === 0 && (
                <p className="px-1 text-center text-sm text-gray-400">{t('noBlocks')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
