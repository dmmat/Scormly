// Media assets: copy uploaded files into the project's assets/ folder and store
// relative paths in the model. Images are optimized in-browser (downscale +
// re-encode) while preserving transparency. Display paths are resolved back to
// object URLs via the project's directory handle — or, without a folder, via
// the in-memory store below.

import { useCourseStore } from '../store/courseStore'
import { writeBlobToSubdir, getSubdirectory } from './fileSystem'
import { uid } from './id'
import { toast } from '../store/toastStore'
import { translate } from '../i18n/I18nProvider'

export type AssetKind = 'image' | 'video' | 'audio' | 'captions' | 'file'

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
  file: {},
}
const SUBDIR_BY_KIND: Record<AssetKind, string> = {
  image: 'images',
  video: 'videos',
  audio: 'audio',
  captions: 'captions',
  file: 'files',
}

// Attachments (downloads) may be any document type, except files a browser
// would run as a page or script if opened from the LMS's own origin.
const BLOCKED_ATTACHMENT_EXT = new Set(['html', 'htm', 'xhtml', 'shtml', 'xht', 'js', 'mjs', 'svg', 'svgz', 'xml', 'php'])

function fileExtension(file: File, kind: AssetKind): string | undefined {
  if (kind === 'file') {
    const ext = /\.([A-Za-z0-9]{1,10})$/.exec(file.name)?.[1]?.toLowerCase()
    if (!ext) return 'bin'
    return BLOCKED_ATTACHMENT_EXT.has(ext) ? undefined : ext
  }
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

// ── In-memory media (no project folder) ──
// Browsers without the File System Access API, a project opened from a .zip,
// "try without saving": uploads are kept in memory under the same relative
// paths they would have on disk (assets/images/…), so project.json stays clean
// and SCORM exports and the project .zip carry real files.
const memoryAssets = new Map<string, Blob>()

// Cache resolved object URLs per relative path for the session.
const urlCache = new Map<string, string>()

export function putMemoryAsset(path: string, blob: Blob): void {
  const old = urlCache.get(path)
  if (old) URL.revokeObjectURL(old)
  urlCache.delete(path)
  memoryAssets.set(path, blob)
}

export function getMemoryAsset(path: string): Blob | undefined {
  return memoryAssets.get(path)
}

/** Forget all in-memory media and resolved URLs (another project replaces
 *  the current one). */
export function clearMemoryAssets(): void {
  for (const url of urlCache.values()) URL.revokeObjectURL(url)
  urlCache.clear()
  memoryAssets.clear()
}

const MIME_BY_EXT: Record<string, string> = {
  ...Object.fromEntries(
    [IMAGE_MIME, VIDEO_MIME, AUDIO_MIME, CAPTIONS_MIME].flatMap((t) => Object.entries(t).map(([mime, ext]) => [ext, mime])),
  ),
  jpeg: 'image/jpeg',
  wav: 'audio/wav',
  pdf: 'application/pdf',
}

/** File extension for a media type the app accepts, if any. */
export function extForMime(mime: string): string | undefined {
  for (const table of [IMAGE_MIME, VIDEO_MIME, AUDIO_MIME, CAPTIONS_MIME]) {
    if (table[mime]) return table[mime]
  }
  return undefined
}

/** Media type for a file path by its extension (files read back from a .zip
 *  carry none, and an SVG or a video needs one to display). */
export function mimeForPath(path: string): string {
  const ext = /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase() ?? ''
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

/**
 * Validate, optimize and store an uploaded file. Returns a project-relative
 * path (assets/images/...) — on disk when a project folder is open, otherwise
 * in memory. Throws UnsupportedFormatError for disallowed formats.
 */
export async function saveAsset(file: File, kind: AssetKind): Promise<string> {
  const ext = fileExtension(file, kind)
  if (!ext) throw new UnsupportedFormatError(kind)

  let blob: Blob = kind === 'image' ? await optimizeImage(file) : file
  // Normalize the type so captions are served as WebVTT.
  if (kind === 'captions' && blob.type !== 'text/vtt') blob = new Blob([blob], { type: 'text/vtt' })
  const sub = SUBDIR_BY_KIND[kind]
  const name = `${uid()}.${ext}`
  const path = `assets/${sub}/${name}`
  const handle = useCourseStore.getState().directoryHandle
  if (!handle) putMemoryAsset(path, blob)
  else await writeBlobToSubdir(handle, ['assets', sub], name, blob)
  return path
}

/** Resolve a stored asset path to a displayable URL (object URL). */
export async function resolveAssetUrl(src: string): Promise<string | null> {
  if (!src) return null
  if (isDirectUrl(src)) return src
  if (urlCache.has(src)) return urlCache.get(src)!

  const handle = useCourseStore.getState().directoryHandle
  if (!handle) {
    const blob = memoryAssets.get(src)
    if (!blob) return null
    const objectUrl = URL.createObjectURL(blob)
    urlCache.set(src, objectUrl)
    return objectUrl
  }

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
