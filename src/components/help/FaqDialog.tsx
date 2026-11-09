import { useEffect } from 'react'
import { useHelpStore } from '../../help/helpStore'
import { useT } from '../../i18n/I18nProvider'
import HelpDialogShell from './HelpDialogShell'

const COUNT = 12

// Builder Q&A: native <details> accordions (keyboard + screen reader friendly).
export default function FaqDialog() {
  const { t } = useT('help')
  const close = useHelpStore((s) => s.closeDialog)
  // Opened at a given question (e.g. from the comments panel): bring it into view.
  const openItem = useHelpStore((s) => s.faqItem)
  useEffect(() => {
    if (openItem > 1) document.getElementById(`faq-${openItem}`)?.scrollIntoView({ block: 'nearest' })
  }, [openItem])
  return (
    <HelpDialogShell id="faq-title" title={t('faqTitle')} onClose={close}>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: COUNT }, (_, i) => i + 1).map((n) => (
          <details key={n} id={`faq-${n}`} className="group py-1" open={n === openItem}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2.5 text-sm font-medium text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
              {t(`faqQ${n}`)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="px-1 pb-3 text-sm leading-relaxed text-gray-600">{t(`faqA${n}`)}</p>
          </details>
        ))}
      </div>
    </HelpDialogShell>
  )
}
