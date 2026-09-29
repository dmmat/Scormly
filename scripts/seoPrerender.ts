import type { Plugin } from 'vite'
import landing from '../src/i18n/locales/landing'
import demo from '../src/i18n/locales/demo'

// The site is a client-rendered SPA, so the served index.html used to contain an
// empty <div id="root">. This build-only plugin writes the landing's English copy
// (the same strings the React landing renders) into #root as plain semantic HTML,
// plus FAQPage structured data, so crawlers see real content without running JS.
// createRoot().render() replaces it on mount.

const GITHUB = 'https://github.com/dmmat/Scormly'

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

function staticLanding(): string {
  const t = landing.en
  const d = demo.en
  const list = (items: [string, string][]) =>
    items.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')
  const range = (prefix: string, n: number): [string, string][] =>
    Array.from({ length: n }, (_, i) => [t[`${prefix}${i + 1}Title`], t[`${prefix}${i + 1}Text`]])

  return `<div id="seo-static">
<header><strong>Scormly</strong>
<nav><a href="#demo">${esc(t.navDemo)}</a> <a href="#features">${esc(t.navFeatures)}</a> <a href="#how">${esc(t.navHow)}</a> <a href="#faq">${esc(t.navFaq)}</a> <a href="${GITHUB}">${esc(t.navGithub)}</a> <a href="#/app">${esc(t.openApp)}</a></nav>
</header>
<main>
<section><p>${esc(t.heroBadge)}</p><h1>${esc(t.heroTitle)}</h1><p>${esc(t.heroSubtitle)}</p>
<p><a href="#/app">${esc(t.heroCtaPrimary)}</a> · <a href="#/demo">${esc(t.heroCtaDemo)}</a> · <a href="${GITHUB}">${esc(t.heroCtaSecondary)}</a></p><p>${esc(t.heroNote)}</p></section>
<section><h2>${esc(t.pillarsTitle)}</h2><ul>${list([
    [t.pillarOpenTitle, t.pillarOpenText],
    [t.pillarFreeTitle, t.pillarFreeText],
    [t.pillarLocalTitle, t.pillarLocalText],
  ])}</ul></section>
<section id="demo"><h2>${esc(d.title)}</h2><p>${esc(d.badge)}. ${esc(d.subtitle)}</p><p><a href="#/demo">${esc(t.demoCourseCta)}</a></p></section>
<section><h2>${esc(t.privacyTitle)}</h2><p>${esc(t.privacyText)}</p></section>
<section id="features"><h2>${esc(t.featuresTitle)}</h2><p>${esc(t.featuresSubtitle)}</p><ul>${list(range('f', 10))}</ul></section>
<section id="ai"><h2>${esc(t.aiTitle)}</h2><p>${esc(t.aiSubtitle)}</p><ul>${list(range('aiPoint', 3))}</ul></section>
<section id="how"><h2>${esc(t.howTitle)}</h2><ol>${list(range('how', 3))}</ol></section>
<section id="faq"><h2>${esc(t.faqTitle)}</h2>${faqKeys(t)
    .map((i) => `<h3>${esc(t[`faqQ${i}`])}</h3><p>${esc(t[`faqA${i}`])}</p>`)
    .join('')}</section>
<section><h2>${esc(t.contributeTitle)}</h2><p>${esc(t.contributeText)}</p><p><a href="${GITHUB}">${esc(t.contributeCta)}</a></p></section>
</main>
<footer><p>${esc(t.footerTagline)}</p><p>${esc(t.footerLicense)} · <a href="${GITHUB}/issues">${esc(t.footerIssues)}</a></p></footer>
</div>`
}

function faqJsonLd(): string {
  const t = landing.en
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

// Minimal readable styling for the moment before the app bundle mounts.
const STYLE = `<style>
#seo-static{max-width:48rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;line-height:1.6;color:#1f2937}
#seo-static h1{font-size:2.25rem;line-height:1.15}
#seo-static ul,#seo-static ol{padding-left:1.25rem}
#seo-static a{color:#db2777}
.route-app #seo-static{display:none}
</style>`

export function seoPrerender(): Plugin {
  return {
    name: 'scormly-seo-prerender',
    apply: 'build',
    transformIndexHtml(html) {
      const root = '<div id="root"></div>'
      if (!html.includes(root)) throw new Error('seoPrerender: #root not found in index.html')
      return html
        .replace('</head>', `${STYLE}\n${faqJsonLd()}\n</head>`)
        .replace(root, `<div id="root">${staticLanding()}</div>`)
    },
  }
}
