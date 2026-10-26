// The AGENTS.md guide written into project folders (src/lib/agentGuide.ts).

import { describe, test, expect } from 'vitest'
import { buildAgentGuide } from '../src/lib/agentGuide'
import type { Course } from '../src/types/course'

const course = {
  id: 'course-1',
  title: 'Say "hi"',
  description: '',
  theme: 'rose',
  settings: { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' },
  lessons: [{ id: 'lesson-1', title: 'L', status: 'draft', blocks: [] }],
} as Course

describe('buildAgentGuide', () => {
  const md = buildAgentGuide(course)

  test('documents the current settings and quality rules', () => {
    expect(md).toContain("navigation: 'free' | 'linear'")
    expect(md).toContain('requireWatch?: boolean')
    expect(md).toContain('## Before you finish — quality checklist')
  })

  test('the example is valid JSON with escaped title', () => {
    const json = md.split('## Minimal example')[1].split('```json')[1].split('```')[0]
    const parsed = JSON.parse(json)
    expect(parsed.title).toBe('Say "hi"')
    expect(parsed.lessons[0].id).toBe('lesson-1')
  })

  test('points to review.md and the public repository', () => {
    expect(md).toContain('[`review.md`](./review.md)')
    expect(md).toContain('https://github.com/dmmat/Scormly')
  })

  test('code fences are balanced', () => {
    expect((md.match(/^```/gm) || []).length % 2).toBe(0)
  })
})
