// Review comments: comments.json (src/lib/comments.ts), the review store and
// the project .zip round trip.

import { describe, test, expect, beforeEach } from 'vitest'
import JSZip from 'jszip'
import { commentAuthors, mergeComments, parseComments, serializeComments } from '../src/lib/comments'
import { deleteReplyWithUndo, deleteThreadWithUndo, useReviewStore } from '../src/store/reviewStore'
import { useCourseStore } from '../src/store/courseStore'
import { buildProjectZip, hasUnsavedZipChanges, markZipSaved } from '../src/lib/exportProjectZip'
import { openProjectZip } from '../src/lib/importProjectZip'
import { useToastStore } from '../src/store/toastStore'
import { buildAgentGuide } from '../src/lib/agentGuide'
import type { Course } from '../src/types/course'
import type { ReviewThread } from '../src/types/review'

const thread = (id: string, over: Partial<ReviewThread> = {}): ReviewThread => ({
  id,
  blockId: 'b1',
  resolved: false,
  updatedAt: '2026-11-01T10:00:00.000Z',
  comments: [{ id: `${id}-1`, author: 'Olena', text: 'Shorter, please', createdAt: '2026-11-01T10:00:00.000Z' }],
  ...over,
})

describe('comments.json', () => {
  test('round trip', () => {
    const threads = [thread('c1'), thread('c2', { resolved: true, resolvedBy: 'Ivan', resolvedAt: '2026-11-02T09:00:00.000Z' })]
    expect(parseComments(serializeComments(threads))).toEqual(threads)
  })

  test('not JSON → null; JSON of the wrong shape → no comments', () => {
    expect(parseComments('{"threads": [')).toBeNull()
    expect(parseComments('"hello"')).toEqual([])
    expect(parseComments('{"version": 1}')).toEqual([])
  })

  test('hand / AI edits are repaired: ids, times and fields filled, empty threads dropped', () => {
    const threads = parseComments(
      JSON.stringify({
        threads: [
          { blockId: 'b1', comments: [{ author: ' AI ', text: 'Fixed the typo' }, { text: '   ' }] },
          { id: 'dup', blockId: 'b2', resolved: 'yes', comments: [{ id: 'm', author: 'Ivan', text: 'Hi', createdAt: 'yesterday' }] },
          { id: 'dup', blockId: 'b3', comments: [{ id: 'm', author: 'Ivan', text: 'Again' }] },
          { id: 'x', comments: [{ text: 'no block' }] },
          { id: 'y', blockId: 'b4', comments: [] },
        ],
      }),
    )!
    expect(threads).toHaveLength(3)
    const [a, b, c] = threads
    expect(a.id).toMatch(/^c-/)
    expect(a.comments).toHaveLength(1)
    expect(a.comments[0]).toMatchObject({ author: 'AI', text: 'Fixed the typo' })
    expect(Date.parse(a.comments[0].createdAt)).not.toBeNaN()
    expect(b.resolved).toBe(false)
    expect(Date.parse(b.comments[0].createdAt)).not.toBeNaN()
    expect(c.id).not.toBe('dup')
    expect(c.comments[0].id).not.toBe('m')
    // Already repaired: parsing again changes nothing.
    expect(parseComments(serializeComments(threads))).toEqual(threads)
  })

  test('the example in AGENTS.md is a valid comments.json', () => {
    const md = buildAgentGuide(course())
    const json = md.split('## Review comments')[1].split('```json')[1].split('```')[0]
    const parsed = parseComments(json)!
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({ id: 'c-1', resolved: false, comments: [{ id: 'm-1', author: 'Olena' }] })
  })

  test('authors, most recent first, for picking a name', () => {
    const t1 = thread('c1')
    const t2 = thread('c2', {
      comments: [
        { id: 'a', author: 'Ivan', text: '1', createdAt: '2026-11-03T00:00:00.000Z' },
        { id: 'b', author: 'Olena', text: '2', createdAt: '2026-10-01T00:00:00.000Z' },
        { id: 'c', author: ' ', text: '3', createdAt: '2026-11-05T00:00:00.000Z' },
      ],
    })
    expect(commentAuthors([t1, t2])).toEqual(['Ivan', 'Olena'])
  })
})

describe('merging comments from another copy', () => {
  test('new threads and replies are added; nothing changed keeps the same array', () => {
    const base = [thread('c1')]
    expect(mergeComments(base, [thread('c1')]).threads).toBe(base)

    const reply = { id: 'r', author: 'Ivan', text: 'Done', createdAt: '2026-11-02T10:00:00.000Z' }
    const theirs = [{ ...thread('c1'), comments: [...thread('c1').comments, reply] }, thread('c9', { blockId: 'b9' })]
    const { threads, added } = mergeComments(base, theirs)
    expect(added).toBe(2)
    expect(threads.map((t) => t.id)).toEqual(['c1', 'c9'])
    expect(threads[0].comments.map((c) => c.id)).toEqual(['c1-1', 'r'])
  })

  test('the newer edit and the newer status win', () => {
    const mine = thread('c1', { updatedAt: '2026-11-03T00:00:00.000Z' })
    const theirs = thread('c1', {
      resolved: true,
      resolvedBy: 'Ivan',
      updatedAt: '2026-11-04T00:00:00.000Z',
      comments: [{ ...thread('c1').comments[0], text: 'Much shorter', editedAt: '2026-11-04T00:00:00.000Z' }],
    })
    const [merged] = mergeComments([mine], [theirs]).threads
    expect(merged).toMatchObject({ resolved: true, resolvedBy: 'Ivan', updatedAt: '2026-11-04T00:00:00.000Z' })
    expect(merged.comments[0].text).toBe('Much shorter')
    // An older copy doesn't undo it.
    expect(mergeComments([merged], [mine]).threads[0]).toBe(merged)
  })
})

describe('review store', () => {
  beforeEach(() => {
    useReviewStore.getState().reset()
    useReviewStore.setState({ reviewer: '' })
  })

  test('commenting needs a name', () => {
    const s = useReviewStore.getState()
    expect(s.addThread('b1', 'Hello')).toBeNull()
    s.setReviewer('  Olena ')
    const id = useReviewStore.getState().addThread('b1', '  Hello  ')!
    const [t] = useReviewStore.getState().threads
    expect(t).toMatchObject({ id, blockId: 'b1', resolved: false, comments: [{ author: 'Olena', text: 'Hello' }] })
    expect(useReviewStore.getState().focusThreadId).toBe(id)
  })

  test('resolve, reply reopens, edit, delete with undo', () => {
    const s = useReviewStore.getState()
    s.setReviewer('Olena')
    const id = s.addThread('b1', 'Typo here')!
    s.setResolved(id, true)
    expect(useReviewStore.getState().threads[0]).toMatchObject({ resolved: true, resolvedBy: 'Olena' })
    s.setReviewer('Ivan')
    s.reply(id, 'Not yet')
    let t = useReviewStore.getState().threads[0]
    expect(t.resolved).toBe(false)
    expect(t.resolvedBy).toBeUndefined()
    expect(t.comments.map((c) => c.author)).toEqual(['Olena', 'Ivan'])

    s.editComment(id, t.comments[1].id, 'Fixed now')
    t = useReviewStore.getState().threads[0]
    expect(t.comments[1]).toMatchObject({ text: 'Fixed now' })
    expect(t.comments[1].editedAt).toBeDefined()

    deleteReplyWithUndo(id, t.comments[1].id)
    expect(useReviewStore.getState().threads[0].comments).toHaveLength(1)
    const { toasts } = useToastStore.getState()
    const undo = toasts[toasts.length - 1].action!
    undo.onClick()
    expect(useReviewStore.getState().threads[0].comments).toHaveLength(2)

    deleteThreadWithUndo(id)
    expect(useReviewStore.getState().threads).toEqual([])
  })

  test('opening another course drops the comments of the last one', async () => {
    useReviewStore.getState().setReviewer('Olena')
    useReviewStore.getState().addThread('b1', 'Hi')
    await useCourseStore.getState().loadSampleCourse('en')
    expect(useReviewStore.getState().threads).toEqual([])
  })
})

function course(): Course {
  return {
    id: 'cz',
    title: 'Review zip',
    description: '',
    theme: 'rose',
    settings: {},
    lessons: [{ id: 'l1', title: 'L1', status: 'draft', blocks: [{ id: 'b1', type: 'heading', settings: {}, data: { level: 2, text: 'Hi' } }] }],
  } as unknown as Course
}

const asFile = async (zip: JSZip, name = 'p.zip') => new File([await zip.generateAsync({ type: 'arraybuffer' })], name)

describe('comments in the project .zip', () => {
  beforeEach(() => {
    useReviewStore.getState().reset()
  })

  test('no comments → no comments.json (older Scormly versions see the same .zip)', async () => {
    const zip = await buildProjectZip(course(), null, [])
    expect(zip.file('comments.json')).toBeNull()
  })

  test('they travel in the .zip and come back with the project', async () => {
    const threads = [thread('c1')]
    const file = await asFile(await buildProjectZip(course(), null, threads))
    await openProjectZip(file, { ask: async () => 'new' })
    expect(useReviewStore.getState().threads).toEqual(threads)
    // Opened from the .zip: nothing unsaved yet.
    expect(hasUnsavedZipChanges()).toBe(false)
    useReviewStore.getState().setThreads([...threads, thread('c2')])
    expect(hasUnsavedZipChanges()).toBe(true)
  })

  test('a reviewer’s .zip: update merges the comments, “comments only” keeps the course', async () => {
    // The author's copy, open in this tab, with one thread.
    await openProjectZip(await asFile(await buildProjectZip(course(), null, [thread('c1')])), { ask: async () => 'new' })
    const id = useCourseStore.getState().course.id
    useCourseStore.getState().updateCourseMeta({ title: 'Edited here' })
    markZipSaved(useCourseStore.getState().course)

    // The reviewer's copy: an older course with a reply and a new thread.
    const reply = { id: 'r', author: 'Ivan', text: 'Agree', createdAt: '2026-11-02T00:00:00.000Z' }
    const theirs = [{ ...thread('c1'), comments: [...thread('c1').comments, reply] }, thread('c2', { blockId: 'b1' })]
    const back = await asFile(await buildProjectZip({ ...course(), id }, null, theirs))

    const asked: number[] = []
    await openProjectZip(back, { ask: async (m) => (asked.push(m.zipComments), 'comments') })
    expect(asked).toEqual([2])
    expect(useCourseStore.getState().course.title).toBe('Edited here')
    const merged = useReviewStore.getState().threads
    expect(merged.map((t) => t.id)).toEqual(['c1', 'c2'])
    expect(merged[0].comments.map((c) => c.id)).toEqual(['c1-1', 'r'])

    // Updating the course from the same .zip again adds nothing new.
    await openProjectZip(back, { ask: async () => 'update' })
    expect(useCourseStore.getState().course.title).toBe('Review zip')
    expect(useReviewStore.getState().threads).toBe(merged)
  })

  test('an unreadable comments.json doesn’t stop the project from opening', async () => {
    const zip = await buildProjectZip(course(), null, [])
    zip.file('comments.json', '{ not json')
    await openProjectZip(await asFile(zip), { ask: async () => 'new' })
    expect(useCourseStore.getState().course.title).toBe('Review zip')
    expect(useReviewStore.getState().threads).toEqual([])
  })
})
