// Block type registry: metadata for the "+ Add block" menu and a factory for
// default blocks. Adding a new block type = a new entry here + renderer/editor.

import type { Block, BlockType } from '../types/course'
import { uid } from '../lib/id'

export type BlockCategory = 'text' | 'media' | 'interactive' | 'navigation'

export interface BlockMeta {
  type: BlockType
  /** Label in the add menu. */
  label: string
  /** Short description under the label. */
  description: string
  category: BlockCategory
  /** Icon name (emoji placeholder until an icon set is wired up). */
  icon: string
  /** Factory for a default block of this type. */
  create: () => Block
}

const baseSettings = { spacing: 'normal' as const }

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
  heading: {
    type: 'heading',
    label: 'Заголовок',
    description: 'H1, H2 або H3',
    category: 'text',
    icon: 'H',
    create: () => ({
      id: uid('block'),
      type: 'heading',
      settings: { ...baseSettings },
      data: { level: 2, text: 'Новий заголовок' },
    }),
  },
  paragraph: {
    type: 'paragraph',
    label: 'Абзац',
    description: 'Звичайний текст',
    category: 'text',
    icon: '¶',
    create: () => ({
      id: uid('block'),
      type: 'paragraph',
      settings: { ...baseSettings },
      data: { html: '<p>Введіть текст…</p>' },
    }),
  },
  list: {
    type: 'list',
    label: 'Список',
    description: 'Маркований або нумерований',
    category: 'text',
    icon: '•',
    create: () => ({
      id: uid('block'),
      type: 'list',
      settings: { ...baseSettings },
      data: { ordered: false, items: ['Перший пункт', 'Другий пункт'] },
    }),
  },
  note: {
    type: 'note',
    label: 'Акцент',
    description: 'Note / Warning з іконкою',
    category: 'text',
    icon: '!',
    create: () => ({
      id: uid('block'),
      type: 'note',
      settings: { ...baseSettings },
      data: { variant: 'note', text: 'Важлива примітка для студента.' },
    }),
  },
  image: {
    type: 'image',
    label: 'Зображення',
    description: 'Одне зображення з підписом',
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
    label: 'Галерея',
    description: 'Кілька зображень',
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
    label: 'Відео',
    description: 'Локальний файл (HTML5)',
    category: 'media',
    icon: '▶',
    create: () => ({
      id: uid('block'),
      type: 'video',
      settings: { ...baseSettings },
      data: { src: '', poster: '' },
    }),
  },
  continue: {
    type: 'continue',
    label: 'Кнопка «Продовжити»',
    description: 'Розділювач сторінки',
    category: 'navigation',
    icon: '⏭',
    create: () => ({
      id: uid('block'),
      type: 'continue',
      settings: { ...baseSettings },
      data: { mode: 'unrestricted', label: 'Продовжити' },
    }),
  },
  tabs: {
    type: 'tabs',
    label: 'Вкладки',
    description: 'Контент за табами',
    category: 'interactive',
    icon: '▭',
    create: () => ({
      id: uid('block'),
      type: 'tabs',
      settings: { ...baseSettings },
      data: {
        tabs: [
          { id: uid('tab'), title: 'Вкладка 1', html: '<p>Зміст вкладки 1</p>' },
          { id: uid('tab'), title: 'Вкладка 2', html: '<p>Зміст вкладки 2</p>' },
        ],
      },
    }),
  },
  accordion: {
    type: 'accordion',
    label: 'Акордеон',
    description: 'Згортувані секції',
    category: 'interactive',
    icon: '≡',
    create: () => ({
      id: uid('block'),
      type: 'accordion',
      settings: { ...baseSettings },
      data: {
        items: [
          { id: uid('acc'), title: 'Секція 1', html: '<p>Зміст секції 1</p>' },
          { id: uid('acc'), title: 'Секція 2', html: '<p>Зміст секції 2</p>' },
        ],
      },
    }),
  },
  flashcards: {
    type: 'flashcards',
    label: 'Картки',
    description: 'Картки-перевертні',
    category: 'interactive',
    icon: '🂠',
    create: () => ({
      id: uid('block'),
      type: 'flashcards',
      settings: { ...baseSettings },
      data: {
        cards: [
          { id: uid('card'), front: 'Термін', back: 'Визначення' },
        ],
      },
    }),
  },
  scenario: {
    type: 'scenario',
    label: 'Діалоговий тренажер',
    description: 'Сценарій з вибором',
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
          characterName: 'Персонаж',
          startNodeId: startId,
          nodes: [
            {
              id: startId,
              text: 'Привіт! З чого почнемо?',
              emotion: 'neutral',
              choices: [
                { id: uid('choice'), text: 'Варіант відповіді', nextNodeId: null },
              ],
            },
          ],
        },
      }
    },
  },
  quiz: {
    type: 'quiz',
    label: 'Квіз',
    description: 'Питання з оцінюванням',
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
            prompt: 'Текст питання?',
            options: [
              { id: uid('opt'), text: 'Правильна відповідь', correct: true },
              { id: uid('opt'), text: 'Неправильна відповідь', correct: false },
            ],
          },
        ],
      },
    }),
  },
}

/** Order and grouping for the add menu. */
export const BLOCK_CATEGORIES: { category: BlockCategory; label: string }[] = [
  { category: 'text', label: 'Текст' },
  { category: 'media', label: 'Медіа' },
  { category: 'interactive', label: 'Інтерактив' },
  { category: 'navigation', label: 'Навігація' },
]

export function createBlock(type: BlockType): Block {
  return BLOCK_REGISTRY[type].create()
}
