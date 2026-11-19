#!/usr/bin/env node
// Renders a Scormly project folder the way a learner sees the exported course,
// and (with --shots) saves a full-page screenshot of every lesson, so an
// author or an AI assistant can look at the result without opening the app.
//
//   node render-course.mjs <project folder> [options]
//
//   --out <dir>      where to write the pages (default: <project>/.render)
//   --shots          screenshot every lesson to <out>/lesson-N.png
//                    (needs Chromium or Chrome and Node 22+)
//   --width <px>     viewport width for the screenshots (default 1280)
//   --keep-gates     keep Continue blocks; by default they are dropped so a
//                    whole lesson shows on one page
//   --player <dir>   folder with the player files (index.html, player.js,
//                    player.css, kit.css, scorm.js); default: next to this
//                    script in the Scormly repo, else https://scormly.app
//   --chrome <path>  browser binary to use
//
// No dependencies. Nothing is uploaded: the pages are written next to the
// project and served from this machine only while the screenshots are taken.

import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import os from 'node:os'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const PLAYER_FILES = ['index.html', 'player.js', 'player.css', 'kit.css', 'scorm.js']
const PLAYER_URL = 'https://scormly.app/scorm-player/'

// ── Custom theme palette (mirrors src/theme/customTheme.ts) ────────────────
const SHAPES = { sharp: ['0', '2px'], soft: ['0.5rem', '0.5rem'], rounded: ['0.875rem', '1rem'], pill: ['9999px', '1rem'] }
const parseHex = (hex) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex ?? '').trim())
  if (!m) return null
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (rgb, to, t) => rgb.map((v, i) => v + (to[i] - v) * t)
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const onWhite = (rgb) => 1.05 / (luminance(rgb) + 0.05)
const readable = (rgb) => {
  let c = rgb
  for (let i = 0; i < 40 && onWhite(c.map(Math.round)) < 4.5; i++) c = mix(c, [0, 0, 0], 0.05)
  return c
}

/** The palette an export embeds for theme 'custom' (course.themeTokens). */
export function themeTokens(theme = {}) {
  const accent = parseHex(theme.accent) ?? parseHex('#0f766e')
  const brand = readable(accent)
  const second = readable(parseHex(theme.accent2) ?? accent)
  const [radiusBtn, radiusInteractive] = SHAPES[theme.shape] ?? SHAPES.rounded
  return {
    brand: toHex(brand),
    brandLight: toHex(mix(brand, [255, 255, 255], 0.6)),
    brandDark: toHex(mix(brand, [0, 0, 0], 0.2)),
    accent2: toHex(second),
    accent2Dark: toHex(mix(second, [0, 0, 0], 0.2)),
    radiusBtn,
    radiusInteractive,
  }
}

/** The course as the player gets it; `only` keeps one lesson (by index). */
export function playerCourse(course, { keepGates = false, only } = {}) {
  const c = structuredClone(course)
  if (c.theme === 'custom') c.themeTokens = themeTokens(c.customTheme)
  if (only !== undefined) {
    c.lessons = [c.lessons[only]]
    c.intro = { ...(c.intro ?? {}), enabled: false }
  }
  if (!keepGates) for (const l of c.lessons) l.blocks = (l.blocks ?? []).filter((b) => b.type !== 'continue')
  return c
}

const dataJs = (course) => `window.__SCORMLY_COURSE__ = ${JSON.stringify(course).replace(/</g, '\\u003c')};`

async function playerFile(name, dir) {
  if (dir) return fs.readFileSync(path.join(dir, name), 'utf8')
  const res = await fetch(PLAYER_URL + name)
  if (!res.ok) throw new Error(`Could not download ${PLAYER_URL + name} (${res.status})`)
  return res.text()
}

function findChrome(explicit) {
  const names = [explicit, process.env.CHROME_PATH, 'chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe']
  for (const n of names.filter(Boolean)) {
    if (path.isAbsolute(n) ? fs.existsSync(n) : spawnSync(process.platform === 'win32' ? 'where' : 'which', [n]).status === 0) return n
  }
  return null
}

function serve(root) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.vtt': 'text/vtt' }
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

async function screenshots(out, pages, width, chromePath) {
  if (typeof WebSocket === 'undefined') throw new Error('Screenshots need Node 22 or newer (built-in WebSocket).')
  const chrome = findChrome(chromePath)
  if (!chrome) throw new Error('No Chromium / Chrome found. Pass --chrome <path> or set CHROME_PATH.')
  const server = await serve(out)
  const base = `http://127.0.0.1:${server.address().port}/`
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'scormly-render-'))
  const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
  try {
    const wsUrl = await new Promise((resolve, reject) => {
      let err = ''
      proc.stderr.on('data', (d) => {
        err += d
        const m = /DevTools listening on (ws:\/\/\S+)/.exec(err)
        if (m) resolve(m[1])
      })
      proc.on('exit', () => reject(new Error('The browser exited before it was ready.')))
      setTimeout(() => reject(new Error('The browser did not start in time.')), 20000)
    })
    const port = new URL(wsUrl).port
    const target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve) => (ws.onopen = resolve))
    let id = 0
    const pending = new Map()
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data)
      if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
    }
    const send = (method, params = {}) => new Promise((resolve) => { pending.set(++id, resolve); ws.send(JSON.stringify({ id, method, params })) })
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const metrics = (height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    // Blocks fade in as they scroll into view; without motion they are simply there.
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await send('Page.enable')
    const files = []
    for (const page of pages) {
      await metrics(900)
      await send('Page.navigate', { url: base + page })
      await sleep(2500)
      const h = (await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result.result.value
      await metrics(Math.min(Math.max(h, 900), 16000))
      await sleep(1500)
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
      const file = path.join(out, page.replace(/\.html$/, '.png'))
      fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'))
      files.push(file)
    }
    ws.close()
    return files
  } finally {
    proc.kill()
    server.close()
    fs.rmSync(profile, { recursive: true, force: true })
  }
}

async function main(argv) {
  const opts = { width: 1280 }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--shots') opts.shots = true
    else if (a === '--keep-gates') opts.keepGates = true
    else if (['--out', '--width', '--player', '--chrome'].includes(a)) opts[a.slice(2)] = argv[++i]
    else if (a === '-h' || a === '--help') opts.help = true
    else rest.push(a)
  }
  if (opts.help || rest.length !== 1) {
    console.log('Usage: node render-course.mjs <project folder> [--shots] [--out <dir>] [--width <px>] [--keep-gates] [--player <dir>] [--chrome <path>]')
    process.exit(opts.help ? 0 : 1)
  }
  const project = path.resolve(rest[0])
  const course = JSON.parse(fs.readFileSync(path.join(project, 'project.json'), 'utf8'))
  const out = path.resolve(opts.out ?? path.join(project, '.render'))
  const local = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scorm-player')
  const playerDir = opts.player ? path.resolve(opts.player) : fs.existsSync(path.join(local, 'player.js')) ? local : null

  fs.mkdirSync(out, { recursive: true })
  for (const name of PLAYER_FILES) {
    let text = await playerFile(name, playerDir)
    if (name === 'index.html') {
      text = text.replace('{{COURSE_TITLE}}', () => String(course.title || 'Course').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]))
      const pages = course.lessons.map((_, i) => `lesson-${i + 1}.html`)
      pages.forEach((page, i) => fs.writeFileSync(path.join(out, page), text.replace('course-data.js', `course-data-${i + 1}.js`)))
    }
    fs.writeFileSync(path.join(out, name), text)
  }
  // The pages load media by the project's own relative paths.
  const assets = path.join(project, 'assets')
  if (fs.existsSync(assets)) fs.cpSync(assets, path.join(out, 'assets'), { recursive: true })
  fs.writeFileSync(path.join(out, 'course-data.js'), dataJs(playerCourse(course, { keepGates: true })))
  course.lessons.forEach((_, i) => fs.writeFileSync(path.join(out, `course-data-${i + 1}.js`), dataJs(playerCourse(course, { keepGates: opts.keepGates, only: i }))))

  console.log(`Rendered ${course.lessons.length} lesson(s) to ${out}`)
  console.log(`  whole course: ${path.join(out, 'index.html')} (serve the folder over http to open it)`)
  if (opts.shots) {
    const files = await screenshots(out, course.lessons.map((_, i) => `lesson-${i + 1}.html`), Number(opts.width) || 1280, opts.chrome)
    for (const f of files) console.log(`  screenshot: ${f}`)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
