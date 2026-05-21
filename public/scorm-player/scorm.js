/* Minimal SCORM 1.2 runtime wrapper. Discovers the LMS API and exposes helpers.
   No-ops gracefully when launched outside an LMS (e.g. local preview). */
(function () {
  'use strict';

  function findAPI(win) {
    var tries = 0;
    while (win && tries < 10) {
      if (win.API) return win.API;
      if (win.parent && win.parent !== win) {
        win = win.parent;
        tries++;
      } else {
        break;
      }
    }
    return null;
  }

  function getAPI() {
    var api = findAPI(window);
    if (!api && window.opener) api = findAPI(window.opener);
    return api;
  }

  var API = null;
  var initialized = false;

  var SCORM = {
    init: function () {
      API = getAPI();
      if (!API) return false;
      var ok = API.LMSInitialize('') === 'true';
      initialized = ok;
      if (ok) {
        // Mark as started if the LMS hasn't recorded a status yet.
        var status = API.LMSGetValue('cmi.core.lesson_status');
        if (!status || status === 'not attempted') {
          API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
        }
      }
      return ok;
    },
    set: function (key, value) {
      if (initialized && API) API.LMSSetValue(key, String(value));
    },
    setStatus: function (status) {
      this.set('cmi.core.lesson_status', status);
    },
    setScore: function (raw, min, max) {
      this.set('cmi.core.score.raw', Math.round(raw));
      this.set('cmi.core.score.min', min == null ? 0 : min);
      this.set('cmi.core.score.max', max == null ? 100 : max);
    },
    commit: function () {
      if (initialized && API) API.LMSCommit('');
    },
    finish: function () {
      if (initialized && API) {
        API.LMSCommit('');
        API.LMSFinish('');
        initialized = false;
      }
    },
    available: function () {
      return !!API;
    },
  };

  window.SCORM = SCORM;
})();
