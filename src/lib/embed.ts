// Convert common video URLs (YouTube watch/youtu.be, Vimeo) to embeddable URLs;
// otherwise return the original if it's https, else ''.
export function toEmbedUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return ''
  }

  if (parsed.protocol !== 'https:') return ''

  const host = parsed.hostname.replace(/^www\./, '')

  // YouTube: youtube.com/watch?v=ID
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = parsed.searchParams.get('v')
    if (id) return `https://www.youtube.com/embed/${id}`
  }

  // YouTube short link: youtu.be/ID
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0]
    if (id) return `https://www.youtube.com/embed/${id}`
  }

  // Vimeo: vimeo.com/ID
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean).pop()
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
  }

  // Any other https URL is used as-is.
  return trimmed
}
