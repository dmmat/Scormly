// Block type registry: metadata for the "+ Add block" menu and a factory for
// default blocks. Adding a new block type = a new entry here + renderer/editor.
// Display labels/descriptions live in i18n (the `blocks` namespace); default
// content is localized at creation time via the `content` namespace.

import type { Block, BlockType } from '../types/course'
import { uid } from '../lib/id'
import { translate } from '../i18n/I18nProvider'

export type BlockCategory = 'text' | 'media' | 'interactive' | 'navigation'

export interface BlockMeta {
  type: BlockType
  category: BlockCategory
  /** Icon name (emoji placeholder until an icon set is wired up). */
  icon: string
  /** Factory for a default block of this type. */
  create: () => Block
}

const baseSettings = { spacing: 'normal' as const }

const c = (key: string, vars?: Record<string, string | number>) =>
  translate('content', key, vars)

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
  heading: {
    type: 'heading',
    category: 'text',
    icon: 'H',
    create: () => ({
      id: uid('block'),
      type: 'heading',
      settings: { ...baseSettings },
      data: { level: 2, text: c('newHeading') },
    }),
  },
  paragraph: {
    type: 'paragraph',
    category: 'text',
    icon: '¶',
    create: () => ({
      id: uid('block'),
      type: 'paragraph',
      settings: { ...baseSettings },
      data: { html: `<p>${c('newParagraph')}</p>` },
    }),
  },
  list: {
    type: 'list',
    category: 'text',
    icon: '•',
    create: () => ({
      id: uid('block'),
      type: 'list',
      settings: { ...baseSettings },
      data: { ordered: false, items: [c('listItem1'), c('listItem2')] },
    }),
  },
  note: {
    type: 'note',
    category: 'text',
    icon: '!',
    create: () => ({
      id: uid('block'),
      type: 'note',
      settings: { ...baseSettings },
      data: { variant: 'note', text: c('noteText') },
    }),
  },
  image: {
    type: 'image',
    category: 'media',
    icon: '🖼',
    create: () => ({
      id: uid('block'),
      type: 'image',
      settings: { ...baseSettings },
      data: { src: '', alt: '', caption: '' },
    }),
  },
  gallery: {
    type: 'gallery',
    category: 'media',
    icon: '🖼🖼',
    create: () => ({
      id: uid('block'),
      type: 'gallery',
      settings: { ...baseSettings },
      data: { images: [] },
    }),
  },
  video: {
    type: 'video',
    category: 'media',
    icon: '▶',
    create: () => ({
      id: uid('block'),
      type: 'video',
      settings: { ...baseSettings },
      data: { src: '', poster: '' },
    }),
  },
  audio: {
    type: 'audio',
    category: 'media',
    icon: '♪',
    create: () => ({
      id: uid('block'),
      type: 'audio',
      settings: { ...baseSettings },
      data: { src: '' },
    }),
  },
  embed: {
    type: 'embed',
    category: 'media',
    icon: '⧉',
    create: () => ({
      id: uid('block'),
      type: 'embed',
      settings: { ...baseSettings },
      data: { url: '', title: '' },
    }),
  },
  code: {
    type: 'code',
    category: 'text',
    icon: '</>',
    create: () => ({
      id: uid('block'),
      type: 'code',
      settings: { ...baseSettings },
      data: { code: c('codeSample'), language: '' },
    }),
  },
  table: {
    type: 'table',
    category: 'text',
    icon: '▦',
    create: () => ({
      id: uid('block'),
      type: 'table',
      settings: { ...baseSettings },
      data: {
        header: true,
        rows: [
          [c('tableHeader') + ' 1', c('tableHeader') + ' 2'],
          [c('tableCell'), c('tableCell')],
        ],
      },
    }),
  },
  quote: {
    type: 'quote',
    category: 'text',
    icon: '❝',
    create: () => ({
      id: uid('block'),
      type: 'quote',
      settings: { ...baseSettings },
      data: { text: c('quoteText'), author: '' },
    }),
  },
  continue: {
    type: 'continue',
    category: 'navigation',
    icon: '⏭',
    create: () => ({
      id: uid('block'),
      type: 'continue',
      settings: { ...baseSettings },
      data: { mode: 'unrestricted', label: c('continueLabel') },
    }),
  },
  divider: {
    type: 'divider',
    category: 'navigation',
    icon: '─',
    create: () => ({
      id: uid('block'),
      type: 'divider',
      settings: { ...baseSettings },
      data: { style: 'solid' },
    }),
  },
  tabs: {
    type: 'tabs',
    category: 'interactive',
    icon: '▭',
    create: () => ({
      id: uid('block'),
      type: 'tabs',
      settings: { ...baseSettings },
      data: {
        tabs: [
          {
            id: uid('tab'),
            title: c('tabTitle', { n: 1 }),
            html: `<p>${c('tabContent', { n: 1 })}</p>`,
          },
          {
            id: uid('tab'),
            title: c('tabTitle', { n: 2 }),
            html: `<p>${c('tabContent', { n: 2 })}</p>`,
          },
        ],
      },
    }),
  },
  accordion: {
    type: 'accordion',
    category: 'interactive',
    icon: '≡',
    create: () => ({
      id: uid('block'),
      type: 'accordion',
      settings: { ...baseSettings },
      data: {
        items: [
          {
            id: uid('acc'),
            title: c('sectionTitle', { n: 1 }),
            html: `<p>${c('sectionContent', { n: 1 })}</p>`,
          },
          {
            id: uid('acc'),
            title: c('sectionTitle', { n: 2 }),
            html: `<p>${c('sectionContent', { n: 2 })}</p>`,
          },
        ],
      },
    }),
  },
  flashcards: {
    type: 'flashcards',
    category: 'interactive',
    icon: '🂠',
    create: () => ({
      id: uid('block'),
      type: 'flashcards',
      settings: { ...baseSettings },
      data: {
        cards: [{ id: uid('card'), front: c('cardFront'), back: c('cardBack') }],
      },
    }),
  },
  scenario: {
    type: 'scenario',
    category: 'interactive',
    icon: '💬',
    create: () => {
      const startId = uid('node')
      return {
        id: uid('block'),
        type: 'scenario',
        settings: { ...baseSettings },
        data: {
          characterImages: {},
          characterName: c('scenarioCharacter'),
          startNodeId: startId,
          nodes: [
            {
              id: startId,
              text: c('scenarioNodeText'),
              emotion: 'neutral',
              choices: [
                { id: uid('choice'), text: c('scenarioChoice'), nextNodeId: null },
              ],
            },
          ],
        },
      }
    },
  },
  quiz: {
    type: 'quiz',
    category: 'interactive',
    icon: '✔',
    create: () => ({
      id: uid('block'),
      type: 'quiz',
      settings: { ...baseSettings },
      data: {
        passingScore: 80,
        questions: [
          {
            id: uid('q'),
            type: 'single',
            prompt: c('quizPrompt'),
            options: [
              { id: uid('opt'), text: c('quizCorrect'), correct: true },
              { id: uid('opt'), text: c('quizWrong'), correct: false },
            ],
          },
        ],
      },
    }),
  },
}

/** Category order for the add menu (labels come from i18n `common`). */
export const BLOCK_CATEGORIES: { category: BlockCategory }[] = [
  { category: 'text' },
  { category: 'media' },
  { category: 'interactive' },
  { category: 'navigation' },
]

export function createBlock(type: BlockType): Block {
  return BLOCK_REGISTRY[type].create()
}
