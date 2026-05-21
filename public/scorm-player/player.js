/* Scormly SCORM player. Fetches project.json and renders the course for the
   learner, reporting completion/score to the LMS via the SCORM wrapper. */
(function () {
  'use strict';

  var THEME_ACCENT = {
    rise: ['#ec4899', '#db2777'],
    ocean: ['#0ea5e9', '#0284c7'],
    forest: ['#16a34a', '#15803d'],
    sunset: ['#f97316', '#ea580c'],
  };

  var T = {
    en: { prev: 'Previous', next: 'Next', progress: 'Lesson {n} of {total}',
      empty: 'This lesson has no content yet.', submit: 'Submit answer', retry: 'Try again',
      correct: 'Correct', incorrect: 'Incorrect', yourScore: 'Your score: {s}%',
      passed: 'Passed', failed: 'Not passed', restart: 'Restart', end: 'The end' },
    uk: { prev: 'Назад', next: 'Далі', progress: 'Урок {n} з {total}',
      empty: 'У цьому уроці ще немає контенту.', submit: 'Відповісти', retry: 'Спробувати ще раз',
      correct: 'Правильно', incorrect: 'Неправильно', yourScore: 'Ваш результат: {s}%',
      passed: 'Складено', failed: 'Не складено', restart: 'Спочатку', end: 'Кінець' },
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

  var state = { course: null, lessonIndex: 0, visited: {}, quizResults: {}, quizzes: [] };

  function start(course) {
    state.course = course;
    var accent = THEME_ACCENT[course.theme] || THEME_ACCENT.rise;
    document.documentElement.style.setProperty('--brand', accent[0]);
    document.documentElement.style.setProperty('--brand-dark', accent[1]);
    document.title = course.title || 'Course';
    document.documentElement.lang = lang;

    // Index all quiz blocks for scoring.
    (course.lessons || []).forEach(function (lesson) {
      (lesson.blocks || []).forEach(function (b) {
        if (b.type === 'quiz') state.quizzes.push({ id: b.id, passingScore: b.data.passingScore });
      });
    });

    SCORM.init();
    visit(0);
    window.addEventListener('beforeunload', function () { SCORM.finish(); });
  }

  function visit(index) {
    state.lessonIndex = index;
    state.visited[index] = true;
    render();
    reportProgress();
    document.querySelector('.player-body').scrollTop = 0;
  }

  function reportProgress() {
    var lessons = state.course.lessons || [];
    var allVisited = Object.keys(state.visited).length >= lessons.length;
    if (state.quizzes.length) {
      var done = state.quizzes.filter(function (q) { return state.quizResults[q.id] != null; });
      if (done.length === state.quizzes.length && allVisited) {
        var avg = avgOf(state.quizzes.map(function (q) { return state.quizResults[q.id]; }));
        var threshold = avgOf(state.quizzes.map(function (q) { return q.passingScore; }));
        SCORM.setScore(avg, 0, 100);
        SCORM.setStatus(avg >= threshold ? 'passed' : 'failed');
      } else {
        SCORM.setStatus('incomplete');
      }
    } else {
      SCORM.setStatus(allVisited ? 'completed' : 'incomplete');
    }
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

    var header = h('header', { class: 'player-header' }, [
      h('div', { style: 'display:flex;align-items:center;gap:12px;min-width:0' }, [
        h('span', { class: 'player-title', text: state.course.title || '' }),
        h('span', { class: 'player-progress', text: t('progress', { n: i + 1, total: lessons.length }) }),
      ]),
      h('div', { class: 'player-nav' }, [
        h('button', { class: 'btn btn-outline', text: t('prev'), disabled: i === 0 ? 'true' : null,
          onclick: function () { if (i > 0) visit(i - 1); } }),
        h('button', { class: 'btn btn-outline', text: t('next'), disabled: i >= lessons.length - 1 ? 'true' : null,
          onclick: function () { if (i < lessons.length - 1) visit(i + 1); } }),
      ]),
    ]);

    var blocksEl = h('div', { class: 'blocks' });
    if (lesson && lesson.blocks && lesson.blocks.length) {
      lesson.blocks.forEach(function (b) {
        var el = renderBlock(b);
        if (el) blocksEl.appendChild(el);
      });
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
        if (!b.data.src) return null;
        return h('video', { controls: 'true', src: b.data.src, poster: b.data.poster || null });
      case 'continue':
        return h('div', { class: 'continue' }, h('button', { class: 'btn', text: b.data.label }));
      case 'divider': {
        var hr = h('hr', { class: 'divider' });
        hr.style.borderTopStyle = b.data.style || 'solid';
        return hr;
      }
      case 'tabs': return renderTabs(b);
      case 'accordion': return renderAccordion(b);
      case 'flashcards': return renderFlashcards(b);
      case 'scenario': return renderScenario(b);
      case 'quiz': return renderQuiz(b);
      default: return null;
    }
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

  function renderQuiz(b) {
    var data = b.data;
    var answers = {};
    var submitted = false;
    var wrap = h('div', {});

    function build() {
      wrap.innerHTML = '';
      (data.questions || []).forEach(function (q, qi) {
        var ok = submitted && isCorrect(q);
        var card = h('div', { class: 'quiz-q' + (submitted ? (ok ? ' correct' : ' incorrect') : '') });
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
              submitted && o.feedback && input.checked ? h('span', { class: 'empty', text: '— ' + o.feedback }) : null]));
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

        if (submitted) {
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
      reportProgress();
    }

    build();
    return wrap;
  }

  // Boot
  fetch('project.json')
    .then(function (r) { return r.json(); })
    .then(start)
    .catch(function () {
      document.getElementById('app').appendChild(
        h('p', { class: 'empty', style: 'padding:2rem', text: 'project.json not found' })
      );
    });
})();
