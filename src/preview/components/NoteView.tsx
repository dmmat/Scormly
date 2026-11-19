import type { ReactNode } from 'react'
import type { NoteVariant } from '../../types/course'
import { stepHtml } from '../../blocks/process'
import RichHtml from '../RichHtml'

// Callout icons (24×24, stroked). The SCORM player has the same paths.
export const NOTE_ICONS: Record<NoteVariant, string> = {
  note: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  tip: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  success: 'm8 12.5 2.5 2.5L16 9.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  warning: 'M12 9v4m0 4h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
}

/** Callout box (learner view; the editor passes its fields as children).
 *  Same markup as the player's note. */
export default function NoteView({
  variant,
  text = '',
  html,
  title,
  icon,
  children,
}: {
  variant: NoteVariant
  text?: string
  html?: string
  title?: string
  icon?: boolean
  children?: ReactNode
}) {
  const v = NOTE_ICONS[variant] ? variant : 'note'
  return (
    <div className={`sc-note sc-note-${v}`}>
      {icon !== false && (
        <span className="sc-note-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d={NOTE_ICONS[v]} />
          </svg>
        </span>
      )}
      <div className="sc-note-body">
        {children ?? (
          <>
            {title && <p className="sc-note-title">{title}</p>}
            <RichHtml html={stepHtml({ text, html })} className="sc-note-text" />
          </>
        )}
      </div>
    </div>
  )
}
