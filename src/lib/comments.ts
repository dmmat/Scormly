// comments.json: the project's review comments, kept beside project.json (in
// the folder, the browser's storage and the project .zip). A missing file means
// no comments, so older projects open as before; the file is only written once
// there is something in it. Like project.json it may be edited by hand or by an
// AI assistant (AGENTS.md describes it), so loading repairs what it can.

import type { ReviewComment, ReviewThread } from '../types/review'
import { uid } from './id'

export const COMMENTS_FILE = 'comments.json'
/** Where an unreadable comments.json is copied before it gets replaced. */
export const BROKEN_COMMENTS_FILE = 'comments.broken.json'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const time = (v: unknown, fallback: string): string =>
  typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : fallback

function repairComment(raw: unknown, seen: Set<string>, now: string): ReviewComment | null {
  if (!isObj(raw)) return null
  const text = str(raw.text)
  if (!text.trim()) return null
  let id = str(raw.id)
  if (!id || seen.has(id)) id = uid('m')
  seen.add(id)
  const c: ReviewComment = { id, author: str(raw.author).trim(), text, createdAt: time(raw.createdAt, now) }
  if (typeof raw.editedAt === 'string' && !Number.isNaN(Date.parse(raw.editedAt))) c.editedAt = raw.editedAt
  return c
}

/**
 * Parse comments.json. Null when the text isn't JSON at all; otherwise the
 * threads that make sense — missing ids, times and fields are filled in, and
 * threads without a block or without any text are dropped.
 */
export function parseComments(text: string): ReviewThread[] | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  const list = isObj(data) ? data.threads : data
  if (!Array.isArray(list)) return []
  const now = new Date().toISOString()
  const threadIds = new Set<string>()
  const commentIds = new Set<string>()
  const threads: ReviewThread[] = []
  for (const raw of list) {
    if (!isObj(raw) || !str(raw.blockId)) continue
    const comments = (Array.isArray(raw.comments) ? raw.comments : [])
      .map((c) => repairComment(c, commentIds, now))
      .filter((c): c is ReviewComment => c !== null)
    if (!comments.length) continue
    let id = str(raw.id)
    if (!id || threadIds.has(id)) id = uid('c')
    threadIds.add(id)
    const last = comments.reduce((t, c) => (latest(c) > t ? latest(c) : t), comments[0].createdAt)
    const thread: ReviewThread = {
      id,
      blockId: str(raw.blockId),
      resolved: raw.resolved === true,
      updatedAt: time(raw.updatedAt, last),
      comments,
    }
    if (thread.resolved) {
      if (str(raw.resolvedBy)) thread.resolvedBy = str(raw.resolvedBy)
      if (typeof raw.resolvedAt === 'string') thread.resolvedAt = time(raw.resolvedAt, thread.updatedAt)
    }
    threads.push(thread)
  }
  return threads
}

export function serializeComments(threads: ReviewThread[]): string {
  return JSON.stringify({ version: 1, threads }, null, 2) + '\n'
}

const latest = (c: ReviewComment): string => c.editedAt ?? c.createdAt

/**
 * Bring comments from another copy of the project (a .zip back from a
 * reviewer) into these: new threads and replies are added, a comment edited in
 * both keeps the newer text, and a thread changed in both keeps the newer
 * resolved / open status. Nothing is removed (a comment deleted here comes back
 * if the other copy still has it). Returns `base` itself when nothing changes.
 */
export function mergeComments(
  base: ReviewThread[],
  incoming: ReviewThread[],
): { threads: ReviewThread[]; added: number } {
  const byId = new Map(base.map((t) => [t.id, t]))
  const out = [...base]
  let added = 0
  let changed = false
  for (const other of incoming) {
    const mine = byId.get(other.id)
    if (!mine) {
      out.push(other)
      byId.set(other.id, other)
      added += other.comments.length
      changed = true
      continue
    }
    const comments = new Map(mine.comments.map((c) => [c.id, c]))
    let threadChanged = false
    for (const c of other.comments) {
      const have = comments.get(c.id)
      if (!have) {
        comments.set(c.id, c)
        added++
        threadChanged = true
      } else if (latest(c) > latest(have)) {
        comments.set(c.id, c)
        threadChanged = true
      }
    }
    const newer = other.updatedAt > mine.updatedAt ? other : mine
    if (newer !== mine && (newer.resolved !== mine.resolved || newer.resolvedBy !== mine.resolvedBy)) threadChanged = true
    if (!threadChanged) continue
    const merged: ReviewThread = {
      id: mine.id,
      blockId: mine.blockId,
      resolved: newer.resolved,
      updatedAt: newer.updatedAt > mine.updatedAt ? newer.updatedAt : mine.updatedAt,
      comments: [...comments.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }
    if (newer.resolved) {
      if (newer.resolvedBy) merged.resolvedBy = newer.resolvedBy
      if (newer.resolvedAt) merged.resolvedAt = newer.resolvedAt
    }
    out[out.indexOf(mine)] = merged
    changed = true
  }
  return { threads: changed ? out : base, added }
}

/** Everyone who has commented, most recent first (for picking your name). */
export function commentAuthors(threads: ReviewThread[]): string[] {
  const last = new Map<string, string>()
  for (const t of threads) {
    for (const c of t.comments) {
      const name = c.author.trim()
      if (name && (last.get(name) ?? '') < c.createdAt) last.set(name, c.createdAt)
    }
  }
  return [...last.entries()].sort((a, b) => b[1].localeCompare(a[1])).map(([name]) => name)
}
