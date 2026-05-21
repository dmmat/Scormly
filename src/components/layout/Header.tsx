import Logo from './Logo'
import ThemePicker from '../editor/ThemePicker'
import LanguagePicker from '../editor/LanguagePicker'
import ProjectMenu from '../editor/ProjectMenu'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { saveProject } from '../../lib/projectService'
import { GITHUB_ISSUES_URL } from '../../lib/links'

export default function Header() {
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const projectName = useCourseStore((s) => s.projectName)
  const directoryHandle = useCourseStore((s) => s.directoryHandle)
  const saveState = useCourseStore((s) => s.saveState)
  const setPreviewOpen = useCourseStore((s) => s.setPreviewOpen)
  const { t } = useT('common')
  const { t: tw } = useT('welcome')
  const { t: tp } = useT('preview')

  const saveLabel =
    saveState === 'saving'
      ? tw('saving')
      : saveState === 'saved'
        ? tw('saved')
        : saveState === 'error'
          ? tw('saveError')
          : tw('save')

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <a href="#/" aria-label="Scormly">
          <Logo />
        </a>
        {projectName ? (
          <ProjectMenu />
        ) : (
          <span className="truncate text-xs text-gray-400">
            {tw('noFolderTitle')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
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
        <button type="button" className="btn-primary text-sm">
          {t('export')}
        </button>
      </div>
    </header>
  )
}
