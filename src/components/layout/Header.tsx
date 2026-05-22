import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import ThemePicker from '../editor/ThemePicker'
import LanguagePicker from '../editor/LanguagePicker'
import ProjectMenu from '../editor/ProjectMenu'
import { useCourseStore } from '../../store/courseStore'
import { useT, useLang } from '../../i18n/I18nProvider'
import { saveProject } from '../../lib/projectService'
import ExportMenu from '../editor/ExportMenu'
import { exportScorm } from '../../export/exportScorm'
import { exportCmi5 } from '../../export/exportCmi5'
import { GITHUB_ISSUES_URL } from '../../lib/links'

export default function Header() {
  const [moreOpen, setMoreOpen] = useState(false)
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const projectName = useCourseStore((s) => s.projectName)
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  const saveState = useCourseStore((s) => s.saveState)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const setSidebarOpen = useCourseStore((s) => s.setSidebarOpen)
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const { t: tp } = useT('preview')
  const { lang, setLang } = useLang()
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return
    function onDown(e: PointerEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [moreOpen])

  const saveLabel =
    saveState === 'saving'
      ? tw('saving')
      : saveState === 'saved'
        ? tw('saved')
        : saveState === 'error'
          ? tw('saveError')
          : tw('save')

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t('course')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 md:hidden"
        >
          ☰
        </button>
        <a href="#/" aria-label="Scormly" className="shrink-0">
          <Logo />
        </a>
        {projectName ? (
          <ProjectMenu />
        ) : (
          <span className="hidden truncate text-xs text-gray-400 sm:inline">
            {tw('noFolderTitle')}
          </span>
        )}
      </div>

      {/* Desktop controls */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title={`${t('undo')} (Ctrl+Z)`}
            aria-label={t('undo')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title={`${t('redo')} (Ctrl+Shift+Z)`}
            aria-label={t('redo')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            ↷
          </button>
        </div>

        <ThemePicker />
        <LanguagePicker />

        <a
          href={GITHUB_ISSUES_URL}
          target="_blank"
          rel="noreferrer"
          title={tw('reportIssue')}
          aria-label={tw('reportIssue')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
        >
          ⚑
        </a>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          {tp('open')}
        </button>
        <button
          type="button"
          onClick={() => void saveProject()}
          disabled={!directoryHandle || saveState === 'saving'}
          title={`${tw('save')} (Ctrl+S)`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          {saveLabel}
        </button>
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
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            ⋯
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
              <MoreItem
                label={tw('save')}
                disabled={!directoryHandle || saveState === 'saving'}
                onClick={() => {
                  void saveProject()
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('export2004')}
                onClick={() => {
                  void exportScorm('2004')
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('export12')}
                onClick={() => {
                  void exportScorm('1.2')
                  setMoreOpen(false)
                }}
              />
              <MoreItem
                label={t('exportCmi5')}
                onClick={() => {
                  void exportCmi5()
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
              <a
                href={GITHUB_ISSUES_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMoreOpen(false)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
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
      onClick={onClick}
      disabled={disabled}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
    >
      {label}
    </button>
  )
}
