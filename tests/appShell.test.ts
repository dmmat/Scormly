// The pages of /app and /demo: a loading screen in place of the landing's copy.

import { describe, test, expect } from 'vitest'
import { appShell, staticLanding } from '../scripts/seoPrerender.ts'

const page = `<html><head><title>x</title></head><body><div id="root">${staticLanding('en')}</div></body></html>`

describe('appShell', () => {
  test('swaps the landing copy for the loader', () => {
    const out = appShell(page, [])
    expect(out).toContain('class="app-loader"')
    expect(out).not.toContain(staticLanding('en'))
    expect(out).not.toContain('modulepreload')
  })

  test('preloads the builder chunks beside the main script', () => {
    const out = appShell(page, ['/assets/Builder-a.js', '/assets/IntroView-b.js'])
    expect(out).toContain('<link rel="modulepreload" crossorigin href="/assets/Builder-a.js">')
    expect(out).toContain('<link rel="modulepreload" crossorigin href="/assets/IntroView-b.js">')
    expect(out.indexOf('modulepreload')).toBeLessThan(out.indexOf('</head>'))
  })

  test('fails loudly when the landing copy is not in the page', () => {
    expect(() => appShell('<html><head></head><body></body></html>', [])).toThrow(/not found/)
  })
})
