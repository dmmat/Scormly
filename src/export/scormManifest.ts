import type { Course } from '../types/course'

export type ScormVersion = '1.2' | '2004'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Collect quiz block IDs in order — used to declare one non-primary objective
// per quiz in the SCORM 2004 manifest, so the LMS recognises the runtime
// `cmi.objectives.n.id = 'QUIZ_<id>'` writes from the player.
function quizIds(course: Course): string[] {
  const ids: string[] = []
  for (const lesson of course.lessons || []) {
    for (const block of lesson.blocks || []) {
      if (block.type === 'quiz') ids.push(block.id)
    }
  }
  return ids
}

// Build an imsmanifest.xml for a single-SCO package launching index.html.
// The same player auto-detects the SCORM API version at runtime; only the
// manifest schema differs between 1.2 and 2004.
export function buildManifest(
  course: Course,
  files: string[],
  version: ScormVersion,
  masteryScore?: number,
): string {
  const title = escapeXml(course.title || 'Course')
  const id = `SCORMLY-${course.id}`
  const fileEntries = files
    .map((f) => `      <file href="${escapeXml(f)}" />`)
    .join('\n')
  const hasMastery = masteryScore != null && masteryScore > 0

  if (version === '2004') {
    // Communicate the passing score to the LMS via the primary objective's
    // minimum normalized measure (0..1 scale). Each quiz is declared as a
    // non-primary objective so per-quiz runtime objective writes link up to
    // a declared id (improves analytics in LMS that gate rollup on
    // declared objectives).
    const quizObjs = quizIds(course)
      .map(
        (id) =>
          `            <imsss:objective objectiveID="${escapeXml('QUIZ_' + id)}" />`,
      )
      .join('\n')
    const sequencing =
      hasMastery || quizObjs
        ? `
        <imsss:sequencing>
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="PRIMARYOBJ"${hasMastery ? ' satisfiedByMeasure="true"' : ''}>
${hasMastery ? `              <imsss:minNormalizedMeasure>${(masteryScore! / 100).toFixed(2)}</imsss:minNormalizedMeasure>\n` : ''}            </imsss:primaryObjective>
${quizObjs}
          </imsss:objectives>
        </imsss:sequencing>`
        : ''
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(id)}" version="1"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${title}</title>${sequencing}
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormType="sco" href="index.html">
${fileEntries}
    </resource>
  </resources>
</manifest>
`
  }

  // SCORM 1.2: the passing score is declared via <adlcp:masteryscore> (0..100).
  const masteryEl = hasMastery
    ? `\n        <adlcp:masteryscore>${Math.round(masteryScore!)}</adlcp:masteryscore>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(id)}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${title}</title>${masteryEl}
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
${fileEntries}
    </resource>
  </resources>
</manifest>
`
}
