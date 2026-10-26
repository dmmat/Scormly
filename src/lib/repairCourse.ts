// Repairs a loaded project.json so the editor, preview and player can't crash
// on it. Projects edited by hand or by an AI (following AGENTS.md) may miss
// ids, fields or whole objects, or use the wrong types. Only structure is
// repaired: content problems the pre-export check reports (an empty quiz, no
// correct option, a dangling scenario link…) are left alone, and blocks of an
// unknown type are kept as they are (the editor shows a placeholder, the
// player skips them).
//
// Callers gate on a `lessons` array first (looksLikeCourse in projectService);
// anything below that is coerced, never thrown on. Repairing is idempotent: a
// repaired course needs no further fixes. Legacy omissions that are valid
// (no `settings`, no `intro`) are not reported.

import type { Course } from '../types/course'
import { BLOCK_REGISTRY, createBlock } from '../blocks/registry'
import { QUESTION_TYPES } from '../blocks/quizQuestions'
import { uid } from './id'
import { translate } from '../i18n/I18nProvider'
import { DICTIONARY } from '../i18n/dictionary'
import { toast } from '../store/toastStore'

/** One repair; `key` is an i18n key in the `common` namespace. */
export interface RepairFix {
  key: string
  vars?: Record<string, string | number>
}

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const isKnownType = (type: unknown): type is keyof typeof BLOCK_REGISTRY =>
  typeof type === 'string' && Object.prototype.hasOwnProperty.call(BLOCK_REGISTRY, type)

// Nested lists whose items carry an id, per block type, with each item's
// fields and their empty values (used to fill missing or mistyped fields).
const ITEMS: Record<string, Record<string, Obj>> = {
  tabs: { tabs: { title: '', html: '' } },
  accordion: { items: { title: '', html: '' } },
  flashcards: { cards: { front: '', back: '' } },
  columns: { columns: { title: '', html: '' } },
  attachment: { files: { src: '', name: '' } },
  hotspot: { hotspots: { x: 50, y: 50, title: '', text: '' } },
  timeline: { items: { label: '', title: '', text: '' } },
  ordering: { items: { text: '' }, categories: { title: '' } },
  process: { steps: { title: '', text: '' } },
  steps: { steps: { title: '', html: '' } },
  comparison: { columns: { title: '', tone: 'neutral', items: [] } },
  scenario: { nodes: { text: '', emotion: 'neutral', choices: [] } },
}

// Nested lists of items without ids: only completed.
const PLAIN_ITEMS: Record<string, Record<string, Obj>> = {
  gallery: { images: { src: '', alt: '' } },
}

// Lists of strings (cells of table rows are handled separately).
const STRING_LISTS: Record<string, string[]> = { list: ['items'] }

// Fields of nested quiz / scenario items.
const QUESTION_ITEMS: Record<string, [field: string, template: Obj]> = {
  single: ['options', { text: '', correct: false }],
  multiple: ['options', { text: '', correct: false }],
  matching: ['pairs', { left: '', right: '' }],
  sequence: ['items', { text: '' }],
}
const CHOICE_TEMPLATE: Obj = { text: '', nextNodeId: null }

const clone = <T>(v: T): T => (v === null || typeof v !== 'object' ? v : structuredClone(v))

/**
 * Coerce `value` to the type of `template`. Returns [value, changed].
 * A null template accepts anything (e.g. nextNodeId: string | null).
 */
function coerce(template: unknown, value: unknown): [unknown, boolean] {
  if (template === null) return [value, false]
  if (Array.isArray(template)) return Array.isArray(value) ? [value, false] : [clone(template), true]
  switch (typeof template) {
    case 'string':
      if (typeof value === 'string') return [value, false]
      if (typeof value === 'number' || typeof value === 'boolean') return [String(value), true]
      return ['', true]
    case 'number':
      if (typeof value === 'number' && Number.isFinite(value)) return [value, false]
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return [Number(value), true]
      return [template, true]
    case 'boolean':
      if (typeof value === 'boolean') return [value, false]
      if (value === 'true' || value === 'false') return [value === 'true', true]
      return [Boolean(value), true]
    case 'object':
      return isObj(value) ? [value, false] : [clone(template), true]
    default:
      return [value, false]
  }
}

class Repairer {
  fixes: RepairFix[] = []
  private blockIds = new Set<string>()

  fix(key: string, vars?: RepairFix['vars']) {
    this.fixes.push(vars ? { key, vars } : { key })
  }

  /** An id that is a non-empty string and not yet in `seen`; else a new one. */
  private claim(id: unknown, seen: Set<string>, prefix: string): [string, boolean] {
    if (typeof id === 'string' && id && !seen.has(id)) {
      seen.add(id)
      return [id, false]
    }
    let next = uid(prefix)
    while (seen.has(next)) next = uid(prefix)
    seen.add(next)
    return [next, true]
  }

  course(input: Obj): Course {
    const c: Obj = { ...input }
    if (typeof c.id !== 'string' || !c.id) {
      c.id = uid('course')
      this.fix('repairCourseId')
    }
    if (typeof c.title !== 'string') {
      c.title = typeof c.title === 'number' ? String(c.title) : translate('common', 'repairUntitled')
      this.fix('repairCourseTitle', { title: c.title as string })
    }
    // Optional in the model, but code reads it as a string.
    if (typeof c.description !== 'string') c.description = ''
    if (c.settings !== undefined && !isObj(c.settings)) {
      delete c.settings
      this.fix('repairSettings')
    }
    if (c.intro !== undefined) {
      if (!isObj(c.intro)) {
        delete c.intro
        this.fix('repairIntro')
      } else {
        const intro: Obj = { ...c.intro }
        if (intro.blocks !== undefined) {
          if (!Array.isArray(intro.blocks)) {
            intro.blocks = []
            this.fix('repairIntroBlocks')
          } else {
            intro.blocks = this.blocks(intro.blocks, translate('common', 'repairCoverPage'))
          }
        }
        c.intro = intro
      }
    }

    const lessonIds = new Set<string>()
    const lessons: Obj[] = []
    ;(c.lessons as unknown[]).forEach((raw) => {
      if (!isObj(raw)) {
        this.fix('repairLessonDropped')
        return
      }
      const n = lessons.length + 1
      const l: Obj = { ...raw }
      const [id, newId] = this.claim(l.id, lessonIds, 'lesson')
      l.id = id
      if (newId) this.fix('repairLessonId', { n })
      if (typeof l.title !== 'string') {
        l.title = typeof l.title === 'number' ? String(l.title) : translate('content', 'lessonN', { n })
        this.fix('repairLessonTitle', { n, title: l.title as string })
      }
      if (l.status !== 'draft' && l.status !== 'published') {
        l.status = 'draft'
        this.fix('repairLessonStatus', { n })
      }
      if (!Array.isArray(l.blocks)) {
        l.blocks = []
        this.fix('repairLessonBlocks', { n })
      } else {
        l.blocks = this.blocks(l.blocks, l.title as string)
      }
      lessons.push(l)
    })
    c.lessons = lessons
    return c as unknown as Course
  }

  /** Blocks of one lesson (or the cover page); `where` names it in fixes. */
  private blocks(list: unknown[], where: string): Obj[] {
    const out: Obj[] = []
    for (const raw of list) {
      if (!isObj(raw)) {
        this.fix('repairBlockDropped', { where })
        continue
      }
      out.push(this.block(raw, where))
    }
    return out
  }

  private block(raw: Obj, where: string): Obj {
    const b: Obj = { ...raw }
    const type = isKnownType(b.type) ? b.type : null
    const label = typeof b.type === 'string' && b.type ? b.type : '?'
    const vars = { type: label, where }

    const [id, newId] = this.claim(b.id, this.blockIds, 'block')
    b.id = id
    if (newId) this.fix('repairBlockId', vars)
    if (!isObj(b.settings)) {
      b.settings = {}
      this.fix('repairBlockSettings', vars)
    }
    // Unknown types keep their data untouched (only made an object).
    if (!type) {
      if (!isObj(b.data)) b.data = {}
      return b
    }

    const defaults = createBlock(type).data as unknown as Obj
    if (!isObj(b.data)) {
      b.data = defaults
      this.fix('repairBlockData', vars)
      return b
    }
    const data: Obj = { ...b.data }
    for (const [key, def] of Object.entries(defaults)) {
      if (def === undefined) continue
      if (data[key] === undefined) {
        data[key] = def
        // Optional fields left out (an empty caption, false, an empty list)
        // are filled quietly; only a default that adds visible content (sample
        // text, sample items) is worth telling the author about.
        if ((typeof def === 'string' && def !== '') || (Array.isArray(def) && def.length > 0)) {
          this.fix('repairDataKey', { ...vars, key })
        }
        continue
      }
      const [value, changed] = coerce(def, data[key])
      if (changed) {
        data[key] = value
        this.fix('repairDataType', { ...vars, key })
      }
    }

    for (const [key, template] of Object.entries(ITEMS[type] ?? {})) {
      data[key] = this.items(data[key] as unknown[], template, true, { ...vars, key })
    }
    for (const [key, template] of Object.entries(PLAIN_ITEMS[type] ?? {})) {
      data[key] = this.items(data[key] as unknown[], template, false, { ...vars, key })
    }
    for (const key of STRING_LISTS[type] ?? []) data[key] = this.strings(data[key] as unknown[], { ...vars, key })
    if (type === 'comparison') {
      for (const col of data.columns as Obj[]) col.items = this.strings(col.items as unknown[], { ...vars, key: 'columns' })
    }
    if (type === 'table') data.rows = this.rows(data.rows as unknown[], { ...vars, key: 'rows' })
    if (type === 'scenario') {
      for (const node of data.nodes as Obj[]) {
        node.choices = this.items(node.choices as unknown[], CHOICE_TEMPLATE, true, { ...vars, key: 'choices' })
      }
    }
    if (type === 'quiz') data.questions = this.questions(data.questions as unknown[], vars)
    b.data = data
    return b
  }

  /** Items of a nested list: objects only, unique ids (when `withId`), and
   *  the template's fields present with the right types. */
  private items(list: unknown[], template: Obj, withId: boolean, vars: Record<string, string>): Obj[] {
    const seen = new Set<string>()
    const out: Obj[] = []
    for (const raw of list) {
      if (!isObj(raw)) {
        this.fix('repairItemDropped', vars)
        continue
      }
      const item: Obj = { ...raw }
      if (withId) {
        const [id, newId] = this.claim(item.id, seen, 'item')
        item.id = id
        if (newId) this.fix('repairItemId', vars)
      }
      for (const [field, def] of Object.entries(template)) {
        const [value, changed] = item[field] === undefined ? [clone(def), true] : coerce(def, item[field])
        if (changed) {
          item[field] = value
          this.fix('repairItemField', { ...vars, field })
        }
      }
      out.push(item)
    }
    return out
  }

  private strings(list: unknown[], vars: Record<string, string>): string[] {
    if (!Array.isArray(list)) {
      this.fix('repairDataType', vars)
      return []
    }
    return list.map((v) => {
      const [value, changed] = coerce('', v)
      if (changed) this.fix('repairItemField', { ...vars, field: 'text' })
      return value as string
    })
  }

  private rows(rows: unknown[], vars: Record<string, string>): string[][] {
    return rows.map((row) => {
      if (Array.isArray(row)) return this.strings(row, vars)
      this.fix('repairItemDropped', vars)
      return []
    })
  }

  private questions(list: unknown[], vars: Record<string, string>): Obj[] {
    const questions = this.items(list, { prompt: '' }, true, { ...vars, key: 'questions' })
    for (const q of questions) {
      if (!QUESTION_TYPES.includes(q.type as never)) {
        // Infer the type from the fields the question has.
        q.type = Array.isArray(q.pairs) ? 'matching'
          : Array.isArray(q.items) ? 'sequence'
          : typeof q.text === 'string' && !Array.isArray(q.options) ? 'fillBlanks'
          : 'single'
        this.fix('repairQuestionType', { where: vars.where, qtype: q.type as string })
      }
      const nested = QUESTION_ITEMS[q.type as string]
      if (nested) {
        const [field, template] = nested
        if (!Array.isArray(q[field])) {
          q[field] = []
          this.fix('repairDataType', { ...vars, key: field })
        }
        q[field] = this.items(q[field] as unknown[], template, true, { ...vars, key: field })
      } else if (typeof q.text !== 'string') {
        q.text = ''
        this.fix('repairItemField', { ...vars, key: 'questions', field: 'text' })
      }
    }
    return questions
  }
}

/** Repair a parsed project.json (must already have a `lessons` array). */
export function repairCourse(input: unknown): { course: Course; fixes: RepairFix[] } {
  const r = new Repairer()
  const source: Obj = isObj(input) ? input : { lessons: [] }
  if (!Array.isArray(source.lessons)) source.lessons = []
  const course = r.course(source)
  return { course, fixes: r.fixes }
}

function english(fix: RepairFix): string {
  let s = DICTIONARY.common.en[fix.key] ?? fix.key
  for (const [k, v] of Object.entries(fix.vars ?? {})) s = s.split(`{${k}}`).join(String(v))
  return s
}

/** Tell the author what was repaired: a toast with the count, and the list
 *  (in English, identical entries grouped) in the console. */
export function reportRepairs(fixes: RepairFix[]): void {
  if (!fixes.length) return
  const counts = new Map<string, number>()
  for (const f of fixes) {
    const line = english(f)
    counts.set(line, (counts.get(line) ?? 0) + 1)
  }
  console.info(
    `[Scormly] Repaired project.json (${fixes.length}):\n` +
      [...counts].map(([line, n]) => `- ${line}${n > 1 ? ` (×${n})` : ''}`).join('\n'),
  )
  toast({ id: 'repairs', tone: 'info', message: translate('common', 'repairSummary', { n: fixes.length }) })
}
