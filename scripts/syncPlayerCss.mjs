// Copies the shared block design CSS (src/styles/blocks.css) into the SCORM
// player stylesheet, mapping the builder's token names to the player's.
// Run after editing src/styles/blocks.css: node scripts/syncPlayerCss.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const START = '/* >>> shared block design (generated from src/styles/blocks.css; do not edit here) */'
const END = '/* <<< shared block design */'

export function playerBlockCss(source) {
  return source
    .replace(/var\(--color-brand-dark\)/g, 'var(--brand-dark)')
    .replace(/var\(--color-brand\)/g, 'var(--brand)')
    .replace(/var\(--radius-interactive\)/g, 'var(--radius-surface)')
}

export function syncedPlayerCss(playerCss, blocksCss) {
  const block = `${START}\n${playerBlockCss(blocksCss).trim()}\n${END}`
  const a = playerCss.indexOf(START)
  const b = playerCss.indexOf(END)
  if (a === -1 || b === -1) return `${playerCss.trimEnd()}\n\n${block}\n`
  return playerCss.slice(0, a) + block + playerCss.slice(b + END.length)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const playerPath = `${root}public/scorm-player/player.css`
  const next = syncedPlayerCss(
    readFileSync(playerPath, 'utf8'),
    readFileSync(`${root}src/styles/blocks.css`, 'utf8'),
  )
  writeFileSync(playerPath, next)
  console.log('player.css: shared block design updated')
}
