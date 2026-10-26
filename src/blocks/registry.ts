// Block type registry: metadata for the "+ Add block" menu and a factory for
// default blocks. Adding a new block type = a new entry here + renderer/editor.
// Display labels/descriptions live in i18n (the `blocks` namespace); default
// content is localized at creation time via the `content` namespace.

import type { Block, BlockOfType, BlockSettings, BlockType } from '../types/course'
import { uid } from '../lib/id'
import { translate } from '../i18n/I18nProvider'

/** Basic-block groups of the add menu (labels: `common` cat<Name>). */
export type BlockCategory = 'text' | 'media' | 'structure' | 'interactive' | 'assessment' | 'navigation'

type DataOf<T extends BlockType> = BlockOfType<T>['data']

/** A ready-to-pick style of a block type, applied on top of `create()`.
 *  Label: `blocks` variant_<type>_<id>. */
export interface BlockVariant<T extends BlockType = BlockType> {
  id: string
  /** Data overrides; a function gets the default data (for fresh ids or
   *  values derived from it). */
  data?: Partial<DataOf<T>> | ((data: DataOf<T>) => Partial<DataOf<T>>)
  settings?: Partial<BlockSettings>
}

export interface BlockMeta<T extends BlockType = BlockType> {
  type: T
  category: BlockCategory
  /** Factory for a default block of this type. */
  create: () => BlockOfType<T>
  /** Styles offered in the add menu; the first is the default (no overrides). */
  variants?: BlockVariant<T>[]
}

const baseSettings = { spacing: 'normal' as const }

const c = (key: string, vars?: Record<string, string | number>) =>
  translate('content', key, vars)

export const BLOCK_REGISTRY: { [T in BlockType]: BlockMeta<T> } = {
  heading: {
    type: 'heading',
    category: 'text',
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
    variants: [{ id: 'normal' }, { id: 'lead', data: { variant: 'lead' } }, { id: 'dropcap', data: { variant: 'dropcap' } }, { id: 'columns', data: { variant: 'columns' } }],
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
    variants: [{ id: 'bulleted' }, { id: 'numbered', data: { ordered: true } }],
    create: () => ({
      id: uid('block'),
      type: 'list',
      settings: { ...baseSettings },
      data: { ordered: false, items: [c('listItem1'), c('listItem2')] },
    }),
  },
  quote: {
    type: 'quote',
    category: 'text',
    variants: [
      { id: 'classic' },
      { id: 'statement', data: { variant: 'statement' } },
      { id: 'card', data: { variant: 'card' } },
      { id: 'photo', data: { variant: 'photo' } },
      { id: 'image', data: { variant: 'image' } },
    ],
    create: () => ({
      id: uid('block'),
      type: 'quote',
      settings: { ...baseSettings },
      data: { text: c('quoteText'), author: '' },
    }),
  },
  note: {
    type: 'note',
    category: 'text',
    variants: [{ id: 'note' }, { id: 'tip', data: { variant: 'tip' } }, { id: 'success', data: { variant: 'success' } }, { id: 'warning', data: { variant: 'warning' } }],
    create: () => ({
      id: uid('block'),
      type: 'note',
      settings: { ...baseSettings },
      data: { variant: 'note', text: c('noteText') },
    }),
  },
  columns: {
    type: 'columns',
    category: 'text',
    variants: [{ id: 'plain' }, { id: 'cards', data: { style: 'cards' } }, { id: 'lines', data: { style: 'lines' } }],
    create: () => ({
      id: uid('block'),
      type: 'columns',
      settings: { ...baseSettings },
      data: {
        style: 'plain',
        columns: [1, 2].map((n) => ({
          id: uid('col'),
          title: c('columnTitle', { n }),
          html: `<p>${c('columnText')}</p>`,
        })),
      },
    }),
  },
  table: {
    type: 'table',
    category: 'text',
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
  code: {
    type: 'code',
    category: 'text',
    create: () => ({
      id: uid('block'),
      type: 'code',
      settings: { ...baseSettings },
      data: { code: c('codeSample'), language: '' },
    }),
  },
  image: {
    type: 'image',
    category: 'media',
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
    variants: [{ id: 'grid' }, { id: 'carousel', data: { layout: 'carousel' } }],
    create: () => ({
      id: uid('block'),
      type: 'gallery',
      settings: { ...baseSettings },
      data: { images: [] },
    }),
  },
  imageText: {
    type: 'imageText',
    category: 'media',
    variants: [{ id: 'left' }, { id: 'right', data: { layout: 'right' } }, { id: 'overlay', data: { layout: 'overlay' } }],
    create: () => ({
      id: uid('block'),
      type: 'imageText',
      settings: { ...baseSettings },
      data: { src: '', alt: '', layout: 'left', html: `<p>${c('imageTextHtml')}</p>` },
    }),
  },
  video: {
    type: 'video',
    category: 'media',
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
    create: () => ({
      id: uid('block'),
      type: 'embed',
      settings: { ...baseSettings },
      data: { url: '', title: '' },
    }),
  },
  attachment: {
    type: 'attachment',
    category: 'media',
    create: () => ({
      id: uid('block'),
      type: 'attachment',
      settings: { ...baseSettings },
      data: { title: c('attachmentTitle'), files: [] },
    }),
  },
  beforeAfter: {
    type: 'beforeAfter',
    category: 'media',
    create: () => ({
      id: uid('block'),
      type: 'beforeAfter',
      settings: { ...baseSettings },
      data: {
        before: '',
        beforeAlt: '',
        beforeLabel: c('beforeLabel'),
        after: '',
        afterAlt: '',
        afterLabel: c('afterLabel'),
      },
    }),
  },
  process: {
    type: 'process',
    category: 'structure',
    variants: [
      { id: 'flow' },
      { id: 'chevrons', data: { layout: 'chevrons' } },
      { id: 'cycle', data: { layout: 'cycle' } },
      { id: 'pyramid', data: { layout: 'pyramid' } },
    ],
    create: () => ({
      id: uid('block'),
      type: 'process',
      settings: { ...baseSettings },
      data: {
        layout: 'flow',
        steps: [1, 2, 3, 4].map((n) => ({
          id: uid('step'),
          title: c(`processTitle${n}`),
          text: c(`processText${n}`),
        })),
      },
    }),
  },
  steps: {
    type: 'steps',
    category: 'structure',
    variants: [{ id: 'list' }, { id: 'slides', data: { layout: 'slides' } }],
    create: () => ({
      id: uid('block'),
      type: 'steps',
      settings: { ...baseSettings },
      data: {
        layout: 'list',
        steps: [1, 2, 3].map((n) => ({
          id: uid('step'),
          title: c('stepsTitle', { n }),
          html: `<p>${c('stepsText')}</p>`,
        })),
      },
    }),
  },
  timeline: {
    type: 'timeline',
    category: 'structure',
    variants: [{ id: 'vertical' }, { id: 'stepper', data: { layout: 'stepper' } }],
    create: () => ({
      id: uid('block'),
      type: 'timeline',
      settings: { ...baseSettings },
      data: {
        layout: 'vertical',
        items: [1, 2, 3].map((n) => ({
          id: uid('step'),
          label: c('timelineLabel', { n }),
          title: c('timelineTitle', { n }),
          text: c('timelineText', { n }),
        })),
      },
    }),
  },
  comparison: {
    type: 'comparison',
    category: 'structure',
    variants: [
      { id: 'prosCons' },
      {
        id: 'versus',
        data: () => ({
          versus: true,
          columns: [1, 2].map((n) => ({
            id: uid('col'),
            title: c('comparisonOption', { n }),
            tone: 'neutral' as const,
            items: [1, 2].map((k) => c('comparisonPoint', { n: k })),
          })),
        }),
      },
    ],
    create: () => ({
      id: uid('block'),
      type: 'comparison',
      settings: { ...baseSettings },
      data: {
        columns: [
          { id: uid('col'), title: c('comparisonPros'), tone: 'pro', items: [1, 2].map((n) => c('comparisonPro', { n })) },
          { id: uid('col'), title: c('comparisonCons'), tone: 'con', items: [1, 2].map((n) => c('comparisonCon', { n })) },
        ],
      },
    }),
  },
  tabs: {
    type: 'tabs',
    category: 'structure',
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
    category: 'structure',
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
    create: () => ({
      id: uid('block'),
      type: 'flashcards',
      settings: { ...baseSettings },
      data: {
        cards: [{ id: uid('card'), front: c('cardFront'), back: c('cardBack') }],
      },
    }),
  },
  hotspot: {
    type: 'hotspot',
    category: 'interactive',
    create: () => ({
      id: uid('block'),
      type: 'hotspot',
      settings: { ...baseSettings },
      data: { src: '', alt: '', hotspots: [] },
    }),
  },
  scenario: {
    type: 'scenario',
    category: 'interactive',
    variants: [{ id: 'classic' }, { id: 'chat', data: { layout: 'chat' } }],
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
  reflection: {
    type: 'reflection',
    category: 'interactive',
    create: () => ({
      id: uid('block'),
      type: 'reflection',
      settings: { ...baseSettings },
      data: { prompt: c('reflectionPrompt'), sample: '' },
    }),
  },
  quiz: {
    type: 'quiz',
    category: 'assessment',
    create: () => ({
      id: uid('block'),
      type: 'quiz',
      settings: { ...baseSettings },
      data: {
        passingScore: 80,
        showAnswers: true,
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
  ordering: {
    type: 'ordering',
    category: 'assessment',
    variants: [
      { id: 'sequence' },
      {
        id: 'categories',
        // Each item starts in a category, so the exercise can be scored as is.
        data: (d) => ({
          mode: 'categories',
          items: d.items.map((it, i) => ({ ...it, categoryId: d.categories[i % d.categories.length]?.id })),
        }),
      },
    ],
    create: () => ({
      id: uid('block'),
      type: 'ordering',
      settings: { ...baseSettings },
      data: {
        mode: 'sequence',
        prompt: c('orderingPrompt'),
        items: [1, 2, 3].map((n) => ({ id: uid('item'), text: c('orderingItem', { n }) })),
        categories: [1, 2].map((n) => ({ id: uid('cat'), title: c('orderingCategory', { n }) })),
        passingScore: 80,
        showAnswers: true,
      },
    }),
  },
  fillBlanks: {
    type: 'fillBlanks',
    category: 'assessment',
    variants: [{ id: 'type' }, { id: 'select', data: { mode: 'select' } }],
    create: () => ({
      id: uid('block'),
      type: 'fillBlanks',
      settings: { ...baseSettings },
      data: {
        text: c('fillBlanksText'),
        mode: 'type',
        passingScore: 80,
        showAnswers: true,
        caseSensitive: false,
      },
    }),
  },
  continue: {
    type: 'continue',
    category: 'navigation',
    variants: [{ id: 'unrestricted' }, { id: 'restricted', data: { mode: 'restricted' } }],
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
    variants: [
      { id: 'solid' },
      { id: 'dashed', data: { style: 'dashed' } },
      { id: 'dotted', data: { style: 'dotted' } },
      { id: 'gradient', data: { style: 'gradient' } },
      { id: 'dots', data: { style: 'dots' } },
      { id: 'ornament', data: { style: 'ornament' } },
      { id: 'wave', data: { style: 'wave' } },
      { id: 'label', data: { style: 'label', label: c('tplChapterLabel') } },
      { id: 'spacer', data: { style: 'spacer' } },
    ],
    create: () => ({
      id: uid('block'),
      type: 'divider',
      settings: { ...baseSettings },
      data: { style: 'solid' },
    }),
  },
  courseOutline: {
    type: 'courseOutline',
    category: 'navigation',
    create: () => ({
      id: uid('block'),
      type: 'courseOutline',
      settings: { ...baseSettings },
      data: { title: c('outlineTitle'), numbered: true },
    }),
  },
}

/** Category order for the add menu (labels come from i18n `common`); within
 *  a category, blocks follow the registry order above. */
export const BLOCK_CATEGORIES: { category: BlockCategory }[] = [
  { category: 'text' },
  { category: 'media' },
  { category: 'structure' },
  { category: 'interactive' },
  { category: 'assessment' },
  { category: 'navigation' },
]

export function blockVariants(type: BlockType): BlockVariant[] {
  return (BLOCK_REGISTRY[type].variants ?? []) as BlockVariant[]
}

// The registry's per-type variant types, loosened for applying any of them.
interface AnyVariant {
  id: string
  data?: Record<string, unknown> | ((data: Record<string, unknown>) => Record<string, unknown>)
  settings?: Partial<BlockSettings>
}

/** A new block of `type`, in style `variantId` when given (an unknown id
 *  gives the default block). */
export function createBlock(type: BlockType, variantId?: string): Block {
  const meta = BLOCK_REGISTRY[type] as unknown as { create: () => Block; variants?: AnyVariant[] }
  const block = meta.create()
  const variant = variantId ? meta.variants?.find((v) => v.id === variantId) : undefined
  if (!variant) return block
  const data = block.data as unknown as Record<string, unknown>
  Object.assign(data, typeof variant.data === 'function' ? variant.data(data) : variant.data)
  if (variant.settings) Object.assign(block.settings, variant.settings)
  return block
}
