import type { Course } from '../types/course'
import { overallPassingScore } from './packageCommon'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Build a cmi5 course structure (cmi5.xml) for a single Assignable Unit that
// launches index.html. The AU id is the xAPI activity id the LMS passes back to
// the runtime at launch (`activityId` query param), so it must be a stable IRI.
//
// moveOn / masteryScore mirror the project's completion+scoring settings:
//   scored + has quizzes → CompletedAndPassed with a mastery score (0..1)
//   otherwise            → Completed
export function buildCmi5Manifest(course: Course): string {
  const title = escapeXml(course.title || 'Course')
  const description = escapeXml(course.description || course.title || 'Course')
  const courseId = `https://scormly.app/course/${encodeURIComponent(course.id)}`
  const auId = `${courseId}/au`

  const mastery = overallPassingScore(course)
  const useScore = mastery != null
  const moveOn = useScore ? 'CompletedAndPassed' : 'Completed'
  const masteryAttr = useScore
    ? ` masteryScore="${(mastery! / 100).toFixed(2)}"`
    : ''

  // The cmi5 CourseStructure.xsd has a target namespace, so `courseStructure`
  // and its children must live in it (declared via the default xmlns). Using
  // xsi:noNamespaceSchemaLocation instead makes validators reject the root
  // element ("Cannot find the declaration of element 'courseStructure'").
  return `<?xml version="1.0" encoding="UTF-8"?>
<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
  <course id="${escapeXml(courseId)}">
    <title><langstring lang="en-US">${title}</langstring></title>
    <description><langstring lang="en-US">${description}</langstring></description>
  </course>
  <au id="${escapeXml(auId)}" moveOn="${moveOn}"${masteryAttr} launchMethod="AnyWindow">
    <title><langstring lang="en-US">${title}</langstring></title>
    <description><langstring lang="en-US">${description}</langstring></description>
    <url>index.html</url>
  </au>
</courseStructure>
`
}
