// public/library/manifest.json is generated from the files in public/library/.

import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-expect-error — plain .mjs build script without type declarations
import { buildManifest, manifestJson } from '../scripts/buildLibraryManifest.mjs'

describe('library manifest', () => {
  test('is in sync with public/library (run node scripts/buildLibraryManifest.mjs)', () => {
    expect(readFileSync('public/library/manifest.json', 'utf8')).toBe(manifestJson(buildManifest()))
  })
})

describe('library thumbnails', () => {
  test('every character has the small portrait the picker and the landing use', async () => {
    const { existsSync } = await import('node:fs')
    for (const c of buildManifest().characters) {
      expect(existsSync(`public/library/characters/${c.id}/thumb.webp`), c.id).toBe(true)
    }
  })
})
