import JSZip from 'jszip'
import { useCourseStore } from '../store/courseStore'
import { buildManifest, type ScormVersion } from './scormManifest'
import type { Course } from '../types/course'

const PLAYER_FILES = ['index.html', 'player.css', 'player.js', 'scorm.js']

// Passing score declared in the manifest so the LMS knows the mastery
// threshold. Comes from project settings; undefined when the course is not
// scored or has no quizzes (completion-only course).
function overallPassingScore(course: Course): number | undefined {
  if (!course.settings?.scored) return undefined
  const hasQuiz = course.lessons.some((l) => l.blocks.some((b) => b.type === 'quiz'))
  if (!hasQuiz) return undefined
  return Math.round(course.settings.passingScore)
}

function escapeHtml(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sanitize(name: string): string {
  return name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'course'
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
      paths.push(...(await addDir(zip, child as FileSystemDirectoryHandle, path + '/')))
    } else {
      const file = await (child as FileSystemFileHandle).getFile()
      zip.file(path, file)
      paths.push(path)
    }
  }
  return paths
}

// Build and download a SCORM package (1.2 or 2004) for the current course.
export async function exportScorm(version: ScormVersion = '1.2'): Promise<void> {
  const { course, directoryHandle } = useCourseStore.getState()
  const zip = new JSZip()
  const base = import.meta.env.BASE_URL
  const files: string[] = []

  // Player runtime files (fetched from the app's static assets).
  for (const name of PLAYER_FILES) {
    const res = await fetch(`${base}scorm-player/${name}`)
    let content = await res.text()
    if (name === 'index.html') {
      content = content.replace('{{COURSE_TITLE}}', escapeHtml(course.title || 'Course'))
    }
    zip.file(name, content)
    files.push(name)
  }

  // Course data.
  zip.file('project.json', JSON.stringify(course, null, 2))
  files.push('project.json')

  // Media copied from the project's assets/ folder (if a project is open).
  if (directoryHandle) {
    try {
      const assets = await directoryHandle.getDirectoryHandle('assets', { create: false })
      files.push(...(await addDir(zip, assets, 'assets/')))
    } catch {
      // No assets folder — media is either absent or embedded as data URLs.
    }
  }

  zip.file('imsmanifest.xml', buildManifest(course, files, version, overallPassingScore(course)))

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitize(course.title)}-scorm${version === '2004' ? '2004' : '12'}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
