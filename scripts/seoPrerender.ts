import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import landing from '../src/i18n/locales/landing.ts'
import { RELEASES } from '../src/help/releaseNotes.ts'
import { CONTACT_EMAIL } from '../src/lib/links.ts'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_STORAGE_KEY, type Language } from '../src/i18n/types.ts'
import { LD } from './seoLd.ts'
import { LOGO_GLYPH } from '../src/components/layout/logoMark.ts'
import pkg from '../package.json' with { type: 'json' }

// The site is a client-rendered SPA, so the served index.html used to contain an
// empty <div id="root">. This build-only plugin writes the landing's copy (the
// same strings the React landing renders) into #root as plain semantic HTML,
// plus FAQPage structured data, so crawlers see real content without running JS.
// createRoot().render() replaces it on mount.
//
// Each interface language gets its own page so it can be found in that
// language: English at '/', the others at '/uk', '/fr', '/es', '/de' (uk.html, …),
// with their own title, description, canonical URL and copy, tied together by
// hreflang links and listed in the sitemap.

const GITHUB = 'https://github.com/dmmat/Scormly'
const SITE = 'https://scormly.app/'
const RELEASE_DATE = RELEASES.find((r) => r.date)?.date ?? ''
const OG_LOCALE: Record<Language, string> = { en: 'en_US', uk: 'uk_UA', fr: 'fr_FR', es: 'es_ES', de: 'de_DE' }

const langPath = (lang: Language) => (lang === DEFAULT_LANGUAGE ? '' : lang)
const pageUrl = (lang: Language) => SITE + langPath(lang)

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function faqKeys(t: Record<string, string>): number[] {
  const out: number[] = []
  for (let i = 1; t[`faqQ${i}`]; i++) out.push(i)
  return out
}

export function staticLanding(lang: Language): string {
  const t = landing[lang]
  const list = (items: [string, string][]) =>
    items.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')
  const range = (prefix: string, n: number): [string, string][] =>
    Array.from({ length: n }, (_, i) => [t[`${prefix}${i + 1}Title`], t[`${prefix}${i + 1}Text`]])

  const date = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  const news = RELEASES.filter((r) => r.date)
    .slice(0, 2)
    .map(
      (r) =>
        `<h3><time datetime="${r.date}">${date.format(new Date(r.date!))}</time></h3><ul>${r.items[lang]
          .map((item) => `<li>${esc(item)}</li>`)
          .join('')}</ul>`,
    )
    .join('')

  return `<div id="seo-static">
<header><strong>Scormly</strong>
<nav><a href="#features">${esc(t.navFeatures)}</a> <a href="#how">${esc(t.navHow)}</a> <a href="#faq">${esc(t.navFaq)}</a> <a href="${GITHUB}">${esc(t.navGithub)}</a> <a href="/app">${esc(t.openApp)}</a></nav>
</header>
<main>
<section><p>${esc(t.heroBadge)}</p><h1>${esc(t.heroTitle)}</h1><p>${esc(t.heroSubtitle)}</p>
<p><a href="/app">${esc(t.heroCtaPrimary)}</a> · <a href="/demo">${esc(t.heroCtaDemo)}</a> · <a href="${GITHUB}">${esc(t.heroCtaSecondary)}</a></p><p>${esc(t.heroNote)}</p></section>
<section><h2>${esc(t.pillarsTitle)}</h2><ul>${list([
    [t.pillarOpenTitle, t.pillarOpenText],
    [t.pillarFreeTitle, t.pillarFreeText],
    [t.pillarLocalTitle, t.pillarLocalText],
  ])}</ul></section>
<section id="who"><h2>${esc(t.whoTitle)}</h2><p>${esc(t.whoSubtitle)}</p><ul>${list(range('who', 4))}</ul></section>
<section id="features"><h2>${esc(t.featuresTitle)}</h2><p>${esc(t.featuresSubtitle)}</p><ul>${list(range('f', 10))}</ul></section>
<section id="how"><h2>${esc(t.howTitle)}</h2><ol>${list(range('how', 3))}</ol></section>
<section id="design"><h2>${esc(t.designTitle)}</h2><p>${esc(t.designSubtitle)}</p><ul>${list(range('designPoint', 4))}</ul></section>
<section id="ai"><h2>${esc(t.aiTitle)}</h2><p>${esc(t.aiSubtitle)}</p><ul>${list(range('aiPoint', 3))}</ul></section>
<section id="accessibility"><h2>${esc(t.a11yTitle)}</h2><p>${esc(t.a11ySubtitle)}</p><ul>${list(range('a11yPoint', 6))}</ul><p>${esc(t.a11yNote)}</p></section>
<section><h2>${esc(t.privacyTitle)}</h2><p>${esc(t.privacyText)}</p></section>
<section id="faq"><h2>${esc(t.faqTitle)}</h2>${faqKeys(t)
    .map((i) => `<h3>${esc(t[`faqQ${i}`])}</h3><p>${esc(t[`faqA${i}`])}</p>`)
    .join('')}</section>
<section id="whats-new"><h2>${esc(t.newsTitle)}</h2><p>${esc(t.newsSubtitle)}</p>${news}</section>
<section id="about"><h2>${esc(t.aboutTitle)}</h2><p>${esc(t.aboutText)} <a href="${GITHUB}">${esc(t.navGithub)}</a> · <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
<p>${esc(t.aboutVersion)}: ${esc(pkg.version)} · ${esc(t.aboutReleased)}: <time datetime="${RELEASE_DATE}">${RELEASE_DATE}</time> · ${esc(t.aboutLicense)}: MIT · ${esc(t.aboutRepo)}: <a href="${GITHUB}">github.com/dmmat/Scormly</a> · <a href="#whats-new">${esc(t.aboutNews)}</a></p></section>
<section><h2>${esc(t.contributeTitle)}</h2><p>${esc(t.contributeText)}</p><p><a href="${GITHUB}">${esc(t.contributeCta)}</a></p></section>
</main>
<footer><p>${esc(t.footerTagline)}</p><p><a href="${GITHUB}">${esc(t.navGithub)}</a> · <a href="/demo">${esc(t.footerDemo)}</a> · <a href="/app">${esc(t.openApp)}</a> · <a href="#whats-new">${esc(t.navNews)}</a> · <a href="/llms.txt">llms.txt</a> · <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> · <a href="${GITHUB}/issues">${esc(t.footerIssues)}</a> · ${esc(t.footerLicense)}</p>
<nav aria-label="${esc(t.footerLanguages)}">${LANGUAGES.map(
    (l) => `<a href="/${langPath(l.id)}" hreflang="${l.id}" lang="${l.id}">${esc(l.label)}</a>`,
  ).join(' · ')}</nav></footer>
</div>`
}

function faqJsonLd(lang: Language): string {
  const t = landing[lang]
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqKeys(t).map((i) => ({
      '@type': 'Question',
      name: t[`faqQ${i}`],
      acceptedAnswer: { '@type': 'Answer', text: t[`faqA${i}`] },
    })),
  }
  // Escape "<" so answer text can never close the script element.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

// Minimal readable styling for no-JS readers. With JS on, the copy stays
// hidden until React replaces it (avoids a flash of unstyled text before the
// real landing mounts); if the bundle never mounts, it fades in after 3s.
const STYLE = `<style>
#seo-static{max-width:48rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;line-height:1.6;color:#1f2937}
#seo-static h1{font-size:2.25rem;line-height:1.15}
#seo-static ul,#seo-static ol{padding-left:1.25rem}
#seo-static a{color:#db2777}
.route-app #seo-static{display:none}
.js #seo-static{opacity:0;animation:seo-reveal .3s 3s forwards}
@keyframes seo-reveal{to{opacity:1}}
</style>`

// The same set on every language page: each version names all the others,
// and x-default is '/', which opens in the visitor's own language.
const hreflangLinks = () =>
  [
    ...LANGUAGES.map((l) => `<link rel="alternate" hreflang="${l.id}" href="${pageUrl(l.id)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}" />`,
  ].join('\n')

function swap(html: string, from: string | RegExp, to: string): string {
  const out = typeof from === 'string' ? html.split(from).join(to) : html.replace(from, () => to)
  if (out === html && from !== to) throw new Error(`seoPrerender: not found in index.html: ${String(from).slice(0, 80)}`)
  return out
}

/** The built English page turned into the page of another language. */
export function localizePage(html: string, lang: Language): string {
  const en = landing[DEFAULT_LANGUAGE]
  const t = landing[lang]
  const locales = [lang, ...LANGUAGES.map((l) => l.id).filter((id) => id !== lang)]
    .map((id, i) => `<meta property="og:locale${i ? ':alternate' : ''}" content="${OG_LOCALE[id]}" />`)
    .join('\n    ')
  let out = swap(html, '<html lang="en">', `<html lang="${lang}">`)
  // The title and description repeat in the Open Graph and Twitter tags.
  out = swap(out, esc(en.metaTitle), esc(t.metaTitle))
  out = swap(out, esc(en.metaDescription), esc(t.metaDescription))
  out = swap(out, `<link rel="canonical" href="${SITE}" />`, `<link rel="canonical" href="${pageUrl(lang)}" />`)
  out = swap(out, `<meta property="og:url" content="${SITE}" />`, `<meta property="og:url" content="${pageUrl(lang)}" />`)
  out = swap(out, /<meta property="og:locale" [^>]*>(\s*<meta property="og:locale:alternate" [^>]*>)*/, locales)
  out = swap(out, faqJsonLd(DEFAULT_LANGUAGE), faqJsonLd(lang))
  // Structured data and the image alt, which the head repeats in English.
  const enLd = LD[DEFAULT_LANGUAGE]
  const ld = LD[lang]
  out = swap(out, enLd.description, ld.description)
  out = swap(out, enLd.siteDescription, ld.siteDescription)
  out = swap(out, esc(enLd.imageAlt), esc(ld.imageAlt))
  enLd.features.forEach((feature, i) => {
    out = swap(out, feature, ld.features[i])
  })
  return swap(out, staticLanding(DEFAULT_LANGUAGE), staticLanding(lang))
}

// The screen /app and /demo show until the builder's code has arrived, instead
// of the landing page they are a copy of. Same markup as components/layout/AppLoader.tsx.
const APP_LOADER = `<div class="app-loader" role="status"><div class="app-loader-mark"><svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#EC4899"/><path d="${LOGO_GLYPH}" fill="#fff"/></svg><span class="app-loader-brand">Scorm<span>ly</span></span></div><div class="app-loader-page" aria-hidden="true"><i class="app-loader-title"></i><i class="app-loader-line"></i><i class="app-loader-line short"></i><i class="app-loader-image"></i><i class="app-loader-btn"></i></div><span class="sr-only">Loading the editor…</span></div>`

/** Adds `<link rel="modulepreload">` for chunks a page is about to ask for, so
 *  they download beside the main script instead of after it has run. */
export function withPreloads(html: string, hrefs: string[]): string {
  if (!hrefs.length) return html
  const links = hrefs.map((href) => `<link rel="modulepreload" crossorigin href="${href}">`).join('\n    ')
  return swap(html, '</head>', `    ${links}\n  </head>`)
}

/** The built landing page turned into the page of /app and /demo: the loading
 *  screen in place of the landing's copy, and the builder's chunks preloaded. */
export function appShell(html: string, preloads: string[]): string {
  return withPreloads(swap(html, staticLanding(DEFAULT_LANGUAGE), APP_LOADER), preloads)
}

/** Preloads a view's interface strings (src/i18n/load.ts): English always (the
 *  fallback), and the page's language. A page with a fixed language names its
 *  chunk; the others (/, /app, /demo) pick it with a small inline script that
 *  repeats the app's own rule: the saved choice, else the first browser
 *  language the interface has. Without it the strings would start downloading
 *  only after the main script ran. */
export function withLocalePreload(html: string, chunks: Partial<Record<Language, string>>, fixed?: Language): string {
  const english = chunks[DEFAULT_LANGUAGE]
  const out = withPreloads(html, [english, fixed && fixed !== DEFAULT_LANGUAGE ? chunks[fixed] : undefined].filter((h): h is string => !!h))
  if (fixed) return out
  const others = Object.fromEntries(Object.entries(chunks).filter(([lang]) => lang !== DEFAULT_LANGUAGE))
  if (!Object.keys(others).length) return out
  const script = `<script>(function(){try{var m=${JSON.stringify(others)},l=localStorage.getItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)});if(!m[l]&&l!==${JSON.stringify(DEFAULT_LANGUAGE)}){l='';var n=navigator.languages||[navigator.language];for(var i=0;i<n.length&&!l;i++){var c=String(n[i]||'').toLowerCase().split('-')[0];if(m[c]||c===${JSON.stringify(DEFAULT_LANGUAGE)})l=c}}if(m[l]){var k=document.createElement('link');k.rel='modulepreload';k.crossOrigin='';k.href=m[l];document.head.appendChild(k)}}catch(e){}})()</script>`
  return swap(out, '</head>', `    ${script}\n  </head>`)
}

/** A chunk and every chunk it imports statically (file names in `assets/`). */
export function chunkClosure(entry: string | undefined, read: (file: string) => string, skip: Set<string>): string[] {
  const out: string[] = []
  const visit = (file: string) => {
    if (skip.has(file) || out.includes(file)) return
    out.push(file)
    // Static imports only: `from"./x.js"` / `import"./x.js"`, not `import("./x.js")`.
    for (const m of read(file).matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)) visit(m[1])
  }
  if (entry) visit(entry)
  return out
}

// The pages to index: the landing in each language, each listing the other
// versions. The builder (/app) and the demo (/demo) are the same app with
// nothing of their own to index.
export const sitemap = (lastmod: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGUAGES.map(
  (page) => `  <url>
    <loc>${pageUrl(page.id)}</loc>
    <lastmod>${lastmod}</lastmod>
${[...LANGUAGES.map((l) => [l.id, pageUrl(l.id)]), ['x-default', SITE]]
  .map(([code, href]) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${href}" />`)
  .join('\n')}
  </url>`,
).join('\n')}
</urlset>
`

export function seoPrerender(): Plugin {
  let outDir = 'dist'
  return {
    name: 'scormly-seo-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    // The host is static, so every route needs a file: /app and /demo are
    // copies of the page (the app picks the view from the URL), 404.html lets
    // any other path (e.g. an old /app/<key> link) still open the app, and
    // each other language gets its own translated page.
    closeBundle() {
      const built = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      // Each page preloads the chunks of its own view (see App.tsx): they are
      // dynamic imports, which would otherwise start only once the main script ran.
      const assetsDir = resolve(outDir, 'assets')
      const assets = readdirSync(assetsDir)
      const base = /src="([^"]*)assets\/index-/.exec(built)?.[1] ?? '/'
      const loaded = new Set([...built.matchAll(/assets\/([^"]+\.js)"/g)].map((m) => m[1]))
      const chunksOf = (name: string) =>
        chunkClosure(
          assets.find((f) => f.startsWith(`${name}-`) && f.endsWith('.js')),
          // A chunk's text may quote an import that is not one of ours (sample code).
          (file) => (assets.includes(file) ? readFileSync(resolve(assetsDir, file), 'utf8') : ''),
          loaded,
        )
          .filter((f) => assets.includes(f))
          .map((f) => `${base}assets/${f}`)
      const strings = (group: string) =>
        Object.fromEntries(
          LANGUAGES.map((l) => [l.id, assets.find((f) => f.startsWith(`_locale-${group}-${l.id}-`))] as const)
            .filter(([, f]) => f)
            .map(([id, f]) => [id, `${base}assets/${f}`]),
        ) as Partial<Record<Language, string>>
      const builder = chunksOf('Builder')
      const landingPage = withPreloads(built, chunksOf('Landing'))
      writeFileSync(resolve(outDir, 'index.html'), withLocalePreload(landingPage, strings('landing')))
      for (const { id } of LANGUAGES) {
        if (id === DEFAULT_LANGUAGE) continue
        writeFileSync(resolve(outDir, `${id}.html`), withLocalePreload(localizePage(landingPage, id), strings('landing'), id))
      }
      writeFileSync(resolve(outDir, 'app.html'), withLocalePreload(appShell(built, builder), strings('app')))
      // The demo also opens the sample course straight away.
      const sample = chunksOf('sampleCourse').filter((href) => !builder.includes(href))
      writeFileSync(resolve(outDir, 'demo.html'), withLocalePreload(appShell(built, [...builder, ...sample]), strings('app')))
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
    // The page changes with every deploy, so the sitemap carries the build date.
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(new Date().toISOString().slice(0, 10)) })
    },
    transformIndexHtml(html) {
      const root = '<div id="root"></div>'
      if (!html.includes(root)) throw new Error('seoPrerender: #root not found in index.html')
      return html
        .replace(/%APP_VERSION%/g, pkg.version)
        .replace(/%RELEASE_DATE%/g, RELEASE_DATE)
        .replace('</head>', `${hreflangLinks()}\n${STYLE}\n${faqJsonLd(DEFAULT_LANGUAGE)}\n</head>`)
        .replace(root, `<div id="root">${staticLanding(DEFAULT_LANGUAGE)}</div>`)
    },
  }
}
