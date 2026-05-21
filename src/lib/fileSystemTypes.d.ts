// Ambient declarations for the parts of the File System Access API not yet in
// the standard TS DOM lib (permission queries and the directory picker).

interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite'
}

interface FileSystemHandle {
  queryPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>
  requestPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>
}

interface DirectoryPickerOptions {
  id?: string
  mode?: 'read' | 'readwrite'
  startIn?: string | FileSystemHandle
}

interface Window {
  showDirectoryPicker?(
    options?: DirectoryPickerOptions,
  ): Promise<FileSystemDirectoryHandle>
}

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}
