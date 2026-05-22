import type JSZip from 'jszip'
import type { Course } from '../types/course'

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
// threshold. Undefined when the course is not scored or has no quizzes.
export function overallPassingScore(course: Course): number | undefined {
  if (!course.settings?.scored) return undefined
  const hasQuiz = course.lessons.some((l) =>
    l.blocks.some((b) => b.type === 'quiz'),
  )
  if (!hasQuiz) return undefined
  return Math.round(course.settings.passingScore)
}

type DirEntries = {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

// Recursively add a directory's files to the zip under `prefix`, returning paths.
async function addDir(
  zip: JSZip,
  dir: FileSystemDirectoryHandle,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = []
  for await (const [name, child] of (dir as unknown as DirEntries).entries()) {
    const path = prefix + name
    if (child.kind === 'directory') {
      paths.push(
        ...(await addDir(zip, child as FileSystemDirectoryHandle, path + '/')),
      )
    } else {
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
export async function addPlayer(
  zip: JSZip,
  course: Course,
  tracking: TrackingScript,
): Promise<string[]> {
  const base = import.meta.env.BASE_URL
  const files: string[] = []

  for (const name of STATIC_FILES) {
    const res = await fetch(`${base}scorm-player/${name}`)
    let content = await res.text()
    if (name === 'index.html') {
      content = content.replace('{{COURSE_TITLE}}', escapeHtml(course.title || 'Course'))
      if (tracking !== 'scorm.js') content = content.replace('scorm.js', tracking)
    }
    zip.file(name, content)
    files.push(name)
  }

  const trackingRes = await fetch(`${base}scorm-player/${tracking}`)
  zip.file(tracking, await trackingRes.text())
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

// Add media copied from the project's assets/ folder (if a project is open).
export async function addAssets(
  zip: JSZip,
  directoryHandle: FileSystemDirectoryHandle | null,
): Promise<string[]> {
  if (!directoryHandle) return []
  try {
    const assets = await directoryHandle.getDirectoryHandle('assets', {
      create: false,
    })
    return await addDir(zip, assets, 'assets/')
  } catch {
    // No assets folder — media is either absent or embedded as data URLs.
    return []
  }
}

export async function downloadZip(zip: JSZip, filename: string): Promise<void> {
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
