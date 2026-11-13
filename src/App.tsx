import { lazy, Suspense } from 'react'
import AppLoader from './components/layout/AppLoader'
import { useRoute, useRouteLinks } from './hooks/useRoute'

// Each view is its own chunk, so the landing page doesn't download the builder
// (editor, stores, export code) and /app doesn't download the landing (its
// copy and the chat demo). The page that needs a chunk preloads it in its HTML
// (scripts/seoPrerender.ts), so it arrives together with this script.
const Builder = lazy(() => import('./components/Builder'))
const Landing = lazy(() => import('./components/landing/Landing'))

// What the page's HTML had in #root before React took it over: the landing's
// copy for readers without scripts (index.html), or the loading screen
// (app.html). Kept on screen while the landing's chunk loads.
const PRERENDERED = document.getElementById('root')?.innerHTML ?? ''

export default function App() {
  const { view } = useRoute()
  useRouteLinks()
  return view === 'app' ? (
    <Suspense fallback={<AppLoader />}>
      <Builder />
    </Suspense>
  ) : (
    <Suspense fallback={<div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: PRERENDERED }} />}>
      <Landing />
    </Suspense>
  )
}
