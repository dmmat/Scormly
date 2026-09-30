import type JSZip from 'jszip'
import { isScoredBlock, type Course } from '../types/course'

// Shared helpers for building the export .zip (SCORM and cmi5). Both targets
// ship the same vanilla player; only the tracking script and the manifest
// differ, so the player/asset/course-data packaging lives here.

/** Tracking runtime to bundle: SCORM (scorm.js) or cmi5/xAPI (xapi.js). */
export type TrackingScript = 'scorm.js' | 'xapi.js'

const STATIC_FILES = ['index.html', 'player.css', 'player.js']

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sanitize(name: string): string {
  return (
    name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') ||
    'course'
  )
}

// Passing score (0..100) declared in the manifest so the LMS knows the mastery
// threshold. Undefined when the course is not scored or has no scored blocks
// (quiz, ordering, fill in the blanks).
export function overallPassingScore(course: Course): number | undefined {
  if (!course.settings?.scored) return undefined
  const hasQuiz = course.lessons.some((l) =>
    l.blocks.some(isScoredBlock),
  )
  if (!hasQuiz) return undefined
  return Math.round(course.settings.passingScore)
}

type DirEntries = {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

// Every assets/ path the course actually references. The course is scanned as
// JSON so this covers structured fields (image/video/audio/gallery/scenario
// src, cover) AND inline rich-text images (paths embedded in block HTML), and
// stays correct as new block types are added. Orphaned files left in assets/
// (e.g. after replacing a video) are therefore excluded from the package.
export function collectAssetPaths(course: Course): Set<string> {
  const paths = new Set<string>()
  // A path runs until a character that can't be part of a file name inside a
  // JSON string / HTML attribute / CSS url() (quote, backslash escape, angle
  // bracket, query/fragment, line break). Spaces, Unicode, parentheses and
  // %-escapes are allowed, so the match is lazy and must end in `.ext`
  // followed by a terminator — "see assets/a.png for details" stops at `.png`,
  // while "assets/my file (1).png" is matched whole. Candidates are only ever
  // compared against real files in assets/, so an over-match is harmless.
  const re = /assets\/[^"'<>\\`?#\r\n]+?\.[A-Za-z0-9]+(?=["'<>\\`?#)\s,;]|$)/gu
  let m: RegExpExecArray | null
  const json = JSON.stringify(course)
  while ((m = re.exec(json)) !== null) {
    paths.add(m[0])
    // URLs in HTML may be %-encoded and/or entity-escaped; the zip needs the
    // on-disk name.
    const unescaped = m[0].replace(/&amp;/g, '&')
    paths.add(unescaped)
    try {
      paths.add(decodeURIComponent(unescaped))
    } catch {
      // Malformed %-sequence: keep the literal path only.
    }
  }
  return paths
}

// Recursively add a directory's files to the zip under `prefix`, returning paths.
// Only files whose path is in `referenced` are included.
async function addDir(
  zip: JSZip,
  dir: FileSystemDirectoryHandle,
  prefix: string,
  referenced: Set<string>,
): Promise<string[]> {
  const paths: string[] = []
  for await (const [name, child] of (dir as unknown as DirEntries).entries()) {
    const path = prefix + name
    if (child.kind === 'directory') {
      paths.push(
        ...(await addDir(zip, child as FileSystemDirectoryHandle, path + '/', referenced)),
      )
    } else if (referenced.has(path)) {
      const file = await (child as FileSystemFileHandle).getFile()
      zip.file(path, file)
      paths.push(path)
    }
  }
  return paths
}

// Fetch one of the bundled player files. Fail loudly: silently zipping an
// HTML 404 page as player.js would produce a package that just shows a blank
// screen in the LMS.
async function fetchPlayerFile(base: string, name: string): Promise<string> {
  const res = await fetch(`${base}scorm-player/${name}`)
  if (!res.ok) {
    throw new Error(`Could not load player file "${name}" (HTTP ${res.status})`)
  }
  return res.text()
}

// Add the player runtime + embedded course data. The chosen tracking script is
// bundled and wired into index.html (which ships referencing scorm.js).
// Returns the list of file paths added (for the manifest's file listing).
export async function addPlayer(
  zip: JSZip,
  course: Course,
  tracking: TrackingScript,
): Promise<string[]> {
  const base = import.meta.env.BASE_URL
  const files: string[] = []

  for (const name of STATIC_FILES) {
    let content = await fetchPlayerFile(base, name)
    if (name === 'index.html') {
      // Replacer function: a string replacement would interpret `$&`, `$1`, …
      // sequences in the course title.
      const title = escapeHtml(course.title || 'Course')
      content = content.replace('{{COURSE_TITLE}}', () => title)
      if (tracking !== 'scorm.js') content = content.replace('scorm.js', () => tracking)
    }
    zip.file(name, content)
    files.push(name)
  }

  zip.file(tracking, await fetchPlayerFile(base, tracking))
  files.push(tracking)

  // Course data, embedded as a JS global rather than a fetched JSON file: many
  // LMS sandbox the SCO or serve it from a CDN that rejects runtime fetch()/XHR
  // for sibling files, whereas a <script src> always loads. Escape '<' so block
  // HTML can't break out of the <script> tag.
  const dataJs = `window.__SCORMLY_COURSE__ = ${JSON.stringify(course).replace(/</g, '\\u003c')};`
  zip.file('course-data.js', dataJs)
  files.push('course-data.js')

  return files
}

// Add media from the project's assets/ folder — only the files the course
// references (orphans from replaced/removed media are skipped).
export async function addAssets(
  zip: JSZip,
  directoryHandle: FileSystemDirectoryHandle | null,
  course: Course,
): Promise<string[]> {
  if (!directoryHandle) return []
  const referenced = collectAssetPaths(course)
  if (referenced.size === 0) return []
  try {
    const assets = await directoryHandle.getDirectoryHandle('assets', {
      create: false,
    })
    return await addDir(zip, assets, 'assets/', referenced)
  } catch {
    // No assets folder — media is either absent or embedded as data URLs.
    return []
  }
}

/** Generate the zip and trigger a browser download; resolves to the filename. */
export async function downloadZip(zip: JSZip, filename: string): Promise<string> {
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking synchronously can cancel the download in some browsers before it
  // has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return filename
}
