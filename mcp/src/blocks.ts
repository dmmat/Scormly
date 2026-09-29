// Block `data` validation + defaults for the MCP tools. One zod schema per block
// type mirroring src/types/course.ts (the source of truth; keyed by BlockType so
// a new block type fails to compile until it is added here). Missing fields get
// neutral defaults and missing nested ids (quiz options, tabs, scenario nodes…)
// are generated like the app does (prefix + uuid, see src/lib/id.ts).
//
// Defaults are intentionally empty rather than the app's placeholder text
// (src/blocks/registry.ts): an AI client supplies the content itself.

import { z } from 'zod'
import type { Block, BlockSettings, BlockType } from '../../src/types/course'
import { uid } from '../../src/lib/id'
import { ToolError } from './project'

const id = (prefix: string) => z.string().min(1).default(() => uid(prefix))
const emotion = z.enum(['neutral', 'happy', 'concerned'])
const imageRef = z.strictObject({
  src: z.string().default(''),
  alt: z.string().default(''),
  caption: z.string().optional(),
})
const titledHtml = (prefix: string) =>
  z.strictObject({ id: id(prefix), title: z.string().default(''), html: z.string().default('') })

const choiceOption = z.strictObject({
  id: id('opt'),
  text: z.string().default(''),
  correct: z.boolean().default(false),
  feedback: z.string().optional(),
})
const question = z.preprocess(
  // `type` defaults to single choice.
  (q) => (q && typeof q === 'object' && !('type' in q) ? { ...q, type: 'single' } : q),
  z.discriminatedUnion('type', [
    z.strictObject({
      id: id('q'),
      type: z.enum(['single', 'multiple']),
      prompt: z.string().default(''),
      feedback: z.string().optional(),
      options: z.array(choiceOption).default([]),
    }),
    z.strictObject({
      id: id('q'),
      type: z.literal('matching'),
      prompt: z.string().default(''),
      feedback: z.string().optional(),
      pairs: z
        .array(z.strictObject({ id: id('pair'), left: z.string().default(''), right: z.string().default('') }))
        .default([]),
    }),
  ]),
)

export const DATA_SCHEMAS: Record<BlockType, z.ZodType> = {
  heading: z.strictObject({
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    text: z.string().default(''),
    align: z.enum(['left', 'center', 'right']).optional(),
  }),
  paragraph: z.strictObject({ html: z.string().default('') }),
  list: z.strictObject({
    ordered: z.boolean().default(false),
    items: z.array(z.string()).default([]),
  }),
  note: z.strictObject({
    variant: z.enum(['note', 'warning']).default('note'),
    text: z.string().default(''),
  }),
  image: imageRef,
  gallery: z.strictObject({ images: z.array(imageRef).default([]) }),
  video: z.strictObject({
    src: z.string().default(''),
    poster: z.string().optional(),
    requireWatch: z.boolean().optional(),
  }),
  audio: z.strictObject({ src: z.string().default('') }),
  embed: z.strictObject({ url: z.string().default(''), title: z.string().optional() }),
  code: z.strictObject({ code: z.string().default(''), language: z.string().optional() }),
  table: z
    .strictObject({
      header: z.boolean().default(true),
      rows: z.array(z.array(z.string())).default([['', '']]),
    })
    .transform((d) => {
      // Every row must have the same number of columns: pad short rows.
      const cols = Math.max(1, ...d.rows.map((r) => r.length))
      return { ...d, rows: d.rows.map((r) => [...r, ...Array(cols - r.length).fill('')]) }
    }),
  quote: z.strictObject({ text: z.string().default(''), author: z.string().optional() }),
  continue: z.strictObject({
    mode: z.enum(['unrestricted', 'restricted']).default('unrestricted'),
    label: z.string().default('Continue'),
  }),
  divider: z.strictObject({ style: z.enum(['solid', 'dashed', 'dotted']).default('solid') }),
  courseOutline: z.strictObject({
    title: z.string().default(''),
    numbered: z.boolean().default(true),
  }),
  tabs: z.strictObject({ tabs: z.array(titledHtml('tab')).default([]) }),
  accordion: z.strictObject({ items: z.array(titledHtml('acc')).default([]) }),
  flashcards: z.strictObject({
    cards: z
      .array(z.strictObject({ id: id('card'), front: z.string().default(''), back: z.string().default('') }))
      .default([]),
  }),
  scenario: z
    .strictObject({
      characterImages: z.partialRecord(emotion, z.string()).default({}),
      characterName: z.string().default(''),
      startNodeId: z.string().optional(),
      layout: z.enum(['classic', 'chat']).optional(),
      userAvatar: z.string().optional(),
      nodes: z
        .array(
          z.strictObject({
            id: id('node'),
            text: z.string().default(''),
            emotion: emotion.default('neutral'),
            choices: z
              .array(
                z.strictObject({
                  id: id('choice'),
                  text: z.string().default(''),
                  nextNodeId: z.string().nullable().default(null),
                  setEmotion: emotion.optional(),
                }),
              )
              .default([]),
          }),
        )
        .default([]),
    })
    // The scenario starts at the first node unless told otherwise.
    .transform((d) => ({ ...d, startNodeId: d.startNodeId ?? d.nodes[0]?.id ?? '' })),
  quiz: z.strictObject({
    questions: z.array(question).default([]),
    passingScore: z.number().min(0).max(100).default(80),
    showAnswers: z.boolean().default(true),
  }),
  hotspot: z.strictObject({
    src: z.string().default(''),
    alt: z.string().default(''),
    hotspots: z
      .array(
        z.strictObject({
          id: id('spot'),
          x: z.number().min(0).max(100).default(50), // % of image width
          y: z.number().min(0).max(100).default(50), // % of image height
          title: z.string().default(''),
          text: z.string().default(''),
        }),
      )
      .default([]),
  }),
  timeline: z.strictObject({
    layout: z.enum(['vertical', 'stepper']).default('vertical'),
    items: z
      .array(
        z.strictObject({
          id: id('step'),
          label: z.string().default(''),
          title: z.string().default(''),
          text: z.string().default(''),
        }),
      )
      .default([]),
  }),
  ordering: z.strictObject({
    mode: z.enum(['sequence', 'categories']).default('sequence'),
    prompt: z.string().default(''),
    // sequence: items in the CORRECT order; categories: categoryId = correct category
    items: z
      .array(z.strictObject({ id: id('item'), text: z.string().default(''), categoryId: z.string().optional() }))
      .default([]),
    categories: z.array(z.strictObject({ id: id('cat'), title: z.string().default('') })).default([]),
    passingScore: z.number().min(0).max(100).default(80),
    showAnswers: z.boolean().default(true),
  }),
  fillBlanks: z.strictObject({
    // Blanks in square brackets, alternatives separated by '|': "Paris is in [France|FR]."
    text: z.string().default(''),
    mode: z.enum(['type', 'select']).default('type'),
    passingScore: z.number().min(0).max(100).default(80),
    showAnswers: z.boolean().default(true),
    caseSensitive: z.boolean().default(false),
  }),
}

export const BLOCK_TYPES = Object.keys(DATA_SCHEMAS) as [BlockType, ...BlockType[]]

export const settingsSchema = z.strictObject({
  spacing: z.enum(['compact', 'normal', 'spacious']).optional(),
})

/** Validate block data, filling defaults and missing ids. */
export function parseBlockData(type: BlockType, data: unknown): Block['data'] {
  const result = DATA_SCHEMAS[type].safeParse(data ?? {})
  if (!result.success) {
    throw new ToolError(`Invalid data for a "${type}" block:\n${z.prettifyError(result.error)}`)
  }
  return result.data as Block['data']
}

export function makeBlock(
  type: BlockType,
  data: unknown,
  settings?: BlockSettings,
): Block {
  return {
    id: uid('block'),
    type,
    settings: { spacing: 'normal', ...settings },
    data: parseBlockData(type, data),
  } as Block
}
