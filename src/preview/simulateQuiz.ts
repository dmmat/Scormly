import type { Question } from '../types/course'
import { blankAnswers, isBlankCorrect } from '../blocks/fillBlanks'

// Quiz grading for the preview, plus the author's "Complete the test" shortcut:
// answers that pass or fail the quiz, so the result screens and the gates
// after it can be checked without answering by hand.

/** single: option id; multiple: option ids; matching: pair id → right text;
 *  sequence: item ids in the learner's order; fillBlanks: one response per blank. */
export type QuizAnswer = string | string[] | Record<string, string>

export function isAnswerCorrect(q: Question, a: QuizAnswer | undefined): boolean {
  switch (q.type) {
    case 'single':
      return !!q.options.find((o) => o.id === a)?.correct
    case 'multiple': {
      const chosen = new Set(Array.isArray(a) ? a : [])
      const correct = q.options.filter((o) => o.correct).map((o) => o.id)
      return chosen.size === correct.length && correct.every((id) => chosen.has(id))
    }
    case 'matching': {
      const map = a && typeof a === 'object' && !Array.isArray(a) ? a : {}
      return q.pairs.every((p) => map[p.id] === p.right)
    }
    case 'sequence': {
      const order = Array.isArray(a) ? a : []
      return q.items.every((it, i) => order[i] === it.id)
    }
    case 'fillBlanks': {
      const responses = Array.isArray(a) ? a : []
      const strict = q.mode === 'type' && !!q.caseSensitive
      const blanks = blankAnswers(q.text)
      return blanks.length > 0 && blanks.every((ans, i) => isBlankCorrect(ans, responses[i], strict))
    }
  }
}

function rightAnswer(q: Question): QuizAnswer {
  switch (q.type) {
    case 'single':
      return q.options.find((o) => o.correct)?.id ?? ''
    case 'multiple':
      return q.options.filter((o) => o.correct).map((o) => o.id)
    case 'matching':
      return Object.fromEntries(q.pairs.map((p) => [p.id, p.right]))
    case 'sequence':
      return q.items.map((it) => it.id)
    case 'fillBlanks':
      return blankAnswers(q.text).map((answers) => answers[0])
  }
}

/** A plausible wrong answer (another option, a shuffled order…), or null
 *  when the question can't be answered wrong. */
function wrongAnswer(q: Question): QuizAnswer | null {
  let a: QuizAnswer
  switch (q.type) {
    case 'single':
      a = q.options.find((o) => !o.correct)?.id ?? ''
      break
    case 'multiple':
      a = q.options.filter((o) => !o.correct).map((o) => o.id)
      break
    case 'matching': {
      const rights = [...new Set(q.pairs.map((p) => p.right))]
      a = Object.fromEntries(q.pairs.map((p) => [p.id, rights.find((r) => r !== p.right) ?? '']))
      break
    }
    case 'sequence':
      a = q.items.map((it) => it.id).reverse()
      break
    case 'fillBlanks': {
      const blanks = blankAnswers(q.text)
      const strict = q.mode === 'type' && !!q.caseSensitive
      // Another blank's answer where it doesn't fit, else left empty.
      a = blanks.map((answers) => blanks.map((b) => b[0]).find((o) => !isBlankCorrect(answers, o, strict)) ?? '')
      break
    }
  }
  return isAnswerCorrect(q, a) ? null : a
}

export function quizScore(questions: Question[], answers: Record<string, QuizAnswer>): number {
  if (!questions.length) return 0
  const right = questions.filter((q) => isAnswerCorrect(q, answers[q.id])).length
  return Math.round((right / questions.length) * 100)
}

/**
 * Answers for the "Complete the test" shortcut. 'pass' answers everything
 * right; 'fail' answers as many right as it can while staying under the
 * passing score (so the result shows a mix), the wrong ones at the end.
 * Null when the outcome can't be reached (e.g. 'fail' at a 0% passing score).
 */
export function simulatedAnswers(
  questions: Question[],
  passingScore: number,
  outcome: 'pass' | 'fail',
): Record<string, QuizAnswer> | null {
  if (!questions.length) return null
  const answers: Record<string, QuizAnswer> = {}
  for (const q of questions) answers[q.id] = rightAnswer(q)
  if (outcome === 'fail') {
    // Answer wrong from the last question up until the score drops below the pass mark.
    for (let i = questions.length - 1; i >= 0 && quizScore(questions, answers) >= passingScore; i--) {
      const wrong = wrongAnswer(questions[i])
      if (wrong !== null) answers[questions[i].id] = wrong
    }
  }
  const passed = quizScore(questions, answers) >= passingScore
  return passed === (outcome === 'pass') ? answers : null
}
