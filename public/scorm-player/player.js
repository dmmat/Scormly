/* Scormly SCORM player. Fetches project.json and renders the course for the
   learner, reporting completion/score to the LMS via the SCORM wrapper. */
(function () {
  'use strict';

  var THEME_ACCENT = {
    rose: ['#ec4899', '#db2777'],
    ocean: ['#0ea5e9', '#0284c7'],
    forest: ['#16a34a', '#15803d'],
    sunset: ['#f97316', '#ea580c'],
  };

  var T = {
    en: { prev: 'Previous', next: 'Next', progress: 'Lesson {n} of {total}',
      empty: 'This lesson has no content yet.', submit: 'Submit answer', retry: 'Try again',
      correct: 'Correct', incorrect: 'Incorrect', yourScore: 'Your score: {s}%',
      passed: 'Passed', failed: 'Not passed', restart: 'Restart', end: 'The end',
      finish: 'Finish', courseComplete: 'Course complete',
      courseCompleteText: 'You have reached the end of the course. You can close this window.',
      review: 'Review the course', watchToContinue: 'Watch the video to continue.' },
    uk: { prev: 'Назад', next: 'Далі', progress: 'Урок {n} з {total}',
      empty: 'У цьому уроці ще немає контенту.', submit: 'Відповісти', retry: 'Спробувати ще раз',
      correct: 'Правильно', incorrect: 'Неправильно', yourScore: 'Ваш результат: {s}%',
      passed: 'Складено', failed: 'Не складено', restart: 'Спочатку', end: 'Кінець',
      finish: 'Завершити', courseComplete: 'Курс завершено',
      courseCompleteText: 'Ви пройшли курс до кінця. Це вікно можна закрити.',
      review: 'Переглянути курс', watchToContinue: 'Перегляньте відео, щоб продовжити.' },
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

  var state = { course: null, lessonIndex: 0, visited: {}, continued: {}, watched: {}, quizResults: {}, quizzes: [], interactionIndex: 0, sessionStart: 0, complete: false, finished: false, summary: null };

  function start(course) {
    state.course = course;
    var accent = THEME_ACCENT[course.theme] || THEME_ACCENT.rose;
    document.documentElement.style.setProperty('--brand', accent[0]);
    document.documentElement.style.setProperty('--brand-dark', accent[1]);
    document.title = course.title || 'Course';
    document.documentElement.lang = lang;

    // Index all quiz blocks for scoring.
    (course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) {
        if (b.type === 'quiz') state.quizzes.push({ id: b.id });
      });
    });

    SCORM.init();
    state.sessionStart = Date.now();

    // Resume from saved progress, if any. Compact keys keep us under the
    // SCORM 1.2 suspend_data limit (4096 chars): l=lesson, v=visited indices,
    // q=quiz scores by block id, c=passed restricted "Continue" gates,
    // w=watched required-video block ids.
    var saved = null;
    try { saved = JSON.parse(SCORM.getSuspend() || 'null'); } catch (e) { saved = null; }
    if (saved) {
      (saved.v || []).forEach(function (i) { state.visited[i] = true; });
      state.quizResults = saved.q || {};
      (saved.c || []).forEach(function (id) { state.continued[id] = true; });
      (saved.w || []).forEach(function (id) { state.watched[id] = true; });
    }

    window.addEventListener('beforeunload', function () {
      SCORM.setSessionTime((Date.now() - state.sessionStart) / 1000);
      SCORM.setExit(state.complete ? '' : 'suspend');
      SCORM.finish();
    });

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
  // Quiz blocks in a lesson, and whether they've all been answered.
  function lessonQuizzesAnswered(lesson) {
    return (lesson.blocks || []).every(function (b) {
      return b.type !== 'quiz' || state.quizResults[b.id] != null;
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
  function goNext() {
    var lessons = state.course.lessons || [];
    if (state.lessonIndex < lessons.length - 1) visit(state.lessonIndex + 1);
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
    document.querySelector('.player-body').scrollTop = 0;
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
    document.querySelector('.player-body').scrollTop = 0;
  }

  var DEFAULT_SETTINGS = { completion: 'quiz', scored: true, passingScore: 80, navigation: 'free' };
  function settings() {
    var s = state.course.settings || {};
    return {
      completion: s.completion || DEFAULT_SETTINGS.completion,
      scored: s.scored !== false,
      passingScore: typeof s.passingScore === 'number' ? s.passingScore : DEFAULT_SETTINGS.passingScore,
      navigation: s.navigation === 'linear' ? 'linear' : 'free',
    };
  }

  function reportProgress() {
    var lessons = state.course.lessons || [];
    var cfg = settings();
    var completedCount = 0;
    lessons.forEach(function (_, i) { if (lessonComplete(i)) completedCount++; });
    var contentDone = lessons.length > 0 && completedCount === lessons.length;
    SCORM.setProgress(lessons.length ? completedCount / lessons.length : 0);

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
    SCORM.setSuspend(JSON.stringify({
      l: state.lessonIndex,
      v: Object.keys(state.visited).map(Number),
      q: state.quizResults,
      c: Object.keys(state.continued),
      w: Object.keys(state.watched),
    }));
    SCORM.setLocation(String(state.lessonIndex));
    SCORM.commit();
  }

  function avgOf(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
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

    var header = h('header', { class: 'player-header' }, [
      h('div', { style: 'display:flex;align-items:center;gap:12px;min-width:0' }, [
        h('span', { class: 'player-title', text: state.course.title || '' }),
        h('span', { class: 'player-progress', text: t('progress', { n: i + 1, total: lessons.length }) }),
      ]),
      h('div', { class: 'player-nav' }, [
        h('button', { class: 'btn btn-outline', text: t('prev'), disabled: i === 0 ? 'true' : null,
          onclick: function () { if (i > 0) visit(i - 1); } }),
        advanceBtn,
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

    var body = h('div', { class: 'player-body' }, [
      h('div', { class: 'lesson' }, [
        h('h1', { class: 'lesson-title', text: lesson ? lesson.title : '' }),
        blocksEl,
      ]),
    ]);

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
      h('div', { class: 'player-nav' }, [
        h('button', { class: 'btn btn-outline', text: t('review'),
          onclick: function () { state.finished = false; render(); document.querySelector('.player-body').scrollTop = 0; } }),
      ]),
    ]);
    var card = h('div', { class: 'finish-card' }, [
      h('div', { class: 'finish-check', text: '✓' }),
      h('h1', { class: 'finish-title', text: t('courseComplete') }),
      s.score != null ? h('p', { class: 'finish-score', text: t('yourScore', { s: Math.round(s.score) }) }) : null,
      s.success ? h('p', { class: 'finish-status ' + s.success, text: s.success === 'passed' ? t('passed') : t('failed') }) : null,
      h('p', { class: 'finish-text', text: t('courseCompleteText') }),
    ]);
    var body = h('div', { class: 'player-body' }, [h('div', { class: 'lesson' }, card)]);
    app.appendChild(header);
    app.appendChild(body);
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
          h('img', { src: b.data.src, alt: b.data.alt || '' }),
          b.data.caption ? h('figcaption', { text: b.data.caption }) : null,
        ]);
      case 'gallery': {
        var g = h('div', { class: 'gallery' });
        (b.data.images || []).forEach(function (img) { g.appendChild(h('img', { src: img.src, alt: img.alt || '' })); });
        return g;
      }
      case 'video':
        return renderVideo(b);
      case 'audio':
        if (!b.data.src) return null;
        return h('audio', { controls: 'true', src: b.data.src, style: 'width:100%' });
      case 'embed': {
        var em = toEmbedUrl(b.data.url || '');
        if (!em) return null;
        return h('div', { class: 'embed' }, h('iframe', {
          src: em, title: b.data.title || '', allowfullscreen: 'true',
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
          onclick: function () {
            if (restricted) { state.continued[b.id] = true; render(); reportProgress(); }
            else { goNext(); }
          } }));
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
      var row = h('button', { class: 'outline-item', type: 'button',
        onclick: (function (idx) { return function () { visit(idx); }; })(i) }, [
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
    if (!b.data.requireWatch) return video;

    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime / video.duration >= 0.95) markWatched(b.id);
    });
    video.addEventListener('ended', function () { markWatched(b.id); });

    var wrap = h('div', { class: 'video-required' }, [video]);
    if (!state.watched[b.id]) {
      wrap.appendChild(h('p', { id: 'vgate-' + b.id, class: 'video-gate', text: t('watchToContinue') }));
    }
    return wrap;
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
    var wrap = h('div', { class: 'tabs' });
    var bar = h('div', { class: 'tab-bar' });
    var panel = h('div', { class: 'tab-panel rich-text' });
    function show(idx) {
      bar.querySelectorAll('.tab-btn').forEach(function (el, i) {
        el.className = 'tab-btn' + (i === idx ? ' active' : '');
      });
      panel.innerHTML = tabs[idx] ? tabs[idx].html : '';
    }
    tabs.forEach(function (tab, idx) {
      bar.appendChild(h('button', { class: 'tab-btn', text: tab.title, onclick: function () { show(idx); } }));
    });
    wrap.appendChild(bar);
    wrap.appendChild(panel);
    if (tabs.length) show(0);
    return wrap;
  }

  function renderAccordion(b) {
    var wrap = h('div', {});
    (b.data.items || []).forEach(function (item) {
      var body = h('div', { class: 'accordion-body rich-text', html: item.html });
      body.style.display = 'none';
      var chev = h('span', { class: 'chev', text: '▸' });
      var head = h('button', { class: 'accordion-head', onclick: function () {
        var open = body.style.display !== 'none';
        body.style.display = open ? 'none' : 'block';
        chev.textContent = open ? '▸' : '▾';
      } }, [chev, h('span', { text: item.title })]);
      wrap.appendChild(h('div', { class: 'accordion-item' }, [head, body]));
    });
    return wrap;
  }

  function renderFlashcards(b) {
    var grid = h('div', { class: 'flashcards' });
    (b.data.cards || []).forEach(function (card) {
      var inner = h('div', { class: 'flashcard-inner' }, [
        h('div', { class: 'flashcard-face flashcard-front', text: card.front }),
        h('div', { class: 'flashcard-face flashcard-back', text: card.back }),
      ]);
      var fc = h('div', { class: 'flashcard', onclick: function () { fc.classList.toggle('flipped'); } }, inner);
      grid.appendChild(fc);
    });
    return grid;
  }

  function renderScenario(b) {
    if ((b.data.layout || 'classic') === 'chat') return renderScenarioChat(b);
    var data = b.data;
    var wrap = h('div', { class: 'scenario' });
    function go(nodeId, emotion) {
      wrap.innerHTML = '';
      var node = nodeId ? (data.nodes || []).find(function (n) { return n.id === nodeId; }) : null;
      var emo = emotion || (node ? node.emotion : 'neutral');
      var avatar = data.characterImages && data.characterImages[emo];
      var col = h('div', { style: 'flex:1;min-width:0' });
      col.appendChild(h('p', { class: 'scenario-name', text: data.characterName || '' }));
      if (node) {
        col.appendChild(h('p', { class: 'scenario-text', text: node.text }));
        var choices = h('div', { class: 'scenario-choices' });
        (node.choices || []).forEach(function (c) {
          choices.appendChild(h('button', { class: 'btn btn-outline', text: c.text, style: 'text-align:left',
            onclick: function () { go(c.nextNodeId, c.setEmotion); } }));
        });
        col.appendChild(choices);
      } else {
        col.appendChild(h('p', { class: 'empty', text: t('end') }));
        col.appendChild(h('button', { class: 'btn btn-outline', text: t('restart'),
          onclick: function () { go(data.startNodeId); } }));
      }
      var row = h('div', { class: 'scenario-row' }, [
        avatar ? h('img', { class: 'scenario-avatar', src: avatar, alt: '' }) : null,
        col,
      ]);
      wrap.appendChild(row);
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
    var body = h('div', { class: 'chat-body' });
    var replies = h('div', { class: 'chat-replies' });

    var messages = [];
    var currentId = data.startNodeId;

    function renderBody() {
      body.innerHTML = '';
      messages.forEach(function (m) {
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
      body.scrollTop = body.scrollHeight;
    }

    function renderReplies() {
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
    }

    function choose(c) {
      var target = findNode(c.nextNodeId);
      var emotion = c.setEmotion || (target ? target.emotion : 'neutral');
      messages.push({ from: 'user', text: c.text, emotion: emotion });
      if (target) messages.push({ from: 'bot', text: target.text, emotion: target.emotion });
      currentId = c.nextNodeId;
      renderBody(); renderReplies();
    }

    function reset() {
      messages = [];
      if (start) messages.push({ from: 'bot', text: start.text, emotion: start.emotion });
      currentId = data.startNodeId;
      renderBody(); renderReplies();
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
    // Reveal correctness after submitting unless the quiz hides answers.
    var showAnswers = data.showAnswers !== false;
    var wrap = h('div', {});

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
          (q.pairs || []).forEach(function (p) {
            var sel = h('select');
            sel.disabled = submitted;
            sel.appendChild(h('option', { value: '', text: '—' }));
            (q.pairs || []).forEach(function (opt) { sel.appendChild(h('option', { value: opt.right, text: opt.right })); });
            sel.value = (answers[q.id] || {})[p.id] || '';
            sel.addEventListener('change', function () {
              answers[q.id] = answers[q.id] || {};
              answers[q.id][p.id] = sel.value;
            });
            card.appendChild(h('div', { class: 'quiz-match' }, [h('span', { text: p.left }), sel]));
          });
        }

        if (reveal) {
          card.appendChild(h('p', { class: 'quiz-feedback ' + (ok ? 'passed' : 'failed'),
            text: (ok ? t('correct') : t('incorrect')) + (q.feedback ? ' — ' + q.feedback : '') }));
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
            onclick: function () { submitted = false; answers = {}; build(); } }),
        ]);
        wrap.appendChild(res);
      } else {
        wrap.appendChild(h('button', { class: 'btn', text: t('submit'),
          onclick: function () { submitted = true; build(); recordScore(); } }));
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
      state.quizResults[b.id] = computeScore();
      // Record each question as a SCORM interaction for LMS analytics.
      (data.questions || []).forEach(function (q) {
        var a = answers[q.id];
        var resp = q.type === 'matching'
          ? Object.keys(a || {}).map(function (k) { return k + '=' + a[k]; }).join(',')
          : (Array.isArray(a) ? a.join(',') : (a || ''));
        SCORM.recordInteraction(state.interactionIndex++, {
          id: q.id,
          type: q.type === 'matching' ? 'matching' : 'choice',
          response: String(resp),
          correct: isCorrect(q),
        });
      });
      reportProgress();
      // Answering a quiz can satisfy the linear-navigation gate; update the
      // advance button in place (the quiz re-renders itself, not the whole page).
      refreshGating();
    }

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
