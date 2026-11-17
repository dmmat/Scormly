import { useId, type ReactNode } from 'react'
import type { Course } from '../types/course'
import { lessonGroups, unitTitle, type LessonEntry } from '../lib/units'
import { useT } from '../i18n/I18nProvider'

// A list of lessons, under unit headings when the course has units (the
// lessons without a unit come first, ungrouped). Shared look: .sc-unit-* in
// styles/blocks.css; the player builds the same markup (groupedList).
export default function GroupedLessons({
  course,
  className,
  headClassName = '',
  filter,
  children,
}: {
  course: Course
  /** Class of the outer list and of each unit's list. */
  className?: string
  headClassName?: string
  /** Lessons to leave out (e.g. the current one); units left empty go too. */
  filter?: (entry: LessonEntry) => boolean
  /** Renders one lesson as an <li>. */
  children: (entry: LessonEntry) => ReactNode
}) {
  const { t } = useT('design')
  // Unique per list: the menu and an outline can show the same unit at once.
  const idBase = useId()
  const groups = lessonGroups(course)
    .map((g) => ({ ...g, lessons: filter ? g.lessons.filter(filter) : g.lessons }))
    .filter((g) => g.lessons.length > 0)
  return (
    <ol className={className}>
      {groups.map((g) =>
        g.unit ? (
          <li key={g.unit.id} className="sc-unit">
            <div className={`sc-unit-head ${headClassName}`} id={`${idBase}-${g.unit.id}`}>
              <span className="sc-unit-name">{unitTitle(course, g.unit, g.number, t)}</span>
            </div>
            <ol className={className} aria-labelledby={`${idBase}-${g.unit.id}`}>
              {g.lessons.map(children)}
            </ol>
          </li>
        ) : (
          g.lessons.map(children)
        ),
      )}
    </ol>
  )
}
