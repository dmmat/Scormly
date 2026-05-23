// SCORM 1.2 + 2004 runtime wrapper tests. Loads public/scorm-player/scorm.js
// in a Node VM with a mock LMS, then asserts the values it writes through the
// SCORM API conform to the SCORM data model.

import { describe, test, expect } from 'vitest'
import { loadScorm } from './lms-mock'

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

  test('setScore writes core.score.raw/min/max (no scaled in 1.2)', () => {
    const { SCORM, data } = loadScorm('1.2')
    SCORM.init()
    SCORM.setScore(70, 0, 100)
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
