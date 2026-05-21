// Thin wrapper around the File System Access API. Keeps all direct browser
// FS calls in one place so the rest of the app works with simple async helpers.

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

/** Open the OS directory picker and return the chosen directory handle. */
export async function pickDirectory(
  mode: 'read' | 'readwrite' = 'readwrite',
): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error('File System Access API is not supported')
  }
  return window.showDirectoryPicker({ mode, id: 'scormly-project' })
}

/**
 * Ensure we hold the requested permission for a handle, prompting if needed.
 * Returns true if granted.
 */
export async function ensurePermission(
  handle: FileSystemHandle,
  readWrite = true,
): Promise<boolean> {
  const opts: FileSystemHandlePermissionDescriptor = {
    mode: readWrite ? 'readwrite' : 'read',
  }
  if ((await handle.queryPermission?.(opts)) === 'granted') return true
  return (await handle.requestPermission?.(opts)) === 'granted'
}

/** Get (or create) a subdirectory handle. */
export async function getSubdirectory(
  dir: FileSystemDirectoryHandle,
  name: string,
  create = true,
): Promise<FileSystemDirectoryHandle> {
  return dir.getDirectoryHandle(name, { create })
}

export async function writeFile(
  dir: FileSystemDirectoryHandle,
  name: string,
  contents: FileSystemWriteChunkType,
): Promise<void> {
  const fileHandle = await dir.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(contents)
  await writable.close()
}

export async function writeJson(
  dir: FileSystemDirectoryHandle,
  name: string,
  data: unknown,
): Promise<void> {
  await writeFile(dir, name, JSON.stringify(data, null, 2))
}

/** Read and parse a JSON file, or return null if it doesn't exist. */
export async function readJson<T>(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<T | null> {
  try {
    const fileHandle = await dir.getFileHandle(name)
    const file = await fileHandle.getFile()
    const text = await file.text()
    return JSON.parse(text) as T
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') return null
    throw err
  }
}

/** True if a file with the given name exists in the directory. */
export async function fileExists(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(name)
    return true
  } catch {
    return false
  }
}

/** Write a binary blob into a subdirectory (e.g. assets/images). */
export async function writeBlobToSubdir(
  dir: FileSystemDirectoryHandle,
  subdirPath: string[],
  name: string,
  blob: Blob,
): Promise<void> {
  let target = dir
  for (const part of subdirPath) {
    target = await getSubdirectory(target, part)
  }
  await writeFile(target, name, blob)
}
