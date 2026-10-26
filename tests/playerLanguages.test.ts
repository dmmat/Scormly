import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PLAYER_LANGUAGES } from '../src/types/course'

// The player's UI strings live in a plain object literal at the top of
// player.js; evaluate just that literal.
function playerStrings(): Record<string, Record<string, string>> {
  const src = readFileSync('public/scorm-player/player.js', 'utf8')
  const m = src.match(/var T = (\{[\s\S]*?\n {2}\});\n/)
  if (!m) throw new Error('T table not found in player.js')
  return new Function(`return ${m[1]}`)()
}

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()

describe('player UI languages', () => {
  const T = playerStrings()

  it('matches PLAYER_LANGUAGES', () => {
    expect(Object.keys(T).sort()).toEqual([...PLAYER_LANGUAGES].sort())
  })

  it.each(PLAYER_LANGUAGES.filter((l) => l !== 'en'))('%s has every key with the same placeholders', (lang) => {
    for (const [key, en] of Object.entries(T.en)) {
      const str = T[lang][key]
      expect(str, `${lang}.${key}`).toBeTruthy()
      expect(placeholders(str), `${lang}.${key}`).toEqual(placeholders(en))
    }
    expect(Object.keys(T[lang]).sort()).toEqual(Object.keys(T.en).sort())
  })
})
