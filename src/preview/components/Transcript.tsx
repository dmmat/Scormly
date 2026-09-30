import { useT } from '../../i18n/I18nProvider'

// Collapsible text transcript shown under audio/video (accessibility).
export default function Transcript({ text }: { text?: string }) {
  const { t } = useT('a11y')
  const body = text?.trim()
  if (!body) return null
  return (
    <details className="interactive-surface mt-2 border border-gray-200 bg-white px-4 py-2 text-gray-800">
      <summary className="cursor-pointer font-medium">{t('transcript')}</summary>
      <p className="mt-2 whitespace-pre-line leading-relaxed">{body}</p>
    </details>
  )
}
