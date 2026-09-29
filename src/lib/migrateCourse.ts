import type { Course } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { DEFAULT_THEME, THEMES } from '../theme/themes'

// Coerce a loaded course to current invariants: migrate a renamed/legacy theme
// id to the default, and backfill completion/scoring settings for older projects.
// Pure (no browser APIs) — also used by the MCP server (mcp/).
export function migrateCourse(course: Course): Course {
  const theme = THEMES[course.theme] ? course.theme : DEFAULT_THEME
  const settings = { ...DEFAULT_COURSE_SETTINGS, ...course.settings }
  return { ...course, theme, settings }
}
