import { useEffect, useState } from 'react'

// Hash routing. The open project is reflected in the URL so it can be restored,
// bookmarked or shared, and different tabs can hold different projects:
//   ''        / '#/'            → landing
//   '#/app'                     → builder, no project (welcome)
//   '#/app/<projectKey>'        → builder with that project open
//   '#/demo'                    → builder with the built-in sample course
export type View = 'landing' | 'app'

export interface RouteState {
  view: View
  projectKey: string | null
  /** Open the built-in sample course (in memory). */
  demo: boolean
}

function parse(): RouteState {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (h === 'demo') return { view: 'app', projectKey: null, demo: true }
  if (h === 'app' || h.startsWith('app/')) {
    const key = h.startsWith('app/') ? decodeURIComponent(h.slice(4)) : null
    return { view: 'app', projectKey: key || null, demo: false }
  }
  return { view: 'landing', projectKey: null, demo: false }
}

export function useRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(view: View | 'demo', projectKey?: string | null) {
  if (view === 'demo') {
    window.location.hash = '/demo'
  } else if (view === 'app') {
    window.location.hash = projectKey
      ? '/app/' + encodeURIComponent(projectKey)
      : '/app'
  } else {
    window.location.hash = '/'
  }
}
