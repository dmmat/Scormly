// Illustrations for the built-in sample course, drawn as inline SVG data URLs
// so the sample needs no asset files and exports as-is. Colors follow the
// sample's Ocean theme.

const svgUrl = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Greedy word wrap for SVG <text> (no foreignObject: not rendered everywhere).
function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

const FONT = `font-family="Inter, 'Segoe UI', Roboto, Arial, sans-serif"`

/** Course cover: a hooked envelope over a deep-blue night sky of data dots. */
export function coverArt(): string {
  const dots = Array.from({ length: 140 }, (_, i) => {
    const x = (i * 97) % 1600
    const y = (i * 53 + (i % 7) * 31) % 900
    const r = 1 + (i % 3) * 0.6
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#7dd3fc" opacity="${0.12 + (i % 5) * 0.06}"/>`
  }).join('')
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c4a6e"/><stop offset=".55" stop-color="#082f49"/><stop offset="1" stop-color="#020617"/></linearGradient>
<radialGradient id="glow" cx=".72" cy=".38" r=".5"><stop offset="0" stop-color="#38bdf8" stop-opacity=".55"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
<linearGradient id="env" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#bg)"/>
<rect width="1600" height="900" fill="url(#glow)"/>
${dots}
<g transform="translate(1010 170) rotate(-8)">
<rect x="0" y="80" width="420" height="280" rx="28" fill="url(#env)"/>
<path d="M0 108 210 250 420 108" fill="none" stroke="#0369a1" stroke-width="14" stroke-linejoin="round"/>
<path d="M210 -40v120" stroke="#e0f2fe" stroke-width="10" stroke-linecap="round"/>
<path d="M210 80c0 70 70 70 70 10" fill="none" stroke="#e0f2fe" stroke-width="12" stroke-linecap="round"/>
<circle cx="380" cy="110" r="44" fill="#ef4444"/>
<path d="M380 88v28M380 130v2" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
</g>
<g opacity=".5" stroke="#38bdf8" stroke-width="2" fill="none">
<circle cx="1220" cy="400" r="300"/><circle cx="1220" cy="400" r="380" opacity=".6"/><circle cx="1220" cy="400" r="460" opacity=".3"/>
</g>
</svg>`)
}

/** A slide of the "red flags" carousel: big icon + title on a gradient. */
export function flagSlide(n: number, title: string, text: string, icon: 'clock' | 'at' | 'clip' | 'key'): string {
  const palettes = [
    ['#0369a1', '#0c4a6e'],
    ['#0e7490', '#164e63'],
    ['#1d4ed8', '#1e3a8a'],
    ['#7c3aed', '#4c1d95'],
  ]
  const [a, b] = palettes[(n - 1) % palettes.length]
  const icons = {
    clock: '<circle cx="0" cy="0" r="90" fill="none" stroke="#fff" stroke-width="16"/><path d="M0-50V0l36 26" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>',
    at: '<circle cx="0" cy="0" r="36" fill="none" stroke="#fff" stroke-width="16"/><path d="M36-36v52c0 22 44 22 44-12a80 80 0 1 0-32 64" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>',
    clip: '<path d="M60-10-20 70a40 40 0 0 1-56-56L20-82a28 28 0 0 1 40 40l-86 86a14 14 0 0 1-20-20l72-72" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>',
    key: '<circle cx="-40" cy="0" r="44" fill="none" stroke="#fff" stroke-width="16"/><path d="M4 0h92M70 0v36M96 0v26" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>',
  }
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" ${FONT}>
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#g)"/>
<circle cx="1350" cy="180" r="320" fill="#fff" opacity=".06"/><circle cx="1450" cy="900" r="260" fill="#fff" opacity=".05"/>
<text x="200" y="210" fill="#fff" opacity=".55" font-size="44" font-weight="700" letter-spacing="8">${String(n).padStart(2, '0')} / 04</text>
<g transform="translate(1220 520)"><circle r="190" fill="#fff" opacity=".12"/>${icons[icon]}</g>
<text x="200" y="500" fill="#fff" font-size="96" font-weight="800">${esc(title)}</text>
<text x="200" y="610" fill="#e0f2fe" font-size="44" font-weight="500">${wrap(text, 38)
    .map((line, i) => `<tspan x="200" dy="${i === 0 ? 0 : 62}">${esc(line)}</tspan>`)
    .join('')}</text>
</svg>`)
}

/** A desk scene: laptop with an inbox and one highlighted suspicious mail. */
export function inboxArt(labels: { inbox: string; mails: string[] }): string {
  const rows = labels.mails
    .map((m, i) => {
      const y = 250 + i * 110
      const bad = i === 1
      return `<rect x="290" y="${y}" width="620" height="90" rx="16" fill="${bad ? '#fef2f2' : '#fff'}" stroke="${bad ? '#ef4444' : '#e2e8f0'}" stroke-width="${bad ? 4 : 2}"/>
<circle cx="340" cy="${y + 45}" r="22" fill="${bad ? '#ef4444' : '#bae6fd'}"/>
<text x="380" y="${y + 54}" fill="#0f172a" font-size="28" font-weight="${bad ? 700 : 500}">${esc(m)}</text>`
    })
    .join('')
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" ${FONT}>
<rect width="1200" height="900" fill="#e0f2fe"/>
<circle cx="1050" cy="120" r="220" fill="#bae6fd"/><circle cx="120" cy="820" r="180" fill="#bae6fd" opacity=".6"/>
<rect x="230" y="130" width="740" height="560" rx="28" fill="#0f172a"/>
<rect x="260" y="160" width="680" height="500" rx="14" fill="#f8fafc"/>
<text x="290" y="220" fill="#0369a1" font-size="34" font-weight="800">${esc(labels.inbox)}</text>
${rows}
<path d="M170 700h860l-60 60H230z" fill="#334155"/>
<g transform="translate(905 330)"><circle r="46" fill="#ef4444"/><path d="M0-22v26M0 18v2" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>
</svg>`)
}

/** Round avatar with initials (testimonial card). */
export function avatarArt(initials: string): string {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ${FONT}>
<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs>
<rect width="200" height="200" fill="url(#a)"/>
<text x="100" y="124" fill="#fff" font-size="72" font-weight="700" text-anchor="middle">${esc(initials)}</text>
</svg>`)
}

/** A plain-text file as a data URL (sample attachment). */
export function textFile(content: string): string {
  return 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
}

/** Neutral landscape placeholder (block previews in the Add menu). */
export function landscapeArt(hue = 205): string {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 82%)"/><stop offset="1" stop-color="hsl(${hue} 60% 95%)"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#s)"/>
<circle cx="900" cy="220" r="90" fill="hsl(${(hue + 160) % 360} 90% 70%)"/>
<path d="M0 620 300 340l220 200 160-120 520 360H0Z" fill="hsl(${hue} 40% 45%)"/>
<path d="M0 800V660l380-200 300 220 240-140 280 160v100Z" fill="hsl(${hue} 45% 30%)"/>
</svg>`)
}

/** Mail toolbar with the "Report phishing" button highlighted (how-to step). */
export function reportButtonArt(labels: { reply: string; forward: string; report: string }): string {
  const btn = (x: number, w: number, label: string, on = false) =>
    `<rect x="${x}" y="110" width="${w}" height="76" rx="14" fill="${on ? '#fef2f2' : '#fff'}" stroke="${on ? '#ef4444' : '#cbd5e1'}" stroke-width="${on ? 5 : 2}"/>
<text x="${x + w / 2}" y="158" fill="${on ? '#b91c1c' : '#334155'}" font-size="30" font-weight="${on ? 700 : 500}" text-anchor="middle">${esc(label)}</text>`
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" ${FONT}>
<rect width="1200" height="300" fill="#e0f2fe"/>
<rect x="60" y="50" width="1080" height="196" rx="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
${btn(110, 230, labels.reply)}${btn(370, 250, labels.forward)}${btn(650, 430, '⚑ ' + labels.report, true)}
<path d="M955 168v74l17-15 13 29 14-6-13-29 23-1z" fill="#0f172a" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
</svg>`)
}
