// Builds public/library/manifest.json from the files in public/library/ plus
// the names / roles below. Only files that exist are listed, so the manifest
// grows as pictures are added. Run: node scripts/buildLibraryManifest.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const EMOTIONS = ['neutral', 'happy', 'concerned', 'surprised', 'frustrated', 'thinking']

// Display order and names (the picture folder / file name is the id).
const CHARACTERS = {
  ksiu: { name: { en: 'Ksenia', uk: 'Ксюша' }, role: { en: 'HR / onboarding', uk: 'HR / онбординг' } },
  nazar: { name: { en: 'Nazar', uk: 'Назар' }, role: { en: 'Team lead', uk: 'Керівник команди' } },
  max: { name: { en: 'Max', uk: 'Макс' }, role: { en: 'New employee', uk: 'Новий працівник' } },
  anna: { name: { en: 'Anna', uk: 'Аня' }, role: { en: 'Colleague', uk: 'Колега' } },
  sergio: { name: { en: 'Sergio', uk: 'Серджіо' }, role: { en: 'Customer', uk: 'Клієнт' } },
  dmytro: { name: { en: 'Dmytro', uk: 'Дмитро' }, role: { en: 'IT support', uk: 'IT-підтримка' } },
  jisu: { name: { en: 'Jisu', uk: 'Дзісу' }, role: { en: 'Marketing / design', uk: 'Маркетинг / дизайн' } },
  layla: { name: { en: 'Layla', uk: 'Лейла' }, role: { en: 'Legal / compliance', uk: 'Юристка / комплаєнс' } },
}
const BACKGROUNDS = {
  'office-open-space': { en: 'Open-plan office', uk: 'Open-space офіс' },
  'meeting-room': { en: 'Meeting room', uk: 'Переговорна' },
  whiteboard: { en: 'Whiteboard', uk: 'Біля дошки' },
  'manager-office': { en: "Manager's office", uk: 'Кабінет керівника' },
  'reception-desk': { en: 'Reception', uk: 'Рецепція' },
  'retail-floor': { en: 'Retail floor', uk: 'Торговий зал' },
  'call-center': { en: 'Call center', uk: 'Колл-центр' },
  'it-corner': { en: 'IT corner', uk: 'IT-куток' },
  'break-room': { en: 'Break room', uk: 'Кухня / кав\'ярня' },
  'home-office': { en: 'Home office', uk: 'Домашній офіс' },
  'warehouse-office': { en: 'Warehouse office', uk: 'Офіс на складі' },
  'street-entrance': { en: 'Entrance', uk: 'Вхід до офісу' },
  'abstract-light': { en: 'Plain light', uk: 'Нейтральний світлий' },
  'abstract-dark': { en: 'Plain dark', uk: 'Нейтральний темний' },
}

const names = (dir) => (existsSync(dir) ? readdirSync(dir) : [])

export function buildManifest(libDir = `${root}public/library`) {
  const characters = Object.entries(CHARACTERS).flatMap(([id, meta]) => {
    const files = names(`${libDir}/characters/${id}`)
    const emotions = EMOTIONS.filter((e) => files.includes(`${e}.webp`))
    if (!emotions.includes('neutral')) return []
    const scene = EMOTIONS.filter((e) => files.includes(`scene-${e}.webp`))
    return [{ id, ...meta, emotions, ...(scene.length ? { scene } : {}) }]
  })
  const avatars = names(`${libDir}/avatars`)
    .filter((f) => /^learner-\d+\.webp$/.test(f))
    .map((f) => f.replace('.webp', ''))
    .sort()
  const bgFiles = names(`${libDir}/backgrounds`)
  const backgrounds = Object.entries(BACKGROUNDS)
    .filter(([id]) => bgFiles.includes(`${id}.webp`) && bgFiles.includes(`${id}.thumb.webp`))
    .map(([id, name]) => ({ id, name }))
  return { version: 1, characters, avatars, backgrounds }
}

export function manifestJson(manifest) {
  return JSON.stringify(manifest, null, 2) + '\n'
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const path = `${root}public/library/manifest.json`
  writeFileSync(path, manifestJson(buildManifest()))
  console.log('library manifest updated')
}
