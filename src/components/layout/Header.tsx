import Logo from './Logo'

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <Logo />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Зберегти
        </button>
        <button
          type="button"
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Експорт у SCORM
        </button>
      </div>
    </header>
  )
}
