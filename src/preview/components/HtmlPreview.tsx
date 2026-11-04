import { useEffect, useRef, useState } from 'react'
import type { HtmlData } from '../../types/course'
import type { PreviewProps } from '../types'
import { useT } from '../../i18n/I18nProvider'
import { buildHtmlDocument, codeDocument, htmlBundleDir, loadHtmlBundle } from '../../lib/htmlBundle'

const DEFAULT_HEIGHT = 300
const MAX_HEIGHT = 4000

/**
 * The page of a custom HTML block in a sandboxed frame (scripts run, but the
 * page can't reach the app). `inert` lets clicks through to the editor's block
 * selection. `onMissing` reports an uploaded page whose files are gone.
 */
export function HtmlFrame({ data, inert, onMissing }: { data: HtmlData; inert?: boolean; onMissing?: (missing: boolean) => void }) {
  const { t } = useT('a11y')
  const { source, code, src } = data
  const [doc, setDoc] = useState<string | null>(() => (source === 'code' && code.trim() ? codeDocument(code) : null))
  const [fit, setFit] = useState<number | null>(null)
  const ref = useRef<HTMLIFrameElement>(null)
  const missingRef = useRef(onMissing)
  missingRef.current = onMissing

  useEffect(() => {
    if (source === 'code') {
      missingRef.current?.(false)
      // Typing rebuilds the page; wait for a pause so it doesn't restart on every key.
      const timer = setTimeout(() => setDoc(code.trim() ? codeDocument(code) : null), 400)
      return () => clearTimeout(timer)
    }
    const dir = htmlBundleDir(src)
    if (!dir) {
      setDoc(null)
      return
    }
    let live = true
    loadHtmlBundle(dir)
      .then((files) => buildHtmlDocument(src.slice(dir.length), files))
      .then((d) => {
        if (!live) return
        setDoc(d)
        missingRef.current?.(d === null)
      })
      .catch(() => live && missingRef.current?.(true))
    return () => {
      live = false
    }
  }, [source, code, src])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data as { type?: unknown; height?: unknown } | null
      if (!e.source || e.source !== ref.current?.contentWindow) return
      if (msg?.type === 'scormly:height' && typeof msg.height === 'number' && msg.height > 0) {
        setFit(Math.min(Math.ceil(msg.height), MAX_HEIGHT))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (doc === null) return null
  return (
    <iframe
      ref={ref}
      className="sc-html-frame"
      srcDoc={doc}
      title={data.title?.trim() || t('embedTitle')}
      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
      allow="fullscreen; clipboard-write; autoplay"
      style={{ height: data.height || fit || DEFAULT_HEIGHT, pointerEvents: inert ? 'none' : undefined }}
    />
  )
}

export default function HtmlPreview({ block }: PreviewProps<'html'>) {
  return <HtmlFrame data={block.data} />
}
