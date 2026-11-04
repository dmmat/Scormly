// Custom HTML blocks: an uploaded .html page or a .zip site is unpacked into
// assets/html/<folder>/ and the block points at its entry page. The exported
// player loads that page as-is (its sibling files ship with it), so relative
// paths, fetch() and modules all work there. The editor can't serve a folder,
// so its frame gets one document with the files inlined as data: URLs (see
// buildHtmlDocument), in a sandbox that keeps the page away from the app.

import JSZip from 'jszip'
import { useCourseStore } from '../store/courseStore'
import { getSubdirectory, writeBlobToSubdir } from './fileSystem'
import { getMemoryAsset, memoryAssetPaths, putMemoryAsset } from './assets'
import { uid } from './id'

export class HtmlUploadError extends Error {
  constructor(public reason: 'format' | 'noHtml') {
    super(`HTML upload: ${reason}`)
    this.name = 'HtmlUploadError'
  }
}

const HTML_RE = /\.html?$/i

const MIME: Record<string, string> = {
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript',
  json: 'application/json', txt: 'text/plain', xml: 'application/xml', csv: 'text/csv',
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', ico: 'image/x-icon',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  mp4: 'video/mp4', webm: 'video/webm', vtt: 'text/vtt', wasm: 'application/wasm', pdf: 'application/pdf',
}

function mimeOf(path: string): string {
  return MIME[/\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase() ?? ''] ?? 'application/octet-stream'
}

/** The bundle folder of an entry path: assets/html/<folder>/ (or null). */
export function htmlBundleDir(src: string): string | null {
  return /^assets\/html\/[^/]+\//.exec(src)?.[0] ?? null
}

// Files of a .zip worth keeping, by their path inside the site. Drops OS
// clutter and anything that would escape the folder, and strips a single
// top-level folder (zipping "my-site/" puts everything under it).
function siteFiles(zip: JSZip): Map<string, JSZip.JSZipObject> {
  const files = new Map<string, JSZip.JSZipObject>()
  zip.forEach((name, entry) => {
    if (entry.dir) return
    const path = name.replace(/\\/g, '/').replace(/^\.?\//, '')
    const parts = path.split('/')
    if (parts.some((p) => p === '..' || p === '') || parts[0] === '__MACOSX') return
    if (/^(\.DS_Store|Thumbs\.db|desktop\.ini)$/i.test(parts[parts.length - 1])) return
    files.set(path, entry)
  })
  const tops = new Set([...files.keys()].map((p) => (p.includes('/') ? p.split('/')[0] : '')))
  if (tops.size === 1 && !tops.has('')) {
    const cut = [...tops][0].length + 1
    return new Map([...files].map(([p, e]) => [p.slice(cut), e]))
  }
  return files
}

/** The page to open: index.html nearest the root, else the shallowest page. */
export function pickEntry(paths: string[]): string | undefined {
  const depth = (p: string) => p.split('/').length
  const pages = paths.filter((p) => HTML_RE.test(p)).sort((a, b) => depth(a) - depth(b) || a.localeCompare(b))
  return pages.find((p) => /(^|\/)index\.html?$/i.test(p) && depth(p) === depth(pages[0])) ?? pages[0]
}

async function writeFile(path: string, blob: Blob): Promise<void> {
  const handle = useCourseStore.getState().directoryHandle
  if (!handle) return putMemoryAsset(path, blob)
  const parts = path.split('/')
  const name = parts.pop()!
  await writeBlobToSubdir(handle, parts, name, blob)
}

/** Store an uploaded .html page or .zip site; resolves to the entry path. */
export async function saveHtmlUpload(file: File): Promise<string> {
  const dir = `assets/html/${uid('html')}/`
  if (HTML_RE.test(file.name)) {
    await writeFile(`${dir}index.html`, new Blob([file], { type: 'text/html' }))
    return `${dir}index.html`
  }
  if (!/\.zip$/i.test(file.name)) throw new HtmlUploadError('format')
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new HtmlUploadError('format')
  }
  const files = siteFiles(zip)
  const entry = pickEntry([...files.keys()])
  if (!entry) throw new HtmlUploadError('noHtml')
  for (const [path, obj] of files) {
    const bytes = await obj.async('arraybuffer')
    await writeFile(dir + path, new Blob([bytes], { type: mimeOf(path) }))
  }
  return dir + entry
}

type DirEntries = { entries(): AsyncIterableIterator<[string, FileSystemHandle]> }

async function readDir(dir: FileSystemDirectoryHandle, prefix: string, out: Map<string, Blob>): Promise<void> {
  for await (const [name, child] of (dir as unknown as DirEntries).entries()) {
    if (child.kind === 'directory') await readDir(child as FileSystemDirectoryHandle, `${prefix}${name}/`, out)
    else out.set(prefix + name, await (child as FileSystemFileHandle).getFile())
  }
}

/** Every file of a bundle, keyed by its path inside the bundle folder. */
export async function loadHtmlBundle(bundleDir: string): Promise<Map<string, Blob>> {
  const files = new Map<string, Blob>()
  const handle = useCourseStore.getState().directoryHandle
  if (!handle) {
    for (const path of memoryAssetPaths()) {
      if (path.startsWith(bundleDir)) files.set(path.slice(bundleDir.length), getMemoryAsset(path)!)
    }
    return files
  }
  try {
    let dir = handle
    for (const part of bundleDir.split('/').filter(Boolean)) dir = await getSubdirectory(dir, part, false)
    await readDir(dir, '', files)
  } catch {
    // Missing folder: the frame shows nothing.
  }
  return files
}

// Posts the page's content height to the editor, which sizes the frame to it.
// scrollHeight never drops below the frame's own height, so a page shorter
// than the frame is measured by its body; a height that keeps growing by the
// same step is a page sized to the frame (100vh + margin) and is left alone.
// Same rule as fitFrame() in the player.
const HEIGHT_REPORTER = `<script>(function(){var l=0,d=0,n=0;function m(){var e=document.documentElement,b=document.body;if(!b)return 0;if(e.scrollHeight>e.clientHeight+1)return e.scrollHeight;return Math.ceil(b.getBoundingClientRect().bottom+(parseFloat(getComputedStyle(b).marginBottom)||0))}function s(){var h=m();if(!h||Math.abs(h-l)<2)return;if(h-l===d&&d>0&&++n>2)return;if(h-l!==d)n=0;d=h-l;l=h;parent.postMessage({type:'scormly:height',height:h},'*')}addEventListener('load',s);if(window.ResizeObserver){var o=new ResizeObserver(s);o.observe(document.documentElement);addEventListener('DOMContentLoaded',function(){o.observe(document.body)})}setTimeout(s,0)})()</script>`

/** Code-mode document for the editor frame; `head` is injected first
 *  (the course styles, see kitHead). */
export function codeDocument(code: string, head = ''): string {
  return withScript(code, head + HEIGHT_REPORTER)
}

let kitCss: Promise<string> | null = null

/** The Scormly kit stylesheet (public/scorm-player/kit.css, shipped with the
 *  player), fetched once. */
function loadKitCss(): Promise<string> {
  kitCss ??= fetch(`${import.meta.env.BASE_URL}scorm-player/kit.css`)
    .then((r) => (r.ok ? r.text() : ''))
    .catch(() => '')
  return kitCss
}

/** Font of an element of `tag` placed under `host` (typography rules style
 *  headings by tag). */
function probeFont(host: Element, tag: string): string {
  const el = document.createElement(tag)
  el.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  host.appendChild(el)
  const font = getComputedStyle(el).fontFamily
  el.remove()
  return font
}

/** The kit's --sc-* tokens as resolved where the frame sits: the course
 *  theme's accent and button shape, and the typography's fonts. Same rule as
 *  kitTokens() in the player. */
export function kitTokensCss(host: Element): string {
  const cs = getComputedStyle(host)
  const v = (name: string) => cs.getPropertyValue(name).trim()
  const tokens: Record<string, string> = {
    '--sc-accent': v('--color-brand'),
    '--sc-accent-dark': v('--color-brand-dark'),
    '--sc-radius': v('--radius-btn'),
    '--sc-font': probeFont(host, 'p'),
    '--sc-heading-font': probeFont(host, 'h2'),
  }
  const decl = Object.entries(tokens)
    .filter(([, value]) => value && !/[<>{};]/.test(value))
    .map(([k, value]) => `${k}:${value}`)
    .join(';')
  return `:root{${decl}}`
}

/** Head markup that gives a frame the course look: the kit, then its tokens. */
export async function kitHead(host: Element): Promise<string> {
  const css = (await loadKitCss()).replace(/<\/style/gi, '<\\/style')
  return `<style>${css}</style><style>${kitTokensCss(host)}</style>`
}

function withScript(html: string, script: string): string {
  const m = /<head[^>]*>/i.exec(html)
  return m ? html.slice(0, m.index + m[0].length) + script + html.slice(m.index + m[0].length) : script + html
}

function toDataUrl(blob: Blob, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob.type === type ? blob : new Blob([blob], { type }))
  })
}

/** Resolve `ref` against the file at `from` (both inside the bundle); null for
 *  absolute URLs (http:, data:, //host, #anchor…). */
export function resolveRef(from: string, ref: string): string | null {
  const clean = ref.trim().replace(/[?#].*$/, '')
  if (!clean || /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref.trim())) return null
  const parts = clean.startsWith('/') ? [] : from.split('/').slice(0, -1)
  for (const seg of clean.replace(/^\//, '').split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.' && seg !== '') parts.push(seg)
  }
  try {
    return decodeURIComponent(parts.join('/'))
  } catch {
    return parts.join('/')
  }
}

/**
 * One self-contained document for an uploaded bundle: stylesheets, scripts,
 * images, fonts and media it references by relative path become data: URLs,
 * and fetch() / XMLHttpRequest of bundle files is answered from the same map.
 * Imports inside ES modules aren't rewritten (they work in the exported
 * course, which serves the real folder).
 */
export async function buildHtmlDocument(entry: string, files: Map<string, Blob>, head = ''): Promise<string | null> {
  const page = files.get(entry)
  if (!page) return null
  const urls = new Map<string, string>()
  const busy = new Set<string>() // stylesheets being inlined (import cycles)
  const dataUrl = async (path: string): Promise<string | undefined> => {
    if (!files.has(path) || busy.has(path)) return undefined
    if (!urls.has(path)) {
      busy.add(path)
      const type = mimeOf(path)
      urls.set(path, type === 'text/css'
        ? `data:text/css;charset=utf-8,${encodeURIComponent(await inlineCss(path, await files.get(path)!.text()))}`
        : await toDataUrl(files.get(path)!, type))
      busy.delete(path)
    }
    return urls.get(path)
  }
  const inlineCss = async (from: string, css: string): Promise<string> => {
    const out: string[] = []
    let last = 0
    const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)|@import\s+(['"])([^'"]+)\3/g
    for (let m = re.exec(css); m; m = re.exec(css)) {
      const ref = m[2] ?? m[4]
      const path = resolveRef(from, ref)
      const url = path ? await dataUrl(path) : undefined
      out.push(css.slice(last, m.index), url ? (m[2] ? `url("${url}")` : `@import "${url}"`) : m[0])
      last = m.index + m[0].length
    }
    return out.join('') + css.slice(last)
  }

  const doc = new DOMParser().parseFromString(await page.text(), 'text/html')
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('[src],[href],[poster],[data]'))) {
    if (el.tagName === 'A' || el.tagName === 'BASE') continue
    for (const attr of ['src', 'href', 'poster', 'data']) {
      const ref = el.getAttribute(attr)
      const path = ref && resolveRef(entry, ref)
      if (!path) continue
      if (el.tagName === 'IFRAME' && HTML_RE.test(path) && files.has(path)) {
        const inner = await buildHtmlDocument(path, files)
        if (inner !== null) {
          el.removeAttribute('src')
          el.setAttribute('srcdoc', inner)
        }
        continue
      }
      const url = await dataUrl(path)
      if (url) el.setAttribute(attr, url)
    }
  }
  for (const style of Array.from(doc.querySelectorAll('style'))) {
    style.textContent = await inlineCss(entry, style.textContent ?? '')
  }
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('[style]'))) {
    el.setAttribute('style', await inlineCss(entry, el.getAttribute('style') ?? ''))
  }

  // Runtime requests for bundle files (JSON data, sounds loaded by script…).
  const map: Record<string, string> = {}
  for (const path of files.keys()) {
    if (path !== entry && !/\.(mp4|webm)$/i.test(path)) {
      const url = await dataUrl(path)
      if (url) map[path] = url
    }
  }
  const dir = JSON.stringify(entry.split('/').slice(0, -1).join('/'))
  const shim = `<script>(function(){var M=${JSON.stringify(map).replace(/</g, '\\u003c')},D=${dir};function r(u){if(typeof u!=='string'||/^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(u))return u;var p=u.replace(/[?#].*$/,''),a=p.charAt(0)==='/'?[]:(D?D.split('/'):[]);p.replace(/^\\//,'').split('/').forEach(function(s){if(s==='..')a.pop();else if(s&&s!=='.')a.push(s)});var k=a.join('/');try{k=decodeURIComponent(k)}catch(e){}return M[k]||u}var f=window.fetch;if(f)window.fetch=function(i,o){return f.call(this,typeof i==='string'?r(i):i,o)};var x=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){arguments[1]=r(u);return x.apply(this,arguments)}})()</script>`
  const html = `<!doctype html>${doc.documentElement.outerHTML}`
  return withScript(html, head + shim + HEIGHT_REPORTER)
}
