import { describe, expect, it } from 'vitest'
import { landingUrl, parseRoute } from '../src/lib/route'
import { LANGUAGES } from '../src/i18n/types'
import { sitemap } from '../scripts/seoPrerender'

const at = (pathname: string, search = '', hash = '') => parseRoute({ pathname, search, hash })

describe('landing language URLs', () => {
  it('English lives at the root, the other languages at /<lang>', () => {
    expect(landingUrl('en')).toBe('/')
    expect(landingUrl('uk')).toBe('/uk')
  })

  it('reads the language from the path', () => {
    expect(at('/')).toMatchObject({ view: 'landing', lang: null })
    expect(at('/uk')).toMatchObject({ view: 'landing', lang: 'uk' })
    expect(at('/fr/')).toMatchObject({ view: 'landing', lang: 'fr' })
    expect(at('/xx')).toMatchObject({ view: 'landing', lang: null })
  })

  it('keeps the builder routes', () => {
    expect(at('/app', '?p=browser:1')).toMatchObject({ view: 'app', projectKey: 'browser:1', lang: null })
    expect(at('/demo')).toMatchObject({ view: 'app', demo: true })
    expect(at('/uk', '', '#/app')).toMatchObject({ view: 'app', lang: null })
  })

  it('every language round-trips through its URL', () => {
    for (const { id } of LANGUAGES) {
      expect(at(landingUrl(id)).lang ?? 'en').toBe(id)
    }
  })
})

describe('sitemap', () => {
  const xml = sitemap('2026-01-01')

  it('lists a page per language, each with every alternate', () => {
    expect(xml.match(/<loc>/g)).toHaveLength(LANGUAGES.length)
    for (const { id } of LANGUAGES) {
      const url = `https://scormly.app/${id === 'en' ? '' : id}`
      expect(xml).toContain(`<loc>${url}</loc>`)
      expect(xml.split(`hreflang="${id}" href="${url}"`)).toHaveLength(LANGUAGES.length + 1)
    }
    expect(xml.split('hreflang="x-default" href="https://scormly.app/"')).toHaveLength(LANGUAGES.length + 1)
  })
})
