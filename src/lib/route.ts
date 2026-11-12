// Routing by path. The open project is reflected in the URL so it can be
// restored, bookmarked or shared, and different tabs can hold different projects:
//   '/'                  → landing ('/#features' is a section of it)
//   '/uk', '/fr', '/es'  → landing in that language (English lives at '/')
//   '/app'               → builder, no project (welcome)
//   '/app?p=<projectKey>' → builder with that project open
//   '/demo'              → builder with the built-in sample course
// The site is static: '/app' and '/demo' are copies of index.html (see
// scripts/seoPrerender.ts), which is why the project key is a query parameter
// and not a path segment; each language page is a prerendered file too. The hash routes used before ('#/app', '#/app/<key>',
// '#/demo') still open and are rewritten to the new form.
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from '../i18n/types'

export type View = 'landing' | 'app'

export interface RouteState {
  view: View
  projectKey: string | null
  /** Open the built-in sample course (in memory). */
  demo: boolean
  /** The language named in a landing URL ('/uk'); null when the URL names none. */
  lang: Language | null
}

/** Fired on `window` after the route changes without a page load. */
export const ROUTE_EVENT = 'scormly:route'

const LANDING: RouteState = { view: 'landing', projectKey: null, demo: false, lang: null }

export function routeUrl(view: View | 'demo', projectKey?: string | null): string {
  if (view === 'demo') return '/demo'
  if (view === 'app') return projectKey ? `/app?p=${encodeURIComponent(projectKey)}` : '/app'
  return '/'
}

/** The landing page of a language: '/' for English, '/<lang>' for the others. */
export function landingUrl(lang: Language): string {
  return lang === DEFAULT_LANGUAGE ? '/' : `/${lang}`
}

const landingLang = (path: string): Language | null =>
  LANGUAGES.find((l) => path === `/${l.id}`)?.id ?? null

/** The route of a URL; a `#/…` hash (the old scheme) wins over the path. */
export function parseRoute(loc: Pick<Location, 'pathname' | 'search' | 'hash'>): RouteState {
  if (loc.hash.startsWith('#/')) {
    const h = loc.hash.slice(2)
    if (h === 'demo') return { view: 'app', projectKey: null, demo: true, lang: null }
    if (h === 'app' || h.startsWith('app/')) {
      const key = h.startsWith('app/') ? safeDecode(h.slice(4)) : null
      return { view: 'app', projectKey: key || null, demo: false, lang: null }
    }
    return LANDING
  }
  const path = loc.pathname.replace(/\/+$/, '')
  if (path === '/demo') return { view: 'app', projectKey: null, demo: true, lang: null }
  if (path === '/app') {
    return { view: 'app', projectKey: new URLSearchParams(loc.search).get('p') || null, demo: false, lang: null }
  }
  // '/app/<key>' is not a real file on the static host, but its 404 page is
  // this app, so the key still opens.
  if (path.startsWith('/app/')) {
    return { view: 'app', projectKey: safeDecode(path.slice(5)) || null, demo: false, lang: null }
  }
  const lang = landingLang(path)
  return lang ? { ...LANDING, lang } : LANDING
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** The current route; an old `#/…` link is rewritten to its new URL first. */
export function currentRoute(): RouteState {
  const route = parseRoute(window.location)
  if (window.location.hash.startsWith('#/')) {
    history.replaceState(null, '', routeUrl(route.demo ? 'demo' : route.view, route.projectKey))
  }
  return route
}

export function navigate(view: View | 'demo', projectKey?: string | null) {
  const url = routeUrl(view, projectKey)
  if (url !== window.location.pathname + window.location.search) history.pushState(null, '', url)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

/** Back to the plain builder URL: the project (or the demo course) named in
 *  the URL was closed or replaced. */
export function clearProjectKey() {
  if (typeof window === 'undefined') return
  const route = parseRoute(window.location)
  if (route.view === 'app' && (route.projectKey || route.demo)) navigate('app')
}

/**
 * Follow plain same-origin links to a route ('/', '/uk', '/app', '/demo') without a
 * page load. Links to a section ('/#faq'), with a modifier key or a target
 * are left to the browser.
 */
export function onRouteLinkClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!link || link.target || link.hasAttribute('download') || link.origin !== window.location.origin) return
  if (link.hash) return
  const path = link.pathname.replace(/\/+$/, '') || '/'
  if (path !== '/' && path !== '/app' && path !== '/demo' && !landingLang(path)) return
  e.preventDefault()
  history.pushState(null, '', link.pathname + link.search)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}
