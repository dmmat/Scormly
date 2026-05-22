/* cmi5 / xAPI runtime. Exposes the SAME interface as scorm.js (window.SCORM) so
   player.js works unchanged, but reports to an LRS using cmi5-defined xAPI
   statements. Active only when launched with cmi5 parameters in the URL
   (endpoint, fetch, actor, activityId, registration); otherwise it no-ops, e.g.
   when previewing the package without an LMS.

   cmi5 launch contract (AU side):
     1. POST to the one-time `fetch` URL to obtain the auth token.
     2. GET the LMS.LaunchData state (for the context template).
     3. Send the `initialized` statement (must be first), then completed /
        passed / failed during the session, and `terminated` last.
   Statements that report cmi5 "moveOn" criteria carry the cmi5 category context
   activity; interaction (`answered`) statements deliberately do not. */
(function () {
  'use strict';

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // Parse the launch query string into a map.
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
  var SESSION_EXT = 'https://w3id.org/xapi/cmi5/context/extensions/sessionid';
  var V = {
    initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: { 'en-US': 'initialized' } },
    terminated: { id: 'http://adlnet.gov/expapi/verbs/terminated', display: { 'en-US': 'terminated' } },
    completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
    passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
    failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { 'en-US': 'failed' } },
    answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
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
  var launchData = null;
  var sessionId = uuid();
  var startTime = 0;
  var score = null;          // { scaled } from setScore
  var sent = {};             // dedupe initialized/completed/result/terminated
  var queue = Promise.resolve(); // statements must keep order; setup is async

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

  // Build a statement context from the LMS context template (cmi5 requires the
  // AU to base its context on it), adding the registration, the session id and,
  // for cmi5-defined statements, the cmi5 category activity.
  function context(defined) {
    var ctx = launchData && launchData.contextTemplate
      ? JSON.parse(JSON.stringify(launchData.contextTemplate)) : {};
    if (registration) ctx.registration = registration;
    ctx.contextActivities = ctx.contextActivities || {};
    if (defined) {
      var cat = ctx.contextActivities.category || [];
      if (!cat.some(function (a) { return a && a.id === CMI5_CATEGORY.id; })) cat.push(CMI5_CATEGORY);
      ctx.contextActivities.category = cat;
    }
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

  // Send the cmi5 passed/failed statement (with the score) once per session.
  function sendResult(passed) {
    if (!active || sent.result || !score) return;
    sent.result = true;
    enqueue(function () {
      var res = { success: !!passed, duration: elapsed(), score: { scaled: score.scaled } };
      if (typeof score.raw === 'number') { res.score.raw = score.raw; res.score.min = score.min; res.score.max = score.max; }
      return post(statement(passed ? V.passed : V.failed, res, true));
    });
  }

  function statement(verb, result, defined) {
    var s = {
      id: uuid(),
      actor: actor,
      verb: verb,
      object: { id: activityId, objectType: 'Activity' },
      context: context(defined),
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
      keepalive: true, // let `terminated` survive page unload
    }).then(function (r) {
      if (!r.ok) console.warn('[xAPI] statement rejected: ' + r.status);
    }).catch(function (e) { console.warn('[xAPI] statement failed', e); });
  }

  function enqueue(fn) {
    queue = queue.then(fn).catch(function (e) { console.warn('[xAPI]', e); });
    return queue;
  }

  // Fetch the auth token, then the LMS.LaunchData state, then send initialized.
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
        return post(statement(V.initialized, null, true));
      });
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
      if (!active) return;
      if (completed && !sent.completed) {
        sent.completed = true;
        enqueue(function () {
          return post(statement(V.completed, { completion: true, duration: elapsed() }, true));
        });
      }
      // The player only passes `success` once the whole course is complete;
      // sendResult() (driven by setScore) usually fires earlier. Either way the
      // result is sent at most once.
      if (success) sendResult(success === 'passed');
    },
    setScore: function (raw, min, max) {
      var lo = min == null ? 0 : min, hi = max == null ? 100 : max;
      var range = hi - lo || 1;
      score = {
        scaled: Math.max(0, Math.min(1, (raw - lo) / range)),
        raw: Math.round(raw), min: lo, max: hi,
      };
      // Emit passed/failed (which carries the score) as soon as the quizzes are
      // scored, rather than waiting for full course completion — so the LMS gets
      // a score even on a partial pass, matching the SCORM runtime's behaviour.
      sendResult(score.scaled >= masteryScore());
    },
    // cmi5 in this build does not persist resume data across launches.
    getSuspend: function () { return ''; },
    setSuspend: function () {},
    setLocation: function () {},
    setExit: function () {},
    setProgress: function () {},
    setSessionTime: function () {}, // duration is derived from startTime
    // Quiz answer → an `answered` interaction statement (no cmi5 category).
    recordInteraction: function (i, data) {
      if (!active) return;
      enqueue(function () {
        var s = statement(V.answered, { response: String(data.response), success: !!data.correct }, false);
        s.object = {
          id: activityId + '/interactions/' + encodeURIComponent(data.id),
          objectType: 'Activity',
          definition: { type: 'http://adlnet.gov/expapi/activities/cmi.interaction' },
        };
        return post(s);
      });
    },
    commit: function () {}, // statements are sent immediately
    finish: function () {
      if (!active || sent.terminated) return;
      sent.terminated = true;
      enqueue(function () {
        return post(statement(V.terminated, { duration: elapsed() }, true));
      });
    },
    available: function () { return active; },
  };

  window.SCORM = SCORM;
})();
