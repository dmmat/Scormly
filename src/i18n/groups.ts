import type { Namespace } from './dictionary'

// Which namespaces load together (src/i18n/load.ts): the landing page needs
// only its own two; everything else belongs to the builder and the learner
// blocks. A namespace listed in no group is never loaded in the app.
export const LOCALE_GROUPS = {
  landing: ['landing', 'demo'],
  app: [
    'common', 'blocks', 'themes', 'text', 'media', 'interactive', 'scenario', 'quiz', 'welcome', 'content',
    'richtext', 'preview', 'newblocks', 'settings', 'help', 'hotspotTimeline', 'assessment', 'a11y', 'design',
    'explainers', 'review',
  ],
} as const satisfies Record<string, readonly Namespace[]>

export type LocaleGroup = keyof typeof LOCALE_GROUPS
