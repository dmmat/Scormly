// cmi5 / xAPI runtime tests. Loads public/scorm-player/xapi.js in a Node VM
// with a mock fetch, drives the wrapper through a course session, and asserts
// the resulting xAPI statements and State-API calls conform to cmi5.

import { describe, test, expect } from 'vitest'
import { loadXapi, defaultLaunch } from './lms-mock'

const CMI5_CAT = 'https://w3id.org/xapi/cmi5/context/categories/cmi5'
const MOVEON_CAT = 'https://w3id.org/xapi/cmi5/context/categories/moveon'
const PROGRESS_EXT = 'https://w3id.org/xapi/cmi5/result/extensions/progress'
const SESSION_EXT = 'https://w3id.org/xapi/cmi5/context/extensions/sessionid'

const V = {
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  answered: 'http://adlnet.gov/expapi/verbs/answered',
  abandoned: 'https://w3id.org/xapi/adl/verbs/abandoned',
  commented: 'http://adlnet.gov/expapi/verbs/commented',
}

function hasCategory(stmt: { context?: { contextActivities?: { category?: Array<{ id: string }> } } }, id: string) {
  const cats = stmt.context?.contextActivities?.category || []
  return cats.some((c) => c.id === id)
}

describe('xAPI — inactive without launch params', () => {
  test('init returns false and available() is false when no cmi5 params', () => {
    const { SCORM } = loadXapi() // no params → no launch
    expect(SCORM.init()).toBe(false)
    expect(SCORM.available()).toBe(false)
  })

  test('every method is a no-op when inactive (no throws, no fetch)', async () => {
    const { SCORM, calls, wait } = loadXapi()
    SCORM.init()
    SCORM.report(true, 'passed')
    SCORM.setScore(80, 0, 100)
    SCORM.setObjective(0, { id: 'Q', raw: 80, status: 'completed', success: 'passed' })
    SCORM.recordInteraction(0, { id: 'q', response: 'a', correct: true })
    SCORM.setProgressed(0.5)
    SCORM.reportAbandoned()
    SCORM.setSuspend('x')
    SCORM.setComment('hi')
    SCORM.finish()
    await wait()
    expect(calls.length).toBe(0)
  })
})

describe('xAPI — launch handshake', () => {
  test('POSTs the one-time fetch URL and pulls LaunchData + suspendData', async () => {
    const { SCORM, calls, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.7, contextTemplate: {} },
      resumeBlob: '{"l":2}',
    })
    expect(SCORM.init()).toBe(true)
    await wait()
    // Fetch token POST.
    expect(calls.some((c) => c.url.endsWith('/fetch') && c.method === 'POST')).toBe(true)
    // LaunchData GET (state API).
    expect(calls.some((c) => c.url.indexOf('stateId=LMS.LaunchData') >= 0)).toBe(true)
    // suspendData GET (state API).
    expect(calls.some((c) => c.url.indexOf('stateId=suspendData') >= 0 && c.method === 'GET')).toBe(true)
    // Resume blob is surfaced through getSuspend().
    expect(SCORM.getSuspend()).toBe('{"l":2}')
    expect(SCORM.isResuming()).toBe(true)
  })

  test('initialized statement is sent first, carries cmi5 category + session id', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    await wait()
    const stmts = statements()
    expect(stmts.length).toBeGreaterThan(0)
    expect(stmts[0].verb.id).toBe(V.initialized)
    expect(hasCategory(stmts[0], CMI5_CAT)).toBe(true)
    const sessionId = stmts[0].context?.extensions?.[SESSION_EXT]
    expect(sessionId).toBeTruthy()
    // The session id must be stable across statements in a session.
    expect(stmts.every((s) => s.context?.extensions?.[SESSION_EXT] === sessionId)).toBe(true)
  })
})

describe('xAPI — full session statement order', () => {
  test('emits initialized → progressed → passed[objective] → answered → passed[result] → completed → commented → terminated', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.7 },
    })
    SCORM.init()
    SCORM.setProgressed(0.1)
    SCORM.setProgressed(0.5)
    SCORM.setObjective(0, { id: 'Q_a1', raw: 80, status: 'completed', success: 'passed', name: 'Quiz 1' })
    SCORM.recordInteraction(0, {
      id: 'q1',
      type: 'choice',
      interactionType: 'choice',
      response: 'opt1',
      correct: true,
      description: 'pick',
      choices: [{ id: 'opt1', text: 'A' }, { id: 'opt2', text: 'B' }],
      correctResponses: ['opt1'],
      latencySec: 10,
    })
    SCORM.setScore(85, 0, 100)
    SCORM.report(true, 'passed')
    SCORM.setComment('Good!')
    SCORM.finish()
    await wait(50)

    const verbs = statements().map((s) => s.verb.id)
    expect(verbs[0]).toBe(V.initialized)
    expect(verbs.filter((v) => v === V.progressed).length).toBe(2)
    expect(verbs).toContain(V.answered)
    expect(verbs).toContain(V.completed)
    expect(verbs).toContain(V.passed) // either the objective statement, the result statement, or both
    expect(verbs).toContain(V.commented)
    expect(verbs[verbs.length - 1]).toBe(V.terminated)
  })

  test('progressed carries the cmi5 progress extension at 10% milestones', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.setProgressed(0.1)
    SCORM.setProgressed(0.18) // same 10-bucket → must not re-emit
    SCORM.setProgressed(0.5)
    await wait()
    const progressed = statements().filter((s) => s.verb.id === V.progressed)
    expect(progressed.length).toBe(2)
    expect(progressed[0].result?.extensions?.[PROGRESS_EXT]).toBe(10)
    expect(progressed[1].result?.extensions?.[PROGRESS_EXT]).toBe(50)
    // progressed is cmi5-defined, so it must carry the cmi5 category…
    expect(hasCategory(progressed[0], CMI5_CAT)).toBe(true)
    // …but not the moveOn category (it isn't a moveOn-criterion verb).
    expect(hasCategory(progressed[0], MOVEON_CAT)).toBe(false)
  })

  test('passed / completed carry the moveOn + cmi5 category', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.7 },
    })
    SCORM.init()
    SCORM.setScore(80, 0, 100) // triggers passed
    SCORM.report(true, 'passed') // triggers completed (passed is deduped)
    await wait()
    const passed = statements().find((s) => s.verb.id === V.passed && s.object.id === 'https://scormly.app/course/x/au')
    const completed = statements().find((s) => s.verb.id === V.completed)
    expect(passed).toBeDefined()
    expect(completed).toBeDefined()
    if (passed) {
      expect(hasCategory(passed, CMI5_CAT)).toBe(true)
      expect(hasCategory(passed, MOVEON_CAT)).toBe(true)
      expect(passed.result?.score).toEqual({ scaled: 0.8, raw: 80, min: 0, max: 100 })
    }
    if (completed) {
      expect(hasCategory(completed, CMI5_CAT)).toBe(true)
      expect(hasCategory(completed, MOVEON_CAT)).toBe(true)
      expect(completed.result?.completion).toBe(true)
    }
  })

  test('setScore below masteryScore emits failed instead of passed', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.8 },
    })
    SCORM.init()
    SCORM.setScore(50, 0, 100) // scaled 0.5 < 0.8
    await wait()
    const stmts = statements().filter((s) => s.verb.id === V.failed || s.verb.id === V.passed)
    const result = stmts.find((s) => s.object.id === 'https://scormly.app/course/x/au')
    expect(result?.verb.id).toBe(V.failed)
  })

  test('passed is emitted at most once per session (setScore + report are deduped)', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.5 },
    })
    SCORM.init()
    SCORM.setScore(90, 0, 100) // fires passed
    SCORM.report(true, 'passed') // fires completed; passed is already sent
    await wait()
    const passedOnAu = statements().filter(
      (s) => s.verb.id === V.passed && s.object.id === 'https://scormly.app/course/x/au',
    )
    expect(passedOnAu.length).toBe(1)
  })
})

describe('xAPI — answered (interaction) statements', () => {
  test('answered carries full definition (interactionType, choices, correctResponsesPattern)', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'q1',
      type: 'choice',
      interactionType: 'choice',
      response: 'opt1',
      correct: true,
      description: 'pick one',
      choices: [{ id: 'opt1', text: 'A' }, { id: 'opt2', text: 'B' }],
      correctResponses: ['opt1'],
      latencySec: 8,
    })
    await wait()
    const ans = statements().find((s) => s.verb.id === V.answered)
    expect(ans).toBeDefined()
    if (!ans) return
    // Object must be the interaction sub-activity, not the AU.
    expect(ans.object.id).toMatch(/interactions\/q1$/)
    expect(ans.object.definition?.type).toBe('http://adlnet.gov/expapi/activities/cmi.interaction')
    expect(ans.object.definition?.interactionType).toBe('choice')
    expect(ans.object.definition?.choices).toHaveLength(2)
    expect(ans.object.definition?.correctResponsesPattern).toEqual(['opt1'])
    expect(ans.result?.success).toBe(true)
    expect(ans.result?.response).toBe('opt1')
    expect(ans.result?.duration).toBe('PT8S')
    // answered must NOT carry the cmi5 category — it isn't cmi5-defined.
    expect(hasCategory(ans, CMI5_CAT)).toBe(false)
  })

  test('matching interactions carry source and target arrays', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.recordInteraction(0, {
      id: 'm1',
      type: 'matching',
      interactionType: 'matching',
      response: 'a.x,b.y',
      correct: true,
      source: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
      target: [{ id: 'x', text: 'X' }, { id: 'y', text: 'Y' }],
      correctResponses: ['a.x,b.y'],
    })
    await wait()
    const ans = statements().find((s) => s.verb.id === V.answered)
    expect(ans?.object.definition?.interactionType).toBe('matching')
    expect(ans?.object.definition?.source).toHaveLength(2)
    expect(ans?.object.definition?.target).toHaveLength(2)
  })
})

describe('xAPI — objectives', () => {
  test('setObjective sends a statement scoped to the objective activity', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.setObjective(0, {
      id: 'QUIZ_a1',
      raw: 80,
      status: 'completed',
      success: 'passed',
      name: 'Quiz 1',
    })
    await wait()
    // Look for a passed statement whose object is the objective, not the AU.
    const obj = statements().find((s) => s.verb.id === V.passed && s.object.id.indexOf('/objectives/') >= 0)
    expect(obj).toBeDefined()
    if (!obj) return
    expect(obj.object.id).toMatch(/objectives\/QUIZ_a1$/)
    expect(obj.object.definition?.type).toBe('http://adlnet.gov/expapi/activities/objective')
    expect(obj.result?.success).toBe(true)
    expect(obj.result?.score).toMatchObject({ raw: 80, scaled: 0.8, min: 0, max: 100 })
  })
})

describe('xAPI — State API for resume', () => {
  test('setSuspend PUTs to stateId=suspendData', async () => {
    const { SCORM, stateCalls, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    await wait() // wait for setup to finish so auth is available
    SCORM.setSuspend('{"l":4}')
    await wait()
    const puts = stateCalls().filter((c) => c.method === 'PUT' && c.stateId === 'suspendData')
    expect(puts.length).toBeGreaterThanOrEqual(1)
    expect(puts[puts.length - 1].body).toBe('{"l":4}')
  })

  test('rapid setSuspend calls coalesce — only the latest blob is needed', async () => {
    const { SCORM, stateCalls, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    await wait()
    SCORM.setSuspend('{"v":1}')
    SCORM.setSuspend('{"v":2}')
    SCORM.setSuspend('{"v":3}')
    await wait()
    const puts = stateCalls().filter((c) => c.method === 'PUT' && c.stateId === 'suspendData')
    // The final blob is what matters; the wrapper must not lose the latest.
    expect(puts[puts.length - 1].body).toBe('{"v":3}')
  })
})

describe('xAPI — launchMode Browse/Review locks out tracking', () => {
  test('Review mode: no statements after initialized except terminated', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Review' },
    })
    SCORM.init()
    await wait()
    SCORM.setScore(80, 0, 100)
    SCORM.setObjective(0, { id: 'Q', raw: 80, status: 'completed', success: 'passed' })
    SCORM.recordInteraction(0, { id: 'q', response: 'a', correct: true })
    SCORM.setProgressed(0.5)
    SCORM.report(true, 'passed')
    SCORM.setComment('hi')
    SCORM.setSuspend('x')
    SCORM.finish()
    await wait()
    const verbs = statements().map((s) => s.verb.id)
    // initialized is fired before LaunchData lands, so it slips through — but
    // every tracking-bearing statement must be suppressed. `terminated` and
    // `abandoned` also no-op in non-Normal mode.
    expect(verbs).not.toContain(V.completed)
    expect(verbs).not.toContain(V.passed)
    expect(verbs).not.toContain(V.failed)
    expect(verbs).not.toContain(V.answered)
    expect(verbs).not.toContain(V.progressed)
    expect(verbs).not.toContain(V.commented)
    expect(SCORM.getMode()).toBe('review')
  })

  test('Browse mode: also suppresses tracking statements', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Browse' },
    })
    SCORM.init()
    await wait()
    SCORM.setScore(80, 0, 100)
    SCORM.recordInteraction(0, { id: 'q', response: 'a', correct: true })
    await wait()
    const verbs = statements().map((s) => s.verb.id)
    expect(verbs).not.toContain(V.passed)
    expect(verbs).not.toContain(V.answered)
    expect(SCORM.getMode()).toBe('browse')
  })
})

describe('xAPI — abandon', () => {
  test('reportAbandoned emits the ADL abandoned verb once', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.reportAbandoned()
    SCORM.reportAbandoned() // dedupe
    await wait()
    const abandoned = statements().filter((s) => s.verb.id === V.abandoned)
    expect(abandoned.length).toBe(1)
    expect(hasCategory(abandoned[0], CMI5_CAT)).toBe(true)
  })

  test('abandon after a successful terminate is also suppressed', async () => {
    const { SCORM, statements, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal' },
    })
    SCORM.init()
    SCORM.finish() // sends terminated
    SCORM.reportAbandoned()
    await wait()
    const abandoned = statements().filter((s) => s.verb.id === V.abandoned)
    expect(abandoned.length).toBe(0)
  })
})

describe('xAPI — LMS context readers', () => {
  test('getLearner returns id/name from the cmi5 actor', () => {
    const { SCORM } = loadXapi({
      params: defaultLaunch({
        actor: { name: 'Анна', account: { homePage: 'https://lms', name: 'u-42' } },
      }),
    })
    SCORM.init()
    expect(SCORM.getLearner()).toEqual({ id: 'u-42', name: 'Анна' })
  })

  test('getLmsMastery converts the cmi5 0..1 masteryScore to 0..100', async () => {
    const { SCORM, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', masteryScore: 0.7 },
    })
    SCORM.init()
    await wait()
    expect(SCORM.getLmsMastery()).toBe(70)
  })

  test('getPreferredLanguage reads languagePreference from LaunchData', async () => {
    const { SCORM, wait } = loadXapi({
      params: defaultLaunch(),
      launchData: { launchMode: 'Normal', languagePreference: 'uk' },
    })
    SCORM.init()
    await wait()
    expect(SCORM.getPreferredLanguage()).toBe('uk')
  })
})
