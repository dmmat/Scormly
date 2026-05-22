import JSZip from 'jszip'
import { useCourseStore } from '../store/courseStore'
import { addAssets, downloadZip, sanitize } from '../export/packageCommon'
import { AGENT_GUIDE_FILE, buildAgentGuide } from './agentGuide'

// Download a clean, shareable copy of the project as a .zip: project.json +
// referenced media (assets/) + the AGENTS.md guide. Deliberately excludes the
// undo/redo history sidecar (.scormly-history.json) — a fresh project to hand to
// someone else. The recipient unzips it into a folder and opens it in Scormly.
export async function downloadProjectZip(): Promise<void> {
  const { course, directoryHandle } = useCourseStore.getState()
  const zip = new JSZip()

  zip.file('project.json', JSON.stringify(course, null, 2))
  zip.file(AGENT_GUIDE_FILE, buildAgentGuide(course))
  // Only the media the course references (skips orphans); no-op without a folder
  // (in that mode media lives as data URLs inside project.json).
  await addAssets(zip, directoryHandle, course)

  await downloadZip(zip, `${sanitize(course.title)}-project.zip`)
}
