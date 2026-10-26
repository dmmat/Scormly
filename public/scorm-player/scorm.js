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
   - objectives: cmi.objectives.n.* (one per scored block: quiz / ordering / fill-in),
                 indexed by id — records the LMS already holds (e.g. manifest-declared
                 2004 objectives) are reused, new ones are appended at _count
   - interactions: cmi.interactions.n.* appended after the LMS's _count, incl.
                   weighting / latency / description (2004) /
                   correct_responses.n.pattern / timestamp
   - LMS context (read-only): learner id/name, mode, entry (resume), launch_data,
                              student_data.mastery_score (1.2) / scaled_passing_score
                              (2004), preference.language
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

  // The package's own version first (course-data.js sets __SCORMLY_SCORM__),
  // so an LMS that exposes both APIs gets the data model its manifest
  // declared; then the other one. Frames up from this window, then from the
  // opener of this window and of the top window (a SCO framed in an LMS popup).
  function discover() {
    var names = window.__SCORMLY_SCORM__ === '1.2' ? ['API', 'API_1484_11'] : ['API_1484_11', 'API'];
    var roots = [window];
    try { if (window.opener) roots.push(window.opener); } catch (e) { /* cross-origin */ }
    try { if (window.top && window.top.opener && window.top !== window) roots.push(window.top.opener); } catch (e) { /* cross-origin */ }
    for (var r = 0; r < roots.length; r++) {
      for (var n = 0; n < names.length; n++) {
        var api = find(roots[r], names[n]);
        if (api) return { api: api, v2004: names[n] === 'API_1484_11' };
      }
    }
    return null;
  }

  var API = null, v2004 = false, ready = false;
  var commentCount = 0; // 2004: index for cmi.comments_from_learner.n
  var interactionCount = 0; // next free cmi.interactions.n (starts at the LMS _count)
  var objectiveCount = 0;   // next free cmi.objectives.n
  var objectiveIndexById = {}; // objective id -> existing cmi.objectives.n index
  var pendingComment = ''; // 1.2: cmi.comments is append-only on some LMS
  // 2004 4th Ed guarantees 64000 chars of suspend_data, but some LMSes still
  // enforce the 3rd Edition's 4000; lowered on the first rejected write.
  var suspendCap = 64000;

  // What the LMS already records, so later writes never downgrade it: passed
  // stays passed (and its score never drops), completed never returns to
  // incomplete. Learners may retake quizzes — also from "Review the course"
  // after finishing — and LMSes keep the last value written, not the best.
  var sticky = { completed: false, passed: false, status12: '', raw: null };
  var held12 = null; // 1.2 score waiting for completion (see setScore)
  function writeScore12() {
    if (!held12) return;
    set('cmi.core.score.raw', held12.raw);
    set('cmi.core.score.min', held12.min);
    set('cmi.core.score.max', held12.max);
    held12 = null;
  }

  // Some LMS APIs return booleans instead of the spec's 'true' / 'false' strings.
  function isTrue(result) { return String(result) === 'true'; }

  function lastError() { return API ? API[v2004 ? 'GetLastError' : 'LMSGetLastError']() : '0'; }
  function errorString(code) { return API ? API[v2004 ? 'GetErrorString' : 'LMSGetErrorString'](code) : ''; }

  function set(key, value) {
    if (!(ready && API)) return false;
    var ok = isTrue(API[v2004 ? 'SetValue' : 'LMSSetValue'](key, String(value)));
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

  // SCORM 2004 time(second,10,0): at most 2 fractional-second digits, so the
  // millisecond precision of toISOString() is rejected by strict LMSes.
  function isoTimestamp() {
    return new Date().toISOString().replace(/\.(\d{2})\d*Z$/, '.$1Z');
  }

  function readCount(key) {
    var n = parseInt(get(key), 10);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // Index the records the LMS already holds, so we append after them (a new
  // launch must not overwrite the previous session's interactions) and write
  // objectives to the slot that already carries their id — 2004 LMSes preload
  // the manifest's objectives (PRIMARYOBJ, QUIZ_*) in declaration order, and
  // writing a different id to an existing slot is an error.
  // Optional data model families the LMS doesn't implement (1.2 error 401,
  // 2004 401/402 — e.g. TalentLMS has no cmi.objectives). Writing to them
  // only produces an error per call, so they are skipped altogether.
  var unsupported = { objectives: false, interactions: false };
  function notImplemented() {
    var code = lastError();
    return code === '401' || (v2004 && code === '402');
  }

  function readIndexes() {
    interactionCount = readCount('cmi.interactions._count');
    unsupported.interactions = notImplemented();
    objectiveCount = readCount('cmi.objectives._count');
    unsupported.objectives = notImplemented();
    objectiveIndexById = {};
    for (var i = 0; i < objectiveCount; i++) {
      var id = get('cmi.objectives.' + i + '.id');
      if (id && !(id in objectiveIndexById)) objectiveIndexById[id] = i;
    }
    if (v2004) commentCount = readCount('cmi.comments_from_learner._count');
  }


  // Interaction responses/patterns may be passed pre-formatted (string) or as
  // an array: a list of ids/strings (sequencing, multi-part fill-in) or of
  // [source, target] pairs (matching). Arrays are joined with the delimiters
  // of the active data model: 2004 uses `[,]` / `[.]`, 1.2 uses `,` / `.`.
  function formatResponse(value) {
    if (!Array.isArray(value)) return value == null ? '' : String(value);
    var list = v2004 ? '[,]' : ',', pair = v2004 ? '[.]' : '.';
    return value.map(function (p) { return Array.isArray(p) ? p.join(pair) : String(p); }).join(list);
  }

  // SCORM 1.2 CMIFeedback holds at most 255 chars and expects single-character
  // choice ids ([0-9a-z]); option/item UUIDs overflow it after a few entries
  // and the LMS rejects the write. So 1.2 reports ids by position in the
  // choices / source / target lists the player passes (a, b, c, …). Ids not
  // in a list (fill-in text) are kept as-is.
  var SHORT_IDS = 'abcdefghijklmnopqrstuvwxyz0123456789';
  function shortIdMap(list) {
    var m = {};
    (Array.isArray(list) ? list : []).forEach(function (c, i) {
      if (c && c.id != null && i < SHORT_IDS.length) m[c.id] = SHORT_IDS.charAt(i);
    });
    return m;
  }
  function compact12(value, data) {
    var src = shortIdMap(data.choices || data.source), tgt = shortIdMap(data.target);
    function pick(map, id) { return Object.prototype.hasOwnProperty.call(map, id) ? map[id] : id; }
    if (Array.isArray(value)) {
      return value.map(function (p) { return Array.isArray(p) ? [pick(src, p[0]), pick(tgt, p[1])] : pick(src, p); });
    }
    return typeof value === 'string' ? pick(src, value) : value;
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

  // LMSes send names as "Last, First[, Middle]" (the 1.2 data model's
  // convention, common in 2004 too); the player shows "First Middle Last".
  function displayName(raw) {
    var parts = String(raw || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return parts.length > 1 ? parts.slice(1).concat(parts[0]).join(' ') : parts.join('');
  }

  function readContext() {
    if (v2004) {
      ctx.learner = {
        id: get('cmi.learner_id') || '',
        name: displayName(get('cmi.learner_name')),
      };
      ctx.mode = (get('cmi.mode') || 'normal').toLowerCase();
      ctx.entry = (get('cmi.entry') || '').toLowerCase();
      ctx.launchData = get('cmi.launch_data') || '';
      ctx.language = get('cmi.learner_preference.language') || '';
      // Initialized by the LMS from the manifest's minNormalizedMeasure (or an
      // admin override); the LMS judges success_status against it.
      var sp = parseFloat(get('cmi.scaled_passing_score'));
      ctx.lmsMastery = isFinite(sp) ? sp * 100 : null;
    } else {
      ctx.learner = {
        id: get('cmi.core.student_id') || '',
        name: displayName(get('cmi.core.student_name')),
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

  function readStatus() {
    var raw = parseFloat(get(v2004 ? 'cmi.score.raw' : 'cmi.core.score.raw'));
    sticky.raw = isFinite(raw) ? raw : null;
    if (v2004) {
      sticky.completed = get('cmi.completion_status') === 'completed';
      sticky.passed = get('cmi.success_status') === 'passed';
    } else {
      var s = get('cmi.core.lesson_status');
      sticky.status12 = s;
      sticky.completed = s === 'completed' || s === 'passed' || s === 'failed';
      sticky.passed = s === 'passed';
    }
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
      ready = isTrue(API[v2004 ? 'Initialize' : 'LMSInitialize'](''));
      if (ready) {
        readContext();
        readIndexes();
        readStatus();
        if (!v2004) {
          var status = sticky.status12;
          if (trackingAllowed() && (!status || status === 'not attempted')) {
            set('cmi.core.lesson_status', 'incomplete');
          }
        }
      }
      return ready;
    },
    // The SCORM API is synchronous: context and suspend_data are readable now.
    whenReady: function (cb) { cb(); },

    // completed: boolean; success: 'passed' | 'failed' | null
    report: function (completed, success) {
      if (!trackingAllowed()) return;
      if (sticky.passed) success = 'passed';
      completed = completed || sticky.completed;
      if (v2004) {
        set('cmi.completion_status', completed ? 'completed' : 'incomplete');
        if (success) set('cmi.success_status', success);
      } else {
        if (completed) writeScore12();
        var status = success || (completed ? 'completed' : 'incomplete');
        // No verdict in this call: keep a "failed" the LMS already holds.
        if (!success && sticky.status12 === 'failed') status = 'failed';
        set('cmi.core.lesson_status', status);
        sticky.status12 = status;
      }
      if (completed) sticky.completed = true;
      if (success === 'passed') sticky.passed = true;
    },

    setScore: function (raw, min, max) {
      if (!trackingAllowed()) return;
      if (sticky.passed && sticky.raw != null && Math.round(raw) < sticky.raw) return;
      sticky.raw = Math.round(raw);
      var lo = min == null ? 0 : min, hi = max == null ? 100 : max;
      if (v2004) {
        set('cmi.score.raw', Math.round(raw));
        set('cmi.score.min', lo);
        set('cmi.score.max', hi);
        var range = hi - lo || 1;
        set('cmi.score.scaled', Math.max(0, Math.min(1, (raw - lo) / range)).toFixed(4));
      } else {
        // 1.2: with a mastery score in the manifest the LMS may turn any raw
        // score into passed / failed (RTE cmi.core.lesson_status) — which
        // many LMSes count as finished. So the score waits for completion.
        held12 = { raw: Math.round(raw), min: lo, max: hi };
        if (sticky.completed) writeScore12();
      }
    },

    // Resume support: a small JSON blob of progress.
    getSuspend: function () { return get('cmi.suspend_data'); },
    // Returns false only when the write was rejected for size and the limit
    // was lowered: the caller should rebuild (compact) the blob and retry.
    setSuspend: function (str) {
      if (!trackingAllowed() || set('cmi.suspend_data', str)) return true;
      if (v2004 && suspendCap > 4000 && String(str).length > 4000) { suspendCap = 4000; return false; }
      return true;
    },
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
    // can break results down per objective. The first argument (the caller's
    // index) is ignored: the slot is resolved by objective id, see readIndexes.
    setObjective: function (_i, data) {
      if (!trackingAllowed() || unsupported.objectives || !data || !data.id) return;
      // A new id takes the next slot only once the LMS accepts it, so a
      // rejected write doesn't leave a gap the next objective would land past.
      var known = data.id in objectiveIndexById;
      var n = known ? objectiveIndexById[data.id] : objectiveCount;
      var p = 'cmi.objectives.' + n + '.';
      if (!set(p + 'id', data.id)) {
        if (notImplemented()) unsupported.objectives = true;
        return;
      }
      if (!known) { objectiveIndexById[data.id] = n; objectiveCount = n + 1; }
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
    // correct response patterns. The first argument (the caller's index) is
    // ignored: interactions are appended after the ones the LMS already holds.
    recordInteraction: function (_i, data) {
      if (!trackingAllowed() || unsupported.interactions || !data || !data.id) return;
      // The index advances only once the LMS accepts the id (it must stay
      // sequential; a rejected one would leave every later write past _count).
      var p = 'cmi.interactions.' + interactionCount + '.';
      if (!set(p + 'id', data.id)) {
        if (notImplemented()) unsupported.interactions = true;
        return;
      }
      interactionCount++;
      // 1.2 has no long-fill-in; free text goes in as fill-in.
      set(p + 'type', !v2004 && data.type === 'long-fill-in' ? 'fill-in' : data.type);
      // 1.2 student_response is CMIFeedback (max 255 chars); 2004 long-fill-in
      // holds up to 4000.
      var resp = formatResponse(v2004 ? data.response : compact12(data.response, data));
      set(p + (v2004 ? 'learner_response' : 'student_response'),
        v2004 ? (data.type === 'long-fill-in' ? resp.slice(0, 4000) : resp) : resp.slice(0, 255));
      // Unscored answers (reflections) are 'neutral' in both vocabularies.
      set(p + 'result', data.neutral ? 'neutral'
        : v2004 ? (data.correct ? 'correct' : 'incorrect') : (data.correct ? 'correct' : 'wrong'));
      // Optional fields.
      if (typeof data.weight === 'number') set(p + 'weighting', data.weight);
      if (typeof data.latencySec === 'number') set(p + 'latency', formatTime(data.latencySec));
      // description exists only in the 2004 data model.
      if (v2004 && data.description) set(p + 'description', String(data.description).slice(0, 250));
      // Timestamp: 2004 wants ISO-8601, 1.2 wants HH:MM:SS.
      if (v2004) set(p + 'timestamp', isoTimestamp());
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
        // 2004 fill-in patterns are case-insensitive unless flagged.
        var prefix = v2004 && data.type === 'fill-in' && data.caseMatters ? '{case_matters=true}' : '';
        for (var j = 0; j < limit; j++) {
          set(p + 'correct_responses.' + j + '.pattern', v2004
            ? prefix + formatResponse(cr[j])
            : formatResponse(compact12(cr[j], data)).slice(0, 255));
        }
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
        set(p + 'timestamp', isoTimestamp());
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
    // SCORM has no LMS return URL (the LMS owns the window); cmi5 does.
    getReturnUrl: function () { return ''; },
    // "Exit course": ask a 2004 LMS to suspend and close the course once the
    // SCO terminates (without a request many leave an empty frame behind).
    // 1.2 has no navigation requests.
    requestExit: function () { if (v2004) set('adl.nav.request', 'suspendAll'); },
    getLmsMastery: function () { return ctx.lmsMastery; },
    getPreferredLanguage: function () { return ctx.language; },
    // Learner preferences, read live. captions: 1 = on, 0 = no change,
    // -1 = off (1.2 cmi.student_preference.text / 2004
    // learner_preference.audio_captioning). Unsupported/errored → 0 / ''.
    // audio: 'off' when the learner muted sound (2004 audio_level 0, 1.2
    // student_preference.audio -1), else ''.
    getLearnerPreferences: function () {
      var prefs = { captions: 0, language: '', audio: '' };
      try {
        var c = parseInt(get(v2004 ? 'cmi.learner_preference.audio_captioning' : 'cmi.student_preference.text'), 10);
        if (c === 1 || c === -1) prefs.captions = c;
        prefs.language = String(get(v2004 ? 'cmi.learner_preference.language' : 'cmi.student_preference.language') || '');
        var a = get(v2004 ? 'cmi.learner_preference.audio_level' : 'cmi.student_preference.audio');
        if (a !== '' && parseFloat(a) === (v2004 ? 0 : -1)) prefs.audio = 'off';
      } catch (e) { /* LMS API threw: keep defaults */ }
      return prefs;
    },
    // Max suspend_data length the data model guarantees (1.2 CMIString4096,
    // 2004 characterstring SPM 64000). 0 = no known limit.
    suspendLimit: function () { return API ? (v2004 ? suspendCap : 4096) : 0; },

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
