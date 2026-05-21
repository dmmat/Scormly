// Short unique IDs for blocks, questions, scenario nodes, etc.
// crypto.randomUUID is available in all target browsers (the File System Access
// API requires a modern browser anyway).

export function uid(prefix = ''): string {
  const id = crypto.randomUUID()
  return prefix ? `${prefix}-${id}` : id
}
