import { useEffect, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { resolveAssetUrl } from '../lib/assets'

// Resolve a stored asset src (relative path, data URL, or http) to a displayable
// URL. Relative project paths are resolved to object URLs via the directory
// handle; data/blob/http URLs pass through unchanged.
export function useAssetUrl(src: string): string {
  const handle = useCourseStore((s) => s.directoryHandle)
  const [url, setUrl] = useState('')

  useEffect(() => {
    let active = true
    void resolveAssetUrl(src).then((resolved) => {
      if (active) setUrl(resolved ?? '')
    })
    return () => {
      active = false
    }
  }, [src, handle])

  return url
}
