import JSZip from 'jszip'
import type { Course } from '../types/course'
import { useCourseStore } from '../store/courseStore'
import { addAssets, downloadZip, sanitize } from '../export/packageCommon'
import { AGENT_GUIDE_FILE, buildAgentGuide } from './agentGuide'
import { extForMime } from './assets'
import { readUserInstructions, USER_INSTRUCTIONS_FILE } from './userInstructions'

// The project as a .zip: project.json + its media (assets/) + the AGENTS.md
// guide + the author's user-instructions.md. It opens back in Scormly ("Open .zip", also in browsers that can't use
// a project folder), unzips into a project folder, and can be handed to an AI
// assistant that follows AGENTS.md. Excludes the undo/redo history sidecar
// (.scormly-history.json).
export async function buildProjectZip(
  course: Course,
  directoryHandle: FileSystemDirectoryHandle | null,
): Promise<JSZip> {
  const zip = new JSZip()
  // Media embedded as data: URLs (older no-folder projects) becomes files, so
  // project.json stays small enough to read and edit.
  const { json, files } = extractDataUrls(JSON.stringify(course, null, 2))
  zip.file('project.json', json)
  for (const [path, bytes] of files) zip.file(path, bytes)
  zip.file(AGENT_GUIDE_FILE, buildAgentGuide(course))
  zip.file(USER_INSTRUCTIONS_FILE, await readUserInstructions(directoryHandle))
  await addAssets(zip, directoryHandle, course)
  // Zip times are local wall-clock time (as Finder, Windows and Python write
  // them), but JSZip stores a date's UTC fields: shift it so they match.
  const now = new Date()
  const wall = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  zip.forEach((_, file) => {
    file.date = wall
  })
  return zip
}

/** A zip entry's time, read as local wall-clock time (see buildProjectZip). */
export function zipEntryTime(date: Date): number {
  return new Date(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(),
  ).getTime()
}

export async function downloadProjectZip(): Promise<string> {
  const { course, directoryHandle } = useCourseStore.getState()
  const zip = await buildProjectZip(course, directoryHandle)
  const filename = await downloadZip(zip, `${sanitize(course.title)}-project.zip`)
  markZipSaved(course)
  return filename
}

// Without a folder the .zip download is the save: remember what was saved, so
// leaving the editor only warns about edits made since.
let savedCourse: Course | null = null

export function markZipSaved(course: Course): void {
  savedCourse = course
}

export function hasUnsavedZipChanges(): boolean {
  return useCourseStore.getState().course !== savedCourse
}

const SUBDIR_BY_TYPE: Record<string, string> = { image: 'images', video: 'videos', audio: 'audio' }

/** Replace base64 data: URLs in the JSON with assets/ paths, returning the
 *  decoded files (identical URLs share one file). */
export function extractDataUrls(json: string): { json: string; files: Map<string, Uint8Array> } {
  const files = new Map<string, Uint8Array>()
  const byUrl = new Map<string, string>()
  const out = json.replace(/data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/gi, (url, mime: string, b64: string) => {
    const known = byUrl.get(url)
    if (known) return known
    const type = mime.toLowerCase()
    const sub = type === 'text/vtt' ? 'captions' : (SUBDIR_BY_TYPE[type.split('/')[0]] ?? 'files')
    const path = `assets/${sub}/embedded-${byUrl.size + 1}.${extForMime(type) ?? 'bin'}`
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    files.set(path, bytes)
    byUrl.set(url, path)
    return path
  })
  return { json: out, files }
}
