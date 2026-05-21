import common from './locales/common'
import blocks from './locales/blocks'
import themes from './locales/themes'
import text from './locales/text'
import media from './locales/media'
import interactive from './locales/interactive'
import scenario from './locales/scenario'
import quiz from './locales/quiz'
import landing from './locales/landing'

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
}

export type Namespace = keyof typeof DICTIONARY
