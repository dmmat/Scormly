/* SCORM runtime wrapper supporting both SCORM 1.2 and 2004. Auto-detects which
   API the LMS exposes (API_1484_11 = 2004, API = 1.2) and maps a unified
   interface onto the right data model. No-ops gracefully outside an LMS.

   Implements (per data model, both versions where applicable):
   - lifecycle: Initialize / Commit / Terminate
   - status:    lesson_status (1.2) / completion_status + success_status (2004)
   - score:     score.raw / min / max (+ scaled in 2004)
   - progress:  progress_measure (2004 only)
   - resume:    suspend_data, location, exit=suspend
   - time:      session_time
   - objectives: cmi.objectives.n.* (one per quiz)
   - interactions: cmi.interactions.n.* incl. weighting / latency / description /
                   correct_responses.0.pattern / timestamp
   - LMS context (read-only): learner id/name, mode, entry (resume), launch_data,
                              student_data.mastery_score, preference.language
   - learner comments: cmi.comments_from_learner (2004) / cmi.comments (1.2)
*/
(function () {
  'use strict';

  function find(win, name) {
    var tries = 0;
    while (win && tries < 10) {
      // Reading a property of a cross-origin ancestor frame throws a
      // SecurityError; skip that frame and keep walking up rather than
      // letting the whole player crash.
      try {
        if (win[name]) return win[name];
      } catch (e) { /* cross-origin frame */ }
      var parent = null;
      try { parent = win.parent; } catch (e) { parent = null; }
      if (parent && parent !== win) { win = parent; tries++; } else break;
    }
    return null;
  }

  function discover() {
    // Prefer 2004, then 1.2.
    var api = find(window, 'API_1484_11');
    if (api) return { api: api, v2004: true };
    api = find(window, 'API');
    if (api) return { api: api, v2004: false };
    var opener = null;
    try { opener = window.opener; } catch (e) { opener = null; }
    if (opener) {
      api = find(opener, 'API_1484_11');
      if (api) return { api: api, v2004: true };
      api = find(opener, 'API');
      if (api) return { api: api, v2004: false };
    }
    return null;
  }

  var API = null, v2004 = false, ready = false;
  var commentCount = 0; // 2004: index for cmi.comments_from_learner.n
  var pendingComment = ''; // 1.2: cmi.comments is append-only on some LMS

  function lastError() { return API ? API[v2004 ? 'GetLastError' : 'LMSGetLastError']() : '0'; }
  function errorString(code) { return API ? API[v2004 ? 'GetErrorString' : 'LMSGetErrorString'](code) : ''; }

  function set(key, value) {
    if (!(ready && API)) return false;
    var ok = API[v2004 ? 'SetValue' : 'LMSSetValue'](key, String(value)) === 'true';
    var code = lastError();
    if (code && code !== '0') console.warn('[SCORM] SetValue(' + key + ') failed: ' + code + ' ' + errorString(code));
    return ok;
  }
  function get(key) {
    if (!(ready && API)) return '';
    var v = API[v2004 ? 'GetValue' : 'LMSGetValue'](key);
    // GetValue returning '' may be a real empty or an unsupported element; the
    // caller decides whether to log. We only log if the LMS actually errored.
    var code = lastError();
    if (code && code !== '0' && code !== '403') {
      // 403 = "Data Model Element Not Initialized" (2004) — common & benign.
      // Some 1.2 LMSes also return non-zero for unsupported optional elements.
      console.debug('[SCORM] GetValue(' + key + ') code ' + code);
    }
    return v || '';
  }

  // 1.2 wants CMITimespan HHHH:MM:SS.SS; 2004 wants an ISO-8601 duration.
  function formatTime(totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds));
    var hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    if (v2004) return 'PT' + hh + 'H' + mm + 'M' + ss + 'S';
    function pad(n, w) { return ('0000' + n).slice(-w); }
    return pad(hh, 4) + ':' + pad(mm, 2) + ':' + pad(ss, 2) + '.00';
  }

  // Cached LMS-context snapshot (read once after Initialize).
  var ctx = {
    learner: null,        // { id, name } | null
    mode: 'normal',       // 'normal' | 'browse' | 'review'
    entry: '',            // 'ab-initio' | 'resume' | ''
    launchData: '',
    lmsMastery: null,     // number 0..100, or null
    language: '',         // ISO code from learner preference
  };

  function readContext() {
    if (v2004) {
      ctx.learner = {
        id: get('cmi.learner_id') || '',
        name: get('cmi.learner_name') || '',
      };
      ctx.mode = (get('cmi.mode') || 'normal').toLowerCase();
      ctx.entry = (get('cmi.entry') || '').toLowerCase();
      ctx.launchData = get('cmi.launch_data') || '';
      ctx.language = get('cmi.learner_preference.language') || '';
      // 2004 has no direct runtime read of the objective's minNormalizedMeasure
      // declared in the manifest; the LMS owns that.
      ctx.lmsMastery = null;
    } else {
      ctx.learner = {
        id: get('cmi.core.student_id') || '',
        name: get('cmi.core.student_name') || '',
      };
      ctx.mode = (get('cmi.core.lesson_mode') || 'normal').toLowerCase();
      ctx.entry = (get('cmi.core.entry') || '').toLowerCase();
      ctx.launchData = get('cmi.launch_data') || '';
      ctx.language = get('cmi.student_preference.language') || '';
      // 1.2 exposes the manifest's masteryscore at runtime.
      var m = get('cmi.student_data.mastery_score');
      var n = m === '' ? NaN : parseFloat(m);
      ctx.lmsMastery = isFinite(n) ? n : null;
    }
    if (ctx.learner && !ctx.learner.id && !ctx.learner.name) ctx.learner = null;
  }

  // In review/browse mode the LMS prohibits writing tracking data; we no-op
  // those calls (still let the player render the course).
  function trackingAllowed() {
    return ctx.mode !== 'review' && ctx.mode !== 'browse';
  }

  var SCORM = {
    init: function () {
      var found = discover();
      if (!found) return false;
      API = found.api; v2004 = found.v2004;
      ready = API[v2004 ? 'Initialize' : 'LMSInitialize']('') === 'true';
      if (ready) {
        readContext();
        if (!v2004) {
          var status = API.LMSGetValue('cmi.core.lesson_status');
          if (trackingAllowed() && (!status || status === 'not attempted')) {
            set('cmi.core.lesson_status', 'incomplete');
          }
        }
      }
      return ready;
    },

    // completed: boolean; success: 'passed' | 'failed' | null
    report: function (completed, success) {
      if (!trackingAllowed()) return;
      if (v2004) {
        set('cmi.completion_status', completed ? 'completed' : 'incomplete');
        if (success) set('cmi.success_status', success);
      } else {
        set('cmi.core.lesson_status', success ? success : (completed ? 'completed' : 'incomplete'));
      }
    },

    setScore: function (raw, min, max) {
      if (!trackingAllowed()) return;
      var lo = min == null ? 0 : min, hi = max == null ? 100 : max;
      if (v2004) {
        set('cmi.score.raw', Math.round(raw));
        set('cmi.score.min', lo);
        set('cmi.score.max', hi);
        var range = hi - lo || 1;
        set('cmi.score.scaled', Math.max(0, Math.min(1, (raw - lo) / range)).toFixed(4));
      } else {
        set('cmi.core.score.raw', Math.round(raw));
        set('cmi.core.score.min', lo);
        set('cmi.core.score.max', hi);
      }
    },

    // Resume support: a small JSON blob of progress.
    getSuspend: function () { return get('cmi.suspend_data'); },
    setSuspend: function (str) { if (trackingAllowed()) set('cmi.suspend_data', str); },
    setLocation: function (str) {
      if (trackingAllowed()) set(v2004 ? 'cmi.location' : 'cmi.core.lesson_location', str);
    },
    // Tell the LMS to preserve suspend_data/location for the next launch.
    // '' (normal) on completion, 'suspend' while the attempt is still in progress.
    setExit: function (mode) { if (trackingAllowed()) set(v2004 ? 'cmi.exit' : 'cmi.core.exit', mode); },
    // 2004 only: fraction 0..1 for the LMS progress bar.
    setProgress: function (fraction) {
      if (v2004 && trackingAllowed()) set('cmi.progress_measure', Math.max(0, Math.min(1, fraction)).toFixed(4));
    },
    setSessionTime: function (seconds) {
      if (trackingAllowed()) set(v2004 ? 'cmi.session_time' : 'cmi.core.session_time', formatTime(seconds));
    },

    // Record an objective (typically one per quiz). data: { id, raw, min, max,
    // status, success }. status: 'completed'|'incomplete' (2004 only).
    // success: 'passed'|'failed'|null. Mirrors the SCORM data model so analytics
    // can break results down per objective.
    setObjective: function (i, data) {
      if (!trackingAllowed() || !data || !data.id) return;
      var p = (v2004 ? 'cmi.objectives.' : 'cmi.objectives.') + i + '.';
      set(p + 'id', data.id);
      if (typeof data.raw === 'number') {
        set(p + 'score.raw', Math.round(data.raw));
        set(p + 'score.min', data.min == null ? 0 : data.min);
        set(p + 'score.max', data.max == null ? 100 : data.max);
        if (v2004) {
          var lo = data.min == null ? 0 : data.min, hi = data.max == null ? 100 : data.max;
          var range = hi - lo || 1;
          set(p + 'score.scaled', Math.max(0, Math.min(1, (data.raw - lo) / range)).toFixed(4));
        }
      }
      if (v2004) {
        if (data.status) set(p + 'completion_status', data.status);
        if (data.success) set(p + 'success_status', data.success);
      } else {
        // 1.2 collapses both into a single objective status.
        var s = data.success ? data.success : (data.status === 'completed' ? 'completed' : 'incomplete');
        set(p + 'status', s);
      }
    },

    // Record a quiz answer as a SCORM interaction. data extends the minimal
    // shape with optional weighting, latencySec, description and an array of
    // correct response patterns.
    recordInteraction: function (i, data) {
      if (!trackingAllowed() || !data || !data.id) return;
      var p = 'cmi.interactions.' + i + '.';
      set(p + 'id', data.id);
      set(p + 'type', data.type);
      set(p + (v2004 ? 'learner_response' : 'student_response'), data.response);
      set(p + 'result', v2004 ? (data.correct ? 'correct' : 'incorrect') : (data.correct ? 'correct' : 'wrong'));
      // Optional fields.
      if (typeof data.weight === 'number') set(p + 'weighting', data.weight);
      if (typeof data.latencySec === 'number') set(p + 'latency', formatTime(data.latencySec));
      if (data.description) set(p + 'description', String(data.description).slice(0, 250));
      // Timestamp: 2004 wants ISO-8601, 1.2 wants HH:MM:SS.
      if (v2004) set(p + 'timestamp', new Date().toISOString());
      else {
        var d = new Date();
        function pad(n) { return n < 10 ? '0' + n : '' + n; }
        set(p + 'time', pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()));
      }
      // Correct response pattern(s).
      var cr = Array.isArray(data.correctResponses) ? data.correctResponses : null;
      if (cr && cr.length) {
        // 1.2 supports only correct_responses.0.pattern reliably.
        var limit = v2004 ? cr.length : 1;
        for (var j = 0; j < limit; j++) set(p + 'correct_responses.' + j + '.pattern', cr[j]);
      }
      // Link interaction to its objective so per-quiz analytics line up.
      if (data.objectiveId) set(p + 'objectives.0.id', data.objectiveId);
    },

    // Learner comment / note. 2004 has indexed cmi.comments_from_learner;
    // 1.2 has a single append-only cmi.comments string.
    setComment: function (text) {
      if (!trackingAllowed() || !text) return;
      var t = String(text);
      if (v2004) {
        var p = 'cmi.comments_from_learner.' + commentCount + '.';
        set(p + 'comment', t.slice(0, 4000));
        set(p + 'timestamp', new Date().toISOString());
        commentCount++;
      } else {
        pendingComment += (pendingComment ? '\n' : '') + t;
        set('cmi.comments', pendingComment.slice(0, 4096));
      }
    },

    // cmi5-only verbs; no-op on SCORM. (Defined here so player.js can call them
    // unconditionally regardless of the active tracking layer.)
    setProgressed: function () {},
    reportAbandoned: function () {},

    // LMS-context readers (cached at init). Return safe defaults when unavailable.
    getLearner: function () { return ctx.learner; },
    getMode: function () { return ctx.mode || 'normal'; },
    isResuming: function () { return ctx.entry === 'resume'; },
    getLaunchData: function () { return ctx.launchData; },
    getLmsMastery: function () { return ctx.lmsMastery; },
    getPreferredLanguage: function () { return ctx.language; },

    commit: function () { if (ready && API) API[v2004 ? 'Commit' : 'LMSCommit'](''); },
    finish: function () {
      if (ready && API) {
        API[v2004 ? 'Commit' : 'LMSCommit']('');
        API[v2004 ? 'Terminate' : 'LMSFinish']('');
        ready = false;
      }
    },
    available: function () { return !!API; },
  };

  window.SCORM = SCORM;
})();
