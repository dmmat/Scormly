// SCORM 1.2 + 2004 runtime wrapper tests. Loads public/scorm-player/scorm.js
// in a Node VM with a mock LMS, then asserts the values it writes through the
// SCORM API conform to the SCORM data model.

import { describe, test, expect, vi } from 'vitest'
import { makeScormApi, loadScorm } from './lms-mock'

describe('SCORM wrapper — discovery + lifecycle', () => {
  test('finds API_1484_11 first and reports 2004 mode', () => {
    const { SCORM, calls } = loadScorm('2004')
    expect(SCORM.init()).toBe(true)
    expect(calls.init).toBe(1)
    SCORM.finish()
    expect(calls.terminate).toBe(1)
    expect(calls.commit).toBe(1) // finish() commits before terminating
  })

  test('falls back to API (1.2) when no 2004 API exists', () => {
    const { SCORM, calls } = loadScorm('1.2')
    expect(SCORM.init()).toBe(true)
    expect(calls.init).toBe(1)
    SCORM.finish()
    expect(calls.terminate).toBe(1)
  })

  test('whenReady calls back synchronously (SCORM API is synchronous)', () => {
    const { SCORM } = loadScorm('2004', { 'cmi.suspend_data': '{"l":1}' })
    SCORM.init()
    let got = ''
    SCORM.whenReady(() => { got = SCORM.getSuspend() })
    expect(got).toBe('{"l":1}')
  })

  test('finish is idempotent', () => {
    const { SCORM } = loadScorm('1.2')
    SCORM.init()
    SCORM.finish()
    expect(() => SCORM.finish()).not.toThrow()
  })
})

describe('SCORM 2004 — data model writes', () => {
  test('report(completed, success) maps to completion_status + success_status', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.report(true, 'passed')
    expect(data['cmi.completion_status']).toBe('completed')
    expect(data['cmi.success_status']).toBe('passed')
  })

  test('setScore writes raw/min/max/scaled (clamped to 0..1)', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setScore(85, 0, 100)
    expect(data['cmi.score.raw']).toBe('85')
    expect(data['cmi.score.min']).toBe('0')
    expect(data['cmi.score.max']).toBe('100')
    expect(data['cmi.score.scaled']).toBe('0.8500')
    SCORM.setScore(200, 0, 100)
    expect(data['cmi.score.scaled']).toBe('1.0000')
  })

  test('setProgress writes progress_measure 0..1 with 4 decimal places', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setProgress(0.5)
    expect(data['cmi.progress_measure']).toBe('0.5000')
    SCORM.setProgress(1.5)
    expect(data['cmi.progress_measure']).toBe('1.0000')
  })

  test('setObjective writes id, score, scaled, completion_status, success_status', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setObjective(0, {
      id: 'QUIZ_q1',
      raw: 75,
      min: 0,
      max: 100,
      status: 'completed',
      success: 'passed',
    })
    expect(data['cmi.objectives.0.id']).toBe('QUIZ_q1')
    expect(data['cmi.objectives.0.score.raw']).toBe('75')
    expect(data['cmi.objectives.0.score.scaled']).toBe('0.7500')
    expect(data['cmi.objectives.0.completion_status']).toBe('completed')
    expect(data['cmi.objectives.0.success_status']).toBe('passed')
  })

  test('recordInteraction writes the full interaction with optional fields', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'q1',
      type: 'choice',
      response: 'opt1',
      correct: true,
      weight: 1,
      latencySec: 12,
      description: 'pick one',
      correctResponses: ['opt1'],
      objectiveId: 'QUIZ_q1',
    })
    expect(data['cmi.interactions.0.id']).toBe('q1')
    expect(data['cmi.interactions.0.type']).toBe('choice')
    expect(data['cmi.interactions.0.learner_response']).toBe('opt1')
    expect(data['cmi.interactions.0.result']).toBe('correct')
    expect(data['cmi.interactions.0.weighting']).toBe('1')
    expect(data['cmi.interactions.0.latency']).toBe('PT0H0M12S')
    expect(data['cmi.interactions.0.description']).toBe('pick one')
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('opt1')
    expect(data['cmi.interactions.0.objectives.0.id']).toBe('QUIZ_q1')
    expect(data['cmi.interactions.0.timestamp']).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('setComment indexes cmi.comments_from_learner.n.comment', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setComment('Перший')
    SCORM.setComment('Другий')
    expect(data['cmi.comments_from_learner.0.comment']).toBe('Перший')
    expect(data['cmi.comments_from_learner.1.comment']).toBe('Другий')
    expect(data['cmi.comments_from_learner.0.timestamp']).toMatch(/^\d{4}/)
  })

  test('setSessionTime writes an ISO-8601 duration', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setSessionTime(3725)
    expect(data['cmi.session_time']).toBe('PT1H2M5S')
  })

  test('setExit writes cmi.exit', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setExit('suspend')
    expect(data['cmi.exit']).toBe('suspend')
  })
})

describe('SCORM 1.2 — data model writes', () => {
  test('init sets lesson_status to incomplete on first attempt', () => {
    const { SCORM, data } = loadScorm('1.2', { 'cmi.core.lesson_status': 'not attempted' })
    SCORM.init()
    expect(data['cmi.core.lesson_status']).toBe('incomplete')
  })

  test('report uses cmi.core.lesson_status (success overrides completed)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.report(true, 'failed')
    expect(data['cmi.core.lesson_status']).toBe('failed')

    const b = loadScorm('1.2')
    b.SCORM.init()
    b.SCORM.report(true, null)
    expect(b.data['cmi.core.lesson_status']).toBe('completed')
  })

  test('setScore writes core.score.raw/min/max (no scaled in 1.2) once the attempt is complete', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setScore(70, 0, 100)
    // With a mastery score the LMS may turn any raw score into passed/failed.
    expect(data['cmi.core.score.raw']).toBeUndefined()
    SCORM.report(false, null)
    expect(data['cmi.core.score.raw']).toBeUndefined()
    SCORM.report(true, 'failed')
    expect(data['cmi.core.score.raw']).toBe('70')
    expect(data['cmi.core.score.min']).toBe('0')
    expect(data['cmi.core.score.max']).toBe('100')
    expect(data['cmi.core.score.scaled']).toBeUndefined()
  })

  test('setProgress is a no-op for 1.2 (no progress_measure)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setProgress(0.5)
    expect(data['cmi.progress_measure']).toBeUndefined()
    expect(data['cmi.core.progress_measure']).toBeUndefined()
  })

  test('setObjective collapses status (no success_status in 1.2)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setObjective(0, {
      id: 'QUIZ_q1',
      raw: 75,
      status: 'completed',
      success: 'passed',
    })
    expect(data['cmi.objectives.0.id']).toBe('QUIZ_q1')
    expect(data['cmi.objectives.0.score.raw']).toBe('75')
    expect(data['cmi.objectives.0.status']).toBe('passed')
    expect(data['cmi.objectives.0.completion_status']).toBeUndefined()
    expect(data['cmi.objectives.0.success_status']).toBeUndefined()
  })

  test('recordInteraction uses student_response + HH:MM:SS time/latency', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'q1',
      type: 'choice',
      response: 'opt1',
      correct: false,
      latencySec: 65,
      correctResponses: ['opt1', 'opt2'],
    })
    expect(data['cmi.interactions.0.student_response']).toBe('opt1')
    expect(data['cmi.interactions.0.result']).toBe('wrong')
    expect(data['cmi.interactions.0.latency']).toBe('0000:01:05.00')
    expect(data['cmi.interactions.0.time']).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    // 1.2 reliably supports only correct_responses.0.pattern.
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('opt1')
    expect(data['cmi.interactions.0.correct_responses.1.pattern']).toBeUndefined()
  })

  test('setComment appends to a single cmi.comments string', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setComment('Перший')
    SCORM.setComment('Другий')
    expect(data['cmi.comments']).toBe('Перший\nДругий')
  })

  test('setSessionTime writes HHHH:MM:SS.SS', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setSessionTime(3725)
    expect(data['cmi.core.session_time']).toBe('0001:02:05.00')
  })

  test('setExit writes cmi.core.exit (1.2-specific path)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setExit('suspend')
    expect(data['cmi.core.exit']).toBe('suspend')
  })
})

describe('SCORM — LMS context readers', () => {
  test('reads learner id/name from cmi.learner_id/name (2004)', () => {
    const { SCORM } = loadScorm('2004', {
      'cmi.learner_id': 'u-42',
      'cmi.learner_name': 'Anna Test',
    })
    SCORM.init()
    expect(SCORM.getLearner()).toEqual({ id: 'u-42', name: 'Anna Test' })
  })

  test('reads learner id/name from cmi.core.student_id/name (1.2)', () => {
    const { SCORM } = loadScorm('1.2', {
      'cmi.core.student_id': 'u-42',
      'cmi.core.student_name': 'Анна',
    })
    SCORM.init()
    expect(SCORM.getLearner()).toEqual({ id: 'u-42', name: 'Анна' })
  })

  test('returns null learner when LMS provides neither id nor name', () => {
    const { SCORM } = loadScorm('2004', {
      'cmi.learner_id': '',
      'cmi.learner_name': '',
    })
    SCORM.init()
    expect(SCORM.getLearner()).toBeNull()
  })

  test('getMode reflects cmi.mode / cmi.core.lesson_mode', () => {
    const a = loadScorm('2004', { 'cmi.mode': 'review' })
    a.SCORM.init()
    expect(a.SCORM.getMode()).toBe('review')

    const b = loadScorm('1.2', { 'cmi.core.lesson_mode': 'browse' })
    b.SCORM.init()
    expect(b.SCORM.getMode()).toBe('browse')
  })

  test('isResuming reflects cmi.entry === resume', () => {
    const a = loadScorm('2004', { 'cmi.entry': 'resume' })
    a.SCORM.init()
    expect(a.SCORM.isResuming()).toBe(true)

    const b = loadScorm('2004', { 'cmi.entry': 'ab-initio' })
    b.SCORM.init()
    expect(b.SCORM.isResuming()).toBe(false)
  })

  test('getLmsMastery reads cmi.student_data.mastery_score in 1.2 only', () => {
    const a = loadScorm('1.2', { 'cmi.student_data.mastery_score': '70' })
    a.SCORM.init()
    expect(a.SCORM.getLmsMastery()).toBe(70)

    const b = loadScorm('2004')
    b.SCORM.init()
    expect(b.SCORM.getLmsMastery()).toBeNull()
  })

  test('getPreferredLanguage reads learner_preference.language (both versions)', () => {
    const a = loadScorm('2004', { 'cmi.learner_preference.language': 'uk' })
    a.SCORM.init()
    expect(a.SCORM.getPreferredLanguage()).toBe('uk')

    const b = loadScorm('1.2', { 'cmi.student_preference.language': 'en' })
    b.SCORM.init()
    expect(b.SCORM.getPreferredLanguage()).toBe('en')
  })

  test('getLaunchData reads cmi.launch_data', () => {
    const { SCORM } = loadScorm('2004', { 'cmi.launch_data': 'payload-xyz' })
    SCORM.init()
    expect(SCORM.getLaunchData()).toBe('payload-xyz')
  })
})

describe('SCORM — review / browse mode locks out tracking', () => {
  test('review mode: every write is a no-op', () => {
    const { SCORM, data } = loadScorm('2004', {
      'cmi.mode': 'review',
      'cmi.learner_id': 'x',
      'cmi.learner_name': 'x',
    })
    SCORM.init()
    const before = Object.keys(data).length
    SCORM.setScore(80, 0, 100)
    SCORM.setObjective(0, { id: 'Q1', raw: 80, status: 'completed', success: 'passed' })
    SCORM.recordInteraction(0, { id: 'q1', type: 'choice', response: 'a', correct: true })
    SCORM.report(true, 'passed')
    SCORM.setSuspend('x')
    SCORM.setLocation('1')
    SCORM.setExit('suspend')
    SCORM.setComment('note')
    SCORM.setSessionTime(60)
    SCORM.setProgress(0.5)
    expect(Object.keys(data).length - before).toBe(0)
  })

  test('browse mode: also no-ops', () => {
    const { SCORM, data } = loadScorm('1.2', { 'cmi.core.lesson_mode': 'browse' })
    SCORM.init()
    const before = Object.keys(data).length
    SCORM.setScore(80)
    SCORM.report(true, 'passed')
    expect(Object.keys(data).length - before).toBe(0)
  })
})

describe('SCORM — resume', () => {
  test('getSuspend reads cmi.suspend_data', () => {
    const { SCORM } = loadScorm('2004', { 'cmi.suspend_data': '{"l":3}' })
    SCORM.init()
    expect(SCORM.getSuspend()).toBe('{"l":3}')
  })

  test('setSuspend writes back to cmi.suspend_data', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setSuspend('{"l":5}')
    expect(data['cmi.suspend_data']).toBe('{"l":5}')
  })

  test('setLocation writes 2004 cmi.location and 1.2 core.lesson_location', () => {
    const a = loadScorm('2004')
    a.SCORM.init()
    a.SCORM.setLocation('lesson-2')
    expect(a.data['cmi.location']).toBe('lesson-2')

    const b = loadScorm('1.2')
    b.SCORM.init()
    b.SCORM.setLocation('lesson-2')
    expect(b.data['cmi.core.lesson_location']).toBe('lesson-2')
  })
})

describe('SCORM — cmi5-only methods are silent no-ops', () => {
  // setProgressed and reportAbandoned exist so the player can call them
  // unconditionally; the SCORM implementation must not throw or write.
  test('setProgressed does nothing', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setProgressed(0.5)
    expect(data['cmi.progressed']).toBeUndefined()
  })
  test('reportAbandoned does nothing', () => {
    const { SCORM } = loadScorm('2004')
    SCORM.init()
    expect(() => SCORM.reportAbandoned()).not.toThrow()
  })
})

describe('SCORM — array responses (sequencing / matching / fill-in)', () => {
  test('2004 joins lists with [,] and matching pairs with [.]', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'ord1', type: 'sequencing', response: ['b', 'a', 'c'], correct: false,
      correctResponses: [['a', 'b', 'c']],
    })
    SCORM.recordInteraction(1, {
      id: 'ord2', type: 'matching', response: [['i1', 'x'], ['i2', 'y']], correct: true,
      correctResponses: [[['i1', 'x'], ['i2', 'y']]],
    })
    expect(data['cmi.interactions.0.type']).toBe('sequencing')
    expect(data['cmi.interactions.0.learner_response']).toBe('b[,]a[,]c')
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('a[,]b[,]c')
    expect(data['cmi.interactions.1.learner_response']).toBe('i1[.]x[,]i2[.]y')
    expect(data['cmi.interactions.1.correct_responses.0.pattern']).toBe('i1[.]x[,]i2[.]y')
  })

  test('2004 fill-in: every alternative is a pattern; case_matters only when flagged', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.recordInteraction(0, { id: 'fb_1', type: 'fill-in', response: 'paris', correct: true, correctResponses: ['Paris', 'Paname'] })
    SCORM.recordInteraction(1, { id: 'fb_2', type: 'fill-in', response: 'Oslo', correct: true, correctResponses: ['Oslo'], caseMatters: true })
    expect(data['cmi.interactions.0.learner_response']).toBe('paris')
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('Paris')
    expect(data['cmi.interactions.0.correct_responses.1.pattern']).toBe('Paname')
    expect(data['cmi.interactions.1.correct_responses.0.pattern']).toBe('{case_matters=true}Oslo')
  })

  test('1.2 joins with , and . and caps student_response at 255 chars', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'ord1', type: 'sequencing', response: ['b', 'a'], correct: false, correctResponses: [['a', 'b']],
    })
    SCORM.recordInteraction(1, {
      id: 'ord2', type: 'matching', response: [['i1', 'x']], correct: true, correctResponses: [[['i1', 'x']]],
    })
    SCORM.recordInteraction(2, {
      id: 'fb_1', type: 'fill-in', response: 'x'.repeat(300), correct: false, correctResponses: ['Oslo'], caseMatters: true,
    })
    expect(data['cmi.interactions.0.student_response']).toBe('b,a')
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('a,b')
    expect(data['cmi.interactions.1.student_response']).toBe('i1.x')
    expect(data['cmi.interactions.2.student_response']).toHaveLength(255)
    // No case_matters delimiter in 1.2.
    expect(data['cmi.interactions.2.correct_responses.0.pattern']).toBe('Oslo')
  })
})

describe('SCORM — LMS compatibility', () => {
  test('accepts an Initialize that returns a boolean instead of "true"', () => {
    const m = loadScorm('2004')
    m.api.Initialize = (() => true) as unknown as () => string
    m.api.SetValue = ((k: string, v: string) => { m.data[k] = v; return true }) as unknown as () => string
    expect(m.SCORM.init()).toBe(true)
    m.SCORM.report(true, null)
    expect(m.data['cmi.completion_status']).toBe('completed')
  })

  test('1.2 reports choice / matching ids by position (single characters)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    const opts = ['opt-6f1c2e8a-0000-4000-8000-000000000001', 'opt-6f1c2e8a-0000-4000-8000-000000000002', 'opt-6f1c2e8a-0000-4000-8000-000000000003']
    SCORM.recordInteraction(0, {
      id: 'q1', type: 'choice', response: [opts[0], opts[2]], correct: false,
      correctResponses: [[opts[1]]], choices: opts.map((id) => ({ id, text: id })),
    })
    SCORM.recordInteraction(1, {
      id: 'q2', type: 'matching', response: [['p1', 'p2'], ['p2', 'p1']], correct: false,
      correctResponses: [[['p1', 'p1'], ['p2', 'p2']]],
      source: [{ id: 'p1', text: 'A' }, { id: 'p2', text: 'B' }],
      target: [{ id: 'p1', text: '1' }, { id: 'p2', text: '2' }],
    })
    expect(data['cmi.interactions.0.student_response']).toBe('a,c')
    expect(data['cmi.interactions.0.correct_responses.0.pattern']).toBe('b')
    expect(data['cmi.interactions.1.student_response']).toBe('a.b,b.a')
    expect(data['cmi.interactions.1.correct_responses.0.pattern']).toBe('a.a,b.b')
  })

  test('2004 keeps the full ids', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'q1', type: 'choice', response: ['o1'], correct: true, correctResponses: [['o1']],
      choices: [{ id: 'o1', text: 'x' }],
    })
    expect(data['cmi.interactions.0.learner_response']).toBe('o1')
  })

  test('2004 reads cmi.scaled_passing_score as the LMS mastery (0..100)', () => {
    const { SCORM } = loadScorm('2004', { 'cmi.scaled_passing_score': '0.8' })
    SCORM.init()
    expect(SCORM.getLmsMastery()).toBe(80)
    const none = loadScorm('2004')
    none.SCORM.init()
    expect(none.SCORM.getLmsMastery()).toBe(null)
  })

  test('requestExit asks a 2004 LMS to suspend all; no-op on 1.2', () => {
    const a = loadScorm('2004')
    a.SCORM.init()
    a.SCORM.requestExit()
    expect(a.data['adl.nav.request']).toBe('suspendAll')
    const b = loadScorm('1.2')
    b.SCORM.init()
    b.SCORM.requestExit()
    expect(b.data['adl.nav.request']).toBeUndefined()
  })

  test('2004 falls back to the 4000-char suspend_data limit when the LMS rejects more', () => {
    const m = loadScorm('2004')
    const setValue = m.api.SetValue
    let rejected = false
    m.api.SetValue = ((k: string, v: string) => {
      if (k === 'cmi.suspend_data' && v.length > 4000) { rejected = true; return 'false' }
      return setValue(k, v)
    }) as unknown as () => string
    m.SCORM.init()
    expect(m.SCORM.suspendLimit()).toBe(64000)
    expect(m.SCORM.setSuspend('x'.repeat(5000))).toBe(false)
    expect(rejected).toBe(true)
    expect(m.SCORM.suspendLimit()).toBe(4000)
    expect(m.SCORM.setSuspend('x'.repeat(100))).toBe(true)
  })
})

describe('SCORM — statuses never downgrade', () => {
  test('2004: passed + completed survive a failed retake', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setScore(90)
    SCORM.report(true, 'passed')
    SCORM.setScore(40)
    SCORM.report(true, 'failed')
    expect(data['cmi.success_status']).toBe('passed')
    expect(data['cmi.score.raw']).toBe('90')
    SCORM.report(false, null)
    expect(data['cmi.completion_status']).toBe('completed')
  })

  test('2004: a status recorded in an earlier session is kept', () => {
    const { SCORM, data } = loadScorm('2004', {
      'cmi.completion_status': 'completed', 'cmi.success_status': 'passed', 'cmi.score.raw': '85',
    })
    SCORM.init()
    SCORM.setScore(50)
    SCORM.report(false, null)
    expect(data['cmi.completion_status']).toBe('completed')
    expect(data['cmi.success_status']).toBe('passed')
    expect(data['cmi.score.raw']).toBe('85')
  })

  test('2004: before passing, the latest score is written (retakes can improve it)', () => {
    const { SCORM, data } = loadScorm('2004')
    SCORM.init()
    SCORM.setScore(60)
    SCORM.report(true, 'failed')
    SCORM.setScore(50)
    expect(data['cmi.score.raw']).toBe('50')
    SCORM.setScore(95)
    SCORM.report(true, 'passed')
    expect(data['cmi.success_status']).toBe('passed')
  })

  test('1.2: passed stays passed; failed is not replaced by completed or incomplete', () => {
    const a = loadScorm('1.2', { 'cmi.core.lesson_status': 'passed' })
    a.SCORM.init()
    a.SCORM.report(false, null)
    expect(a.data['cmi.core.lesson_status']).toBe('passed')
    a.SCORM.report(true, 'failed')
    expect(a.data['cmi.core.lesson_status']).toBe('passed')

    const b = loadScorm('1.2', { 'cmi.core.lesson_status': 'failed' })
    b.SCORM.init()
    b.SCORM.report(true, null)
    expect(b.data['cmi.core.lesson_status']).toBe('failed')
    b.SCORM.report(true, 'passed')
    expect(b.data['cmi.core.lesson_status']).toBe('passed')

    const c = loadScorm('1.2', { 'cmi.core.lesson_status': 'completed' })
    c.SCORM.init()
    c.SCORM.report(false, null)
    expect(c.data['cmi.core.lesson_status']).toBe('completed')
  })
})

describe('SCORM — audio preference', () => {
  test('2004 audio_level 0 and 1.2 audio -1 mean sound off', () => {
    const a = loadScorm('2004', { 'cmi.learner_preference.audio_level': '0' })
    a.SCORM.init()
    expect((a.SCORM.getLearnerPreferences() as { audio: string }).audio).toBe('off')
    const b = loadScorm('1.2', { 'cmi.student_preference.audio': '-1' })
    b.SCORM.init()
    expect((b.SCORM.getLearnerPreferences() as { audio: string }).audio).toBe('off')
    const c = loadScorm('2004', { 'cmi.learner_preference.audio_level': '1' })
    c.SCORM.init()
    expect((c.SCORM.getLearnerPreferences() as { audio: string }).audio).toBe('')
  })
})

describe('SCORM — field findings (TalentLMS 1.2 log)', () => {
  // TalentLMS answers cmi.objectives.* with 401 "Not implemented".
  function withoutObjectives(version: '1.2' | '2004') {
    const m = loadScorm(version)
    const code = version === '2004' ? '402' : '401'
    const get = m.api[version === '2004' ? 'GetValue' : 'LMSGetValue']
    const set = m.api[version === '2004' ? 'SetValue' : 'LMSSetValue']
    let err = '0'
    const writes: string[] = []
    m.api[version === '2004' ? 'GetValue' : 'LMSGetValue'] = ((k: string) => {
      if (k.startsWith('cmi.objectives')) { err = code; return '' }
      err = '0'; return get(k)
    }) as unknown as () => string
    m.api[version === '2004' ? 'SetValue' : 'LMSSetValue'] = ((k: string, v: string) => {
      writes.push(k)
      if (k.startsWith('cmi.objectives')) { err = code; return 'false' }
      err = '0'; return set(k, v)
    }) as unknown as () => string
    m.api[version === '2004' ? 'GetLastError' : 'LMSGetLastError'] = (() => err) as () => string
    return { ...m, writes }
  }

  test.each(['1.2', '2004'] as const)('%s: objectives are skipped when the LMS does not implement them', (v) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { SCORM, writes } = withoutObjectives(v)
    SCORM.init()
    SCORM.setObjective(0, { id: 'QUIZ_q1', raw: 100, status: 'completed', success: 'passed' })
    SCORM.setObjective(1, { id: 'QUIZ_q2', raw: 100, status: 'completed', success: 'passed' })
    expect(writes.filter((k) => k.startsWith('cmi.objectives'))).toEqual([])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test('learner names in "Last, First" form are shown as "First Last"', () => {
    const a = loadScorm('1.2', { 'cmi.core.student_name': 'Shevchenko, Taras' })
    a.SCORM.init()
    expect(a.SCORM.getLearner()?.name).toBe('Taras Shevchenko')
    const b = loadScorm('2004', { 'cmi.learner_name': 'Doe, Jane, Q' })
    b.SCORM.init()
    expect(b.SCORM.getLearner()?.name).toBe('Jane Q Doe')
  })

  test('1.2 reads lesson_status only once at launch', () => {
    const m = loadScorm('1.2', { 'cmi.core.lesson_status': 'not attempted' })
    const get = m.api.LMSGetValue
    let reads = 0
    m.api.LMSGetValue = ((k: string) => { if (k === 'cmi.core.lesson_status') reads++; return get(k) }) as unknown as () => string
    m.SCORM.init()
    expect(reads).toBe(1)
    expect(m.data['cmi.core.lesson_status']).toBe('incomplete')
  })
})

describe('SCORM — API discovery and LMS rejections', () => {
  test('a 1.2 package uses the 1.2 API even when the LMS also exposes 2004', () => {
    const v2004 = makeScormApi('2004')
    const { SCORM, calls } = loadScorm('1.2', {}, { API_1484_11: v2004.api, __SCORMLY_SCORM__: '1.2' })
    SCORM.init()
    expect(calls.init).toBe(1)
    expect(v2004.calls.init).toBe(0)
  })

  test('without a version hint 2004 is preferred', () => {
    const v12 = makeScormApi('1.2')
    const { SCORM, calls } = loadScorm('2004', {}, { API: v12.api })
    SCORM.init()
    expect(calls.init).toBe(1)
    expect(v12.calls.init).toBe(0)
  })

  test('a rejected interaction id does not skip an index', () => {
    const { SCORM, data, api } = loadScorm('2004', { 'cmi.interactions._count': '0' })
    SCORM.init()
    const setValue = api.SetValue
    api.SetValue = (key, value) => (String(value) === 'bad id' ? 'false' : setValue(key, value))
    api.GetLastError = () => '406'
    SCORM.recordInteraction(0, { id: 'bad id', type: 'choice', response: 'a', correct: true })
    api.SetValue = setValue
    SCORM.recordInteraction(0, { id: 'q2', type: 'choice', response: 'a', correct: true })
    expect(data['cmi.interactions.0.id']).toBe('q2')
    expect(data['cmi.interactions.1.id']).toBeUndefined()
  })
})

