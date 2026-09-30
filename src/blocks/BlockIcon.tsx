import type { ReactNode } from 'react'
import type { BlockType } from '../types/course'

// Line icons for block types (24×24 grid, stroked with currentColor so they
// follow the theme accent). The Record type forces an icon for every block.
const PATHS: Record<BlockType, ReactNode> = {
  heading: <path d="M6 4v16M18 4v16M6 12h12" />,
  paragraph: <path d="M4 6h16M4 10h16M4 14h16M4 18h10" />,
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  note: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5-5-9 9" />
    </>
  ),
  gallery: (
    <>
      <rect x="7" y="3" width="14" height="14" rx="2" />
      <path d="M3 7v12a2 2 0 0 0 2 2h12" />
      <path d="m21 13-4-4-6 6" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  audio: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  embed: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </>
  ),
  code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M10 4v16" />
    </>
  ),
  quote: (
    <path d="M4 17c0-5 1-8 5-10M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13 17c0-5 1-8 5-10M16 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  ),
  continue: <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />,
  divider: <path d="M3 12h18M8 7h8M8 17h8" />,
  courseOutline: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2" />
      <circle cx="5" cy="18" r="1" />
    </>
  ),
  tabs: (
    <>
      <path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M3 8V5a1 1 0 0 1 1-1h6v4M10 4h5v4" />
    </>
  ),
  accordion: (
    <>
      <rect x="3" y="3" width="18" height="6" rx="1.5" />
      <rect x="3" y="15" width="18" height="6" rx="1.5" />
      <path d="M7 12h10" />
    </>
  ),
  flashcards: (
    <>
      <rect x="6" y="3" width="12" height="16" rx="2" transform="rotate(8 12 11)" />
      <rect x="4" y="5" width="12" height="16" rx="2" />
    </>
  ),
  scenario: (
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM9 12h.01M13 12h.01M17 12h.01" />
  ),
  quiz: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  hotspot: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  timeline: (
    <>
      <path d="M12 3v18" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M14 6h6M4 12h6M14 18h6" />
    </>
  ),
  ordering: <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />,
  fillBlanks: (
    <>
      <path d="M3 8h5M16 8h5M3 16h18" />
      <rect x="9" y="5" width="6" height="6" rx="1" strokeDasharray="2 2" />
    </>
  ),
}

export default function BlockIcon({
  type,
  className = 'h-4 w-4',
}: {
  type: BlockType
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[type]}
    </svg>
  )
}
