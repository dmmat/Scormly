import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { hasHtmlPage } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { Segmented, SettingsBar, UploadButton } from '../../components/editor/controls'
import { HtmlFrame } from '../../preview/components/HtmlPreview'
import { HtmlUploadError, saveHtmlUpload } from '../../lib/htmlBundle'
import { toastUploadError } from '../../lib/assets'
import { HTML_BLOCK_GUIDE } from '../../lib/agentGuide'
import { toast } from '../../store/toastStore'

const inputCls = 'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand'

// Custom code: the author's own HTML / CSS / JS, or an uploaded .html page or
// .zip site, shown in a frame (see lib/htmlBundle).
export default function HtmlBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'html'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('newblocks')
  const d = block.data
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'format' | 'noHtml' | null>(null)
  const [missing, setMissing] = useState(false)

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const src = await saveHtmlUpload(file)
      update(lessonId, block.id, { source: 'file', src, fileName: file.name })
    } catch (err) {
      if (err instanceof HtmlUploadError) setError(err.reason)
      else toastUploadError(err)
    } finally {
      setBusy(false)
    }
  }

  async function copyGuide() {
    try {
      await navigator.clipboard.writeText(HTML_BLOCK_GUIDE)
      toast({ tone: 'success', message: t('htmlCopied') })
    } catch (err) {
      console.error('[clipboard]', err)
    }
  }

  const empty = !hasHtmlPage(d)
  return (
    <div className="space-y-3">
      {!empty && <HtmlFrame data={d} inert={!selected} onMissing={setMissing} />}
      {(empty || (d.source === 'file' && missing)) && (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
          {empty ? t('htmlEmpty') : t('htmlMissing')}
        </p>
      )}

      {selected && (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <SettingsBar>
            <Segmented
              label={t('htmlSourceLabel')}
              value={d.source}
              options={[['code', t('htmlSourceCode')], ['file', t('htmlSourceFile')]]}
              onChange={(source) => update(lessonId, block.id, { source })}
            />
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
              {t('htmlHeightLabel')}
              <input
                type="number"
                min={80}
                max={4000}
                step={10}
                value={d.height ?? ''}
                placeholder={t('htmlHeightAuto')}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value))
                  update(lessonId, block.id, { height: e.target.value && n > 0 ? Math.min(n, 4000) : undefined }, `html-height-${block.id}`)
                }}
                className="h-8 w-28 rounded-md border border-gray-300 px-2 text-sm text-gray-900 outline-none focus:border-brand"
              />
              <span>{t('htmlHeightPx')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500" title={t('htmlStylesHint')}>
              <input
                type="checkbox"
                checked={d.styles !== false}
                onChange={(e) => update(lessonId, block.id, { styles: e.target.checked })}
                className="accent-brand"
              />
              {t('htmlStyles')}
            </label>
            <button type="button" onClick={copyGuide} className="btn-secondary text-sm">
              {t('htmlCopyAi')}
            </button>
          </SettingsBar>

          {d.source === 'code' ? (
            <div className="rounded-lg bg-gray-900 p-4">
              <textarea
                value={d.code}
                rows={12}
                spellCheck={false}
                aria-label={t('htmlCodeLabel')}
                placeholder="<!doctype html>…"
                onChange={(e) => update(lessonId, block.id, { code: e.target.value }, `html-code-${block.id}`)}
                className="w-full resize-y bg-transparent font-mono text-sm text-gray-100 placeholder-gray-500 outline-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <UploadButton label={busy ? t('htmlUploading') : d.src ? t('htmlReplace') : t('htmlUpload')} accept=".html,.htm,.zip" onPick={onPick} />
                {d.src && <span className="truncate text-sm text-gray-600">{d.fileName || d.src}</span>}
              </div>
              <p className="text-xs text-gray-500">{t('htmlUploadHint')}</p>
              <p className="text-xs text-gray-400">{t('htmlPreviewNote')}</p>
              {error && <p className="text-sm text-red-600">{error === 'format' ? t('htmlBadFormat') : t('htmlNoPage')}</p>}
            </div>
          )}

          <input
            type="text"
            value={d.title ?? ''}
            placeholder={t('htmlTitleLabel')}
            aria-label={t('htmlTitleLabel')}
            onChange={(e) => update(lessonId, block.id, { title: e.target.value }, `html-title-${block.id}`)}
            className={`w-full ${inputCls}`}
          />
        </div>
      )}
    </div>
  )
}
