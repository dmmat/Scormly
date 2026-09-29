import JSZip from 'jszip'
import { useCourseStore } from '../store/courseStore'
import { buildManifest, type ScormVersion } from './scormManifest'
import {
  addAssets,
  addPlayer,
  fetchPlayerFile,
  downloadZip,
  overallPassingScore,
  sanitize,
} from './packageCommon'

// Build and download a SCORM package (1.2 or 2004) for the current course.
export async function exportScorm(version: ScormVersion = '2004'): Promise<string> {
  const { course, directoryHandle } = useCourseStore.getState()
  const zip = new JSZip()

  const files = await addPlayer(zip, course, 'scorm.js', fetchPlayerFile)
  files.push(...(await addAssets(zip, directoryHandle, course)))

  zip.file(
    'imsmanifest.xml',
    buildManifest(course, files, version, overallPassingScore(course)),
  )

  return downloadZip(
    zip,
    `${sanitize(course.title)}-scorm${version === '2004' ? '2004' : '12'}.zip`,
  )
}
