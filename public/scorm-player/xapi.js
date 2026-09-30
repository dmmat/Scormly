/* cmi5 / xAPI runtime. Exposes the SAME interface as scorm.js (window.SCORM) so
   player.js works unchanged, but reports to an LRS using cmi5-defined xAPI
   statements. Active only when launched with cmi5 parameters in the URL
   (endpoint, fetch, actor, activityId, registration); otherwise it no-ops, e.g.
   when previewing the package without an LMS.

   cmi5 launch contract (AU side):
     1. POST to the one-time `fetch` URL to obtain the auth token.
     2. GET the LMS.LaunchData state (auMode, masteryScore, contextTemplate,
        launchParameters, returnURL, …).
     3. Send `initialized` first; then during the session — `completed`,
        `passed`/`failed`, plus the non-cmi5-defined `progressed` / `answered`;
        and `terminated` last. `abandoned` is issued by the LMS, never the AU.
   cmi5-defined statements carry the cmi5 category context activity; the
   others (`progressed`, `answered`, objective results) deliberately do not.
   `completed` and `passed` are sent at most once per registration (the flags
   survive relaunches inside the resume state); `failed` at most once per
   session and never after `passed`.

   Resume: cmi5 has no suspend_data field — we persist the player's resume blob
   via the xAPI State API under stateId `suspendData` so getSuspend/setSuspend
   keep working across launches. The sent-statement flags ride along in the
   same JSON document under the `x5` key, invisible to the player. */
(function () {
  'use strict';

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function parseParams() {
    var q = {};
    location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = i < 0 ? pair : pair.slice(0, i);
      var v = i < 0 ? '' : pair.slice(i + 1);
      try { q[decodeURIComponent(k)] = decodeURIComponent(v); }
      catch (e) { q[k] = v; }
    });
    return q;
  }

  var CMI5_CATEGORY = { id: 'https://w3id.org/xapi/cmi5/context/categories/cmi5' };
  var MOVEON_CATEGORY = { id: 'https://w3id.org/xapi/cmi5/context/categories/moveon' };
  var SESSION_EXT = 'https://w3id.org/xapi/cmi5/context/extensions/sessionid';
  var PROGRESS_EXT = 'https://w3id.org/xapi/cmi5/result/extensions/progress';
  var SUSPEND_STATE_ID = 'suspendData';
  var V = {
    initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: { 'en-US': 'initialized' } },
    terminated: { id: 'http://adlnet.gov/expapi/verbs/terminated', display: { 'en-US': 'terminated' } },
    completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
    passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
    failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { 'en-US': 'failed' } },
    progressed: { id: 'http://adlnet.gov/expapi/verbs/progressed', display: { 'en-US': 'progressed' } },
    answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
    commented: { id: 'http://adlnet.gov/expapi/verbs/commented', display: { 'en-US': 'commented' } },
  };

  var P = parseParams();
  var active = !!(P.endpoint && P.fetch && P.actor && P.activityId);
  var endpoint = '';
  if (P.endpoint) endpoint = P.endpoint.charAt(P.endpoint.length - 1) === '/' ? P.endpoint : P.endpoint + '/';
  var actor = null;
  try { actor = JSON.parse(P.actor); } catch (e) { actor = null; }
  var activityId = P.activityId;
  var registration = P.registration || '';

  var auth = null;
  var launchData = null;     // {auMode, masteryScore, contextTemplate, returnURL, launchParameters, languagePreference?, …}
  var sessionId = uuid();
  var startTime = 0;
  var score = null;          // { scaled, raw?, min?, max? } from setScore
  var sent = {};             // dedupe per-session statements (initialized, terminated, failed)
  // Result statements already sent in this registration (persisted, see x5).
  var regSent = { completed: false, passed: false, failed: false };
  var lastProgress = -1;     // last reported progress, 0..100
  var queue = Promise.resolve();

  function elapsed() {
    return 'PT' + Math.max(0, Math.floor((Date.now() - startTime) / 1000)) + 'S';
  }

  function headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': auth,
      'X-Experience-API-Version': '1.0.3',
    };
  }

  // cmi5 §8.2: the fetch URL returns a Basic credential without the scheme.
  function authHeader(token) {
    token = String(token);
    return /^basic\s/i.test(token) ? token : 'Basic ' + token;
  }

  // cmi5 context: derived from LaunchData.contextTemplate (LMS-required) plus
  // the registration and session id. cmi5-defined statements add the cmi5
  // category activity; moveOn-relevant statements also add the moveon category.
  function context(opts) {
    var ctx = launchData && launchData.contextTemplate
      ? JSON.parse(JSON.stringify(launchData.contextTemplate)) : {};
    if (registration) ctx.registration = registration;
    ctx.contextActivities = ctx.contextActivities || {};
    var cats = ctx.contextActivities.category || [];
    function pushCat(c) { if (!cats.some(function (a) { return a && a.id === c.id; })) cats.push(c); }
    if (opts && opts.cmi5) pushCat(CMI5_CATEGORY);
    if (opts && opts.moveOn) pushCat(MOVEON_CATEGORY);
    ctx.contextActivities.category = cats;
    ctx.extensions = ctx.extensions || {};
    ctx.extensions[SESSION_EXT] = sessionId;
    return ctx;
  }

  // Pass mark as a 0..1 scaled score: prefer the cmi5 masteryScore the LMS sent
  // in LMS.LaunchData, else fall back to the course's own passing score, else .5.
  function masteryScore() {
    if (launchData && typeof launchData.masteryScore === 'number') return launchData.masteryScore;
    var c = window.__SCORMLY_COURSE__;
    if (c && c.settings && typeof c.settings.passingScore === 'number') return c.settings.passingScore / 100;
    return 0.5;
  }

  // cmi5 auMode: Normal | Browse | Review. Browse/Review must NOT report
  // completion or success (the AU is not being "really" taken).
  function auMode() {
    var m = launchData && launchData.launchMode;
    return (m === 'Browse' || m === 'Review') ? m : 'Normal';
  }
  function trackingAllowed() { return auMode() === 'Normal'; }

  // Passed: once per registration. Failed: once per session and never after a
  // pass — a later successful retry in the same session may still send passed.
  function sendResult(passed) {
    if (!active || !score || !trackingAllowed() || regSent.passed) return;
    if (passed) regSent.passed = true;
    else if (sent.failed) return;
    else { sent.failed = true; regSent.failed = true; }
    persistFlags();
    enqueue(function () {
      var res = { success: !!passed, duration: elapsed(), score: { scaled: score.scaled } };
      if (typeof score.raw === 'number') { res.score.raw = score.raw; res.score.min = score.min; res.score.max = score.max; }
      return post(statement(passed ? V.passed : V.failed, res, { cmi5: true, moveOn: true }));
    });
  }

  function statement(verb, result, opts) {
    var s = {
      id: uuid(),
      actor: actor,
      verb: verb,
      object: { id: activityId, objectType: 'Activity' },
      context: context(opts),
      timestamp: new Date().toISOString(),
    };
    if (result) s.result = result;
    return s;
  }

  function post(stmt) {
    if (!active || !auth) return Promise.resolve();
    return fetch(endpoint + 'statements', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(stmt),
      keepalive: true, // let final statements survive page unload
    }).then(function (r) {
      if (!r.ok) console.warn('[xAPI] statement rejected: ' + r.status);
    }).catch(function (e) { console.warn('[xAPI] statement failed', e); });
  }

  function enqueue(fn) {
    queue = queue.then(fn).catch(function (e) { console.warn('[xAPI]', e); });
    return queue;
  }

  // xAPI State API helpers — used for resume (suspendData). The state is scoped
  // to {activity, agent, registration}.
  function stateUrl(stateId) {
    var url = endpoint + 'activities/state?stateId=' + encodeURIComponent(stateId)
      + '&activityId=' + encodeURIComponent(activityId)
      + '&agent=' + encodeURIComponent(JSON.stringify(actor));
    if (registration) url += '&registration=' + encodeURIComponent(registration);
    return url;
  }

  // Pending suspend-data writes: only the latest value matters, and there's no
  // point queueing duplicates — the player calls setSuspend on every progress
  // change. We coalesce by overwriting `pendingSuspend` and flushing in the
  // background; if a flush is in-flight we mark `suspendDirty` to re-flush.
  var pendingSuspend = null;
  var flushingSuspend = false;
  var suspendDirty = false;
  var playerSuspend = null;  // last blob handed to setSuspend (without x5)

  // Merge the sent flags into the player's JSON blob (key x5); non-JSON blobs
  // are stored as-is.
  function withFlags(str) {
    if (!regSent.completed && !regSent.passed && !regSent.failed) return str;
    try {
      var o = JSON.parse(str);
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        o.x5 = { c: regSent.completed ? 1 : 0, p: regSent.passed ? 1 : 0, f: regSent.failed ? 1 : 0 };
        return JSON.stringify(o);
      }
    } catch (e) { /* not JSON */ }
    return str;
  }
  // Split a stored document into the player's blob and our flags.
  function extractFlags(str) {
    try {
      var o = JSON.parse(str);
      if (o && typeof o === 'object' && o.x5) {
        regSent.completed = !!o.x5.c;
        regSent.passed = !!o.x5.p;
        regSent.failed = !!o.x5.f;
        delete o.x5;
        return JSON.stringify(o);
      }
    } catch (e) { /* not JSON */ }
    return str;
  }
  // Re-save the resume state so a flag change is durable even if the player
  // doesn't write progress again before the window closes.
  function persistFlags() {
    if (playerSuspend == null) return;
    pendingSuspend = withFlags(playerSuspend);
    suspendDirty = true;
    flushSuspend();
  }
  function flushSuspend() {
    if (!active || !auth || flushingSuspend) return;
    if (pendingSuspend == null) return;
    flushingSuspend = true;
    var body = pendingSuspend;
    pendingSuspend = null;
    suspendDirty = false;
    fetch(stateUrl(SUSPEND_STATE_ID), {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain', 'Authorization': auth, 'X-Experience-API-Version': '1.0.3' },
      body: body,
      keepalive: true,
    }).catch(function (e) { console.warn('[xAPI] state PUT failed', e); })
      .finally(function () {
        flushingSuspend = false;
        if (suspendDirty || pendingSuspend != null) flushSuspend();
      });
  }

  var resumedSuspend = '';
  var learnerPrefs = null;   // cmi5LearnerPreferences agent profile (languagePreference, audioPreference)
  var readyPromise = null;
  // Upper bound on waiting for the launch handshake before rendering anyway,
  // so an unresponsive LRS can't leave the learner on a blank page.
  var READY_TIMEOUT_MS = 8000;

  // Fetch the auth token, then the LMS.LaunchData state, then the resume state,
  // then send initialized.
  function setup() {
    return fetch(P.fetch, { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var token = j['auth-token'] || j.authToken || null;
        if (!token) throw new Error('no auth-token returned from fetch URL');
        auth = authHeader(token);
        var url = endpoint + 'activities/state?stateId=LMS.LaunchData'
          + '&activityId=' + encodeURIComponent(activityId)
          + '&agent=' + encodeURIComponent(JSON.stringify(actor))
          + (registration ? '&registration=' + encodeURIComponent(registration) : '');
        return fetch(url, { headers: headers() })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
      .then(function (ld) {
        launchData = ld;
        // Fetch the resume blob, if any.
        return fetch(stateUrl(SUSPEND_STATE_ID), { headers: headers() })
          .then(function (r) { return r.ok ? r.text() : ''; })
          .catch(function () { return ''; });
      })
      .then(function (sd) {
        resumedSuspend = extractFlags(sd || '');
        // cmi5 §11: the LMS keeps the learner's language in an agent profile,
        // not in LaunchData.
        var url = endpoint + 'agents/profile?profileId=cmi5LearnerPreferences'
          + '&agent=' + encodeURIComponent(JSON.stringify(actor));
        return fetch(url, { headers: headers() })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
      .then(function (prefs) {
        learnerPrefs = prefs;
        return post(statement(V.initialized, null, { cmi5: true }));
      });
  }

  // Build a richer xAPI interaction object for `answered`. Mirrors the SCORM
  // 2004 interaction model: type, choices/source/target, correctResponsesPattern.
  // Array responses (see scorm.js formatResponse) use the xAPI delimiters:
  // `[,]` between items, `[.]` inside a matching pair.
  function formatResponse(value) {
    if (!Array.isArray(value)) return value == null ? '' : String(value);
    return value.map(function (p) { return Array.isArray(p) ? p.join('[.]') : String(p); }).join('[,]');
  }

  function buildInteractionObject(data) {
    var id = activityId + '/interactions/' + encodeURIComponent(data.id);
    var def = { type: 'http://adlnet.gov/expapi/activities/cmi.interaction' };
    if (data.description) def.description = { 'en-US': String(data.description) };
    if (data.interactionType) def.interactionType = data.interactionType;
    if (Array.isArray(data.choices) && data.choices.length) {
      def.choices = data.choices.map(function (c) {
        return { id: c.id, description: { 'en-US': String(c.text) } };
      });
    }
    if (Array.isArray(data.source) && data.source.length) {
      def.source = data.source.map(function (s) {
        return { id: s.id, description: { 'en-US': String(s.text) } };
      });
    }
    if (Array.isArray(data.target) && data.target.length) {
      def.target = data.target.map(function (t) {
        return { id: t.id, description: { 'en-US': String(t.text) } };
      });
    }
    if (Array.isArray(data.correctResponses) && data.correctResponses.length) {
      var prefix = data.interactionType === 'fill-in' && data.caseMatters ? '{case_matters=true}' : '';
      def.correctResponsesPattern = data.correctResponses.map(function (r) { return prefix + formatResponse(r); });
    }
    return { id: id, objectType: 'Activity', definition: def };
  }

  var SCORM = {
    init: function () {
      if (!active || !actor) { active = false; return false; }
      startTime = Date.now();
      sent.initialized = true;
      // enqueue() swallows errors, so this resolves even if the handshake fails.
      readyPromise = enqueue(setup);
      return true;
    },

    // Resume data, LaunchData (mode, mastery, language) and the auth token
    // arrive asynchronously; the player must not read them or write progress
    // before this fires, or it would start over and overwrite the saved state.
    whenReady: function (cb) {
      if (!readyPromise) { cb(); return; }
      var done = false, timer = null;
      function once() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cb();
      }
      timer = setTimeout(once, READY_TIMEOUT_MS);
      readyPromise.then(once);
    },

    // completed: boolean; success: 'passed' | 'failed' | null
    report: function (completed, success) {
      if (!active || !trackingAllowed()) return;
      if (completed && !regSent.completed) {
        regSent.completed = true;
        persistFlags();
        enqueue(function () {
          var res = { completion: true, duration: elapsed() };
          return post(statement(V.completed, res, { cmi5: true, moveOn: true }));
        });
      }
      // The player only passes `success` once the whole course is complete;
      // sendResult() (driven by setScore) usually fires earlier. Its guards
      // make repeated calls no-ops.
      if (success) sendResult(success === 'passed');
    },

    setScore: function (raw, min, max) {
      if (!active || !trackingAllowed()) return;
      var lo = min == null ? 0 : min, hi = max == null ? 100 : max;
      var range = hi - lo || 1;
      score = {
        scaled: Math.max(0, Math.min(1, (raw - lo) / range)),
        raw: Math.round(raw), min: lo, max: hi,
      };
      // Emit passed/failed (which carries the score) as soon as the quizzes are
      // scored, rather than waiting for full course completion — so the LRS gets
      // a score even on a partial pass, matching the SCORM runtime's behaviour.
      sendResult(score.scaled >= masteryScore());
    },

    // Resume: cmi5 stores it as activity state (suspendData) over the State API.
    getSuspend: function () { return resumedSuspend; },
    setSuspend: function (str) {
      if (!active || !trackingAllowed()) return;
      playerSuspend = String(str || '');
      pendingSuspend = withFlags(playerSuspend);
      suspendDirty = true;
      flushSuspend();
    },
    // location, exit, session_time: not part of cmi5 — durations and lifecycle
    // are conveyed by statements themselves.
    setLocation: function () {},
    setExit: function () {},
    setSessionTime: function () {},
    // setProgress (the 0..1 LMS-progress measure used by SCORM 2004) maps to
    // a cmi5 `progressed` statement; debounce so we only fire on milestones.
    setProgress: function (fraction) {
      // Kept for API parity; the player calls setProgressed separately for
      // explicit milestone events. We avoid emitting a statement on every
      // micro-update — setProgressed handles that.
      void fraction;
    },

    // Emit a `progressed` statement when crossing a 10% milestone. Not a
    // cmi5-defined verb, so it must not carry the cmi5 category (an LMS
    // rejects cmi5-categorised statements with other verbs).
    setProgressed: function (fraction) {
      if (!active || !trackingAllowed()) return;
      var pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
      var bucket = Math.floor(pct / 10) * 10;
      if (bucket <= lastProgress || bucket <= 0 || bucket >= 100) return;
      lastProgress = bucket;
      enqueue(function () {
        var res = { duration: elapsed(), extensions: {} };
        res.extensions[PROGRESS_EXT] = bucket;
        return post(statement(V.progressed, res, { cmi5: false }));
      });
    },

    // Objectives in cmi5 are not part of the moveOn contract; we still send
    // one `answered`-style statement per quiz so the LRS sees an objective
    // record. The interaction id namespaces under .../objectives/<id>.
    setObjective: function (i, data) {
      if (!active || !trackingAllowed() || !data || !data.id) return;
      var raw = typeof data.raw === 'number' ? data.raw : null;
      var lo = data.min == null ? 0 : data.min, hi = data.max == null ? 100 : data.max;
      var range = hi - lo || 1;
      var scaled = raw == null ? null : Math.max(0, Math.min(1, (raw - lo) / range));
      enqueue(function () {
        var res = { duration: elapsed() };
        if (raw != null) res.score = { scaled: scaled, raw: raw, min: lo, max: hi };
        if (data.success) res.success = data.success === 'passed';
        var s = statement(data.success === 'failed' ? V.failed : (data.success === 'passed' ? V.passed : V.completed), res, { cmi5: false });
        s.object = {
          id: activityId + '/objectives/' + encodeURIComponent(data.id),
          objectType: 'Activity',
          definition: {
            type: 'http://adlnet.gov/expapi/activities/objective',
            name: data.name ? { 'en-US': String(data.name) } : undefined,
          },
        };
        return post(s);
      });
      void i;
    },

    // Quiz answer → an `answered` interaction statement (no cmi5 category).
    recordInteraction: function (i, data) {
      if (!active || !trackingAllowed()) return;
      enqueue(function () {
        var res = { response: formatResponse(data.response), success: !!data.correct };
        if (typeof data.latencySec === 'number') res.duration = 'PT' + Math.max(0, Math.floor(data.latencySec)) + 'S';
        var s = statement(V.answered, res, { cmi5: false });
        s.object = buildInteractionObject(data);
        return post(s);
      });
      void i;
    },

    // Learner comment → xAPI `commented` statement (not cmi5-defined; ADL verb).
    setComment: function (text) {
      if (!active || !trackingAllowed() || !text) return;
      enqueue(function () {
        return post(statement(V.commented, { response: String(text).slice(0, 4000) }, { cmi5: false }));
      });
    },

    // `abandoned` is an LMS-issued verb in cmi5 (when an AU session ends
    // without `terminated`); the AU must never send it. Kept as a no-op for
    // API parity.
    reportAbandoned: function () {},

    // LMS-context readers, surfaced from cmi5 launch params + LaunchData.
    getLearner: function () {
      if (!actor) return null;
      // cmi5 actor.account holds the LMS user; name is optional.
      var id = (actor.account && actor.account.name) || actor.mbox || actor.openid || '';
      var name = actor.name || '';
      return id || name ? { id: id, name: name } : null;
    },
    // launchMode in LaunchData → 'normal' | 'browse' | 'review' (lower-case for parity with SCORM).
    getMode: function () { return auMode().toLowerCase(); },
    isResuming: function () { return !!resumedSuspend; },
    getLaunchData: function () {
      if (!launchData) return '';
      // cmi5 exposes raw launchParameters (string) for AU consumption.
      return launchData.launchParameters || JSON.stringify(launchData);
    },
    getLmsMastery: function () {
      var m = launchData && launchData.masteryScore;
      return typeof m === 'number' ? m * 100 : null;
    },
    getPreferredLanguage: function () {
      // languagePreference is a comma-separated list in priority order; the
      // player matches on the first entry's two-letter code.
      var p = (learnerPrefs && learnerPrefs.languagePreference)
        || (launchData && launchData.languagePreference) || '';
      return String(p).split(',')[0].trim();
    },
    // Same shape as the SCORM runtime. cmi5LearnerPreferences has no caption
    // preference, so captions is always 0 (no change).
    getLearnerPreferences: function () {
      return { captions: 0, language: SCORM.getPreferredLanguage() };
    },
    suspendLimit: function () { return 0; },

    commit: function () {}, // statements are sent immediately
    // unloading: the page is going away, so anything still waiting in the
    // queue may never be sent — post `terminated` right now (keepalive) so the
    // LMS doesn't mark the session abandoned.
    finish: function (unloading) {
      if (!active || sent.terminated) return;
      sent.terminated = true;
      var stmt = statement(V.terminated, { duration: elapsed() }, { cmi5: true });
      if (unloading) {
        flushSuspend();
        post(stmt);
      } else {
        enqueue(function () { return post(stmt); });
      }
    },
    available: function () { return active; },
  };

  window.SCORM = SCORM;
})();
