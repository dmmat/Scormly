import Logo from './Logo'
import ThemePicker from '../editor/ThemePicker'
import LanguagePicker from '../editor/LanguagePicker'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function Header() {
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const { t } = useT('common')

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <Logo />
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

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          {t('save')}
        </button>
        <button type="button" className="btn-primary text-sm">
          {t('export')}
        </button>
      </div>
    </header>
  )
}
