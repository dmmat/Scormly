import { useT } from '../../i18n/I18nProvider'

// Correct / incorrect marker for revealed answers, so correctness is never
// conveyed by color alone (icon + screen-reader text).
export default function ResultMark({ ok }: { ok: boolean }) {
  const { t } = useT('a11y')
  return (
    <span className={`shrink-0 text-sm font-bold ${ok ? 'text-green-700' : 'text-red-700'}`}>
      <span aria-hidden>{ok ? '✓' : '✗'}</span>
      <span className="sr-only">{ok ? t('correct') : t('incorrect')}</span>
    </span>
  )
}
