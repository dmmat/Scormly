import { isScoredBlock, type Course } from '../types/course'

export type ScormVersion = '1.2' | '2004'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Manifest hrefs must be valid URIs: asset file names with spaces or non-ASCII
// characters (common for Ukrainian authors) are %-encoded per path segment,
// then XML-escaped. Strict LMS importers reject manifests with raw spaces or
// Unicode in href attributes.
function hrefXml(path: string): string {
  return escapeXml(encodeURI(path))
}

// Collect scored block IDs (quiz, ordering, fill in the blanks) in order, used
// to declare one non-primary objective per scored block in the SCORM 2004
// manifest, so the LMS recognises the runtime `cmi.objectives.n.id =
// 'QUIZ_<id>'` writes from the player (the prefix is shared by all of them).
function quizIds(course: Course): string[] {
  const ids: string[] = []
  for (const lesson of course.lessons || []) {
    for (const block of lesson.blocks || []) {
      if (isScoredBlock(block)) ids.push(block.id)
    }
  }
  return ids
}

// IEEE LOM metadata (title / language / description) for SCORM 2004, so the LMS
// catalog can show the course description without the author re-typing it at
// import time. Not emitted for 1.2: its <metadata> holds a strict wildcard, so
// inline IMS MD requires imsmd_rootv1p2p1.xsd, whose content model is not
// deterministic: strict validators (libxml2, i.e. PHP schemaValidate) fail to
// compile it and reject the whole manifest.
function lomMetadata(course: Course, lang: string): string {
  const title = escapeXml(course.title || 'Course')
  const description = escapeXml(course.description || '')
  const l = escapeXml(lang)
  return `    <lom:lom>
      <lom:general>
        <lom:title><lom:string language="${l}">${title}</lom:string></lom:title>
        <lom:language>${l}</lom:language>
${description ? `        <lom:description><lom:string language="${l}">${description}</lom:string></lom:description>\n` : ''}      </lom:general>
    </lom:lom>`
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
  const lang = course.settings?.contentLanguage?.trim() || 'en'
  const fileEntries = files
    .map((f) => `      <file href="${hrefXml(f)}" />`)
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
    const objectives =
      hasMastery || quizObjs
        ? `
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="PRIMARYOBJ"${hasMastery ? ' satisfiedByMeasure="true"' : ''}>
${hasMastery ? `              <imsss:minNormalizedMeasure>${(masteryScore! / 100).toFixed(2)}</imsss:minNormalizedMeasure>\n` : ''}            </imsss:primaryObjective>
${quizObjs}
          </imsss:objectives>`
        : ''
    // deliveryControls: without completionSetByContent/objectiveSetByContent
    // the LMS is allowed to infer "completed"/"satisfied" merely from the SCO
    // being launched and exited, overriding the statuses the player reports.
    // The player always sets both itself, so declare that explicitly.
    const sequencing = `
        <imsss:sequencing>${objectives}
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true" />
        </imsss:sequencing>`
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(id)}" version="1"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:lom="http://ltsc.ieee.org/xsd/LOM"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd http://ltsc.ieee.org/xsd/LOM lom.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
${lomMetadata(course, lang)}
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
