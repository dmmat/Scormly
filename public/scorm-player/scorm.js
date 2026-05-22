/* SCORM runtime wrapper supporting both SCORM 1.2 and 2004. Auto-detects which
   API the LMS exposes (API_1484_11 = 2004, API = 1.2) and maps a small unified
   interface onto the right data model. No-ops gracefully outside an LMS. */
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

  function lastError() { return API ? API[v2004 ? 'GetLastError' : 'LMSGetLastError']() : '0'; }
  function errorString(code) { return API ? API[v2004 ? 'GetErrorString' : 'LMSGetErrorString'](code) : ''; }

  function set(key, value) {
    if (!(ready && API)) return;
    API[v2004 ? 'SetValue' : 'LMSSetValue'](key, String(value));
    var code = lastError();
    if (code && code !== '0') console.warn('[SCORM] SetValue(' + key + ') failed: ' + code + ' ' + errorString(code));
  }
  function get(key) { return ready && API ? API[v2004 ? 'GetValue' : 'LMSGetValue'](key) : ''; }

  // 1.2 wants CMITimespan HHHH:MM:SS.SS; 2004 wants an ISO-8601 duration.
  function formatTime(totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds));
    var hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    if (v2004) return 'PT' + hh + 'H' + mm + 'M' + ss + 'S';
    function pad(n, w) { return ('0000' + n).slice(-w); }
    return pad(hh, 4) + ':' + pad(mm, 2) + ':' + pad(ss, 2) + '.00';
  }

  var SCORM = {
    init: function () {
      var found = discover();
      if (!found) return false;
      API = found.api; v2004 = found.v2004;
      ready = API[v2004 ? 'Initialize' : 'LMSInitialize']('') === 'true';
      if (ready && !v2004) {
        var status = API.LMSGetValue('cmi.core.lesson_status');
        if (!status || status === 'not attempted') set('cmi.core.lesson_status', 'incomplete');
      }
      return ready;
    },
    // completed: boolean; success: 'passed' | 'failed' | null
    report: function (completed, success) {
      if (v2004) {
        set('cmi.completion_status', completed ? 'completed' : 'incomplete');
        if (success) set('cmi.success_status', success);
      } else {
        set('cmi.core.lesson_status', success ? success : (completed ? 'completed' : 'incomplete'));
      }
    },
    setScore: function (raw, min, max) {
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
    setSuspend: function (str) { set('cmi.suspend_data', str); },
    setLocation: function (str) { set(v2004 ? 'cmi.location' : 'cmi.core.lesson_location', str); },
    // Tell the LMS to preserve suspend_data/location for the next launch.
    // '' (normal) on completion, 'suspend' while the attempt is still in progress.
    setExit: function (mode) { set(v2004 ? 'cmi.exit' : 'cmi.core.exit', mode); },
    // 2004 only: fraction 0..1 for the LMS progress bar.
    setProgress: function (fraction) {
      if (v2004) set('cmi.progress_measure', Math.max(0, Math.min(1, fraction)).toFixed(4));
    },
    setSessionTime: function (seconds) {
      set(v2004 ? 'cmi.session_time' : 'cmi.core.session_time', formatTime(seconds));
    },
    // Record a quiz answer as a SCORM interaction (for LMS analytics).
    recordInteraction: function (i, data) {
      var p = 'cmi.interactions.' + i + '.';
      set(p + 'id', data.id);
      set(p + 'type', data.type);
      set(p + (v2004 ? 'learner_response' : 'student_response'), data.response);
      set(p + 'result', v2004 ? (data.correct ? 'correct' : 'incorrect') : (data.correct ? 'correct' : 'wrong'));
    },
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
