// The SCORM player carries a generated copy of the shared block design CSS.

import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-expect-error: plain .mjs build script without type declarations
import { syncedPlayerCss } from '../scripts/syncPlayerCss.mjs'

describe('player.css', () => {
  test('is in sync with src/styles/blocks.css (run node scripts/syncPlayerCss.mjs)', () => {
    const player = readFileSync('public/scorm-player/player.css', 'utf8')
    const blocks = readFileSync('src/styles/blocks.css', 'utf8')
    expect(syncedPlayerCss(player, blocks)).toBe(player)
  })

  test('uses only player token names', () => {
    const player = readFileSync('public/scorm-player/player.css', 'utf8')
    expect(player).not.toMatch(/var\(--color-brand|var\(--radius-interactive/)
  })
})
