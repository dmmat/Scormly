import Builder from './components/Builder'
import Landing from './components/landing/Landing'
import { useRoute } from './hooks/useRoute'

export default function App() {
  const { view } = useRoute()
  return view === 'app' ? <Builder /> : <Landing />
}
