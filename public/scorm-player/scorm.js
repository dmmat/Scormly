/* SCORM runtime wrapper supporting both SCORM 1.2 and 2004. Auto-detects which
   API the LMS exposes (API_1484_11 = 2004, API = 1.2) and maps a small unified
   interface onto the right data model. No-ops gracefully outside an LMS. */
(function () {
  'use strict';

  function find(win, name) {
    var tries = 0;
    while (win && tries < 10) {
      if (win[name]) return win[name];
      if (win.parent && win.parent !== win) { win = win.parent; tries++; } else break;
    }
    return null;
  }

  function discover() {
    // Prefer 2004, then 1.2.
    var api = find(window, 'API_1484_11');
    if (api) return { api: api, v2004: true };
    api = find(window, 'API');
    if (api) return { api: api, v2004: false };
    if (window.opener) {
      api = find(window.opener, 'API_1484_11');
      if (api) return { api: api, v2004: true };
      api = find(window.opener, 'API');
      if (api) return { api: api, v2004: false };
    }
    return null;
  }

  var API = null, v2004 = false, ready = false;

  function set(key, value) { if (ready && API) API[v2004 ? 'SetValue' : 'LMSSetValue'](key, String(value)); }

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
