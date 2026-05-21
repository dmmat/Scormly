import { useEffect, useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import { resolveAssetUrl } from '../lib/assets'

function isDirectUrl(src: string): boolean {
  return /^(data:|blob:|https?:)/.test(src)
}

// Renders rich-text HTML, resolving inline asset image paths (assets/...) to
// displayable object URLs. In the SCORM package those relative paths resolve
// directly (sibling files), so this is only needed inside the editor app.
export default function RichHtml({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const handle = useCourseStore((s) => s.directoryHandle)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = html
    el.querySelectorAll('img').forEach((img) => {
      const raw = img.getAttribute('src') || ''
      if (raw && !isDirectUrl(raw)) {
        void resolveAssetUrl(raw).then((url) => {
          if (url) img.src = url
        })
      }
    })
  }, [html, handle])

  return <div ref={ref} className={className} />
}
