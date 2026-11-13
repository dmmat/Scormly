// Builds public/library/manifest.json from the files in public/library/ plus
// the names / roles below. Only files that exist are listed, so the manifest
// grows as pictures are added. Run: node scripts/buildLibraryManifest.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const EMOTIONS = ['neutral', 'happy', 'concerned', 'surprised', 'frustrated', 'thinking']

// Display order and names (the picture folder / file name is the id). Names and
// roles are shown in the library picker, in every interface language.
const tr = (en, uk, fr, es, de) => ({ en, uk, fr, es, de })
const same = (n, uk) => tr(n, uk, n, n, n)
const CHARACTERS = {
  ksiu: { name: same('Ksenia', 'Ксюша'), role: tr('HR / onboarding', 'HR / онбординг', 'RH / intégration', 'RR. HH. / incorporación', 'HR / Onboarding') },
  nazar: { name: same('Nazar', 'Назар'), role: tr('Team lead', 'Керівник команди', 'Chef d’équipe', 'Responsable de equipo', 'Teamleiter') },
  max: { name: same('Max', 'Макс'), role: tr('New employee', 'Новий працівник', 'Nouvel employé', 'Empleado nuevo', 'Neuer Mitarbeiter') },
  anna: { name: same('Anna', 'Аня'), role: tr('Colleague', 'Колега', 'Collègue', 'Colega', 'Kollegin') },
  sergio: { name: same('Sergio', 'Серджіо'), role: tr('Customer', 'Клієнт', 'Client', 'Cliente', 'Kunde') },
  dmytro: { name: same('Dmytro', 'Дмитро'), role: tr('IT support', 'IT-підтримка', 'Support informatique', 'Soporte informático', 'IT-Support') },
  jisu: { name: same('Jisu', 'Дзісу'), role: tr('Marketing / design', 'Маркетинг / дизайн', 'Marketing / design', 'Marketing / diseño', 'Marketing / Design') },
  layla: { name: same('Layla', 'Лейла'), role: tr('Legal / compliance', 'Юристка / комплаєнс', 'Juridique / conformité', 'Legal / cumplimiento', 'Recht / Compliance') },
}
const BACKGROUNDS = {
  'office-open-space': tr('Open-plan office', 'Open-space офіс', 'Open space', 'Oficina diáfana', 'Großraumbüro'),
  'meeting-room': tr('Meeting room', 'Переговорна', 'Salle de réunion', 'Sala de reuniones', 'Besprechungsraum'),
  whiteboard: tr('Whiteboard', 'Біля дошки', 'Tableau blanc', 'Pizarra', 'Whiteboard'),
  'manager-office': tr("Manager's office", 'Кабінет керівника', 'Bureau du responsable', 'Despacho del responsable', 'Büro der Führungskraft'),
  'reception-desk': tr('Reception', 'Рецепція', 'Accueil', 'Recepción', 'Empfang'),
  'retail-floor': tr('Retail floor', 'Торговий зал', 'Espace de vente', 'Sala de ventas', 'Verkaufsfläche'),
  'call-center': tr('Call center', 'Колл-центр', 'Centre d’appels', 'Centro de llamadas', 'Callcenter'),
  'it-corner': tr('IT corner', 'IT-куток', 'Coin informatique', 'Rincón de TI', 'IT-Ecke'),
  'break-room': tr('Break room', 'Кухня / кав’ярня', 'Salle de pause', 'Sala de descanso', 'Pausenraum'),
  'home-office': tr('Home office', 'Домашній офіс', 'Télétravail', 'Oficina en casa', 'Homeoffice'),
  'warehouse-office': tr('Warehouse office', 'Офіс на складі', 'Bureau d’entrepôt', 'Oficina de almacén', 'Lagerbüro'),
  'street-entrance': tr('Entrance', 'Вхід до офісу', 'Entrée', 'Entrada', 'Eingang'),
  'abstract-light': tr('Plain light', 'Нейтральний світлий', 'Fond clair uni', 'Fondo claro liso', 'Hell, schlicht'),
  'abstract-dark': tr('Plain dark', 'Нейтральний темний', 'Fond sombre uni', 'Fondo oscuro liso', 'Dunkel, schlicht'),
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
