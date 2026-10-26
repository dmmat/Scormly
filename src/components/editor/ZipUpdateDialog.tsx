import { useRef } from 'react'
import { useT } from '../../i18n/I18nProvider'
import { useDialog } from '../../hooks/useDialog'
import { useZipPrompt, type ZipChoice, type ZipMatch } from '../../lib/importProjectZip'

// "This .zip is a version of a project you already have": update it, or open
// the .zip as a new project (with its own id). See openProjectZip.
export default function ZipUpdateDialog() {
  const { match, answer } = useZipPrompt()
  if (!match || !answer) return null
  return <Dialog match={match} answer={answer} />
}

function Dialog({ match, answer }: { match: ZipMatch; answer: (c: ZipChoice) => void }) {
  const { t } = useT('welcome')
  const ref = useRef<HTMLDivElement>(null)
  useDialog(ref, () => answer('cancel'))
  const when = (ms: number | null) =>
    ms ? new Date(ms).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : t('zipMatchUnknown')
  const newer = match.zipDate && match.updatedAt ? (match.zipDate > match.updatedAt ? 'zip' : 'here') : null

  return (
    // Above the onboarding tour (z-70): the author just asked for this.
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => answer('cancel')}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zip-match-title"
        aria-describedby="zip-match-text"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="zip-match-title" className="text-lg font-semibold text-gray-900">
          {t('zipMatchTitle')}
        </h2>
        <p id="zip-match-text" className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(match.where === 'open' ? 'zipMatchOpen' : 'zipMatchBrowser', { title: match.title })}
        </p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <dt className="text-gray-500">{t('zipMatchHere')}</dt>
          <dd className="text-gray-900">
            {when(match.updatedAt)}
            {newer === 'here' && <span className="ml-2 text-xs font-semibold text-brand-dark">{t('zipMatchNewer')}</span>}
          </dd>
          <dt className="text-gray-500">{t('zipMatchZip')}</dt>
          <dd className="text-gray-900">
            {when(match.zipDate)}
            {newer === 'zip' && <span className="ml-2 text-xs font-semibold text-brand-dark">{t('zipMatchNewer')}</span>}
          </dd>
        </dl>
        <p className="mt-3 text-xs text-gray-500">{t('zipMatchNote')}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => answer('cancel')} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            {t('zipMatchCancel')}
          </button>
          <button type="button" onClick={() => answer('new')} className="btn-secondary text-sm">
            {t('zipMatchNew')}
          </button>
          <button type="button" onClick={() => answer('update')} className="btn-primary text-sm">
            {t('zipMatchUpdate')}
          </button>
        </div>
      </div>
    </div>
  )
}
