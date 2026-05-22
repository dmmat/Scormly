import JSZip from 'jszip'
import { useCourseStore } from '../store/courseStore'
import { buildCmi5Manifest } from './cmi5Manifest'
import { addAssets, addPlayer, downloadZip, sanitize } from './packageCommon'

// Build and download a cmi5 package for the current course. Same player as the
// SCORM export, but bundles the xAPI/cmi5 runtime (xapi.js) and a cmi5.xml
// course structure instead of imsmanifest.xml.
export async function exportCmi5(): Promise<void> {
  const { course, directoryHandle } = useCourseStore.getState()
  const zip = new JSZip()

  await addPlayer(zip, course, 'xapi.js')
  await addAssets(zip, directoryHandle, course)

  zip.file('cmi5.xml', buildCmi5Manifest(course))

  await downloadZip(zip, `${sanitize(course.title)}-cmi5.zip`)
}
