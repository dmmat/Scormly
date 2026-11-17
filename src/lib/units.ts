import type { Course, Lesson, Unit, UnitNumbering } from '../types/course'

// Units: optional named groups of lessons. `course.lessons` stays the one flat,
// ordered list everything else (player, progress, export) walks; a lesson
// joins a unit with `unitId`. The list is kept grouped: lessons without a unit
// first, then each unit's lessons in the order of `course.units`
// (normalizeUnits). Mirrored by lessonGroups() in public/scorm-player/player.js.

export function hasUnits(course: Pick<Course, 'units'>): boolean {
  return !!course.units && course.units.length > 0
}

export interface LessonEntry {
  lesson: Lesson
  /** Index in course.lessons. */
  index: number
  /** 1-based number within its group (the whole course without units). */
  n: number
}

export interface LessonGroup {
  /** null: the lessons before the units (or every lesson without units). */
  unit: Unit | null
  /** 1-based unit number; 0 for the lessons without a unit. */
  number: number
  lessons: LessonEntry[]
}

/** The lessons by group, in display order. Without units: one group with
 *  every lesson. With units: the lessons without a unit (only when there are
 *  some), then every unit, even an empty one. */
export function lessonGroups(course: Pick<Course, 'units' | 'lessons'>): LessonGroup[] {
  if (!hasUnits(course)) {
    return [{ unit: null, number: 0, lessons: course.lessons.map((lesson, index) => ({ lesson, index, n: index + 1 })) }]
  }
  const loose: LessonGroup = { unit: null, number: 0, lessons: [] }
  const groups = course.units!.map((unit, k): LessonGroup => ({ unit, number: k + 1, lessons: [] }))
  const byId = new Map(groups.map((g) => [g.unit!.id, g]))
  course.lessons.forEach((lesson, index) => {
    const group = (lesson.unitId && byId.get(lesson.unitId)) || loose
    group.lessons.push({ lesson, index, n: group.lessons.length + 1 })
  })
  return loose.lessons.length ? [loose, ...groups] : groups
}

export function unitNumbering(course: Pick<Course, 'settings'>): UnitNumbering {
  const v = course.settings?.unitNumbering
  return v === 'dotted' || v === 'none' ? v : 'unit'
}

export interface LessonPosition {
  unit: Unit | null
  /** 1-based unit number; 0 without a unit. */
  unitNumber: number
  /** 1-based number within the unit (or among the lessons without one). */
  n: number
}

/** Where lesson `index` sits; null when there are no units. */
export function lessonPosition(course: Pick<Course, 'units' | 'lessons'>, index: number): LessonPosition | null {
  if (!hasUnits(course)) return null
  for (const g of lessonGroups(course)) {
    const entry = g.lessons.find((e) => e.index === index)
    if (entry) return { unit: g.unit, unitNumber: g.number, n: entry.n }
  }
  return null
}

/** The lesson's number as listed in menus and outlines: "5" (course-wide),
 *  "1" (within its unit) or "2.1" (dotted). */
export function lessonNumber(course: Pick<Course, 'units' | 'lessons' | 'settings'>, index: number): string {
  const pos = lessonPosition(course, index)
  const style = unitNumbering(course)
  if (!pos || style === 'none') return String(index + 1)
  if (style === 'dotted' && pos.unitNumber) return `${pos.unitNumber}.${pos.n}`
  return String(pos.n)
}

/**
 * Restore the invariants on a course (mutates it): drop `unitId`s that name
 * no unit, drop an empty `units` list, and group the lessons (no unit first,
 * then by unit order; the order within a group is kept). Returns whether
 * anything changed.
 */
export function normalizeUnits(course: Course): boolean {
  let changed = false
  if (course.units && course.units.length === 0) {
    delete course.units
    changed = true
  }
  const rank = new Map((course.units ?? []).map((u, k) => [u.id, k]))
  for (const lesson of course.lessons) {
    if (lesson.unitId !== undefined && !rank.has(lesson.unitId)) {
      delete lesson.unitId
      changed = true
    }
  }
  const rankOf = (l: Lesson) => (l.unitId === undefined ? -1 : rank.get(l.unitId)!)
  const sorted = course.lessons
    .map((lesson, i) => ({ lesson, i }))
    .sort((a, b) => rankOf(a.lesson) - rankOf(b.lesson) || a.i - b.i)
    .map((e) => e.lesson)
  if (sorted.some((l, i) => l !== course.lessons[i])) {
    course.lessons = sorted
    changed = true
  }
  return changed
}

/** Put a lesson in a unit (null: no unit) as that group's last lesson. */
export function setLessonUnit(course: Course, lessonId: string, unitId: string | null): void {
  const from = course.lessons.findIndex((l) => l.id === lessonId)
  if (from < 0) return
  if (unitId !== null && !course.units?.some((u) => u.id === unitId)) return
  const [lesson] = course.lessons.splice(from, 1)
  if (unitId === null) delete lesson.unitId
  else lesson.unitId = unitId
  // After the group's last lesson; normalizeUnits places it when the group is empty.
  let at = -1
  course.lessons.forEach((l, i) => {
    if ((l.unitId ?? null) === unitId) at = i
  })
  course.lessons.splice(at < 0 ? course.lessons.length : at + 1, 0, lesson)
  normalizeUnits(course)
}

/**
 * Keyboard move (Alt+↑/↓): one step within the lesson's group; from a group's
 * edge it crosses into the neighbouring group (empty units too, and the
 * no-unit group above the first unit) without jumping over a lesson.
 */
export function moveLessonStep(course: Course, lessonId: string, dir: -1 | 1): void {
  if (!hasUnits(course)) {
    const from = course.lessons.findIndex((l) => l.id === lessonId)
    const to = from + dir
    if (from < 0 || to < 0 || to >= course.lessons.length) return
    const [moved] = course.lessons.splice(from, 1)
    course.lessons.splice(to, 0, moved)
    return
  }
  // Every group in order, the no-unit one included even when empty.
  const keys: (string | null)[] = [null, ...course.units!.map((u) => u.id)]
  const lesson = course.lessons.find((l) => l.id === lessonId)
  if (!lesson) return
  const key = lesson.unitId ?? null
  const members = course.lessons.filter((l) => (l.unitId ?? null) === key)
  const at = members.indexOf(lesson)
  const neighbour = members[at + dir]
  if (neighbour) {
    const a = course.lessons.indexOf(lesson)
    const b = course.lessons.indexOf(neighbour)
    course.lessons[a] = neighbour
    course.lessons[b] = lesson
    return
  }
  const next = keys[keys.indexOf(key) + dir]
  if (next === undefined) return
  // Into the neighbouring group: its first lesson going down, its last going up.
  const from = course.lessons.indexOf(lesson)
  course.lessons.splice(from, 1)
  if (next === null) delete lesson.unitId
  else lesson.unitId = next
  const target = course.lessons.filter((l) => (l.unitId ?? null) === next)
  if (target.length === 0) course.lessons.push(lesson)
  else if (dir === 1) course.lessons.splice(course.lessons.indexOf(target[0]), 0, lesson)
  else course.lessons.splice(course.lessons.indexOf(target[target.length - 1]) + 1, 0, lesson)
  normalizeUnits(course)
}

/**
 * Drag and drop: move a lesson onto another lesson (it takes that lesson's
 * place and unit) or onto a unit's header (it becomes the unit's first lesson).
 */
export function dropLesson(course: Course, lessonId: string, over: { lessonId: string } | { unitId: string }): void {
  const from = course.lessons.findIndex((l) => l.id === lessonId)
  if (from < 0) return
  if ('unitId' in over) {
    if (!course.units?.some((u) => u.id === over.unitId)) return
    const [lesson] = course.lessons.splice(from, 1)
    lesson.unitId = over.unitId
    const first = course.lessons.findIndex((l) => l.unitId === over.unitId)
    course.lessons.splice(first < 0 ? course.lessons.length : first, 0, lesson)
    normalizeUnits(course)
    return
  }
  const to = course.lessons.findIndex((l) => l.id === over.lessonId)
  if (to < 0 || to === from) return
  const target = course.lessons[to]
  const [lesson] = course.lessons.splice(from, 1)
  course.lessons.splice(to, 0, lesson)
  if (hasUnits(course)) {
    if (target.unitId === undefined) delete lesson.unitId
    else lesson.unitId = target.unitId
    normalizeUnits(course)
  }
}

/** Remove a unit, keeping its lessons in place: they join the unit above it
 *  (or have no unit when it was the first). */
export function deleteUnit(course: Course, unitId: string): void {
  const k = course.units?.findIndex((u) => u.id === unitId) ?? -1
  if (k < 0) return
  const above = k > 0 ? course.units![k - 1].id : undefined
  for (const lesson of course.lessons) {
    if (lesson.unitId !== unitId) continue
    if (above) lesson.unitId = above
    else delete lesson.unitId
  }
  course.units!.splice(k, 1)
  normalizeUnits(course)
}

/** Move a unit (with its lessons) one place up or down. */
export function moveUnit(course: Course, unitId: string, dir: -1 | 1): void {
  const units = course.units
  const k = units?.findIndex((u) => u.id === unitId) ?? -1
  if (!units || k < 0 || k + dir < 0 || k + dir >= units.length) return
  ;[units[k], units[k + dir]] = [units[k + dir], units[k]]
  normalizeUnits(course)
}

type Translate = (key: string, vars?: Record<string, string | number>) => string

/** The learner-facing word for a unit: the course's own, else `unitWord`. */
export function unitWord(course: Pick<Course, 'settings'>, t: Translate): string {
  return course.settings?.unitLabel?.trim() || t('unitWord')
}

/** A unit's heading label, e.g. "Unit 2" / "Module 2". */
export function unitHeading(course: Pick<Course, 'settings'>, number: number, t: Translate): string {
  return t('unitHeading', { unit: unitWord(course, t), u: number })
}

/** A unit as headed in lists: its title, or "Unit 2" when it has none. */
export function unitTitle(course: Pick<Course, 'settings'>, unit: Unit, number: number, t: Translate): string {
  return unit.title.trim() || unitHeading(course, number, t)
}

/** The line above a lesson's title when the course has units ("Unit 2 ·
 *  Lesson 1", "Lesson 2.1", "Lesson 1" for one without a unit); null =
 *  the usual "Lesson n of N". Keys are in the `design` namespace. */
export function lessonKicker(course: Pick<Course, 'units' | 'lessons' | 'settings'>, index: number, t: Translate): string | null {
  const pos = lessonPosition(course, index)
  if (!pos || unitNumbering(course) === 'none') return null
  if (!pos.unitNumber) return t('lessonOnly', { n: pos.n })
  if (unitNumbering(course) === 'dotted') return t('dottedLesson', { u: pos.unitNumber, n: pos.n })
  return t('unitLesson', { unit: unitWord(course, t), u: pos.unitNumber, n: pos.n })
}

/** The cover page outline's number: two digits ("05"), or "2.1" when dotted. */
export function coverNumber(course: Pick<Course, 'units' | 'lessons' | 'settings'>, index: number): string {
  const n = lessonNumber(course, index)
  return n.includes('.') ? n : n.padStart(2, '0')
}

/** Numbers in a course outline block that leaves out lesson `exceptId`:
 *  without units, 1, 2, 3… over the lessons shown; with units, each lesson's
 *  own number (lessonNumber). */
export function outlineNumbers(course: Pick<Course, 'units' | 'lessons' | 'settings'>, exceptId?: string): Map<string, string> {
  const out = new Map<string, string>()
  let k = 0
  course.lessons.forEach((lesson, index) => {
    if (lesson.id === exceptId) return
    k++
    out.set(lesson.id, hasUnits(course) ? lessonNumber(course, index) : String(k))
  })
  return out
}
