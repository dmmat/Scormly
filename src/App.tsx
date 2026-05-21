import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Workspace from './components/layout/Workspace'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Workspace />
      </div>
    </div>
  )
}
