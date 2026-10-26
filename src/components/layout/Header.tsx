import { useRef, useState } from 'react'
import { useMenu } from '../../hooks/useMenu'
import Logo from './Logo'
import ThemePicker from '../editor/ThemePicker'
import LanguagePicker from '../editor/LanguagePicker'
import ProjectMenu from '../editor/ProjectMenu'
import { useCourseStore } from '../../store/courseStore'
import { useT, useLang } from '../../i18n/I18nProvider'
import { saveProject } from '../../lib/projectService'
import ExportMenu from '../editor/ExportMenu'
import { requestExport, runExport, useExportStore } from '../../export/runExport'
import { GITHUB_ISSUES_URL } from '../../lib/links'
import HelpMenu from '../help/HelpMenu'
import { useHelpStore } from '../../help/helpStore'
import { KEYS } from '../../lib/keyboard'
import { useRoute } from '../../hooks/useRoute'
import { BROWSER_KEY_PREFIX } from '../../lib/browserProjects'

export default function Header() {
  const [moreOpen, setMoreOpen] = useState(false)
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  // Projects that aren't files on the computer (kept in this browser, or only
  // in this tab) get an explicit .zip download: it's how they're backed up
  // and shared.
  const { projectKey } = useRoute()
  const inBrowser = !!directoryHandle && !!projectKey?.startsWith(BROWSER_KEY_PREFIX)
  const zipButton =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:border-brand/40 hover:bg-gray-50 disabled:opacity-40'
  const saveState = useCourseStore((s) => s.saveState)
  const lastSavedAt = useCourseStore((s) => s.lastSavedAt)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const setSidebarOpen = useCourseStore((s) => s.setSidebarOpen)
  const startTour = useHelpStore((s) => s.startTour)
  const openHelpDialog = useHelpStore((s) => s.openDialog)
  const { t: th } = useT('help')
  const exporting = useExportStore((s) => s.exporting)
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const { t: tp } = useT('preview')
  const { lang, setLang } = useLang()
  const moreRef = useRef<HTMLDivElement>(null)
  const moreTriggerRef = useRef<HTMLButtonElement>(null)

  useMenu({ open: moreOpen, onClose: () => setMoreOpen(false), rootRef: moreRef, triggerRef: moreTriggerRef })

  const saveLabel =
    saveState === 'saving'
      ? tw('saving')
      : saveState === 'saved'
        ? tw('saved')
        : saveState === 'error'
          ? tw('saveError')
          : tw('save')

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-200/80 bg-white/90 px-3 shadow-[0_1px_0_rgba(15,23,42,0.02),0_4px_16px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t('course')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 md:hidden"
        >
          ☰
        </button>
        <div className="shrink-0">
          <Logo />
        </div>
        <ProjectMenu />
      </div>

      {/* Desktop controls */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title={`${t('undo')} (${KEYS.undo})`}
            aria-label={t('undo')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title={`${t('redo')} (${KEYS.redo})`}
            aria-label={t('redo')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            ↷
          </button>
        </div>

        <ThemePicker />
        <LanguagePicker />

        <HelpMenu />

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          data-tour="preview"
          onClick={() => setPreviewOpen(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          {tp('open')}
        </button>
        {directoryHandle ? (
          <button
            type="button"
            data-tour="save"
            onClick={() => void saveProject()}
            disabled={saveState === 'saving'}
            title={
              lastSavedAt
                ? `${t('savedAt', { time: new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })} · ${tw('save')} (${KEYS.save})`
                : `${tw('save')} (${KEYS.save})`
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 ${
              saveState === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {saveLabel}
          </button>
        ) : (
          <button
            type="button"
            data-tour="save"
            onClick={() => void runExport('project')}
            disabled={exporting}
            title={`${tw('saveZipTitle')} (${KEYS.save})`}
            className={zipButton}
          >
            <DownloadIcon />
            {tw('saveZip')}
          </button>
        )}
        {inBrowser && (
          <button
            type="button"
            onClick={() => void runExport('project')}
            disabled={exporting}
            title={tw('downloadZipBrowserTitle')}
            className={zipButton}
          >
            <DownloadIcon />
            {tw('downloadZip')}
          </button>
        )}
        <ExportMenu />
      </div>

      {/* Mobile controls */}
      <div className="flex items-center gap-1.5 md:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label={tp('open')}
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
        >
          ▷
        </button>
        <div ref={moreRef} className="relative">
          <button
            ref={moreTriggerRef}
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label={t('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            ⋯
          </button>
          {moreOpen && (
            <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
              {inBrowser && (
                <MoreItem
                  label={tw('downloadZip')}
                  disabled={exporting}
                  onClick={() => {
                    void runExport('project')
                    setMoreOpen(false)
                  }}
                />
              )}
              <MoreItem
                label={directoryHandle ? saveLabel : tw('saveZip')}
                disabled={(!!directoryHandle && saveState === 'saving') || (!directoryHandle && exporting)}
                onClick={() => {
                  void (directoryHandle ? saveProject() : runExport('project'))
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('export2004')}
                disabled={exporting}
                onClick={() => {
                  requestExport('scorm2004')
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('export12')}
                disabled={exporting}
                onClick={() => {
                  requestExport('scorm12')
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('exportCmi5')}
                disabled={exporting}
                onClick={() => {
                  requestExport('cmi5')
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('undo')}
                disabled={!canUndo}
                onClick={() => {
                  undo()
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('redo')}
                disabled={!canRedo}
                onClick={() => {
                  redo()
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={`${t('language')}: ${lang.toUpperCase()}`}
                onClick={() => {
                  setLang(lang === 'en' ? 'uk' : 'en')
                  setMoreOpen(false)
                }}
              />
              <div className="my-1 h-px bg-gray-100" />
              <MoreItem
                label={th('menuTour')}
                onClick={() => {
                  setMoreOpen(false)
                  startTour()
                }}
              />
              <MoreItem
                label={th('menuWhatsNew')}
                onClick={() => {
                  setMoreOpen(false)
                  openHelpDialog('whatsNew')
                }}
              />
              <MoreItem
                label={th('menuFaq')}
                onClick={() => {
                  setMoreOpen(false)
                  openHelpDialog('faq')
                }}
              />
              <a
                href={GITHUB_ISSUES_URL}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => setMoreOpen(false)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {tw('reportIssue')}
              </a>
            </div>
          )}
        </div>
      </div>

    </header>
  )
}

function MoreItem({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-30"
    >
      {label}
    </button>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}
