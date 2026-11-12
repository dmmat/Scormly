import type JSZip from 'jszip'

// JSZip is ~100 kB, so it loads only when a package or a project .zip is
// actually built or opened, not with the landing page or the editor shell.
export async function loadJSZip(): Promise<typeof JSZip> {
  return (await import('jszip')).default
}
