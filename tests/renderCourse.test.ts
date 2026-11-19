// The standalone render script (public/tools/render-course.mjs) prepares the
// course the way an export does.

import { describe, test, expect } from 'vitest'
// @ts-expect-error a plain script without types
import { themeTokens, playerCourse } from '../public/tools/render-course.mjs'
import { customThemeTokens } from '../src/theme/customTheme'
import { buildAgentGuide } from '../src/lib/agentGuide'
import type { Course } from '../src/types/course'

describe('render-course', () => {
  test('its custom theme palette is the app\'s', () => {
    for (const theme of [
      { accent: '#EB1700', shape: 'soft' },
      { accent: '#ffcc00', accent2: '#7dd3fc', shape: 'pill' },
      { accent: '#0369a1', accent2: '#004685', shape: 'sharp' },
    ] as const) {
      expect(themeTokens(theme)).toEqual(customThemeTokens(theme))
    }
  })

  test('one lesson per page, without gates or the cover', () => {
    const course = {
      id: 'c', title: 'C', theme: 'custom', customTheme: { accent: '#0369a1', shape: 'soft' }, intro: { enabled: true },
      lessons: [
        { id: 'a', title: 'A', blocks: [{ id: '1', type: 'heading' }, { id: '2', type: 'continue' }, { id: '3', type: 'paragraph' }] },
        { id: 'b', title: 'B', blocks: [] },
      ],
    }
    const page = playerCourse(course, { only: 0 })
    expect(page.lessons.map((l: { id: string }) => l.id)).toEqual(['a'])
    expect(page.lessons[0].blocks.map((b: { type: string }) => b.type)).toEqual(['heading', 'paragraph'])
    expect(page.intro.enabled).toBe(false)
    expect(page.themeTokens.brand).toBe('#0369a1')
    // The source is left alone.
    expect(course.lessons[0].blocks).toHaveLength(3)
  })

  test('the project guide points at it', () => {
    const guide = buildAgentGuide({ id: 'c', title: 'C', lessons: [] } as unknown as Course)
    expect(guide).toContain('https://scormly.app/tools/render-course.mjs')
    expect(guide).toContain('## Choosing a block')
  })
})
