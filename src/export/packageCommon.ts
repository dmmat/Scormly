import type JSZip from 'jszip'
import { isScoredBlock, type Course } from '../types/course'

// Shared helpers for building the export .zip (SCORM and cmi5). Both targets
// ship the same vanilla player; only the tracking script and the manifest
// differ, so the player/asset/course-data packaging lives here.

/** Tracking runtime to bundle: SCORM (scorm.js) or cmi5/xAPI (xapi.js). */
export type TrackingScript = 'scorm.js' | 'xapi.js'

const STATIC_FILES = ['index.html', 'player.css', 'player.js']

export function escapeHtml(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

/** Reads a player runtime file (e.g. `player.js`) as text. */
export type PlayerFileReader = (name: string) => Promise<string>

/** Browser reader: fetch the player files the app serves from public/. */
export const fetchPlayerFile: PlayerFileReader = async (name) => {
  const res = await fetch(`${import.meta.env.BASE_URL}scorm-player/${name}`)
  return res.text()
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
  const re = /assets\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]+/g
  let m: RegExpExecArray | null
  const json = JSON.stringify(course)
  while ((m = re.exec(json)) !== null) paths.add(m[0])
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

// Add the player runtime + embedded course data. The chosen tracking script is
// bundled and wired into index.html (which ships referencing scorm.js).
// Returns the list of file paths added (for the manifest's file listing).
//
// `readPlayerFile` loads a file from public/scorm-player/: the app fetches it
// (fetchPlayerFile), the MCP server (mcp/) reads it from disk.
export async function addPlayer(
  zip: JSZip,
  course: Course,
  tracking: TrackingScript,
  readPlayerFile: PlayerFileReader,
): Promise<string[]> {
  const files: string[] = []

  for (const name of STATIC_FILES) {
    let content = await readPlayerFile(name)
    if (name === 'index.html') {
      content = content.replace('{{COURSE_TITLE}}', escapeHtml(course.title || 'Course'))
      if (tracking !== 'scorm.js') content = content.replace('scorm.js', tracking)
    }
    zip.file(name, content)
    files.push(name)
  }

  zip.file(tracking, await readPlayerFile(tracking))
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
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return filename
}
