// SCORM manifest generation (src/export/scormManifest.ts).

import { describe, test, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildManifest } from '../src/export/scormManifest'
import { SCHEMA_FILES } from '../src/export/packageCommon'
import type { Course } from '../src/types/course'

const SCHEMA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'scorm-player', 'schemas')

function course(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    title: 'My <Course> & "Друзі"',
    description: 'What the course is about',
    theme: 'rose',
    settings: {
      completion: 'quiz',
      scored: true,
      passingScore: 80,
      navigation: 'free',
      contentLanguage: 'uk',
    },
    lessons: [
      {
        id: 'l1',
        title: 'L1',
        blocks: [
          {
            id: 'q1',
            type: 'quiz',
            settings: {},
            data: { questions: [], passingScore: 70, shuffle: false },
          },
        ],
      },
    ],
    ...overrides,
  } as unknown as Course
}

const FILES = ['index.html', 'player.js', 'assets/фото уроку (1).png']

describe('buildManifest: both versions', () => {
  test.each(['1.2', '2004'] as const)('%s: hrefs are %%-encoded valid URIs', (v) => {
    const xml = buildManifest(course(), FILES, v)
    expect(xml).toContain(
      '<file href="assets/%D1%84%D0%BE%D1%82%D0%BE%20%D1%83%D1%80%D0%BE%D0%BA%D1%83%20(1).png" />',
    )
    expect(xml).not.toContain('href="assets/фото')
  })

  test.each(['1.2', '2004'] as const)('%s: title is XML-escaped', (v) => {
    const xml = buildManifest(course(), FILES, v)
    expect(xml).toContain('My &lt;Course&gt; &amp; &quot;Друзі&quot;')
  })
})

describe('buildManifest: SCORM 2004', () => {
  test('declares the mastery score as minNormalizedMeasure', () => {
    const xml = buildManifest(course(), FILES, '2004', 80)
    expect(xml).toContain('satisfiedByMeasure="true"')
    expect(xml).toContain('<imsss:minNormalizedMeasure>0.80</imsss:minNormalizedMeasure>')
  })

  test('declares one objective per scored block', () => {
    const xml = buildManifest(course(), FILES, '2004', 80)
    expect(xml).toContain('objectiveID="QUIZ_q1"')
  })

  test('always declares completionSetByContent/objectiveSetByContent', () => {
    // Without these the LMS may auto-complete the SCO on exit, overriding the
    // player's reported status, even for unscored courses.
    const unscored = course({ lessons: [] })
    for (const xml of [buildManifest(course(), FILES, '2004', 80), buildManifest(unscored, FILES, '2004')]) {
      expect(xml).toContain(
        '<imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true" />',
      )
    }
  })

  test('embeds LOM metadata with title, description and language', () => {
    const xml = buildManifest(course(), FILES, '2004')
    expect(xml).toContain('xmlns:lom="http://ltsc.ieee.org/xsd/LOM"')
    expect(xml).toContain('<lom:string language="uk">What the course is about</lom:string>')
    expect(xml).toContain('<lom:language>uk</lom:language>')
  })

  test('omits the LOM description when the course has none; language defaults to en', () => {
    const c = course({ description: '' })
    delete c.settings!.contentLanguage
    const xml = buildManifest(c, FILES, '2004')
    expect(xml).not.toContain('lom:description')
    expect(xml).toContain('<lom:language>en</lom:language>')
  })
})

describe('buildManifest: SCORM 1.2', () => {
  test('declares the mastery score via adlcp:masteryscore', () => {
    const xml = buildManifest(course(), FILES, '1.2', 80)
    expect(xml).toContain('<adlcp:masteryscore>80</adlcp:masteryscore>')
  })

  test('carries no inline metadata (its strict wildcard needs the IMS MD schema, which strict validators reject)', () => {
    const xml = buildManifest(course(), FILES, '1.2')
    expect(xml).not.toContain('imsmd')
    expect(xml).not.toContain('lom')
  })
})

describe('bundled schema files', () => {
  test.each(['scorm12', 'scorm2004'] as const)('%s: the list matches the files on disk', (set) => {
    const root = path.join(SCHEMA_DIR, set)
    const onDisk = (fs.readdirSync(root, { recursive: true }) as string[])
      .filter((f) => fs.statSync(path.join(root, f)).isFile())
      .map((f) => f.split(path.sep).join('/'))
    expect([...SCHEMA_FILES[set]].sort()).toEqual(onDisk.sort())
  })
})

// Validate generated manifests against the bundled ADL/IMS schemas. Needs
// xmllint (libxml2); skipped where it isn't installed.
const hasXmllint = (() => {
  try { execFileSync('xmllint', ['--version'], { stdio: 'ignore' }); return true } catch { return false }
})()

describe.skipIf(!hasXmllint)('manifests validate against the official XSDs', () => {
  // xmllint takes one schema; a driver imports every namespace the manifest uses.
  function validate(xml: string, set: 'scorm12' | 'scorm2004', imports: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scormly-xsd-'))
    const driver = path.join(dir, 'driver.xsd')
    fs.writeFileSync(driver, `<?xml version="1.0"?>\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n${Object.entries(imports)
      .map(([ns, file]) => `  <xs:import namespace="${ns}" schemaLocation="${path.join(SCHEMA_DIR, set, file)}"/>`)
      .join('\n')}\n</xs:schema>\n`)
    const doc = path.join(dir, 'imsmanifest.xml')
    fs.writeFileSync(doc, xml)
    try {
      return execFileSync('xmllint', ['--noout', '--schema', driver, doc], { encoding: 'utf8', stdio: 'pipe' })
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  test.each([true, false])('SCORM 2004 (scored: %s)', (scored) => {
    const c = scored ? course() : course({ description: '', lessons: [] })
    const xml = buildManifest(c, FILES, '2004', scored ? 80 : undefined)
    expect(() => validate(xml, 'scorm2004', {
      'http://www.imsglobal.org/xsd/imscp_v1p1': 'imscp_v1p1.xsd',
      'http://www.adlnet.org/xsd/adlcp_v1p3': 'adlcp_v1p3.xsd',
      'http://www.adlnet.org/xsd/adlseq_v1p3': 'adlseq_v1p3.xsd',
      'http://www.adlnet.org/xsd/adlnav_v1p3': 'adlnav_v1p3.xsd',
      'http://www.imsglobal.org/xsd/imsss': 'imsss_v1p0.xsd',
      'http://ltsc.ieee.org/xsd/LOM': 'lom.xsd',
    })).not.toThrow()
  })

  test.each([true, false])('SCORM 1.2 (scored: %s)', (scored) => {
    const xml = buildManifest(course(), FILES, '1.2', scored ? 80 : undefined)
    expect(() => validate(xml, 'scorm12', {
      'http://www.imsproject.org/xsd/imscp_rootv1p1p2': 'imscp_rootv1p1p2.xsd',
      'http://www.adlnet.org/xsd/adlcp_rootv1p2': 'adlcp_rootv1p2.xsd',
    })).not.toThrow()
  })
})
