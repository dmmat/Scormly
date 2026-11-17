import { registerTables } from './registry.ts'
import common from './locales/common.ts'
import blocks from './locales/blocks.ts'
import themes from './locales/themes.ts'
import text from './locales/text.ts'
import media from './locales/media.ts'
import interactive from './locales/interactive.ts'
import scenario from './locales/scenario.ts'
import quiz from './locales/quiz.ts'
import landing from './locales/landing.ts'
import welcome from './locales/welcome.ts'
import content from './locales/content.ts'
import richtext from './locales/richtext.ts'
import preview from './locales/preview.ts'
import newblocks from './locales/newblocks.ts'
import settings from './locales/settings.ts'
import demo from './locales/demo.ts'
import help from './locales/help.ts'
import hotspotTimeline from './locales/hotspotTimeline.ts'
import assessment from './locales/assessment.ts'
import a11y from './locales/a11y.ts'
import design from './locales/design.ts'
import explainers from './locales/explainers.ts'
import review from './locales/review.ts'

// All translation namespaces. Each lives in its own file (src/i18n/locales/),
// so they can be worked on in parallel without conflicts.
export const DICTIONARY = {
  common,
  blocks,
  themes,
  text,
  media,
  interactive,
  scenario,
  quiz,
  landing,
  welcome,
  content,
  richtext,
  preview,
  newblocks,
  settings,
  demo,
  help,
  hotspotTimeline,
  assessment,
  a11y,
  design,
  explainers,
  review,
}

export type Namespace = keyof typeof DICTIONARY

// Importing this module registers every namespace in every language at once.
// That is for tests and build scripts: the app must NOT import it (it would
// ship all the languages), it loads the strings it needs through ./load.
registerTables(DICTIONARY)
