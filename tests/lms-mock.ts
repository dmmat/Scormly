// Shared helpers for the SCORM and xAPI runtime tests.
// Loads the player scripts in a Node `vm` context with a mock LMS / LRS and
// exposes the in-memory state for assertions.

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLAYER_DIR = path.resolve(__dirname, '..', 'public', 'scorm-player')

function readPlayer(name: string): string {
  return fs.readFileSync(path.join(PLAYER_DIR, name), 'utf8')
}

export type ScormVersion = '1.2' | '2004'

export interface ScormMock {
  api: Record<string, (...args: unknown[]) => string>
  data: Record<string, string>
  calls: { init: number; set: number; get: number; commit: number; terminate: number }
  v2004: boolean
}

// Build a fake SCORM API (1.2 or 2004) with an in-memory data store.
export function makeScormApi(version: ScormVersion, preload: Record<string, string> = {}): ScormMock {
  const v2004 = version === '2004'
  const data: Record<string, string> = { ...preload }
  const verbs = v2004
    ? { init: 'Initialize', set: 'SetValue', get: 'GetValue', commit: 'Commit', term: 'Terminate', err: 'GetLastError', errs: 'GetErrorString' }
    : { init: 'LMSInitialize', set: 'LMSSetValue', get: 'LMSGetValue', commit: 'LMSCommit', term: 'LMSFinish', err: 'LMSGetLastError', errs: 'LMSGetErrorString' }
  let lastErr = '0'
  const calls = { init: 0, commit: 0, terminate: 0, set: 0, get: 0 }
  const api: Record<string, (...args: unknown[]) => string> = {
    [verbs.init]: () => { calls.init++; return 'true' },
    [verbs.set]: (key, value) => {
      calls.set++
      data[String(key)] = String(value)
      lastErr = '0'
      return 'true'
    },
    [verbs.get]: (key) => {
      calls.get++
      const k = String(key)
      if (k in data) { lastErr = '0'; return data[k] }
      lastErr = '403'
      return ''
    },
    [verbs.commit]: () => { calls.commit++; return 'true' },
    [verbs.term]: () => { calls.terminate++; return 'true' },
    [verbs.err]: () => lastErr,
    [verbs.errs]: () => '',
  }
  return { api, data, calls, v2004 }
}

// The cross-section of the wrapper used in tests. Mirrors window.SCORM at
// runtime — tests assert via this surface.
export interface ScormWrapper {
  init(): boolean
  report(completed: boolean, success: 'passed' | 'failed' | null): void
  setScore(raw: number, min?: number, max?: number): void
  setProgress(fraction: number): void
  setObjective(i: number, data: { id: string; raw?: number; min?: number; max?: number; status?: string; success?: 'passed' | 'failed' | null; name?: string }): void
  recordInteraction(i: number, data: Record<string, unknown>): void
  setComment(text: string): void
  setSuspend(str: string): void
  getSuspend(): string
  setLocation(str: string): void
  setExit(mode: string): void
  setSessionTime(seconds: number): void
  setProgressed(fraction: number): void
  reportAbandoned(): void
  getLearner(): { id: string; name: string } | null
  getMode(): string
  isResuming(): boolean
  getLaunchData(): string
  getLmsMastery(): number | null
  getPreferredLanguage(): string
  commit(): void
  finish(): void
  available(): boolean
}

export interface LoadedScorm extends ScormMock {
  SCORM: ScormWrapper
}

// Load scorm.js with the given mock API attached to `window`.
export function loadScorm(version: ScormVersion, preload: Record<string, string> = {}): LoadedScorm {
  const mock = makeScormApi(version, preload)
  const win: Record<string, unknown> = mock.v2004 ? { API_1484_11: mock.api } : { API: mock.api }
  const ctx: Record<string, unknown> = { window: win, console, location: { search: '' } }
  ;(win as { window?: unknown }).window = win
  vm.createContext(ctx)
  vm.runInContext(readPlayer('scorm.js'), ctx)
  const SCORM = (ctx.window as { SCORM: ScormWrapper }).SCORM
  return { ...mock, SCORM }
}

// ── cmi5 / xAPI mocks ────────────────────────────────────────────────────────

export interface XapiCall {
  url: string
  method: string
  body?: string
  headers?: Record<string, string>
}

export interface XapiFetchMock {
  fetch: (url: string, opts?: { method?: string; body?: string; headers?: Record<string, string> }) => Promise<{
    ok: boolean
    json?: () => Promise<unknown>
    text?: () => Promise<string>
  }>
  calls: XapiCall[]
}

export function makeXapiFetch(opts: { launchData?: Record<string, unknown>; resumeBlob?: string } = {}): XapiFetchMock {
  const launchData = opts.launchData || {}
  const resumeBlob = opts.resumeBlob || ''
  const calls: XapiCall[] = []
  function fetch(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
    const method = init?.method || 'GET'
    calls.push({ url, method, body: init?.body, headers: init?.headers })
    if (url.indexOf('/fetch') >= 0 && method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ 'auth-token': 'tok_abc' }) })
    }
    if (url.indexOf('stateId=LMS.LaunchData') >= 0) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(launchData) })
    }
    if (url.indexOf('stateId=suspendData') >= 0 && method !== 'PUT') {
      return Promise.resolve({ ok: !!resumeBlob, text: () => Promise.resolve(resumeBlob) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve('') })
  }
  return { fetch, calls }
}

export interface XapiLaunchParams {
  endpoint: string
  fetch: string
  actor: unknown
  activityId: string
  registration?: string
}

export function buildLaunchQuery(params: Record<string, unknown>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'string' ? v : JSON.stringify(v))}`)
    .join('&')
}

// xAPI statement shape (only the bits the tests look at).
export interface XapiStatement {
  id: string
  actor: unknown
  verb: { id: string; display: Record<string, string> }
  object: {
    id: string
    objectType?: string
    definition?: Record<string, unknown>
  }
  context?: {
    registration?: string
    contextActivities?: { category?: Array<{ id: string }> }
    extensions?: Record<string, unknown>
  }
  result?: {
    completion?: boolean
    success?: boolean
    duration?: string
    response?: string
    score?: { scaled?: number; raw?: number; min?: number; max?: number }
    extensions?: Record<string, unknown>
  }
  timestamp?: string
}

export interface LoadedXapi {
  SCORM: ScormWrapper
  calls: XapiCall[]
  statements: () => XapiStatement[]
  stateCalls: () => Array<{ method: string; stateId: string | undefined; body?: string }>
  wait: (idleMs?: number) => Promise<void>
}

export function loadXapi(opts: {
  launchData?: Record<string, unknown>
  resumeBlob?: string
  params?: XapiLaunchParams
  course?: Record<string, unknown>
} = {}): LoadedXapi {
  const { fetch, calls } = makeXapiFetch({ launchData: opts.launchData, resumeBlob: opts.resumeBlob })
  const win: Record<string, unknown> = {
    __SCORMLY_COURSE__: opts.course || { settings: { passingScore: 80 } },
  }
  const search = opts.params ? '?' + buildLaunchQuery(opts.params as unknown as Record<string, unknown>) : ''
  const ctx: Record<string, unknown> = {
    window: win,
    console,
    location: { search },
    fetch,
    setTimeout,
    clearTimeout,
  }
  ;(win as { window?: unknown }).window = win
  vm.createContext(ctx)
  vm.runInContext(readPlayer('xapi.js'), ctx)
  const SCORM = (ctx.window as { SCORM: ScormWrapper }).SCORM

  // Drain microtasks/timers until no new fetch calls happen for `idleMs`.
  async function wait(idleMs = 30): Promise<void> {
    let last = -1
    for (let i = 0; i < 50; i++) {
      const len = calls.length
      if (len === last) return
      last = len
      await new Promise((r) => setTimeout(r, idleMs))
    }
  }

  function statements(): XapiStatement[] {
    return calls
      .filter((c) => c.url.indexOf('/statements') >= 0 && c.method === 'POST')
      .map((c) => JSON.parse(String(c.body)) as XapiStatement)
  }

  function stateCalls() {
    return calls
      .filter((c) => c.url.indexOf('/activities/state') >= 0)
      .map((c) => ({
        method: c.method,
        stateId: /stateId=([^&]+)/.exec(c.url)?.[1],
        body: c.body,
      }))
  }

  return { SCORM, calls, statements, stateCalls, wait }
}

// Default cmi5 launch params used by most tests.
export function defaultLaunch(overrides: Partial<XapiLaunchParams> = {}): XapiLaunchParams {
  return {
    endpoint: 'https://lrs.example/xapi/',
    fetch: 'https://lms.example/fetch',
    actor: { name: 'Test Learner', account: { homePage: 'https://lms.example', name: 'u-42' } },
    activityId: 'https://scormly.app/course/x/au',
    registration: 'reg-1',
    ...overrides,
  }
}
