/* Salieri Index — Tistory skin. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Theme ---------- */
  function initTheme() {
    var btn = $('.js-theme-toggle');
    if (!btn) return;
    var sync = function () { btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); };
    sync();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('salieri-theme', next);
      sync();
    });
    if (window.matchMedia && !store.get('salieri-theme')) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function (e) {
        if (!store.get('salieri-theme')) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); sync(); }
      });
    }
  }

  /* ---------- Header toggles: search + category panel ---------- */
  function toggler(btnSel, panelSel, focusSel) {
    var btn = $(btnSel), panel = $(panelSel);
    if (!btn || !panel) return null;
    function set(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && focusSel) { var f = $(focusSel, panel); if (f) f.focus(); }
    }
    btn.addEventListener('click', function () { set(panel.hidden); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
    return set;
  }
  function initHeader() {
    var setSearch = toggler('.js-search-toggle', '#search', 'input');
    var setPanel = toggler('.js-panel-toggle', '#panel', 'a');
    // One open at a time.
    var s = $('.js-search-toggle'), p = $('.js-panel-toggle');
    if (s && setPanel) s.addEventListener('click', function () { setPanel(false); });
    if (p && setSearch) p.addEventListener('click', function () { setSearch(false); });
    var input = $('#search input');
    if (doc.body.id === 'tt-body-search' && input && input.value && setSearch) setSearch(true);
  }

  /* ---------- Hero: *word* in the hero text becomes an accent ---------- */
  function initHero() {
    var hero = $('.js-hero');
    if (!hero) return;
    var text = hero.textContent.trim();
    hero.textContent = text;
    if (/\*[^*]+\*/.test(text)) {
      hero.innerHTML = text.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; })
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }
    if (text.length > 90 || text.split('\n').length > 3) hero.classList.add('is-long');
  }

  /* ---------- Series titles: "[LG CNS] 과정 3일차 :: 주제" → series label + main title ---------- */
  function initSeries() {
    $$('.js-series').forEach(function (el) {
      var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var i = node.nodeValue.indexOf('::');
        if (i < 1) continue;
        var left = node.nodeValue.slice(0, i).trim();
        var right = node.nodeValue.slice(i + 2).trim();
        if (!left || !right) return;
        var series = doc.createElement('span');
        series.className = 'series';
        series.textContent = left;
        var main = doc.createElement('span');
        main.className = 'series-main';
        main.textContent = right;
        node.parentNode.insertBefore(series, node);
        node.parentNode.replaceChild(main, node);
        el.classList.add('has-series');
        return;
      }
    });
  }

  /* ---------- Category counts: Tistory prints "(96)"; show "96" ---------- */
  function initCounts() {
    $$('.c_cnt').forEach(function (c) { c.textContent = c.textContent.replace(/[()\s]/g, ''); });
  }

  /* ---------- Index rows: group by year, show mm.dd ---------- */
  function initIndex() {
    var rows = $$('.idx__row[data-date]');
    var lastYear = null, lastList = null;
    rows.forEach(function (row) {
      var m = (row.getAttribute('data-date') || '').match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
      if (!m) return;
      var list = row.parentNode;
      var t = $('.idx__date', row);
      if (t) { t.textContent = m[2] + '.' + m[3]; t.setAttribute('datetime', m[1] + '-' + m[2] + '-' + m[3]); }
      // Each cover/list starts its own year run; index_article_rep renders one <ul> per post, so those share one run.
      if (list !== lastList && !list.classList.contains('idx--loose')) lastYear = null;
      if (m[1] !== lastYear) {
        var y = doc.createElement('li');
        y.className = 'idx__year';
        y.setAttribute('aria-hidden', 'true');
        y.textContent = m[1];
        list.insertBefore(y, row);
        lastYear = m[1];
      }
      lastList = list;
    });
  }

  /* ---------- Article helpers ---------- */
  var LANG = { js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', py: 'Python', python: 'Python',
    java: 'Java', kotlin: 'Kotlin', cpp: 'C++', c: 'C', csharp: 'C#', cs: 'C#', go: 'Go', rust: 'Rust', sql: 'SQL', bash: 'Bash',
    shell: 'Shell', sh: 'Shell', powershell: 'PowerShell', yaml: 'YAML', yml: 'YAML', json: 'JSON', xml: 'XML', html: 'HTML',
    css: 'CSS', dockerfile: 'Dockerfile', markdown: 'Markdown', plaintext: 'Text', text: 'Text' };
  function langOf(pre) {
    var code = $('code', pre);
    var guess = pre.getAttribute('data-ke-language') || (code && code.getAttribute('data-ke-language')) || '';
    if (!guess) {
      var cls = ((pre.className || '') + ' ' + (code ? code.className : '')).split(/\s+/);
      for (var i = 0; i < cls.length; i++) {
        var c = cls[i].replace(/^language-|^lang-/, '');
        if (c && c !== 'hljs' && c !== 'codeblock') { guess = c; break; }
      }
    }
    return guess ? (LANG[guess.toLowerCase()] || (guess.length <= 12 ? guess : '')) : '';
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      doc.body.removeChild(ta);
    });
  }
  function initCode(content) {
    $$('pre', content).forEach(function (pre) {
      if ($('.code-bar', pre)) return;
      var code = $('code', pre);
      if (!code) { code = doc.createElement('code'); while (pre.firstChild) code.appendChild(pre.firstChild); pre.appendChild(code); }
      var bar = doc.createElement('div'); bar.className = 'code-bar';
      var label = doc.createElement('span'); label.textContent = langOf(pre) || 'Code';
      var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'code-copy'; btn.textContent = '복사';
      btn.setAttribute('aria-label', '코드 복사');
      btn.addEventListener('click', function () {
        copyText(code.innerText).then(function () {
          btn.textContent = '복사됨'; btn.classList.add('is-done');
          setTimeout(function () { btn.textContent = '복사'; btn.classList.remove('is-done'); }, 1500);
        }, function () { btn.textContent = '실패'; });
      });
      bar.appendChild(label); bar.appendChild(btn);
      pre.insertBefore(bar, pre.firstChild);
      code.setAttribute('tabindex', '0');
    });
  }
  function initTables(content) {
    $$('table', content).forEach(function (t) {
      if (t.closest('.table-wrap, .another_category')) return;
      var w = doc.createElement('div'); w.className = 'table-wrap'; w.setAttribute('tabindex', '0');
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }
  function initReadTime(content) {
    var el = $('.js-readtime');
    if (!el) return;
    var chars = content.innerText.replace(/\s+/g, '').length;
    var min = Math.max(1, Math.round(chars / 600)); // ~600 Hangul chars per minute
    el.textContent = '약 ' + min + '분';
    el.hidden = false;
  }
  function slug(text, used) {
    var base = text.trim().toLowerCase().replace(/[^\wㄱ-힝]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'section';
    var id = base, n = 2;
    while (used[id] || doc.getElementById(id)) id = base + '-' + n++;
    used[id] = true; return id;
  }
  function initToc(content) {
    if (doc.body.classList.contains('toc-off')) return;
    var heads = $$('h2, h3', content).filter(function (h) {
      return h.textContent.replace(/\s| /g, '').length && !h.closest('.another_category, figure, blockquote');
    });
    if (heads.length < 2) return;
    var used = {}, list = doc.createElement('ol'), current = null;
    heads.forEach(function (h) {
      if (!h.id) h.id = slug(h.textContent, used);
      var li = doc.createElement('li'), a = doc.createElement('a');
      a.href = '#' + h.id; a.setAttribute('data-target', h.id); a.textContent = h.textContent.trim();
      li.appendChild(a);
      if (h.tagName === 'H3' && current) {
        var sub = $('ol', current);
        if (!sub) { sub = doc.createElement('ol'); sub.className = 'toc__sub'; current.appendChild(sub); }
        sub.appendChild(li);
      } else { list.appendChild(li); current = li; }
    });
    var inline = $('.toc-inline'), rail = $('.toc-rail');
    if (inline) { $('.toc', inline).appendChild(list.cloneNode(true)); inline.hidden = false; }
    if (rail) {
      $('.toc', rail).appendChild(list); rail.hidden = false; root.classList.add('has-toc');
      var place = function () {
        var page = $('.page');
        if (page) rail.style.setProperty('--toc-top', (content.getBoundingClientRect().top - page.getBoundingClientRect().top) + 'px');
      };
      place(); window.addEventListener('resize', place); window.addEventListener('load', place);
    }
    var links = $$('.toc a'), last, ticking = false;
    function mark() {
      var active = null;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top < innerHeight * 0.3) active = heads[i].id; else break; }
      if (active !== last) { last = active; links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-target') === active); }); }
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }
  function initProgress(content) {
    var bar = $('.progress__bar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var r = content.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      bar.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0).toFixed(4) + ')';
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();
  }

  function init() {
    initTheme();
    initHeader();
    initHero();
    initSeries();
    initCounts();
    initIndex();
    var content = $('.post #article-view');
    if (content) { initCode(content); initTables(content); initReadTime(content); initToc(content); initProgress(content); }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
