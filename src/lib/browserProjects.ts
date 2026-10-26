// Projects kept in this browser. The Origin Private File System (OPFS) gives
// each project a real directory handle — no permission prompts, it survives
// reloads, and it works in Firefox as well as Chrome — so the folder code
// (autosave, media, undo history, export) runs on it unchanged. Layout:
// <OPFS>/projects/<id>/{project.json, AGENTS.md, assets/…}. Not synced
// anywhere: a .zip download is the way to back a project up or share it.

const ROOT = 'projects'
const PROJECT_FILE = 'project.json'

/** URL key prefix (#/app/browser:<id>) that marks a project in this browser. */
export const BROWSER_KEY_PREFIX = 'browser:'

export interface BrowserProject {
  id: string
  /** The course's own id (project.json `id`): how a .zip coming back is
   *  recognized as a version of this project. */
  courseId: string
  title: string
  /** Last write to project.json (ms). */
  updatedAt: number
}

/** OPFS with writable files (Chrome / Edge 86+, Firefox 111+). */
export function isBrowserStorageSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function' &&
    typeof FileSystemFileHandle !== 'undefined' &&
    'createWritable' in FileSystemFileHandle.prototype
  )
}

async function projectsDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()
  return root.getDirectoryHandle(ROOT, { create: true })
}

/** Projects in this browser, most recently changed first. */
export async function listBrowserProjects(): Promise<BrowserProject[]> {
  if (!isBrowserStorageSupported()) return []
  const out: BrowserProject[] = []
  try {
    for await (const handle of (await projectsDir()).values()) {
      if (handle.kind !== 'directory') continue
      try {
        const file = await (await (handle as FileSystemDirectoryHandle).getFileHandle(PROJECT_FILE)).getFile()
        const course = JSON.parse(await file.text()) as { id?: unknown; title?: unknown }
        out.push({
          id: handle.name,
          courseId: typeof course.id === 'string' ? course.id : '',
          title: typeof course.title === 'string' && course.title.trim() ? course.title : handle.name,
          updatedAt: file.lastModified,
        })
      } catch {
        // Not a project (or a broken one): leave it out of the list.
      }
    }
  } catch {
    return []
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt)
}

/** The directory of a project in this browser, created when asked. */
export async function browserProjectDir(id: string, create = false): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await (await projectsDir()).getDirectoryHandle(id, { create })
  } catch {
    return null
  }
}

export async function deleteBrowserProject(id: string): Promise<void> {
  await (await projectsDir()).removeEntry(id, { recursive: true })
}

/** Ask the browser to keep this site's storage under disk pressure (it may
 *  prompt in Firefox; Chrome decides by itself). Best-effort. */
export function requestPersistentStorage(): void {
  void navigator.storage?.persist?.().catch(() => false)
}
