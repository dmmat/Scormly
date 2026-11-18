// Pure helpers for the fill-in-the-blanks block. The author writes text with
// blanks in square brackets ("The capital of France is [Paris|paris]."),
// where `|` separates accepted alternatives and the first one is canonical.
//
// The SCORM player (public/scorm-player/player.js) mirrors this logic in
// vanilla JS; keep the two in sync.

export type BlankSegment =
  | { kind: 'text'; text: string }
  | { kind: 'blank'; index: number; answers: string[] }

// A blank is `[` … `]` with no nested brackets or line breaks inside.
const BLANK_RE = /\[([^[\]\n]*)\]/g

/** Split the text into literal runs and blanks (numbered from 0). A bracket
 *  pair with no non-empty alternative (e.g. "[]" or "[ | ]") stays literal. */
export function parseBlanks(text: string): BlankSegment[] {
  const out: BlankSegment[] = []
  let last = 0
  let index = 0
  const pushText = (t: string) => {
    if (!t) return
    const prev = out[out.length - 1]
    if (prev && prev.kind === 'text') prev.text += t
    else out.push({ kind: 'text', text: t })
  }
  for (const m of text.matchAll(BLANK_RE)) {
    const answers = m[1].split('|').map((a) => a.trim()).filter(Boolean)
    const start = m.index ?? 0
    pushText(text.slice(last, start))
    if (answers.length) out.push({ kind: 'blank', index: index++, answers })
    else pushText(m[0])
    last = start + m[0].length
  }
  pushText(text.slice(last))
  return out
}

/** Accepted answers for every blank, in order (first = canonical). */
export function blankAnswers(text: string): string[][] {
  return parseBlanks(text).flatMap((s) => (s.kind === 'blank' ? [s.answers] : []))
}

/** Trim, collapse inner whitespace and (unless case-sensitive) lowercase. */
export function normalizeAnswer(value: string, caseSensitive = false): string {
  const s = value.trim().replace(/\s+/g, ' ')
  return caseSensitive ? s : s.toLowerCase()
}

export function isBlankCorrect(
  answers: string[],
  response: string | undefined,
  caseSensitive = false,
): boolean {
  if (!response) return false
  const r = normalizeAnswer(response, caseSensitive)
  return answers.some((a) => normalizeAnswer(a, caseSensitive) === r)
}

/** Percentage (0–100, rounded) of blanks answered correctly. */
export function scoreBlanks(
  blanks: string[][],
  responses: (string | undefined)[],
  caseSensitive = false,
): number {
  if (!blanks.length) return 0
  const ok = blanks.filter((answers, i) => isBlankCorrect(answers, responses[i], caseSensitive)).length
  return Math.round((ok / blanks.length) * 100)
}

/** Options for 'select' mode: every blank's canonical answer, de-duplicated
 *  (callers shuffle them). */
export function selectOptions(blanks: string[][]): string[] {
  return [...new Set(blanks.map((a) => a[0]))]
}
