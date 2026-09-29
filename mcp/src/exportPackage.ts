// Build SCORM 1.2 / 2004 and cmi5 packages in Node. Reuses the app's packaging
// code (src/export): addPlayer (player files + embedded course-data.js), the
// manifest builders and the referenced-asset scan. Only the file access differs
// from the browser: player files are read from public/scorm-player/ and media
// from the project's assets/ folder on disk.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import type { Course } from '../../src/types/course'
import { migrateCourse } from '../../src/lib/migrateCourse'
import { buildManifest } from '../../src/export/scormManifest'
import { buildCmi5Manifest } from '../../src/export/cmi5Manifest'
import {
  addPlayer,
  collectAssetPaths,
  overallPassingScore,
  sanitize,
} from '../../src/export/packageCommon'
import { ToolError, ensureDir } from './project'

export type PackageFormat = 'scorm2004' | 'scorm12' | 'cmi5'

// The player shipped with the app. Both mcp/src/ (tests) and mcp/dist/ (the
// bundled server) sit two levels below the repo root.
const PLAYER_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/scorm-player',
)

const readPlayerFile = (name: string) =>
  readFile(path.join(PLAYER_DIR, name), 'utf8').catch(() => {
    throw new ToolError(`Scormly player file not found: ${path.join(PLAYER_DIR, name)}`)
  })

export function defaultPackageName(course: Course, format: PackageFormat): string {
  const suffix = format === 'cmi5' ? 'cmi5' : format === 'scorm12' ? 'scorm12' : 'scorm2004'
  return `${sanitize(course.title)}-${suffix}.zip`
}

export interface ExportResult {
  file: string
  files: number
  bytes: number
  /** Referenced assets/ paths that were not found on disk (left out). */
  missingAssets: string[]
}

export async function exportPackage(
  projectDir: string,
  input: Course,
  format: PackageFormat,
  outFile: string,
): Promise<ExportResult> {
  // The same invariants the builder applies when it loads a project.
  const course = migrateCourse(input)
  const zip = new JSZip()

  const files = await addPlayer(zip, course, format === 'cmi5' ? 'xapi.js' : 'scorm.js', readPlayerFile)

  const missingAssets: string[] = []
  const assetsRoot = path.resolve(projectDir, 'assets')
  for (const rel of [...collectAssetPaths(course)].sort()) {
    const abs = path.resolve(projectDir, rel)
    // Never package anything outside the project's assets/ folder.
    if (!abs.startsWith(assetsRoot + path.sep)) continue
    try {
      zip.file(rel, await readFile(abs))
      files.push(rel)
    } catch {
      missingAssets.push(rel)
    }
  }

  if (format === 'cmi5') {
    zip.file('cmi5.xml', buildCmi5Manifest(course))
  } else {
    const version = format === 'scorm12' ? '1.2' : '2004'
    zip.file('imsmanifest.xml', buildManifest(course, files, version, overallPassingScore(course)))
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer' })
  await ensureDir(path.dirname(outFile))
  await writeFile(outFile, buffer)
  const count = Object.values(zip.files).filter((f) => !f.dir).length
  return { file: outFile, files: count, bytes: buffer.length, missingAssets }
}
