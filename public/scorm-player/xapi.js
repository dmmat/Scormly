/* cmi5 / xAPI runtime. Exposes the SAME interface as scorm.js (window.SCORM) so
   player.js works unchanged, but reports to an LRS using cmi5-defined xAPI
   statements. Active only when launched with cmi5 parameters in the URL
   (endpoint, fetch, actor, activityId, registration); otherwise it no-ops, e.g.
   when previewing the package without an LMS.

   cmi5 launch contract (AU side):
     1. POST to the one-time `fetch` URL to obtain the auth token.
     2. GET the LMS.LaunchData state (auMode, masteryScore, contextTemplate,
        launchParameters, returnURL, …).
     3. Send `initialized` first; then during the session — `progressed`,
        `completed`, `passed`/`failed`, `answered`; and `terminated` last (or
        `abandoned` if the AU closes without a terminate).
   Statements that report cmi5 "moveOn" criteria carry the cmi5 category context
   activity; interaction (`answered`) statements deliberately do not.

   Resume: cmi5 has no suspend_data field — we persist the player's resume blob
   via the xAPI State API under stateId `suspendData` so getSuspend/setSuspend
   keep working across launches. */
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
    abandoned: { id: 'https://w3id.org/xapi/adl/verbs/abandoned', display: { 'en-US': 'abandoned' } },
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
  var sent = {};             // dedupe per-session statements
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

  function sendResult(passed) {
    if (!active || sent.result || !score || !trackingAllowed()) return;
    sent.result = true;
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

  // Fetch the auth token, then the LMS.LaunchData state, then the resume state,
  // then send initialized.
  function setup() {
    return fetch(P.fetch, { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        auth = j['auth-token'] || j.authToken || null;
        if (!auth) throw new Error('no auth-token returned from fetch URL');
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
        resumedSuspend = sd || '';
        return post(statement(V.initialized, null, { cmi5: true }));
      });
  }

  // Build a richer xAPI interaction object for `answered`. Mirrors the SCORM
  // 2004 interaction model: type, choices/source/target, correctResponsesPattern.
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
      def.correctResponsesPattern = data.correctResponses;
    }
    return { id: id, objectType: 'Activity', definition: def };
  }

  var SCORM = {
    init: function () {
      if (!active || !actor) { active = false; return false; }
      startTime = Date.now();
      sent.initialized = true;
      enqueue(setup);
      return true;
    },

    // completed: boolean; success: 'passed' | 'failed' | null
    report: function (completed, success) {
      if (!active || !trackingAllowed()) return;
      if (completed && !sent.completed) {
        sent.completed = true;
        enqueue(function () {
          var res = { completion: true, duration: elapsed() };
          return post(statement(V.completed, res, { cmi5: true, moveOn: true }));
        });
      }
      // The player only passes `success` once the whole course is complete;
      // sendResult() (driven by setScore) usually fires earlier. Either way the
      // result is sent at most once.
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
      pendingSuspend = String(str || '');
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

    // Emit a cmi5 `progressed` statement when crossing a 10% milestone.
    setProgressed: function (fraction) {
      if (!active || !trackingAllowed()) return;
      var pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
      var bucket = Math.floor(pct / 10) * 10;
      if (bucket <= lastProgress || bucket <= 0 || bucket >= 100) return;
      lastProgress = bucket;
      enqueue(function () {
        var res = { duration: elapsed(), extensions: {} };
        res.extensions[PROGRESS_EXT] = bucket;
        return post(statement(V.progressed, res, { cmi5: true }));
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
        var res = { response: String(data.response), success: !!data.correct };
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

    // Abandon: cmi5 / xAPI verb. Use when the AU closes without a terminate
    // (player.js fires this from beforeunload when the course isn't complete).
    reportAbandoned: function () {
      if (!active || sent.abandoned || sent.terminated) return;
      sent.abandoned = true;
      enqueue(function () {
        return post(statement(V.abandoned, { duration: elapsed() }, { cmi5: true }));
      });
    },

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
      return (launchData && launchData.languagePreference) || '';
    },

    commit: function () {}, // statements are sent immediately
    finish: function () {
      if (!active || sent.terminated) return;
      sent.terminated = true;
      enqueue(function () {
        return post(statement(V.terminated, { duration: elapsed() }, { cmi5: true }));
      });
    },
    available: function () { return active; },
  };

  window.SCORM = SCORM;
})();
