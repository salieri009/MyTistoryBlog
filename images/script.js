/* 이정표 (Signpost) Tistory skin — vanilla, no dependencies. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>';

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    var btn = $('.js-theme-toggle');
    if (!btn) return;
    function sync() { btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); }
    sync();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('ijp-theme', next);
      sync();
    });
    // Follow the OS while the visitor has not chosen and the option is auto.
    if (window.matchMedia && !store.get('ijp-theme')) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) { if (!store.get('ijp-theme')) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); sync(); } };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
  }

  /* ---------- Search panel ---------- */
  function initSearch() {
    var btn = $('.js-search-toggle'), panel = $('#search-panel');
    if (!btn || !panel) return;
    var input = $('input', panel);
    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && input) input.focus();
    }
    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
    // Keep the panel open on search result pages so the query stays visible.
    if (doc.body.id === 'tt-body-search' && input && input.value) setOpen(true);
  }

  /* ---------- Drawer (rail below 1200px) ---------- */
  function initDrawer() {
    var rail = $('#rail'), scrim = $('.scrim'), openBtn = $('.js-drawer-open');
    if (!rail || !openBtn) return;
    var lastFocus = null;
    var desktop = window.matchMedia ? matchMedia('(min-width: 1200px)') : { matches: false };
    function focusables() { return $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', rail).filter(function (el) { return el.offsetParent !== null; }); }
    function setOpen(open) {
      root.classList.toggle('drawer-open', open);
      doc.body.classList.toggle('drawer-open', open);
      if (scrim) scrim.hidden = !open;
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        lastFocus = doc.activeElement;
        rail.setAttribute('role', 'dialog');
        rail.setAttribute('aria-modal', 'true');
        var f = focusables(); if (f.length) f[0].focus();
      } else {
        rail.removeAttribute('role');
        rail.removeAttribute('aria-modal');
        if (lastFocus) lastFocus.focus();
      }
    }
    openBtn.addEventListener('click', function () { setOpen(true); });
    $$('.js-drawer-close').forEach(function (el) { el.addEventListener('click', function () { setOpen(false); }); });
    rail.addEventListener('keydown', function (e) {
      if (!root.classList.contains('drawer-open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var onDesktop = function () { if (desktop.matches && root.classList.contains('drawer-open')) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
  }

  /* ---------- Article: code blocks ---------- */
  var LANG_NAMES = { js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', py: 'Python', python: 'Python',
    java: 'Java', kotlin: 'Kotlin', cpp: 'C++', 'c++': 'C++', c: 'C', csharp: 'C#', cs: 'C#', go: 'Go', rust: 'Rust', sql: 'SQL',
    bash: 'Bash', shell: 'Shell', sh: 'Shell', powershell: 'PowerShell', yaml: 'YAML', yml: 'YAML', json: 'JSON', xml: 'XML',
    html: 'HTML', css: 'CSS', scss: 'SCSS', dockerfile: 'Dockerfile', markdown: 'Markdown', md: 'Markdown', plaintext: 'Text', text: 'Text' };

  function langOf(pre) {
    var code = $('code', pre);
    var attr = pre.getAttribute('data-ke-language') || (code && code.getAttribute('data-ke-language'));
    var classes = ((pre.className || '') + ' ' + (code ? code.className : '')).split(/\s+/);
    var guess = attr || '';
    if (!guess) {
      for (var i = 0; i < classes.length; i++) {
        var c = classes[i].replace(/^language-|^lang-/, '');
        if (c && c !== 'hljs' && c !== 'codeblock' && !/^tt_|^data-/.test(c)) { guess = c; break; }
      }
    }
    if (!guess) return '';
    var key = guess.toLowerCase();
    return LANG_NAMES[key] || (guess.length <= 12 ? guess : '');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      doc.body.removeChild(ta);
    });
  }

  function initCode(content) {
    $$('pre', content).forEach(function (pre) {
      if (pre.querySelector('.code-bar')) return;
      var code = $('code', pre);
      if (!code) { // plain <pre>: wrap so styles apply
        code = doc.createElement('code');
        while (pre.firstChild) code.appendChild(pre.firstChild);
        pre.appendChild(code);
      }
      var bar = doc.createElement('div');
      bar.className = 'code-bar';
      var label = doc.createElement('span');
      label.className = 'code-bar__lang';
      label.textContent = langOf(pre) || 'Code';
      var btn = doc.createElement('button');
      btn.type = 'button'; btn.className = 'code-copy'; btn.textContent = '복사';
      btn.setAttribute('aria-label', '코드 복사');
      btn.addEventListener('click', function () {
        copyText(code.innerText).then(function () {
          btn.textContent = '복사됨'; btn.classList.add('is-done');
          setTimeout(function () { btn.textContent = '복사'; btn.classList.remove('is-done'); }, 1600);
        }, function () { btn.textContent = '복사 실패'; });
      });
      bar.appendChild(label); bar.appendChild(btn);
      pre.insertBefore(bar, pre.firstChild);
      code.setAttribute('tabindex', '0'); // horizontally scrollable region must be keyboard reachable
    });
  }

  /* ---------- Article: tables scroll on narrow screens ---------- */
  function initTables(content) {
    $$('table', content).forEach(function (table) {
      if (table.closest('.table-wrap, .another_category')) return;
      var wrap = doc.createElement('div');
      wrap.className = 'table-wrap';
      wrap.setAttribute('tabindex', '0');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* ---------- Article: TOC as an exit list ---------- */
  function slug(text, used) {
    var base = text.trim().toLowerCase().replace(/[^\wㄱ-힝]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'section';
    var id = base, n = 2;
    while (used[id] || doc.getElementById(id)) id = base + '-' + n++;
    used[id] = true;
    return id;
  }

  function initToc(content) {
    if (doc.body.classList.contains('toc-off')) return;
    var heads = $$('h2, h3', content).filter(function (h) { return h.textContent.replace(/\s| /g, '').length > 0 && !h.closest('.another_category, figure, blockquote'); });
    if (heads.length < 2) return;
    var used = {}, list = doc.createElement('ol');
    var current = null;
    heads.forEach(function (h) {
      if (!h.id) h.id = slug(h.textContent, used);
      var li = doc.createElement('li');
      var a = doc.createElement('a');
      a.href = '#' + h.id;
      a.setAttribute('data-target', h.id);
      a.innerHTML = ICON_ARROW + '<span></span>';
      a.lastChild.textContent = h.textContent.trim();
      li.appendChild(a);
      if (h.tagName === 'H3' && current) {
        var sub = current.querySelector('ol');
        if (!sub) { sub = doc.createElement('ol'); sub.className = 'toc__sub'; current.appendChild(sub); }
        sub.appendChild(li);
      } else {
        list.appendChild(li);
        current = li;
      }
    });

    var inline = $('.toc-inline'), rail = $('.toc-rail');
    if (inline) { $('.toc', inline).appendChild(list.cloneNode(true)); inline.hidden = false; }
    if (rail) { $('.toc', rail).appendChild(list); rail.hidden = false; root.classList.add('has-toc'); }

    // Highlight the section being read: the last heading above 35% of the viewport.
    var links = $$('.toc a'), lastActive, ticking = false;
    function mark() {
      var active = null;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top < window.innerHeight * 0.35) active = heads[i].id; else break;
      }
      if (active !== lastActive) {
        lastActive = active;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-target') === active); });
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  /* ---------- Reading progress (amber edge line) ---------- */
  function initProgress(content) {
    var bar = $('.progress__bar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var rect = content.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function init() {
    initTheme();
    initSearch();
    initDrawer();
    var content = $('.post .entry-content');
    if (content) {
      initCode(content);
      initTables(content);
      initToc(content);
      initProgress(content);
    } else {
      $$('.entry-content').forEach(function (c) { initCode(c); initTables(c); });
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
