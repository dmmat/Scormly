// Recent projects, persisted in IndexedDB. Unlike localStorage, IndexedDB can
// store FileSystemDirectoryHandle objects, so we can re-open a project later
// (re-requesting permission on click).

const DB_NAME = 'scormly'
const STORE = 'recent-projects'
const MAX_RECENTS = 8

export interface RecentProject {
  /** Stable key (the folder name). */
  name: string
  handle: FileSystemDirectoryHandle
  lastOpened: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'name' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode)
        const req = run(transaction.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export async function listRecentProjects(): Promise<RecentProject[]> {
  try {
    const all = await tx<RecentProject[]>('readonly', (s) => s.getAll())
    return all.sort((a, b) => b.lastOpened - a.lastOpened).slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export async function rememberRecentProject(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  try {
    const entry: RecentProject = {
      name: handle.name,
      handle,
      lastOpened: Date.now(),
    }
    await tx('readwrite', (s) => s.put(entry))
  } catch {
    // Recents are best-effort; ignore storage failures.
  }
}

export async function forgetRecentProject(name: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(name))
  } catch {
    // ignore
  }
}
