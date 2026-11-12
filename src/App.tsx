import { lazy, Suspense } from 'react'
import Landing from './components/landing/Landing'
import { useRoute } from './hooks/useRoute'

// The builder (editor, stores, export code) loads only on the #/app and #/demo
// routes, so a visitor reading the landing page doesn't download it.
const Builder = lazy(() => import('./components/Builder'))

export default function App() {
  const { view } = useRoute()
  return view === 'app' ? (
    <Suspense fallback={null}>
      <Builder />
    </Suspense>
  ) : (
    <Landing />
  )
}
