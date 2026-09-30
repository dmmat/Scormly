/* Scormly SCORM player. Reads the course embedded by course-data.js
   (window.__SCORMLY_COURSE__) and renders it for the learner, reporting
   completion/score to the LMS via the tracking wrapper (window.SCORM, provided
   by scorm.js or xapi.js). */
(function () {
  'use strict';

  // [brand, brand-dark, button radius, surface radius] — mirrors the builder
  // themes in src/index.css so exports look like the preview.
  var THEME_ACCENT = {
    rose: ['#db2777', '#be185d', '0.5rem', '0.5rem'],
    ocean: ['#0369a1', '#075985', '9999px', '1rem'],
    forest: ['#15803d', '#166534', '0.25rem', '0.25rem'],
    sunset: ['#c2410c', '#9a3412', '0.75rem', '0.75rem'],
    mono: ['#334155', '#1e293b', '0', '0'],
    indigo: ['#4f46e5', '#4338ca', '2px', '2px'],
    crimson: ['#dc2626', '#b91c1c', '0', '2px'],
    mint: ['#0f766e', '#115e59', '1.25rem', '1.5rem'],
    grape: ['#9333ea', '#7e22ce', '9999px', '0.375rem'],
    terminal: ['#15803d', '#166534', '0', '0'],
  };

  var T = {
    en: { prev: 'Previous', next: 'Next', progress: 'Lesson {n} of {total}',
      empty: 'This lesson has no content yet.', submit: 'Submit answer', retry: 'Try again',
      correct: 'Correct', incorrect: 'Incorrect', yourScore: 'Your score: {s}%',
      passed: 'Passed', failed: 'Not passed', restart: 'Restart', end: 'The end',
      finish: 'Finish', courseComplete: 'Course complete',
      courseCompleteText: 'You have reached the end of the course. You can close this window.',
      review: 'Review the course', watchToContinue: 'Watch the video to continue.',
      close: 'Close', hotspotMarker: 'Marker {n}: {title}', hotspotProgress: 'Explored {n} of {total}',
      stepOf: 'Step {n} of {total}', goToStep: 'Go to step {n}',
      sequenceHint: 'Drag the items, or use the arrows, to put them in the right order.',
      categoriesHint: 'Drag each item into a category, or pick one from its list.',
      unsorted: 'Not sorted yet', chooseCategory: 'Choose a category', dragItem: 'Drag to reorder',
      moveUp: 'Move up', moveDown: 'Move down', correctPosition: 'Correct position: {n}',
      correctCategory: 'Correct: {c}', correctAnswer: 'Answer: {a}', blankN: 'Blank {n}',
      skipToContent: 'Skip to content', lessonNav: 'Lesson navigation', a11ySettings: 'Accessibility settings',
      textSize: 'Text size', textNormal: 'Normal', textLarge: 'Large', textXLarge: 'Extra large',
      highContrast: 'High contrast', readableSpacing: 'Readable spacing', reduceMotion: 'Reduce motion',
      captionsDefault: 'Captions on by default', captions: 'Captions', transcript: 'Transcript',
      embedTitle: 'Embedded content', lessonAnnounce: 'Lesson {n} of {total}: {title}',
      cardFront: 'Front', cardBack: 'Back', flipHint: 'Press Enter or Space to flip the card.' },
    uk: { prev: 'Назад', next: 'Далі', progress: 'Урок {n} з {total}',
      empty: 'У цьому уроці ще немає контенту.', submit: 'Відповісти', retry: 'Спробувати ще раз',
      correct: 'Правильно', incorrect: 'Неправильно', yourScore: 'Ваш результат: {s}%',
      passed: 'Складено', failed: 'Не складено', restart: 'Спочатку', end: 'Кінець',
      finish: 'Завершити', courseComplete: 'Курс завершено',
      courseCompleteText: 'Ви пройшли курс до кінця. Це вікно можна закрити.',
      review: 'Переглянути курс', watchToContinue: 'Перегляньте відео, щоб продовжити.',
      close: 'Закрити', hotspotMarker: 'Мітка {n}: {title}', hotspotProgress: 'Переглянуто {n} з {total}',
      stepOf: 'Крок {n} з {total}', goToStep: 'Перейти до кроку {n}',
      sequenceHint: 'Перетягніть елементи або скористайтеся стрілками, щоб розставити їх у правильному порядку.',
      categoriesHint: 'Перетягніть кожен елемент у категорію або оберіть її зі списку.',
      unsorted: 'Ще не розсортовано', chooseCategory: 'Оберіть категорію', dragItem: 'Перетягніть, щоб змінити порядок',
      moveUp: 'Вище', moveDown: 'Нижче', correctPosition: 'Правильна позиція: {n}',
      correctCategory: 'Правильно: {c}', correctAnswer: 'Відповідь: {a}', blankN: 'Пропуск {n}',
      skipToContent: 'Перейти до вмісту', lessonNav: 'Навігація уроками', a11ySettings: 'Налаштування доступності',
      textSize: 'Розмір тексту', textNormal: 'Звичайний', textLarge: 'Великий', textXLarge: 'Дуже великий',
      highContrast: 'Висока контрастність', readableSpacing: 'Зручні інтервали', reduceMotion: 'Зменшити анімацію',
      captionsDefault: 'Субтитри увімкнено за замовчуванням', captions: 'Субтитри', transcript: 'Транскрипт',
      embedTitle: 'Вбудований вміст', lessonAnnounce: 'Урок {n} з {total}: {title}',
      cardFront: 'Лицьовий бік', cardBack: 'Зворотний бік', flipHint: 'Натисніть Enter або пробіл, щоб перевернути картку.' },
  };
  var lang = (navigator.language || 'en').toLowerCase().indexOf('uk') === 0 ? 'uk' : 'en';
  function t(key, vars) {
    var s = (T[lang] && T[lang][key]) || T.en[key] || key;
    if (vars) for (var k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  // ── Learner accessibility preferences ────────────────────────────────────
  // Stored per learner in localStorage ('scormly-a11y'). `motion` and
  // `captions` are tri-state: undefined = follow the OS / LMS default.
  var A11Y_KEY = 'scormly-a11y';
  var a11y = { text: 'normal', contrast: false, spacing: false, motion: undefined, captions: undefined };
  var lmsCaptions = false; // LMS learner preference said "captions on"
  try {
    var storedA11y = JSON.parse(window.localStorage.getItem(A11Y_KEY) || 'null');
    if (storedA11y && typeof storedA11y === 'object') {
      if (storedA11y.text === 'large' || storedA11y.text === 'xlarge') a11y.text = storedA11y.text;
      a11y.contrast = storedA11y.contrast === true;
      a11y.spacing = storedA11y.spacing === true;
      if (typeof storedA11y.motion === 'boolean') a11y.motion = storedA11y.motion;
      if (typeof storedA11y.captions === 'boolean') a11y.captions = storedA11y.captions;
    }
  } catch (e) { /* storage unavailable or corrupt: defaults */ }

  function saveA11y() {
    try { window.localStorage.setItem(A11Y_KEY, JSON.stringify(a11y)); } catch (e) { /* storage unavailable */ }
  }
  function osReducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function motionReduced() { return typeof a11y.motion === 'boolean' ? a11y.motion : osReducedMotion(); }
  // Local override > LMS preference > off.
  function captionsOn() { return typeof a11y.captions === 'boolean' ? a11y.captions : lmsCaptions; }

  // Reflect the preferences as attributes on <html>; player.css does the rest.
  function applyA11y() {
    var root = document.documentElement;
    if (a11y.text !== 'normal') root.setAttribute('data-a11y-text', a11y.text); else root.removeAttribute('data-a11y-text');
    if (a11y.contrast) root.setAttribute('data-a11y-contrast', 'on'); else root.removeAttribute('data-a11y-contrast');
    if (a11y.spacing) root.setAttribute('data-a11y-spacing', 'on'); else root.removeAttribute('data-a11y-spacing');
    // 'full' = explicit opt-out, which also overrides the OS media query in CSS.
    if (typeof a11y.motion === 'boolean') root.setAttribute('data-a11y-motion', a11y.motion ? 'reduce' : 'full');
    else root.removeAttribute('data-a11y-motion');
  }
  function applyCaptions(video) {
    var on = captionsOn();
    var tracks = video.textTracks || [];
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].kind === 'captions') tracks[i].mode = on ? 'showing' : 'disabled';
    }
  }

  // Darken a #rrggbb color toward black (used for the high-contrast accent).
  function darken(hex, factor) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      var d = Math.round(v * factor).toString(16);
      return d.length < 2 ? '0' + d : d;
    });
    return '#' + c.join('');
  }

  // Polite live region, kept outside #app so re-renders don't recreate it
  // (screen readers only announce changes to regions that already exist).
  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = msg; }, 60);
  }

  // Header button + non-modal settings panel (disclosure pattern).
  var a11yPanelSeq = 0;
  var a11yMenu = null; // the menu in the current header (re-created on render)
  document.addEventListener('mousedown', function (e) {
    if (a11yMenu && a11yMenu.isOpen() && !a11yMenu.wrap.contains(e.target)) a11yMenu.close();
  });
  function renderA11yMenu() {
    var panelId = 'a11y-panel-' + (++a11yPanelSeq);
    var titleId = panelId + '-title';
    var btn = h('button', { class: 'a11y-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId,
      'aria-label': t('a11ySettings'), title: t('a11ySettings') }, h('span', { 'aria-hidden': 'true', text: 'Aa' }));
    var panel = h('div', { class: 'a11y-panel', id: panelId, role: 'dialog', 'aria-labelledby': titleId });
    panel.hidden = true;
    var wrap = h('div', { class: 'a11y-menu' }, [btn, panel]);

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var first = panel.querySelector('input:checked') || panel.querySelector('input');
        if (first) first.focus();
      } else if (returnFocus) btn.focus();
    }
    btn.addEventListener('click', function () { setOpen(panel.hidden, true); });
    wrap.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !panel.hidden) { e.stopPropagation(); setOpen(false, true); }
    });
    // Close when focus or a click moves outside the menu.
    wrap.addEventListener('focusout', function (e) {
      if (!panel.hidden && e.relatedTarget && !wrap.contains(e.relatedTarget)) setOpen(false, false);
    });
    a11yMenu = { wrap: wrap, isOpen: function () { return !panel.hidden; }, close: function () { setOpen(false, false); } };

    panel.appendChild(h('p', { class: 'a11y-panel-title', id: titleId, text: t('a11ySettings') }));
    var sizes = h('fieldset', { class: 'a11y-sizes' }, h('legend', { text: t('textSize') }));
    [['normal', 'textNormal'], ['large', 'textLarge'], ['xlarge', 'textXLarge']].forEach(function (opt) {
      var input = h('input', { type: 'radio', name: panelId + '-size', value: opt[0] });
      input.checked = a11y.text === opt[0];
      input.addEventListener('change', function () { if (input.checked) { a11y.text = opt[0]; saveA11y(); applyA11y(); } });
      sizes.appendChild(h('label', { class: 'a11y-opt' }, [input, h('span', { text: t(opt[1]) })]));
    });
    panel.appendChild(sizes);

    function toggle(labelKey, checked, onChange) {
      var input = h('input', { type: 'checkbox' });
      input.checked = checked;
      input.addEventListener('change', function () { onChange(input.checked); saveA11y(); applyA11y(); });
      panel.appendChild(h('label', { class: 'a11y-opt a11y-toggle' }, [input, h('span', { text: t(labelKey) })]));
    }
    toggle('highContrast', a11y.contrast, function (v) { a11y.contrast = v; });
    toggle('readableSpacing', a11y.spacing, function (v) { a11y.spacing = v; });
    toggle('reduceMotion', motionReduced(), function (v) { a11y.motion = v; });
    toggle('captionsDefault', captionsOn(), function (v) {
      a11y.captions = v;
      Array.prototype.forEach.call(document.querySelectorAll('video'), applyCaptions);
    });
    return wrap;
  }

  // After a lesson change: focus the lesson heading and announce it.
  function focusLessonHeading(announceIt) {
    var h1 = document.querySelector('.lesson-title, .finish-title');
    if (h1) { try { h1.focus({ preventScroll: true }); } catch (e) { h1.focus(); } }
    var body = document.querySelector('.player-body');
    if (body) body.scrollTop = 0;
    if (!announceIt) return;
    if (state.finished) { announce(t('courseComplete')); return; }
    var lessons = state.course.lessons || [];
    var lesson = lessons[state.lessonIndex];
    announce(t('lessonAnnounce', { n: state.lessonIndex + 1, total: lessons.length, title: lesson ? lesson.title || '' : '' }));
  }

  function skipLink() {
    return h('a', { class: 'skip-link', href: '#main-content', text: t('skipToContent'),
      onclick: function (e) { e.preventDefault(); focusLessonHeading(false); } });
  }

  // Author-set language of the course content (BCP 47), or null.
  function contentLang() {
    var l = state.course && state.course.settings && state.course.settings.contentLanguage;
    return typeof l === 'string' && l.trim() ? l.trim() : null;
  }

  // Block types that produce a 0–100 score and count like quizzes (course
  // score, per-block objectives, the 'quiz' completion rule, linear gating).
  var SCORED = { quiz: true, ordering: true, fillBlanks: true };

  var state = { course: null, lessonIndex: 0, visited: {}, continued: {}, watched: {}, quizResults: {}, quizzes: [], quizIndexById: {}, interactionIndex: 0, sessionStart: 0, complete: false, finished: false, summary: null, learner: null, lmsMode: 'normal' };

  function start(course) {
    state.course = course;
    var accent = THEME_ACCENT[course.theme] || THEME_ACCENT.rose;
    document.documentElement.style.setProperty('--brand', accent[0]);
    document.documentElement.style.setProperty('--brand-dark', accent[1]);
    document.documentElement.style.setProperty('--radius-btn', accent[2]);
    document.documentElement.style.setProperty('--radius-surface', accent[3]);
    // Theme-specific extras beyond color/radius (e.g. terminal font) live in player.css.
    document.documentElement.setAttribute('data-theme', THEME_ACCENT[course.theme] ? course.theme : 'rose');
    // High-contrast accent: the theme's dark shade pushed toward black so
    // white-on-brand buttons and brand-colored text reach ~7:1.
    document.documentElement.style.setProperty('--brand-hc', darken(accent[1], 0.6));
    document.documentElement.style.setProperty('--brand-hc-dark', darken(accent[1], 0.45));
    applyA11y();
    document.title = course.title || 'Course';

    // Index all scored blocks for scoring and per-block objectives.
    (course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) {
        if (SCORED[b.type]) {
          state.quizIndexById[b.id] = state.quizzes.length;
          state.quizzes.push({ id: b.id, data: b.data });
        }
      });
    });

    SCORM.init();
    state.sessionStart = Date.now();
    // Registered right after init (not after the async cmi5 handshake) so a
    // learner who closes the window early still gets a proper terminate.
    // pagehide covers browsers/iframes where beforeunload doesn't fire
    // (mobile Safari, some LMS frame teardowns); the flag stops a double exit.
    var exited = false;
    function onExit() {
      if (exited) return;
      exited = true;
      SCORM.setSessionTime((Date.now() - state.sessionStart) / 1000);
      SCORM.setExit(state.complete ? '' : 'suspend');
      // Only ever terminate from the AU; cmi5 `abandoned` is LMS-issued.
      // `true` = unloading, so xapi.js posts `terminated` immediately.
      SCORM.finish(true);
    }
    window.addEventListener('beforeunload', onExit);
    window.addEventListener('pagehide', onExit);
    // cmi5 loads its launch context and resume data over the network; SCORM
    // calls back immediately.
    SCORM.whenReady(resume);
  }

  function resume() {
    // LMS may push a preferred language (SCORM learner_preference.language /
    // cmi5 languagePreference). Switch the player UI if it matches a supported
    // locale; otherwise keep the browser-based default.
    // An explicit course setting wins over both.
    var fixedLang = settings().playerLanguage;
    var lmsLang = (SCORM.getPreferredLanguage && SCORM.getPreferredLanguage()) || '';
    var twoLetter = lmsLang.toLowerCase().slice(0, 2);
    if (fixedLang !== 'auto') lang = fixedLang;
    else if (T[twoLetter]) lang = twoLetter;
    document.documentElement.lang = lang;

    // LMS learner preference "captions on" (SCORM audio_captioning / 1.2
    // student_preference.text). A local override in the a11y menu still wins.
    try {
      var prefs = SCORM.getLearnerPreferences && SCORM.getLearnerPreferences();
      lmsCaptions = !!prefs && Number(prefs.captions) === 1;
    } catch (e) { lmsCaptions = false; }

    state.learner = SCORM.getLearner && SCORM.getLearner();
    state.lmsMode = (SCORM.getMode && SCORM.getMode()) || 'normal';

    // Resume from saved progress, if any (format: see buildSuspend).
    var saved = null;
    try { saved = JSON.parse(SCORM.getSuspend() || 'null'); } catch (e) { saved = null; }
    applySuspend(saved);

    visit(saved && typeof saved.l === 'number' ? saved.l : 0);
  }

  // Restricted "Continue" gates in a lesson (block subsequent content + advance).
  function lessonGates(lesson) {
    return (lesson.blocks || []).filter(function (b) {
      return b.type === 'continue' && b.data.mode === 'restricted';
    });
  }
  // Videos in a lesson that must be watched before advancing.
  function requiredVideos(lesson) {
    return (lesson.blocks || []).filter(function (b) {
      return b.type === 'video' && b.data.requireWatch;
    });
  }
  // Scored blocks (quizzes & exercises) in a lesson, and whether they've all
  // been answered.
  function lessonQuizzesAnswered(lesson) {
    return (lesson.blocks || []).every(function (b) {
      return !SCORED[b.type] || state.quizResults[b.id] != null;
    });
  }
  // Per-block gates that block advancing in any navigation mode: restricted
  // Continue gates passed AND every required video watched.
  function gatesSatisfied(lesson) {
    if (!lesson) return true;
    return lessonGates(lesson).every(function (b) { return state.continued[b.id]; })
      && requiredVideos(lesson).every(function (b) { return state.watched[b.id]; });
  }
  function lessonComplete(index) {
    var lesson = (state.course.lessons || [])[index];
    if (!lesson || !state.visited[index]) return false;
    return gatesSatisfied(lesson);
  }
  // Whether the learner may leave the current lesson via Next/Finish. Always
  // requires the per-block gates; linear navigation also requires the lesson's
  // quizzes to be answered (when the completion rule involves quizzes).
  function canLeaveLesson(index) {
    var lesson = (state.course.lessons || [])[index];
    if (!gatesSatisfied(lesson)) return false;
    if (settings().navigation === 'linear' && settings().completion === 'quiz') {
      return lessonQuizzesAnswered(lesson);
    }
    return true;
  }
  // Continue button. Both modes advance to the next lesson (or finish on the
  // last one) like the preview does — but only when the lesson's rules allow
  // leaving it (required videos, linear quiz rule, later gates). A restricted
  // gate is marked passed first, so its hidden content is revealed and stays
  // unlocked when the learner comes back via Previous; if the learner can't
  // leave yet (or the gate hides content on the last lesson), the lesson is
  // re-rendered in place to show that content.
  function onContinue(b, restricted) {
    var lessons = state.course.lessons || [];
    var lesson = lessons[state.lessonIndex];
    var isLast = state.lessonIndex >= lessons.length - 1;
    if (restricted) { state.continued[b.id] = true; reportProgress(); }
    var blocks = (lesson && lesson.blocks) || [];
    var hidesContent = restricted && blocks.indexOf(b) < blocks.length - 1;
    if (canLeaveLesson(state.lessonIndex) && !(isLast && hidesContent)) {
      if (isLast) finishCourse(); else visit(state.lessonIndex + 1);
      return;
    }
    if (restricted) {
      // Re-render in place, keeping the scroll position.
      var body = document.querySelector('.player-body');
      var top = body ? body.scrollTop : 0;
      render();
      body = document.querySelector('.player-body');
      if (body) body.scrollTop = top;
    }
    refreshGating();
  }

  // Linear navigation: a lesson can be jumped to only when every lesson
  // before it has been visited and may be left (gates, required videos, quiz
  // rule) — i.e. it is reachable by Next alone.
  function canReachLesson(index) {
    if (settings().navigation !== 'linear') return true;
    for (var k = 0; k < index; k++) {
      if (!state.visited[k] || !canLeaveLesson(k)) return false;
    }
    return true;
  }

  // Learner explicitly ends the course: report final state and terminate the
  // LMS session, then show the completion screen.
  function finishCourse() {
    state.visited[state.lessonIndex] = true;
    state.finished = true;
    reportProgress();
    SCORM.setSessionTime((Date.now() - state.sessionStart) / 1000);
    SCORM.setExit(state.complete ? '' : 'suspend');
    SCORM.finish();
    render();
    focusLessonHeading(true);
  }

  // Mark a required video as watched and update gating without re-rendering
  // (which would reset the video element).
  function markWatched(id) {
    if (state.watched[id]) return;
    state.watched[id] = true;
    reportProgress();
    refreshGating();
  }
  // Re-evaluate the advance button and hide any now-satisfied video hints,
  // in place (no full render).
  function refreshGating() {
    var btn = document.getElementById('advance-btn');
    if (btn) btn.disabled = !canLeaveLesson(state.lessonIndex);
    document.querySelectorAll('.outline-item[data-lesson]').forEach(function (el) {
      el.disabled = !canReachLesson(Number(el.getAttribute('data-lesson')));
    });
    Object.keys(state.watched).forEach(function (id) {
      var hint = document.getElementById('vgate-' + id);
      if (hint) hint.style.display = 'none';
    });
  }

  function visit(index) {
    state.lessonIndex = index;
    state.visited[index] = true;
    render();
    reportProgress();
    // The initial (resume) render keeps the natural focus order; later lesson
    // changes move focus to the heading and announce the lesson.
    if (lessonShown) focusLessonHeading(true);
    else document.querySelector('.player-body').scrollTop = 0;
    lessonShown = true;
  }
  var lessonShown = false;

  var DEFAULT_SETTINGS = { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' };
  function settings() {
    var s = state.course.settings || {};
    return {
      completion: s.completion || DEFAULT_SETTINGS.completion,
      scored: s.scored !== false,
      passingScore: typeof s.passingScore === 'number' ? s.passingScore : DEFAULT_SETTINGS.passingScore,
      navigation: s.navigation === 'linear' ? 'linear' : 'free',
      playerLanguage: s.playerLanguage === 'en' || s.playerLanguage === 'uk' ? s.playerLanguage : 'auto',
      showProgress: s.showProgress !== false,
      finishMessage: typeof s.finishMessage === 'string' ? s.finishMessage.trim() : '',
    };
  }

  function reportProgress() {
    var lessons = state.course.lessons || [];
    var cfg = settings();
    var completedCount = 0;
    lessons.forEach(function (_, i) { if (lessonComplete(i)) completedCount++; });
    var contentDone = lessons.length > 0 && completedCount === lessons.length;
    var progressFraction = lessons.length ? completedCount / lessons.length : 0;
    SCORM.setProgress(progressFraction);
    // cmi5: emit a `progressed` statement when crossing a 10% milestone.
    // No-op on SCORM, where setProgress already covers the progress measure.
    if (SCORM.setProgressed) SCORM.setProgressed(progressFraction);

    var hasQuiz = state.quizzes.length > 0;
    var quizzesDone = hasQuiz && state.quizzes.every(function (q) {
      return state.quizResults[q.id] != null;
    });

    // Completion criterion (project setting). 'quiz' also requires every quiz
    // answered; falls back to content-only when the course has no quizzes.
    var completed = (cfg.completion === 'quiz' && hasQuiz)
      ? (contentDone && quizzesDone)
      : contentDone;

    // Scoring / pass-fail — only when enabled and the course has quizzes.
    var success = null;
    var scoreValue = null;
    if (cfg.scored && hasQuiz && quizzesDone) {
      scoreValue = avgOf(state.quizzes.map(function (q) { return state.quizResults[q.id]; }));
      SCORM.setScore(scoreValue, 0, 100);
      if (completed) success = scoreValue >= cfg.passingScore ? 'passed' : 'failed';
    }

    state.complete = completed;
    // Snapshot for the completion screen (success may be null until completed).
    state.summary = {
      completed: completed,
      score: scoreValue,
      success: scoreValue == null ? null : (scoreValue >= cfg.passingScore ? 'passed' : 'failed'),
    };
    SCORM.report(completed, success);
    SCORM.setSuspend(buildSuspend());
    SCORM.setLocation(String(state.lessonIndex));
    SCORM.commit();
  }

  function avgOf(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  // ── Resume state (suspend_data) ──────────────────────────────────────────
  // Keys: l=lesson, v=visited indices, q=scores by block id, c=passed
  // restricted "Continue" gates, w=watched required videos. When the runtime
  // reports a size limit (SCORM 1.2: 4096 chars) and the state outgrows it, it
  // is shrunk step by step — never silently: block ids become ordinals and
  // visited lists become ranges (z=1), then the gate/video maps are dropped.
  // Lesson position and scores are always kept.
  function blockOrdinals() {
    var list = [];
    (state.course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) { list.push(b.id); });
    });
    return list;
  }
  function toRanges(nums) {
    nums = nums.slice().sort(function (a, b) { return a - b; });
    var out = [];
    for (var i = 0; i < nums.length; i++) {
      var s = nums[i], e = s;
      while (i + 1 < nums.length && nums[i + 1] === e + 1) e = nums[++i];
      out.push(s === e ? String(s) : s + '-' + e);
    }
    return out.join(',');
  }
  function fromRanges(str) {
    var out = [];
    String(str).split(',').forEach(function (part) {
      var m = /^(\d+)(?:-(\d+))?$/.exec(part);
      if (!m) return;
      for (var n = +m[1], e = m[2] ? +m[2] : n; n <= e; n++) out.push(n);
    });
    return out;
  }
  function buildSuspend() {
    var visited = Object.keys(state.visited).map(Number);
    var str = JSON.stringify({
      l: state.lessonIndex, v: visited, q: state.quizResults,
      c: Object.keys(state.continued), w: Object.keys(state.watched),
    });
    var limit = (SCORM.suspendLimit && SCORM.suspendLimit()) || 0;
    if (!limit || str.length <= limit) return str;

    var ids = blockOrdinals();
    function ord(list) {
      return list.map(function (id) { return ids.indexOf(id); }).filter(function (n) { return n >= 0; });
    }
    var q = {};
    Object.keys(state.quizResults).forEach(function (id) {
      var n = ids.indexOf(id);
      if (n >= 0) q[n] = Math.round(state.quizResults[id]);
    });
    var compact = { l: state.lessonIndex, z: 1, v: toRanges(visited), q: q,
      c: toRanges(ord(Object.keys(state.continued))), w: toRanges(ord(Object.keys(state.watched))) };
    var steps = [
      [],               // compact encoding only
      ['w'],            // then forget watched videos
      ['w', 'c'],       // then passed gates
      ['w', 'c', 'v'],  // then visited lessons
    ];
    for (var i = 0; i < steps.length; i++) {
      steps[i].forEach(function (k) { delete compact[k]; });
      str = JSON.stringify(compact);
      if (str.length <= limit) {
        console.warn('[Scormly] Resume data exceeded ' + limit + ' chars; saved in compact form'
          + (steps[i].length ? ' without: ' + steps[i].join(', ') : '') + '.');
        return str;
      }
    }
    console.error('[Scormly] Resume data (' + str.length + ' chars) exceeds the LMS limit of '
      + limit + ' even with only lesson position and scores; the LMS may truncate it.');
    return str;
  }
  // Apply a saved blob (full or compact form) to state.
  function applySuspend(saved) {
    if (!saved || typeof saved !== 'object') return;
    if (saved.z) {
      var ids = blockOrdinals();
      var q = {};
      Object.keys(saved.q || {}).forEach(function (n) { if (ids[n]) q[ids[n]] = saved.q[n]; });
      state.quizResults = q;
      if (saved.v) fromRanges(saved.v).forEach(function (i) { state.visited[i] = true; });
      if (saved.c) fromRanges(saved.c).forEach(function (n) { if (ids[n]) state.continued[ids[n]] = true; });
      if (saved.w) fromRanges(saved.w).forEach(function (n) { if (ids[n]) state.watched[ids[n]] = true; });
      return;
    }
    (saved.v || []).forEach(function (i) { state.visited[i] = true; });
    state.quizResults = saved.q || {};
    (saved.c || []).forEach(function (id) { state.continued[id] = true; });
    (saved.w || []).forEach(function (id) { state.watched[id] = true; });
  }

  function render() {
    var app = document.getElementById('app');
    app.innerHTML = '';
    var lessons = state.course.lessons || [];
    var i = state.lessonIndex;
    var lesson = lessons[i];

    if (state.finished) { renderComplete(app); return; }

    // Gates (restricted Continue + required videos), plus linear-mode quiz rule,
    // decide whether the learner may move on from this lesson.
    var canAdvance = canLeaveLesson(i);
    var isLast = i >= lessons.length - 1;

    // On the last lesson, "Next" becomes "Finish" (primary) to end the course.
    var advanceBtn = isLast
      ? h('button', { id: 'advance-btn', class: 'btn', text: t('finish'), disabled: canAdvance ? null : 'true',
          onclick: function () { if (canLeaveLesson(state.lessonIndex)) finishCourse(); } })
      : h('button', { id: 'advance-btn', class: 'btn btn-outline', text: t('next'), disabled: canAdvance ? null : 'true',
          onclick: function () { if (canLeaveLesson(state.lessonIndex)) visit(state.lessonIndex + 1); } });

    var titleRow = [
      h('span', { class: 'player-title', lang: contentLang(), text: state.course.title || '' }),
      settings().showProgress
        ? h('span', { class: 'player-progress', text: t('progress', { n: i + 1, total: lessons.length }) })
        : null,
    ];
    // Show the LMS-reported learner name (greeting) when available.
    if (state.learner && state.learner.name) {
      titleRow.push(h('span', { class: 'player-progress', text: '· ' + state.learner.name }));
    }
    // Browse / Review mode badge (LMS told us not to track this attempt).
    if (state.lmsMode && state.lmsMode !== 'normal') {
      titleRow.push(h('span', { class: 'player-progress', text: '· ' + state.lmsMode }));
    }
    var header = h('header', { class: 'player-header' }, [
      h('div', { style: 'display:flex;align-items:center;gap:12px;min-width:0' }, titleRow),
      h('div', { class: 'player-actions' }, [
        renderA11yMenu(),
        h('nav', { class: 'player-nav', 'aria-label': t('lessonNav') }, [
          h('button', { class: 'btn btn-outline', text: t('prev'), disabled: i === 0 ? 'true' : null,
            onclick: function () { if (i > 0) visit(i - 1); } }),
          advanceBtn,
        ]),
      ]),
    ]);

    var blocksEl = h('div', { class: 'blocks' });
    if (lesson && lesson.blocks && lesson.blocks.length) {
      for (var bi = 0; bi < lesson.blocks.length; bi++) {
        var b = lesson.blocks[bi];
        var el = renderBlock(b);
        if (el) blocksEl.appendChild(el);
        // Hide everything after an unpassed restricted gate.
        if (b.type === 'continue' && b.data.mode === 'restricted' && !state.continued[b.id]) break;
      }
    } else {
      blocksEl.appendChild(h('p', { class: 'empty', text: t('empty') }));
    }

    var body = h('main', { class: 'player-body', id: 'main-content' }, [
      h('div', { class: 'lesson', lang: contentLang() }, [
        h('h1', { class: 'lesson-title', tabindex: '-1', text: lesson ? lesson.title : '' }),
        blocksEl,
      ]),
    ]);

    app.appendChild(skipLink());
    app.appendChild(header);
    app.appendChild(body);
  }

  // Completion screen shown after the learner clicks Finish.
  function renderComplete(app) {
    var s = state.summary || {};
    var header = h('header', { class: 'player-header' }, [
      h('div', { style: 'display:flex;align-items:center;gap:12px;min-width:0' }, [
        h('span', { class: 'player-title', text: state.course.title || '' }),
      ]),
      h('div', { class: 'player-actions' }, [
        renderA11yMenu(),
        h('nav', { class: 'player-nav', 'aria-label': t('lessonNav') }, [
          h('button', { class: 'btn btn-outline', text: t('review'),
            onclick: function () { state.finished = false; render(); focusLessonHeading(true); } }),
        ]),
      ]),
    ]);
    var card = h('div', { class: 'finish-card' }, [
      h('div', { class: 'finish-check', 'aria-hidden': 'true', text: '✓' }),
      h('h1', { class: 'finish-title', tabindex: '-1', text: t('courseComplete') }),
      s.score != null ? h('p', { class: 'finish-score', text: t('yourScore', { s: Math.round(s.score) }) }) : null,
      s.success ? h('p', { class: 'finish-status ' + s.success, text: s.success === 'passed' ? t('passed') : t('failed') }) : null,
      h('p', { class: 'finish-text', text: settings().finishMessage || t('courseCompleteText') }),
    ]);
    var body = h('main', { class: 'player-body', id: 'main-content' }, [h('div', { class: 'lesson' }, card)]);
    app.appendChild(skipLink());
    app.appendChild(header);
    app.appendChild(body);
  }

  // Decorative images get an empty alt so screen readers skip them.
  function imgAlt(img) { return img.decorative ? '' : (img.alt || ''); }

  // Media element followed by a collapsible text transcript, when provided.
  function withTranscript(media, transcript) {
    var text = typeof transcript === 'string' ? transcript.trim() : '';
    if (!text) return media;
    return h('div', { class: 'media-with-transcript' }, [media,
      h('details', { class: 'transcript' }, [
        h('summary', { text: t('transcript') }),
        h('div', { class: 'transcript-text', text: text }),
      ])]);
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'heading': {
        var el = h('h' + b.data.level, { text: b.data.text });
        el.style.textAlign = b.data.align || 'left';
        return el;
      }
      case 'paragraph':
        return h('div', { class: 'rich-text', html: b.data.html });
      case 'list': {
        var list = h(b.data.ordered ? 'ol' : 'ul', { class: 'list' });
        (b.data.items || []).forEach(function (it) { list.appendChild(h('li', { text: it })); });
        return list;
      }
      case 'note':
        return h('div', { class: 'note ' + (b.data.variant === 'warning' ? 'warning' : 'info') }, [
          h('span', { text: b.data.variant === 'warning' ? '⚠' : 'ℹ' }),
          h('p', { text: b.data.text, style: 'margin:0' }),
        ]);
      case 'image':
        if (!b.data.src) return null;
        return h('figure', {}, [
          h('img', { src: b.data.src, alt: imgAlt(b.data) }),
          b.data.caption ? h('figcaption', { text: b.data.caption }) : null,
        ]);
      case 'gallery': {
        var g = h('div', { class: 'gallery' });
        (b.data.images || []).forEach(function (img) { g.appendChild(h('img', { src: img.src, alt: imgAlt(img) })); });
        return g;
      }
      case 'video':
        return renderVideo(b);
      case 'audio':
        if (!b.data.src) return null;
        return withTranscript(h('audio', { controls: 'true', src: b.data.src, style: 'width:100%' }), b.data.transcript);
      case 'embed': {
        var em = toEmbedUrl(b.data.url || '');
        if (!em) return null;
        return h('div', { class: 'embed' }, h('iframe', {
          src: em, title: (b.data.title || '').trim() || t('embedTitle'), allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        }));
      }
      case 'code':
        return h('pre', { class: 'code' }, h('code', { text: b.data.code || '' }));
      case 'table':
        return renderTable(b);
      case 'quote':
        return h('blockquote', { class: 'quote' }, [
          h('p', { text: b.data.text || '', style: 'margin:0' }),
          b.data.author ? h('footer', { class: 'quote-author', text: '— ' + b.data.author }) : null,
        ]);
      case 'continue': {
        var restricted = b.data.mode === 'restricted';
        // A passed gate disappears; the blocks it was hiding are now shown.
        if (restricted && state.continued[b.id]) return null;
        return h('div', { class: 'continue' }, h('button', { class: 'btn', text: b.data.label,
          onclick: function () { onContinue(b, restricted); } }));
      }
      case 'divider': {
        var hr = h('hr', { class: 'divider' });
        hr.style.borderTopStyle = b.data.style || 'solid';
        return hr;
      }
      case 'courseOutline':
        return renderOutline(b);
      case 'tabs': return renderTabs(b);
      case 'accordion': return renderAccordion(b);
      case 'flashcards': return renderFlashcards(b);
      case 'scenario': return renderScenario(b);
      case 'quiz': return renderQuiz(b);
      case 'hotspot': return renderHotspot(b);
      case 'timeline': return renderTimeline(b);
      case 'ordering': return renderOrdering(b);
      case 'fillBlanks': return renderFillBlanks(b);
      default: return null;
    }
  }

  function toEmbedUrl(url) {
    if (!url) return '';
    try {
      var u = new URL(url);
      var host = u.hostname.replace(/^www\.|^m\./, '');
      if (host === 'youtube.com' && u.searchParams.get('v')) {
        return 'https://www.youtube.com/embed/' + u.searchParams.get('v');
      }
      if (host === 'youtu.be') {
        return 'https://www.youtube.com/embed/' + u.pathname.slice(1);
      }
      if (host === 'vimeo.com') {
        var id = u.pathname.split('/').filter(Boolean)[0];
        if (/^\d+$/.test(id)) return 'https://player.vimeo.com/video/' + id;
      }
      return u.protocol === 'https:' ? url : '';
    } catch (e) { return ''; }
  }

  // Course outline: links to every lesson; a click navigates the learner there.
  // The lesson list is derived live from the course (not stored in the block).
  function renderOutline(b) {
    var lessons = state.course.lessons || [];
    var wrap = h('div', { class: 'outline' });
    if (b.data.title) wrap.appendChild(h('p', { class: 'outline-title', text: b.data.title }));
    var ol = h('ol', { class: 'outline-list' });
    var n = 0; // sequential number among shown lessons
    lessons.forEach(function (lesson, i) {
      if (i === state.lessonIndex) return; // exclude the current lesson
      n++;
      // Linear mode: lessons not yet reachable by Next are shown but locked.
      var locked = !canReachLesson(i);
      var row = h('button', { class: 'outline-item', type: 'button', 'data-lesson': String(i), disabled: locked ? 'true' : null,
        onclick: (function (idx) { return function () { if (canReachLesson(idx)) visit(idx); }; })(i) }, [
        b.data.numbered ? h('span', { class: 'outline-num', text: String(n) }) : null,
        h('span', { class: 'outline-label', text: lesson.title || '' }),
        h('span', { class: 'outline-arrow', text: '→' }),
      ]);
      ol.appendChild(h('li', {}, row));
    });
    wrap.appendChild(ol);
    return wrap;
  }

  // Video block. Download is disabled (controlsList=nodownload + no context
  // menu / PiP) — a deterrent, not DRM. When requireWatch is set, watching to
  // ~95% (or to the end) satisfies the lesson's advance gate.
  function renderVideo(b) {
    if (!b.data.src) return null;
    var video = h('video', {
      controls: 'true', controlslist: 'nodownload', disablepictureinpicture: 'true',
      src: b.data.src, poster: b.data.poster || null,
    });
    video.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    // WebVTT captions; shown by default per the learner's / LMS preference.
    if (b.data.captions) {
      video.appendChild(h('track', { kind: 'captions', src: b.data.captions, srclang: contentLang() || lang,
        label: t('captions'), default: captionsOn() ? '' : null }));
      applyCaptions(video);
      video.addEventListener('loadedmetadata', function () { applyCaptions(video); });
    }
    if (!b.data.requireWatch) return withTranscript(video, b.data.transcript);

    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime / video.duration >= 0.95) markWatched(b.id);
    });
    video.addEventListener('ended', function () { markWatched(b.id); });

    var wrap = h('div', { class: 'video-required' }, [video]);
    if (!state.watched[b.id]) {
      wrap.appendChild(h('p', { id: 'vgate-' + b.id, class: 'video-gate', text: t('watchToContinue') }));
    }
    return withTranscript(wrap, b.data.transcript);
  }

  function renderTable(b) {
    var rows = b.data.rows || [];
    var table = h('table', { class: 'data-table' });
    rows.forEach(function (row, ri) {
      var tr = h('tr');
      row.forEach(function (cell) {
        tr.appendChild(h(b.data.header && ri === 0 ? 'th' : 'td', { text: cell }));
      });
      table.appendChild(tr);
    });
    return table;
  }

  function renderTabs(b) {
    var tabs = b.data.tabs || [];
    // WAI-ARIA tabs: roving tabindex, arrows/Home/End move and activate.
    var base = 'tabs-' + b.id;
    var wrap = h('div', { class: 'tabs' });
    var bar = h('div', { class: 'tab-bar', role: 'tablist' });
    var panel = h('div', { class: 'tab-panel rich-text', role: 'tabpanel', id: base + '-panel', tabindex: '0' });
    var btns = [];
    function show(idx, focus) {
      btns.forEach(function (el, i) {
        el.className = 'tab-btn' + (i === idx ? ' active' : '');
        el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        el.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      panel.innerHTML = tabs[idx] ? tabs[idx].html : '';
      panel.setAttribute('aria-labelledby', base + '-tab-' + idx);
      if (focus) btns[idx].focus();
    }
    tabs.forEach(function (tab, idx) {
      var btn = h('button', { class: 'tab-btn', type: 'button', role: 'tab', id: base + '-tab-' + idx,
        'aria-controls': base + '-panel', text: tab.title, onclick: function () { show(idx); } });
      btn.addEventListener('keydown', function (e) {
        var n = tabs.length, to = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (idx + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (idx - 1 + n) % n;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = n - 1;
        if (to < 0) return;
        e.preventDefault();
        show(to, true);
      });
      btns.push(btn);
      bar.appendChild(btn);
    });
    wrap.appendChild(bar);
    wrap.appendChild(panel);
    if (tabs.length) show(0);
    return wrap;
  }

  function renderAccordion(b) {
    var wrap = h('div', {});
    (b.data.items || []).forEach(function (item, idx) {
      var bodyId = 'acc-' + b.id + '-' + idx;
      var body = h('div', { class: 'accordion-body rich-text', id: bodyId, html: item.html });
      body.style.display = 'none';
      var chev = h('span', { class: 'chev', 'aria-hidden': 'true', text: '▸' });
      var head = h('button', { class: 'accordion-head', type: 'button', 'aria-expanded': 'false', 'aria-controls': bodyId,
        onclick: function () {
          var open = body.style.display !== 'none';
          body.style.display = open ? 'none' : 'block';
          chev.textContent = open ? '▸' : '▾';
          head.setAttribute('aria-expanded', open ? 'false' : 'true');
        } }, [chev, h('span', { text: item.title })]);
      wrap.appendChild(h('div', { class: 'accordion-item' }, [head, body]));
    });
    return wrap;
  }

  function renderFlashcards(b) {
    var grid = h('div', { class: 'flashcards' });
    (b.data.cards || []).forEach(function (card) {
      // Only the visible face is exposed to assistive tech; flipping
      // announces the newly shown side.
      var front = h('div', { class: 'flashcard-face flashcard-front', text: card.front });
      var back = h('div', { class: 'flashcard-face flashcard-back', 'aria-hidden': 'true', text: card.back });
      var inner = h('div', { class: 'flashcard-inner' }, [front, back]);
      var fc = h('div', { class: 'flashcard', role: 'button', tabindex: '0', title: t('flipHint') }, inner);
      function flip() {
        var flipped = fc.classList.toggle('flipped');
        front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
        announce((flipped ? t('cardBack') : t('cardFront')) + ': ' + (flipped ? card.back : card.front));
      }
      fc.addEventListener('click', flip);
      fc.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); flip(); }
      });
      grid.appendChild(fc);
    });
    return grid;
  }

  // Image hotspots: numbered pulsing markers; a click opens a card with the
  // marker's title and text. Esc closes it and returns focus to the marker.
  function renderHotspot(b) {
    if (!b.data.src) return null;
    var spots = b.data.hotspots || [];
    var visited = {};
    var visitedCount = 0;
    var openIdx = -1;
    var markers = [];
    var stage = h('div', { class: 'hotspot-stage' }, h('img', { src: b.data.src, alt: imgAlt(b.data) }));
    var progress = spots.length ? h('p', { class: 'hotspot-progress' }) : null;
    var pop = null;

    function updateProgress() {
      if (progress) progress.textContent = t('hotspotProgress', { n: visitedCount, total: spots.length });
    }
    function close(focus) {
      if (pop) { pop.parentNode.removeChild(pop); pop = null; }
      if (openIdx >= 0) {
        markers[openIdx].setAttribute('aria-expanded', 'false');
        markers[openIdx].classList.remove('active');
        if (focus) markers[openIdx].focus();
      }
      openIdx = -1;
    }
    function open(i, focus) {
      var s = spots[i];
      close(false);
      openIdx = i;
      if (!visited[s.id]) { visited[s.id] = true; visitedCount++; markers[i].classList.add('visited'); updateProgress(); }
      markers[i].setAttribute('aria-expanded', 'true');
      markers[i].classList.add('active');
      // Anchor the card to the marker's nearer edge so it stays over the image.
      var tx = s.x < 33 ? '0%' : s.x > 67 ? '-100%' : '-50%';
      var ty = s.y <= 55 ? '1.5rem' : 'calc(-100% - 1.5rem)';
      pop = h('div', { class: 'hotspot-pop', role: 'dialog', tabindex: '-1', 'aria-label': s.title || '' }, [
        h('div', { class: 'hotspot-pop-head' }, [
          h('p', { class: 'hotspot-pop-title', text: s.title || '' }),
          h('button', { class: 'hotspot-close', type: 'button', 'aria-label': t('close'), text: '✕',
            onclick: function () { close(true); } }),
        ]),
        s.text ? h('p', { class: 'hotspot-pop-text', text: s.text }) : null,
      ]);
      pop.style.left = s.x + '%';
      pop.style.top = s.y + '%';
      pop.style.transform = 'translate(' + tx + ', ' + ty + ')';
      stage.appendChild(pop);
      // Move focus into the card so keyboard / screen reader users land on it.
      if (focus) pop.focus();
    }

    spots.forEach(function (s, i) {
      var m = h('button', { class: 'hotspot-marker', type: 'button', 'aria-expanded': 'false',
        'aria-label': t('hotspotMarker', { n: i + 1, title: s.title || '' }),
        onclick: function (e) { if (openIdx === i) close(false); else open(i, e.detail === 0); } },
        h('span', { class: 'hotspot-dot', text: String(i + 1) }));
      m.style.left = s.x + '%';
      m.style.top = s.y + '%';
      markers.push(m);
      stage.appendChild(m);
    });
    updateProgress();

    var wrap = h('div', { class: 'hotspot' }, [stage, progress]);
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openIdx >= 0) { e.stopPropagation(); close(true); }
    });
    return wrap;
  }

  // Timeline: 'vertical' lists every item; 'stepper' shows one step at a time
  // with Previous/Next and clickable step dots.
  function timelineItemBody(it) {
    return [
      it.label ? h('p', { class: 'timeline-label', text: it.label }) : null,
      it.title ? h('p', { class: 'timeline-title', text: it.title }) : null,
      it.text ? h('p', { class: 'timeline-text', text: it.text }) : null,
    ];
  }

  function renderTimeline(b) {
    var items = b.data.items || [];
    if (!items.length) return null;
    if (b.data.layout !== 'stepper') {
      var ol = h('ol', { class: 'timeline' });
      items.forEach(function (it) {
        ol.appendChild(h('li', { class: 'timeline-item' },
          [h('span', { class: 'timeline-dot' })].concat(timelineItemBody(it))));
      });
      return ol;
    }

    var index = 0;
    var seen = { 0: true };
    var dots = h('div', { class: 'stepper-dots' });
    var body = h('div', { class: 'stepper-body', 'aria-live': 'polite' });
    var counter = h('span', { class: 'stepper-count' });
    var prev = h('button', { class: 'btn btn-outline', type: 'button', text: t('prev'),
      onclick: function () { go(index - 1); } });
    var next = h('button', { class: 'btn', type: 'button', text: t('next'),
      onclick: function () { go(index + 1); } });
    var dotEls = items.map(function (it, n) {
      var d = h('button', { class: 'stepper-dot', type: 'button', text: String(n + 1),
        'aria-label': t('goToStep', { n: n + 1 }), onclick: function () { go(n); } });
      dots.appendChild(d);
      return d;
    });

    function go(n) {
      if (n < 0 || n >= items.length) return;
      index = n;
      seen[n] = true;
      dotEls.forEach(function (d, i) {
        d.className = 'stepper-dot' + (i === n ? ' active' : seen[i] ? ' seen' : '');
        if (i === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      body.innerHTML = '';
      timelineItemBody(items[n]).forEach(function (el) { if (el) body.appendChild(el); });
      counter.textContent = t('stepOf', { n: n + 1, total: items.length });
      // Keep keyboard focus alive when the focused button becomes disabled.
      var focused = document.activeElement;
      prev.disabled = n === 0;
      next.disabled = n === items.length - 1;
      if (focused === prev && prev.disabled) next.focus();
      else if (focused === next && next.disabled) prev.focus();
    }
    go(0);

    return h('div', { class: 'stepper' }, [dots, body,
      h('div', { class: 'stepper-nav' }, [prev, counter, next])]);
  }

  function renderScenario(b) {
    if ((b.data.layout || 'classic') === 'chat') return renderScenarioChat(b);
    var data = b.data;
    var wrap = h('div', { class: 'scenario' });
    function go(nodeId, emotion, moveFocus) {
      wrap.innerHTML = '';
      var node = nodeId ? (data.nodes || []).find(function (n) { return n.id === nodeId; }) : null;
      var emo = emotion || (node ? node.emotion : 'neutral');
      var avatar = data.characterImages && data.characterImages[emo];
      var col = h('div', { style: 'flex:1;min-width:0' });
      col.appendChild(h('p', { class: 'scenario-name', text: data.characterName || '' }));
      if (node) {
        col.appendChild(h('p', { class: 'scenario-text', tabindex: '-1', text: node.text }));
        var choices = h('div', { class: 'scenario-choices' });
        (node.choices || []).forEach(function (c) {
          choices.appendChild(h('button', { class: 'btn btn-outline', text: c.text, style: 'text-align:left',
            onclick: function () { go(c.nextNodeId, c.setEmotion, true); } }));
        });
        col.appendChild(choices);
      } else {
        col.appendChild(h('p', { class: 'empty scenario-text', tabindex: '-1', text: t('end') }));
        col.appendChild(h('button', { class: 'btn btn-outline', text: t('restart'),
          onclick: function () { go(data.startNodeId, null, true); } }));
      }
      var row = h('div', { class: 'scenario-row' }, [
        avatar ? h('img', { class: 'scenario-avatar', src: avatar, alt: '' }) : null,
        col,
      ]);
      wrap.appendChild(row);
      // The clicked choice is gone; move focus to the character's new line and
      // announce it.
      if (moveFocus) {
        var said = wrap.querySelector('.scenario-text');
        if (said) said.focus();
        announce((data.characterName ? data.characterName + ': ' : '') + (node ? node.text : t('end')));
      }
    }
    go(data.startNodeId);
    return wrap;
  }

  // Messenger-style scenario: an accumulating phone chat with reply bubbles.
  function renderScenarioChat(b) {
    var data = b.data;
    var nodes = data.nodes || [];
    function findNode(id) { return id ? nodes.find(function (n) { return n.id === id; }) : null; }
    var start = findNode(data.startNodeId);
    var imgs = data.characterImages || {};

    var wrap = h('div', { class: 'chat' });
    var header = h('div', { class: 'chat-header' }, [
      imgs.neutral ? h('img', { class: 'chat-avatar', src: imgs.neutral, alt: '' })
        : h('span', { class: 'chat-avatar chat-avatar-fallback', text: (data.characterName || '?').slice(0, 1).toUpperCase() }),
      h('span', { class: 'chat-name', text: data.characterName || '' }),
    ]);
    var body = h('div', { class: 'chat-body', role: 'log', 'aria-live': 'polite' });
    var replies = h('div', { class: 'chat-replies' });

    var messages = [];
    var currentId = data.startNodeId;
    var shown = 0; // messages already in the DOM

    // Appends only new messages, so the live log announces just those.
    function renderBody() {
      if (shown > messages.length) { body.innerHTML = ''; shown = 0; }
      messages.slice(shown).forEach(function (m) {
        if (m.from === 'bot') {
          var av = imgs[m.emotion];
          body.appendChild(h('div', { class: 'chat-row chat-row-bot' }, [
            av ? h('img', { class: 'chat-msg-avatar', src: av, alt: '' })
              : h('span', { class: 'chat-msg-avatar chat-avatar-fallback' }),
            h('p', { class: 'chat-bubble chat-bubble-bot', text: m.text }),
          ]));
        } else {
          body.appendChild(h('div', { class: 'chat-row chat-row-user' }, [
            h('p', { class: 'chat-bubble chat-bubble-user', text: m.text }),
            data.userAvatar ? h('img', { class: 'chat-msg-avatar', src: data.userAvatar, alt: '' }) : null,
          ]));
        }
      });
      shown = messages.length;
      body.scrollTop = body.scrollHeight;
    }

    function renderReplies(moveFocus) {
      replies.innerHTML = '';
      var node = findNode(currentId);
      if (node) {
        (node.choices || []).forEach(function (c) {
          replies.appendChild(h('button', { class: 'chat-reply', text: c.text, onclick: function () { choose(c); } }));
        });
      } else {
        replies.appendChild(h('span', { class: 'empty', text: t('end') }));
        replies.appendChild(h('button', { class: 'btn btn-outline', text: t('restart'), onclick: reset }));
      }
      // The clicked reply was removed; keep focus inside the chat.
      if (moveFocus) {
        var first = replies.querySelector('button');
        if (first) first.focus();
      }
    }

    function choose(c) {
      var target = findNode(c.nextNodeId);
      var emotion = c.setEmotion || (target ? target.emotion : 'neutral');
      messages.push({ from: 'user', text: c.text, emotion: emotion });
      if (target) messages.push({ from: 'bot', text: target.text, emotion: target.emotion });
      currentId = c.nextNodeId;
      renderBody(); renderReplies(true);
    }

    function reset() {
      messages = [];
      body.innerHTML = ''; shown = 0;
      if (start) messages.push({ from: 'bot', text: start.text, emotion: start.emotion });
      currentId = data.startNodeId;
      renderBody(); renderReplies(true);
    }

    if (start) messages.push({ from: 'bot', text: start.text, emotion: start.emotion });
    renderBody(); renderReplies();
    wrap.appendChild(header); wrap.appendChild(body); wrap.appendChild(replies);
    return wrap;
  }

  function renderQuiz(b) {
    var data = b.data;
    var answers = {};
    var submitted = false;
    var openedAt = Date.now(); // for latency on each interaction
    // Reveal correctness after submitting unless the quiz hides answers.
    var showAnswers = data.showAnswers !== false;
    var wrap = h('div', {});

    // For each matching question, scramble the right-column choices once so
    // the correct answer isn't simply the option at the same index. Stable
    // across re-renders within an attempt; re-rolled on retry.
    function shuffleArray(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }
    var matchChoices = {};
    function rollChoices() {
      matchChoices = {};
      (data.questions || []).forEach(function (q) {
        if (q.type === 'matching') matchChoices[q.id] = shuffleArray(q.pairs || []);
      });
    }
    rollChoices();

    function build() {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      (data.questions || []).forEach(function (q, qi) {
        var ok = reveal && isCorrect(q);
        var card = h('div', { class: 'quiz-q' + (reveal ? (ok ? ' correct' : ' incorrect') : '') });
        card.appendChild(h('p', { class: 'quiz-prompt', text: (qi + 1) + '. ' + q.prompt }));

        if (q.type === 'single' || q.type === 'multiple') {
          (q.options || []).forEach(function (o) {
            var input = h('input', { type: q.type === 'single' ? 'radio' : 'checkbox', name: q.id });
            input.disabled = submitted;
            input.checked = q.type === 'single' ? answers[q.id] === o.id
              : (answers[q.id] || []).indexOf(o.id) >= 0;
            input.addEventListener('change', function () {
              if (q.type === 'single') answers[q.id] = o.id;
              else {
                var set = answers[q.id] || [];
                var pos = set.indexOf(o.id);
                if (pos >= 0) set.splice(pos, 1); else set.push(o.id);
                answers[q.id] = set;
              }
            });
            card.appendChild(h('label', { class: 'quiz-opt' }, [input, h('span', { text: o.text }),
              reveal && o.feedback && input.checked ? h('span', { class: 'empty', text: '— ' + o.feedback }) : null]));
          });
        } else if (q.type === 'matching') {
          var choices = matchChoices[q.id] || q.pairs || [];
          (q.pairs || []).forEach(function (p) {
            var sel = h('select', { 'aria-label': p.left });
            sel.disabled = submitted;
            sel.appendChild(h('option', { value: '', text: '—' }));
            choices.forEach(function (opt) { sel.appendChild(h('option', { value: opt.right, text: opt.right })); });
            sel.value = (answers[q.id] || {})[p.id] || '';
            sel.addEventListener('change', function () {
              answers[q.id] = answers[q.id] || {};
              answers[q.id][p.id] = sel.value;
            });
            card.appendChild(h('div', { class: 'quiz-match' }, [h('span', { text: p.left }), sel]));
          });
        }

        if (reveal) {
          card.appendChild(h('p', { class: 'quiz-feedback ' + (ok ? 'passed' : 'failed') }, [
            resultIcon(ok),
            (ok ? t('correct') : t('incorrect')) + (q.feedback ? ' — ' + q.feedback : ''),
          ]));
        }
        wrap.appendChild(card);
      });

      if (submitted) {
        var score = computeScore();
        var passed = score >= data.passingScore;
        var res = h('div', { class: 'quiz-result' }, [
          h('p', { class: 'quiz-score', text: t('yourScore', { s: score }) }),
          h('p', { class: (passed ? 'passed' : 'failed'), style: 'font-weight:500;margin:4px 0 0',
            text: passed ? t('passed') : t('failed') }),
          h('button', { class: 'btn btn-outline', style: 'margin-top:12px', text: t('retry'),
            onclick: function () { submitted = false; answers = {}; rollChoices(); openedAt = Date.now(); build(); focusFirstControl(wrap); } }),
        ]);
        wrap.appendChild(res);
      } else {
        wrap.appendChild(h('button', { class: 'btn', text: t('submit'),
          onclick: function () { submitted = true; build(); recordScore(); announceResult(wrap); } }));
      }
    }

    function isCorrect(q) {
      var a = answers[q.id];
      if (q.type === 'single') {
        var opt = (q.options || []).find(function (o) { return o.id === a; });
        return !!(opt && opt.correct);
      }
      if (q.type === 'multiple') {
        var chosen = a || [];
        var correct = (q.options || []).filter(function (o) { return o.correct; }).map(function (o) { return o.id; });
        return chosen.length === correct.length && correct.every(function (id) { return chosen.indexOf(id) >= 0; });
      }
      var map = a || {};
      return (q.pairs || []).every(function (p) { return map[p.id] === p.right; });
    }

    function computeScore() {
      var qs = data.questions || [];
      if (!qs.length) return 0;
      var c = qs.filter(isCorrect).length;
      return Math.round((c / qs.length) * 100);
    }

    function recordScore() {
      var rawScore = computeScore();
      state.quizResults[b.id] = rawScore;
      var latency = (Date.now() - openedAt) / 1000;

      // Record each question as a SCORM interaction (LMS analytics).
      (data.questions || []).forEach(function (q) {
        var a = answers[q.id];
        var pairs = q.pairs || [];
        // Matching targets are identified by pair id (the right-hand text is
        // free-form, not a valid identifier). Pairs sharing the same right-hand
        // text are one target: the first pair carrying that text.
        function targetId(rightText) {
          var p = pairs.find(function (x) { return x.right === rightText; });
          return p ? p.id : '';
        }
        // Responses/patterns are passed as arrays; the runtime joins them with
        // its own delimiters (SCORM 1.2 `,` `.`, SCORM 2004 / xAPI `[,]` `[.]`).
        var resp;
        if (q.type === 'matching') {
          resp = pairs.filter(function (p) { return a && a[p.id] && targetId(a[p.id]); })
            .map(function (p) { return [p.id, targetId(a[p.id])]; });
        } else if (Array.isArray(a)) {
          resp = a.slice();
        } else {
          resp = a || '';
        }
        // Correct response pattern, in the same notation as the response.
        var correct;
        if (q.type === 'matching') {
          correct = [pairs.map(function (p) { return [p.id, targetId(p.right)]; })];
        } else if (q.type === 'multiple') {
          correct = [(q.options || []).filter(function (o) { return o.correct; }).map(function (o) { return o.id; })];
        } else {
          var single = (q.options || []).find(function (o) { return o.correct; });
          correct = single ? [single.id] : [];
        }
        // Build interaction object — extra fields are ignored by SCORM, used by xAPI.
        var inter = {
          id: q.id,
          type: q.type === 'matching' ? 'matching' : 'choice',
          interactionType: q.type === 'matching' ? 'matching' : 'choice',
          response: resp,
          correct: isCorrect(q),
          weight: 1,
          latencySec: latency,
          description: q.prompt,
          correctResponses: correct,
          objectiveId: 'QUIZ_' + b.id,
        };
        if (q.type === 'matching') {
          inter.source = pairs.map(function (p) { return { id: p.id, text: p.left }; });
          inter.target = pairs.filter(function (p) { return targetId(p.right) === p.id; })
            .map(function (p) { return { id: p.id, text: p.right }; });
        } else {
          inter.choices = (q.options || []).map(function (o) { return { id: o.id, text: o.text }; });
        }
        SCORM.recordInteraction(state.interactionIndex++, inter);
      });

      // One objective per quiz. Passing threshold is the quiz's own passingScore.
      var passed = rawScore >= (data.passingScore || 0);
      SCORM.setObjective(state.quizIndexById[b.id] || 0, {
        id: 'QUIZ_' + b.id,
        name: 'Quiz ' + b.id,
        raw: rawScore, min: 0, max: 100,
        status: 'completed',
        success: passed ? 'passed' : 'failed',
      });

      reportProgress();
      // Answering a quiz can satisfy the linear-navigation gate; update the
      // advance button in place (the quiz re-renders itself, not the whole page).
      refreshGating();
    }

    build();
    return wrap;
  }

  // ── Scored exercises (ordering, fill in the blanks) ──────────────────────
  // Scoring mirrors src/blocks/ordering.ts and src/blocks/fillBlanks.ts.

  // Fisher–Yates; with 2+ items never returns the input order (a free score).
  function shuffledOrder(ids) {
    var out = ids.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    if (out.length > 1 && out.every(function (id, k) { return id === ids[k]; })) out.push(out.shift());
    return out;
  }

  // Store a scored block's result and report it like a quiz: objective
  // 'QUIZ_<id>' (the manifest declares the same ids), course score, gating.
  function commitExerciseScore(b, rawScore, label) {
    state.quizResults[b.id] = rawScore;
    var passed = rawScore >= (b.data.passingScore || 0);
    SCORM.setObjective(state.quizIndexById[b.id] || 0, {
      id: 'QUIZ_' + b.id,
      name: label + ' ' + b.id,
      raw: rawScore, min: 0, max: 100,
      status: 'completed',
      success: passed ? 'passed' : 'failed',
    });
    reportProgress();
    refreshGating();
  }

  // Submit button, or the score panel with "Try again" once submitted.
  // ✓ / ✗ glyph so correctness is never conveyed by color alone (the text
  // next to it carries the meaning for screen readers).
  function resultIcon(ok) {
    return h('span', { class: 'result-icon', 'aria-hidden': 'true', text: ok ? '✓' : '✗' });
  }
  // Icon plus screen-reader text, for items whose visible label is not a verdict.
  function resultMark(ok) {
    return h('span', { class: 'result-mark ' + (ok ? 'passed' : 'failed') }, [
      resultIcon(ok), h('span', { class: 'sr-only', text: ok ? t('correct') : t('incorrect') }),
    ]);
  }
  // After submitting: the Submit button is gone, so move focus to the result
  // panel and announce the score.
  function announceResult(wrap) {
    var res = wrap.querySelector('.quiz-result');
    if (!res) return;
    res.setAttribute('tabindex', '-1');
    res.focus();
    var parts = Array.prototype.map.call(res.querySelectorAll('p'), function (p) { return p.textContent; });
    announce(parts.join('. '));
  }
  function focusFirstControl(wrap) {
    var el = wrap.querySelector('input:not([disabled]), select:not([disabled]), button:not([disabled])');
    if (el) el.focus();
  }

  function exerciseFooter(submitted, score, passingScore, onSubmit, onRetry) {
    if (!submitted) return h('button', { class: 'btn', text: t('submit'), onclick: onSubmit });
    var passed = score >= passingScore;
    return h('div', { class: 'quiz-result' }, [
      h('p', { class: 'quiz-score', text: t('yourScore', { s: score }) }),
      h('p', { class: (passed ? 'passed' : 'failed'), style: 'font-weight:500;margin:4px 0 0',
        text: passed ? t('passed') : t('failed') }),
      h('button', { class: 'btn btn-outline', style: 'margin-top:12px', text: t('retry'), onclick: onRetry }),
    ]);
  }

  function renderOrdering(b) {
    var data = b.data;
    var items = data.items || [];
    var categories = data.categories || [];
    var isSequence = data.mode !== 'categories';
    var showAnswers = data.showAnswers !== false;
    var ids = items.map(function (it) { return it.id; });
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var order, assigned, submitted, openedAt, dragId = null;
    var wrap = h('div', { class: 'ord' });

    function reset() { order = shuffledOrder(ids); assigned = {}; submitted = false; openedAt = Date.now(); }

    function computeScore() {
      if (!items.length) return 0;
      var ok = items.filter(function (it, i) {
        return isSequence ? order[i] === it.id : (!!it.categoryId && assigned[it.id] === it.categoryId);
      }).length;
      return Math.round((ok / items.length) * 100);
    }

    function categoryTitle(id) {
      var c = categories.find(function (x) { return x.id === id; });
      return c ? c.title : '';
    }

    function moveTo(id, to) {
      var from = order.indexOf(id);
      if (from < 0 || to < 0 || to >= order.length || from === to) return;
      order.splice(from, 1);
      order.splice(to, 0, id);
    }

    // Native drag & drop for mouse; the arrow buttons / selects cover
    // keyboard and touch (HTML5 DnD is unreliable on mobile).
    function makeDraggable(el, id) {
      el.setAttribute('draggable', 'true');
      el.addEventListener('dragstart', function (e) {
        dragId = id;
        el.classList.add('dragging');
        try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* old browsers */ }
      });
      el.addEventListener('dragend', function () { dragId = null; el.classList.remove('dragging'); });
    }
    function makeDropTarget(el, onDrop) {
      el.addEventListener('dragover', function (e) { if (dragId) { e.preventDefault(); el.classList.add('drop-over'); } });
      el.addEventListener('dragleave', function () { el.classList.remove('drop-over'); });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        el.classList.remove('drop-over');
        if (dragId) { var id = dragId; dragId = null; onDrop(id); }
      });
    }

    function build(focusKey) {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      if (data.prompt) wrap.appendChild(h('p', { class: 'quiz-prompt', text: data.prompt }));
      if (!submitted) wrap.appendChild(h('p', { class: 'ord-hint', text: t(isSequence ? 'sequenceHint' : 'categoriesHint') }));
      if (isSequence) buildSequence(reveal); else buildCategories(reveal);
      wrap.appendChild(exerciseFooter(submitted, computeScore(), data.passingScore,
        function () { submitted = true; build(); recordScore(); announceResult(wrap); },
        function () { reset(); build(); focusFirstControl(wrap); }));
      // Rebuilding replaces the DOM; keep keyboard focus on the moved control.
      if (focusKey) {
        var f = wrap.querySelector('[data-focus="' + focusKey + '"]');
        if (f && !f.disabled) f.focus();
      }
    }

    function buildSequence(reveal) {
      var list = h('ol', { class: 'ord-list' });
      order.forEach(function (id, i) {
        var it = byId[id];
        var right = ids.indexOf(id);
        var li = h('li', { class: 'ord-item' + (reveal ? (right === i ? ' correct' : ' incorrect') : '') });
        if (!submitted) {
          li.appendChild(h('span', { class: 'ord-handle', 'aria-hidden': 'true', title: t('dragItem'), text: '⠿' }));
          makeDraggable(li, id);
          makeDropTarget(li, function (dragged) { moveTo(dragged, order.indexOf(id)); build(); });
        }
        if (reveal) li.appendChild(resultMark(right === i));
        li.appendChild(h('span', { class: 'ord-text', text: it.text }));
        if (reveal && right !== i) li.appendChild(h('span', { class: 'ord-note', text: t('correctPosition', { n: right + 1 }) }));
        if (!submitted) {
          li.appendChild(h('button', { class: 'ord-arrow', type: 'button', text: '↑', 'data-focus': id + ':up',
            'aria-label': t('moveUp') + ': ' + it.text, disabled: i === 0 ? 'true' : null,
            onclick: function () { moveTo(id, i - 1); build(id + ':up'); } }));
          li.appendChild(h('button', { class: 'ord-arrow', type: 'button', text: '↓', 'data-focus': id + ':down',
            'aria-label': t('moveDown') + ': ' + it.text, disabled: i === order.length - 1 ? 'true' : null,
            onclick: function () { moveTo(id, i + 1); build(id + ':down'); } }));
        }
        list.appendChild(li);
      });
      wrap.appendChild(list);
    }

    function chip(id, inCategory, reveal) {
      var it = byId[id];
      var ok = !!inCategory && it.categoryId === inCategory;
      var el = h('div', { class: 'ord-item' + (reveal ? (ok ? ' correct' : ' incorrect') : '') });
      if (!submitted) {
        el.appendChild(h('span', { class: 'ord-handle', 'aria-hidden': 'true', title: t('dragItem'), text: '⠿' }));
        makeDraggable(el, id);
      }
      if (reveal) el.appendChild(resultMark(ok));
      el.appendChild(h('span', { class: 'ord-text', text: it.text }));
      if (reveal && !ok && categoryTitle(it.categoryId)) {
        el.appendChild(h('span', { class: 'ord-note', text: t('correctCategory', { c: categoryTitle(it.categoryId) }) }));
      }
      var sel = h('select', { 'aria-label': t('chooseCategory') + ': ' + it.text, 'data-focus': id + ':sel' });
      sel.disabled = submitted;
      sel.appendChild(h('option', { value: '', text: '—' }));
      categories.forEach(function (c) { sel.appendChild(h('option', { value: c.id, text: c.title })); });
      sel.value = assigned[id] || '';
      sel.addEventListener('change', function () { assigned[id] = sel.value || undefined; build(id + ':sel'); });
      el.appendChild(sel);
      return el;
    }

    function bin(catId, title, reveal) {
      var el = h('div', { class: 'ord-bin' }, h('p', { class: 'ord-bin-title', text: title }));
      order.forEach(function (id) {
        if ((assigned[id] || null) === catId) el.appendChild(chip(id, catId, reveal));
      });
      if (!submitted) makeDropTarget(el, function (dragged) { assigned[dragged] = catId || undefined; build(); });
      return el;
    }

    function buildCategories(reveal) {
      wrap.appendChild(bin(null, t('unsorted'), reveal));
      var grid = h('div', { class: 'ord-bins' });
      categories.forEach(function (c) { grid.appendChild(bin(c.id, c.title, reveal)); });
      wrap.appendChild(grid);
    }

    function recordScore() {
      var rawScore = computeScore();
      var inter = {
        id: b.id,
        response: '',
        correct: rawScore === 100,
        weight: 1,
        latencySec: (Date.now() - openedAt) / 1000,
        description: data.prompt || '',
        objectiveId: 'QUIZ_' + b.id,
      };
      // Array responses are formatted per runtime (SCORM 1.2 / 2004 / xAPI).
      if (isSequence) {
        inter.type = inter.interactionType = 'sequencing';
        inter.response = order.slice();
        inter.correctResponses = [ids.slice()];
        inter.choices = items.map(function (it) { return { id: it.id, text: it.text }; });
      } else {
        inter.type = inter.interactionType = 'matching';
        inter.response = items.filter(function (it) { return assigned[it.id]; })
          .map(function (it) { return [it.id, assigned[it.id]]; });
        inter.correctResponses = [items.filter(function (it) { return it.categoryId; })
          .map(function (it) { return [it.id, it.categoryId]; })];
        inter.source = items.map(function (it) { return { id: it.id, text: it.text }; });
        inter.target = categories.map(function (c) { return { id: c.id, text: c.title }; });
      }
      SCORM.recordInteraction(state.interactionIndex++, inter);
      commitExerciseScore(b, rawScore, 'Ordering');
    }

    reset();
    build();
    return wrap;
  }

  // Blanks are `[answer|alternative]`; see parseBlanks in src/blocks/fillBlanks.ts.
  function parseBlanks(text) {
    var out = [], last = 0, index = 0, m;
    var re = /\[([^[\]\n]*)\]/g;
    function pushText(s) {
      if (!s) return;
      var prev = out[out.length - 1];
      if (prev && prev.kind === 'text') prev.text += s; else out.push({ kind: 'text', text: s });
    }
    while ((m = re.exec(text)) !== null) {
      var answers = m[1].split('|').map(function (a) { return a.trim(); }).filter(Boolean);
      pushText(text.slice(last, m.index));
      if (answers.length) out.push({ kind: 'blank', index: index++, answers: answers });
      else pushText(m[0]);
      last = m.index + m[0].length;
    }
    pushText(text.slice(last));
    return out;
  }
  function normalizeAnswer(v, caseSensitive) {
    var s = String(v).trim().replace(/\s+/g, ' ');
    return caseSensitive ? s : s.toLowerCase();
  }
  function isBlankCorrect(answers, response, caseSensitive) {
    if (!response) return false;
    var r = normalizeAnswer(response, caseSensitive);
    return answers.some(function (a) { return normalizeAnswer(a, caseSensitive) === r; });
  }

  function renderFillBlanks(b) {
    var data = b.data;
    var isSelect = data.mode === 'select';
    // Selected answers are canonical; only typed ones honour caseSensitive.
    var strict = !isSelect && !!data.caseSensitive;
    var showAnswers = data.showAnswers !== false;
    var segments = parseBlanks(data.text || '');
    var blanks = segments.filter(function (s) { return s.kind === 'blank'; });
    var responses, submitted, openedAt, options;
    var wrap = h('div', { class: 'fib' });

    function reset() {
      responses = []; submitted = false; openedAt = Date.now();
      var seen = {}, canon = [];
      blanks.forEach(function (s) { if (!seen[s.answers[0]]) { seen[s.answers[0]] = true; canon.push(s.answers[0]); } });
      options = shuffledOrder(canon);
    }

    function computeScore() {
      if (!blanks.length) return 0;
      var ok = blanks.filter(function (s) { return isBlankCorrect(s.answers, responses[s.index], strict); }).length;
      return Math.round((ok / blanks.length) * 100);
    }

    function build() {
      var reveal = submitted && showAnswers;
      wrap.innerHTML = '';
      var p = h('p', { class: 'fib-text' });
      segments.forEach(function (s) {
        if (s.kind === 'text') { p.appendChild(document.createTextNode(s.text)); return; }
        var ok = isBlankCorrect(s.answers, responses[s.index], strict);
        var cls = 'fib-blank' + (reveal ? (ok ? ' correct' : ' incorrect') : '');
        var field;
        if (isSelect) {
          field = h('select', { class: cls, 'aria-label': t('blankN', { n: s.index + 1 }) });
          field.appendChild(h('option', { value: '', text: '—' }));
          options.forEach(function (o) { field.appendChild(h('option', { value: o, text: o })); });
          field.value = responses[s.index] || '';
          field.addEventListener('change', function () { responses[s.index] = field.value; });
        } else {
          field = h('input', { class: cls, type: 'text', autocomplete: 'off', spellcheck: 'false',
            size: String(Math.max(6, s.answers[0].length + 2)), 'aria-label': t('blankN', { n: s.index + 1 }) });
          field.value = responses[s.index] || '';
          field.addEventListener('input', function () { responses[s.index] = field.value; });
        }
        field.disabled = submitted;
        p.appendChild(field);
        if (reveal) p.appendChild(resultMark(ok));
        if (reveal && !ok) p.appendChild(h('span', { class: 'fib-answer', text: t('correctAnswer', { a: s.answers[0] }) }));
      });
      wrap.appendChild(p);
      wrap.appendChild(exerciseFooter(submitted, computeScore(), data.passingScore,
        function () { submitted = true; build(); recordScore(); announceResult(wrap); },
        function () { reset(); build(); focusFirstControl(wrap); }));
    }

    function recordScore() {
      var rawScore = computeScore();
      var latency = (Date.now() - openedAt) / 1000;
      // Context for LMS reports: the text with every blank shown as ___.
      var context = segments.map(function (s) { return s.kind === 'text' ? s.text : '___'; }).join('');
      // One fill-in interaction per blank; every accepted alternative is a
      // correct-response pattern (SCORM 1.2 keeps only the first).
      blanks.forEach(function (s) {
        SCORM.recordInteraction(state.interactionIndex++, {
          id: b.id + '_' + (s.index + 1),
          type: 'fill-in',
          interactionType: 'fill-in',
          response: String(responses[s.index] || '').trim(),
          correct: isBlankCorrect(s.answers, responses[s.index], strict),
          weight: 1,
          latencySec: latency,
          description: t('blankN', { n: s.index + 1 }) + ': ' + context,
          correctResponses: s.answers.slice(),
          caseMatters: strict,
          objectiveId: 'QUIZ_' + b.id,
        });
      });
      commitExerciseScore(b, rawScore, 'Fill in the blanks');
    }

    reset();
    build();
    return wrap;
  }

  // Boot. Course data is embedded as a global by course-data.js (loaded via a
  // <script> tag before this file). We deliberately avoid fetch()/XHR here:
  // many LMS environments sandbox the SCO or serve its files from a CDN that
  // rejects runtime requests for sibling files (404/400/403/CORS), while
  // <script>/<link>/<img> loads work fine.
  if (window.__SCORMLY_COURSE__) {
    start(window.__SCORMLY_COURSE__);
  } else {
    document.getElementById('app').appendChild(
      h('p', { class: 'empty', style: 'padding:2rem', text: 'Course data not found' })
    );
  }
})();
