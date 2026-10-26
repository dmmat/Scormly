import { useCourseStore } from '../store/courseStore'
import { useExportStore } from '../export/runExport'
import { useHelpStore } from '../help/helpStore'

/** True when a key event comes from a place where the user is typing. */
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return (
    !!el &&
    (el.isContentEditable ||
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT')
  )
}

/** Editor shortcuts must not reach the course underneath an open overlay. */
export function editorShortcutsBlocked(): boolean {
  const s = useCourseStore.getState()
  const help = useHelpStore.getState()
  return (
    s.previewOpen ||
    s.settingsOpen ||
    s.shortcutsOpen ||
    help.tourOpen ||
    help.dialog !== null ||
    useExportStore.getState().pending !== null
  )
}

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/** Modifier label for shortcut hints: ⌘ on Apple devices, Ctrl elsewhere. */
export const MOD = IS_MAC ? '⌘' : 'Ctrl'

/** Shortcut hints shown in tooltips, menus and the shortcuts help. */
export const KEYS = {
  undo: `${MOD}+Z`,
  redo: IS_MAC ? `${MOD}+Shift+Z` : `${MOD}+Y`,
  save: `${MOD}+S`,
  duplicate: `${MOD}+D`,
  delete: IS_MAC ? '⌫' : 'Del',
  moveUp: `${IS_MAC ? '⌥' : 'Alt'}+↑`,
  moveDown: `${IS_MAC ? '⌥' : 'Alt'}+↓`,
  deselect: 'Esc',
  help: '?',
  // Rich-text editor (matched on the physical key, any layout).
  bold: `${MOD}+B`,
  italic: `${MOD}+I`,
  underline: `${MOD}+U`,
  link: `${MOD}+K`,
  numberedList: `${MOD}+Shift+7`,
  bulletList: `${MOD}+Shift+8`,
  alignLeft: `${MOD}+Shift+L`,
  alignCenter: `${MOD}+Shift+E`,
  alignRight: `${MOD}+Shift+R`,
  clearFormat: `${MOD}+\\`,
  nextCell: 'Tab',
} as const
