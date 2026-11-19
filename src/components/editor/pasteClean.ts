// What a paste may bring into rich text. Text copied from a web page, Word or
// Google Docs carries colors, fonts, sizes and wrappers; only the formatting
// the editor itself offers survives, so pasted text looks like the course.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const SKIP = new Set(['STYLE', 'SCRIPT', 'TITLE', 'META', 'LINK', 'HEAD', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'IFRAME', 'OBJECT', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'])
const BLOCK = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'DL', 'DT', 'DD', 'ADDRESS'])
const SAFE_LINK = /^(https?:|mailto:|tel:)/i
// Pictures already in the project (or pasted as data) stay; hotlinked ones don't.
const SAFE_IMAGE = /^(assets\/|data:image\/)/i

function marks(el: HTMLElement, inner: string): string {
  if (!inner.trim()) return inner
  const tag = el.tagName
  const weight = el.style.fontWeight
  // Google Docs wraps everything in <b style="font-weight: normal">.
  const light = weight === 'normal' || (/^\d+$/.test(weight) && Number(weight) < 600)
  const bold = ((tag === 'B' || tag === 'STRONG' || /^H[1-6]$/.test(tag)) && !light) || weight === 'bold' || weight === 'bolder' || (/^\d+$/.test(weight) && Number(weight) >= 600)
  const italic = ((tag === 'I' || tag === 'EM') && el.style.fontStyle !== 'normal') || el.style.fontStyle === 'italic'
  const decoration = `${el.style.textDecoration} ${el.style.textDecorationLine}`
  const underline = tag !== 'A' && (tag === 'U' || /underline/.test(decoration))
  let out = inner
  if (underline) out = `<u>${out}</u>`
  if (italic) out = `<em>${out}</em>`
  if (bold) out = `<strong>${out}</strong>`
  return out
}

const hasBlocks = (el: Element) => !!el.querySelector('p, div, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, table, section, article')
const tidyBreaks = (html: string) => html.replace(/(?:\s*<br>\s*){3,}/g, '<br><br>').replace(/^(?:\s*<br>\s*)+|(?:\s*<br>\s*)+$/g, '')

function walk(node: Node, inline: boolean, basic = false): string {
  if (node.nodeType === Node.TEXT_NODE) return esc((node.textContent ?? '').replace(/\s*\n\s*/g, ' '))
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as HTMLElement
  const tag = el.tagName.toUpperCase()
  if (SKIP.has(tag)) return ''
  if (tag === 'BR') return '<br>'
  if (tag === 'IMG') {
    // In the editor a project image shows through a blob: URL; its real path is in data-asset.
    const src = el.getAttribute('data-asset') ?? el.getAttribute('src') ?? ''
    return !inline && !basic && SAFE_IMAGE.test(src) ? `<img src="${esc(src).replace(/"/g, '&quot;')}" alt="${esc(el.getAttribute('alt') ?? '').replace(/"/g, '&quot;')}">` : ''
  }
  const children = (flat: boolean) => [...el.childNodes].map((ch) => walk(ch, flat, basic)).join('')

  if (!inline) {
    if (tag === 'UL' || tag === 'OL') {
      const items = [...el.children].filter((ch) => ch.tagName === 'LI').map((li) => `<li>${tidyBreaks(walk(li, true))}</li>`)
      return items.length ? `<${tag.toLowerCase()}>${items.join('')}</${tag.toLowerCase()}>` : ''
    }
    if (tag === 'TABLE' && basic) {
      // No tables in a narrow place: each row becomes a line of text.
      return [...el.querySelectorAll('tr')].map((tr) => `<p>${tidyBreaks([...tr.children].map((c) => walk(c, true)).join(' ')).trim()}</p>`).join('')
    }
    if (tag === 'TABLE') {
      const rows = [...el.querySelectorAll('tr')].filter((tr) => tr.closest('table') === el)
      const body = rows
        .map((tr) => `<tr>${[...tr.children].map((c) => `<${c.tagName === 'TH' ? 'th' : 'td'}>${tidyBreaks(walk(c, true)).trim()}</${c.tagName === 'TH' ? 'th' : 'td'}>`).join('')}</tr>`)
        .join('')
      return body ? `<table class="rt-table rt-table-grid"><tbody>${body}</tbody></table>` : ''
    }
    if (BLOCK.has(tag)) {
      // A wrapper around other blocks adds nothing; a leaf block is a paragraph.
      if (hasBlocks(el)) return children(false)
      const inner = tidyBreaks(marks(el, children(true)))
      return inner.trim() ? `<p>${inner}</p>` : ''
    }
  }

  let inner = marks(el, children(inline))
  if (tag === 'A') {
    const href = (el.getAttribute('href') ?? '').trim()
    if (SAFE_LINK.test(href) && inner.trim()) inner = `<a href="${esc(href).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">${inner}</a>`
  }
  // In one-line text a block (or a list item, a table row) is a line.
  if (inline && (BLOCK.has(tag) || tag === 'LI' || tag === 'TR' || tag === 'UL' || tag === 'OL' || tag === 'TABLE')) return `${inner}<br>`
  if (inline && (tag === 'TD' || tag === 'TH')) return `${inner} `
  return inner
}

/**
 * The HTML to insert for a paste: `html` (the clipboard's rich flavour) cut
 * down to bold, italic, underline, links and line breaks when `inline`, plus
 * paragraphs, lists, simple tables and the project's own images otherwise
 * (`basic`: without the tables and images, as the short toolbar has none).
 * Without `html` the plain text is used, one paragraph (or line) per line.
 */
export function cleanPaste(html: string, plain: string, inline: boolean, basic = false): string {
  if (!html.trim()) {
    const lines = plain.replace(/\r\n?/g, '\n').split('\n')
    if (inline || lines.length === 1) return lines.map(esc).join('<br>')
    return lines.filter((l) => l.trim()).map((l) => `<p>${esc(l)}</p>`).join('')
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const out = [...doc.body.childNodes].map((n) => walk(n, inline, basic)).join('')
  // One line of text has no paragraphs: a gap between pasted blocks is one line break.
  return inline ? tidyBreaks(out.replace(/(?:\s*<br>\s*){2,}/g, '<br>')) : out
}
