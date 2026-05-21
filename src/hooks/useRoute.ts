import { useEffect, useState } from 'react'

// Simple hash-based routing without external dependencies.
// '' / '#/' → landing; '#/app' → builder.
export type Route = 'landing' | 'app'

function parse(): Route {
  return window.location.hash.replace(/^#\/?/, '') === 'app' ? 'app' : 'landing'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(route: Route) {
  window.location.hash = route === 'app' ? '/app' : '/'
}
