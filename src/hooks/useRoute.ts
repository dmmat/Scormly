import { useEffect, useState } from 'react'
import { currentRoute, onRouteLinkClick, ROUTE_EVENT, type RouteState } from '../lib/route'

export { navigate } from '../lib/route'
export type { RouteState, View } from '../lib/route'

// The current route (see lib/route.ts for the URL scheme).
export function useRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(currentRoute)
  useEffect(() => {
    // Keep the same object while the route is unchanged (e.g. a section
    // anchor on the landing), so the page doesn't re-render.
    const onChange = () =>
      setRoute((prev) => {
        const next = currentRoute()
        return next.view === prev.view &&
          next.projectKey === prev.projectKey &&
          next.demo === prev.demo &&
          next.lang === prev.lang
          ? prev
          : next
      })
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onChange)
    window.addEventListener(ROUTE_EVENT, onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener(ROUTE_EVENT, onChange)
    }
  }, [])
  return route
}

/** Makes in-app links to a route change it without a page load. Mount once. */
export function useRouteLinks() {
  useEffect(() => {
    document.addEventListener('click', onRouteLinkClick)
    return () => document.removeEventListener('click', onRouteLinkClick)
  }, [])
}
