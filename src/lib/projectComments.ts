// Reading and writing comments.json in a project's folder (on disk or in the
// browser's storage). Projects without a folder keep their comments in the
// review store only; they travel in the project .zip (exportProjectZip).

import { readText, writeFile } from './fileSystem'
import { BROKEN_COMMENTS_FILE, COMMENTS_FILE, parseComments, serializeComments } from './comments'
import { useReviewStore } from '../store/reviewStore'
import { toast } from '../store/toastStore'
import { translate } from '../i18n/I18nProvider'

// Set when the file exists but couldn't be read: never overwrite what we
// couldn't see.
let readFailed = false

/** Load the project's comments (none when it has no comments.json). */
export async function loadProjectComments(handle: FileSystemDirectoryHandle): Promise<void> {
  readFailed = false
  let text: string | null
  try {
    text = await readText(handle, COMMENTS_FILE)
  } catch (err) {
    console.error('[comments]', err)
    readFailed = true
    useReviewStore.getState().loadThreads([])
    toast({ id: 'comments-file', tone: 'error', message: translate('review', 'fileReadFailed') })
    return
  }
  const threads = text === null ? [] : parseComments(text)
  if (threads === null) {
    // Not JSON (a slip while editing it by hand?): keep a copy, since the
    // next comment rewrites the file.
    try {
      await writeFile(handle, BROKEN_COMMENTS_FILE, text!)
    } catch {
      readFailed = true
    }
    toast({ id: 'comments-file', tone: 'error', message: translate('review', 'fileUnreadable', { file: BROKEN_COMMENTS_FILE }) })
  }
  useReviewStore.getState().loadThreads(threads ?? [])
}

/** Write comments.json when the comments changed since it was read / written. */
export async function saveProjectComments(handle: FileSystemDirectoryHandle): Promise<void> {
  const { threads, savedThreads, markSaved } = useReviewStore.getState()
  if (threads === savedThreads || readFailed) return
  await writeFile(handle, COMMENTS_FILE, serializeComments(threads))
  markSaved(threads)
}

export function hasUnsavedComments(): boolean {
  const { threads, savedThreads } = useReviewStore.getState()
  return threads !== savedThreads && !readFailed
}
