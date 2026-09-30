// Media assets: copy uploaded files into the project's assets/ folder and store
// relative paths in the model. Images are optimized in-browser (downscale +
// re-encode) while preserving transparency. Display paths are resolved back to
// object URLs via the project's directory handle.

import { useCourseStore } from '../store/courseStore'
import { writeBlobToSubdir, getSubdirectory } from './fileSystem'
import { uid } from './id'
import { toast } from '../store/toastStore'
import { translate } from '../i18n/I18nProvider'

export type AssetKind = 'image' | 'video' | 'audio' | 'captions'

// SCORM-safe formats. These render as plain HTML in any LMS.
const IMAGE_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}
const VIDEO_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}
const AUDIO_MIME: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mp4': 'm4a',
}

// WebVTT captions for <track>. Browsers/OSes often report an empty or generic
// MIME type for .vtt, so the extension is also accepted (see fileExtension).
const CAPTIONS_MIME: Record<string, string> = {
  'text/vtt': 'vtt',
}

const MIME_BY_KIND: Record<AssetKind, Record<string, string>> = {
  image: IMAGE_MIME,
  video: VIDEO_MIME,
  audio: AUDIO_MIME,
  captions: CAPTIONS_MIME,
}
const SUBDIR_BY_KIND: Record<AssetKind, string> = {
  image: 'images',
  video: 'videos',
  audio: 'audio',
  captions: 'captions',
}

function fileExtension(file: File, kind: AssetKind): string | undefined {
  const byMime = MIME_BY_KIND[kind][file.type]
  if (byMime) return byMime
  if (kind === 'captions' && /\.vtt$/i.test(file.name)) return 'vtt'
  return undefined
}

const MAX_DIMENSION = 1920
const ENCODE_QUALITY = 0.85

export class UnsupportedFormatError extends Error {
  constructor(public kind: AssetKind) {
    super(`Unsupported ${kind} format`)
    this.name = 'UnsupportedFormatError'
  }
}

function isDirectUrl(src: string): boolean {
  return /^(data:|blob:|https?:)/.test(src)
}

// Re-encode/downscale raster images via canvas, preserving alpha (PNG/WebP keep
// their type; never flattened to JPEG). GIF (animation) and SVG are kept as-is.
async function optimizeImage(file: File): Promise<Blob> {
  const type = file.type
  if (type === 'image/gif' || type === 'image/svg+xml') return file

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })

    const longest = Math.max(img.width, img.height)
    if (longest <= MAX_DIMENSION) return file // already small enough

    const scale = MAX_DIMENSION / longest
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // JPEG/WebP take a quality argument; PNG ignores it (and keeps alpha).
    const quality = type === 'image/png' ? undefined : ENCODE_QUALITY
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    )
    return blob ?? file
  } finally {
    URL.revokeObjectURL(url)
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Validate, optimize and store an uploaded file. Returns a project-relative path
 * (assets/images/...) when a project folder is open, or a data URL fallback when
 * working in-memory. Throws UnsupportedFormatError for disallowed formats.
 */
export async function saveAsset(file: File, kind: AssetKind): Promise<string> {
  const ext = fileExtension(file, kind)
  if (!ext) throw new UnsupportedFormatError(kind)

  let blob: Blob = kind === 'image' ? await optimizeImage(file) : file
  // Normalize the type so a data-URL fallback is served as WebVTT.
  if (kind === 'captions' && blob.type !== 'text/vtt') blob = new Blob([blob], { type: 'text/vtt' })
  const handle = useCourseStore.getState().directoryHandle
  if (!handle) return blobToDataUrl(blob) // no project: keep it self-contained

  const sub = SUBDIR_BY_KIND[kind]
  const name = `${uid()}.${ext}`
  await writeBlobToSubdir(handle, ['assets', sub], name, blob)
  return `assets/${sub}/${name}`
}

// Cache resolved object URLs per relative path for the session.
const urlCache = new Map<string, string>()

/** Resolve a stored asset path to a displayable URL (object URL). */
export async function resolveAssetUrl(src: string): Promise<string | null> {
  if (!src) return null
  if (isDirectUrl(src)) return src
  if (urlCache.has(src)) return urlCache.get(src)!

  const handle = useCourseStore.getState().directoryHandle
  if (!handle) return null

  try {
    const parts = src.split('/')
    const fileName = parts.pop()!
    let dir = handle
    for (const part of parts) {
      dir = await getSubdirectory(dir, part, false)
    }
    const fileHandle = await dir.getFileHandle(fileName)
    const file = await fileHandle.getFile()
    const objectUrl = URL.createObjectURL(file)
    urlCache.set(src, objectUrl)
    return objectUrl
  } catch {
    return null
  }
}

/**
 * Report a failed media upload as a toast. Callers that show their own inline
 * message for unsupported formats only pass the other errors here.
 */
export function toastUploadError(err: unknown): void {
  console.error('[upload]', err)
  toast({
    tone: 'error',
    message: translate(
      'common',
      err instanceof UnsupportedFormatError ? 'uploadUnsupported' : 'uploadFailed',
    ),
  })
}
