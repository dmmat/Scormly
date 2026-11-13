import { useEffect, useState } from 'react'
import { useT } from '../../i18n/I18nProvider'
import { libraryUrl, loadLibrary, type LibraryManifest } from '../../lib/library'

export type LibraryKind = 'character' | 'avatar' | 'background'

function useLibrary(): { library: LibraryManifest | null; failed: boolean } {
  const [library, setLibrary] = useState<LibraryManifest | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    loadLibrary().then(
      (m) => active && setLibrary(m),
      () => active && setFailed(true),
    )
    return () => {
      active = false
    }
  }, [])
  return { library, failed }
}

const TILE =
  'rounded-xl border-2 p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand'
const tileClass = (on: boolean) =>
  `${TILE} ${on ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300'}`

// A grid of library pictures to pick one from: characters (round portrait,
// name, role), learner avatars or backgrounds.
export default function LibraryGrid({
  kind,
  value,
  onSelect,
}: {
  kind: LibraryKind
  value: string | null
  onSelect: (id: string) => void
}) {
  const { t, lang } = useT('scenario')
  const { library, failed } = useLibrary()

  if (failed) return <p className="text-sm text-gray-500">{t('libraryError')}</p>
  if (!library) return <p className="text-sm text-gray-400">{t('libraryLoading')}</p>

  if (kind === 'character') {
    return (
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {library.characters.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              aria-pressed={value === c.id}
              onClick={() => onSelect(c.id)}
              className={`${tileClass(value === c.id)} flex w-full items-center gap-3`}
            >
              <img
                src={libraryUrl(`characters/${c.id}/thumb.webp`)}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full bg-gray-50 object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-800">{c.name[lang]}</span>
                <span className="block truncate text-xs text-gray-500">{c.role[lang]}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  if (kind === 'avatar') {
    return (
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {library.avatars.map((id, i) => (
          <li key={id}>
            <button
              type="button"
              aria-pressed={value === id}
              aria-label={t('avatarN', { n: i + 1 })}
              onClick={() => onSelect(id)}
              className={`${tileClass(value === id)} block w-full`}
            >
              <img src={libraryUrl(`avatars/${id}.webp`)} alt="" className="aspect-square w-full rounded-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {library.backgrounds.map((b) => (
        <li key={b.id}>
          <button
            type="button"
            aria-pressed={value === b.id}
            onClick={() => onSelect(b.id)}
            className={`${tileClass(value === b.id)} block w-full`}
          >
            <img src={libraryUrl(`backgrounds/${b.id}.thumb.webp`)} alt="" className="aspect-video w-full rounded-lg object-cover" />
            <span className="mt-1 block truncate text-xs font-medium text-gray-700">{b.name[lang]}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
