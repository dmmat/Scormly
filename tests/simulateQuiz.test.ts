// "Complete the test" shortcut in the preview (src/preview/simulateQuiz.ts).

import { describe, test, expect } from 'vitest'
import { LANGUAGES } from '../src/i18n/types'
import type { Question } from '../src/types/course'
import { isAnswerCorrect, quizScore, simulatedAnswers } from '../src/preview/simulateQuiz'
import { makeSampleCourse } from '../src/lib/sampleCourse'

const opt = (id: string, correct: boolean) => ({ id, text: id, correct })

const questions: Question[] = [
  { id: 'q1', type: 'single', prompt: '1', options: [opt('a', false), opt('b', true)] },
  { id: 'q2', type: 'multiple', prompt: '2', options: [opt('c', true), opt('d', false), opt('e', true)] },
  {
    id: 'q3',
    type: 'matching',
    prompt: '3',
    pairs: [
      { id: 'p1', left: 'Cat', right: 'Animal' },
      { id: 'p2', left: 'Rose', right: 'Plant' },
    ],
  },
  { id: 'q4', type: 'sequence', prompt: '4', items: [{ id: 'i1', text: 'A' }, { id: 'i2', text: 'B' }, { id: 'i3', text: 'C' }] },
  { id: 'q5', type: 'fillBlanks', prompt: '5', mode: 'select', text: 'Paris is in [France], Rome in [Italy|italia].' },
]

describe('simulated quiz answers', () => {
  test('pass answers every question right', () => {
    const answers = simulatedAnswers(questions, 80, 'pass')!
    expect(questions.every((q) => isAnswerCorrect(q, answers[q.id]))).toBe(true)
    expect(quizScore(questions, answers)).toBe(100)
  })

  test('fail stays just under the passing score, wrong answers at the end', () => {
    const answers = simulatedAnswers(questions, 80, 'fail')!
    expect(quizScore(questions, answers)).toBe(60)
    expect(questions.map((q) => isAnswerCorrect(q, answers[q.id]))).toEqual([true, true, true, false, false])
  })

  test('every question type gets a wrong answer it really grades as wrong', () => {
    for (const q of questions) {
      const answers = simulatedAnswers([q], 100, 'fail')
      expect(answers, q.type).not.toBeNull()
      expect(isAnswerCorrect(q, answers![q.id]), q.type).toBe(false)
    }
  })

  test('no outcome that the quiz cannot reach', () => {
    expect(simulatedAnswers(questions, 0, 'fail')).toBeNull()
    expect(simulatedAnswers([], 80, 'pass')).toBeNull()
    // One item is always in order, so the question can't be failed.
    const oneItem: Question = { id: 'q', type: 'sequence', prompt: '', items: [{ id: 'x', text: 'X' }] }
    expect(simulatedAnswers([oneItem], 50, 'fail')).toBeNull()
    // No correct option: it can't be passed.
    const noCorrect: Question = { id: 'q', type: 'single', prompt: '', options: [opt('a', false), opt('b', false)] }
    expect(simulatedAnswers([noCorrect], 50, 'pass')).toBeNull()
  })

  test('the sample course test can be completed both ways', () => {
    for (const { id: lang } of LANGUAGES) {
      const quiz = makeSampleCourse(lang).lessons.flatMap((l) => l.blocks).find((b) => b.type === 'quiz')
      if (quiz?.type !== 'quiz') throw new Error('no quiz')
      const { questions: qs, passingScore } = quiz.data
      expect(quizScore(qs, simulatedAnswers(qs, passingScore, 'pass')!)).toBe(100)
      expect(quizScore(qs, simulatedAnswers(qs, passingScore, 'fail')!)).toBeLessThan(passingScore)
    }
  })
})
