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
    $$('.c_cnt').forEach(function (c) {
      c.textContent = c.textContent.replace(/[()\s]/g, '');
      // A parent with 0 own posts but subcategories would read as "empty"; drop its count.
      var li = c.closest('li');
      if (c.textContent === '0' && li && li.querySelector('.sub_category_list li')) c.hidden = true;
    });
  }

  /* ---------- Where am I: highlight the current category, center it in the mobile tabs ---------- */
  function initCurrent() {
    var here;
    var path = window.__SKIN_PATH__ || location.pathname; // __SKIN_PATH__: set only by the local preview harness
    try { here = decodeURIComponent(path).replace(/\/+$/, ''); } catch (e) { here = path; }
    if (!/\/category\//.test(here)) return;
    $$('.tt_category a').forEach(function (a) {
      var path;
      try { path = decodeURIComponent(a.pathname || '').replace(/\/+$/, ''); } catch (e) { path = a.pathname; }
      if (path && path === here) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
        // In the tabs, a subcategory page marks its top-level parent.
        var parent = a.closest('.tabs .category_list > li');
        if (parent && !a.classList.contains('link_item')) { var top = $('.link_item', parent); if (top) top.classList.add('is-current'); }
      }
    });
    var cur = $('.tabs .is-current');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  /* ---------- Post head: "부모/자식" category text becomes a two-step breadcrumb ---------- */
  function initCrumbs() {
    $$('.js-crumbs').forEach(function (a) {
      var parts = a.textContent.split('/').map(function (t) { return t.trim(); }).filter(Boolean);
      if (parts.length < 2) return;
      var nav = a.parentNode, href = a.getAttribute('href') || '';
      var segs = href.split('/');
      var parentHref = segs.length > 3 ? segs.slice(0, -1).join('/') : href; // /category/부모/자식 -> /category/부모
      var chevron = '<svg class="crumbs__sep" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
      var parent = doc.createElement('a');
      parent.className = 'crumbs__link crumbs__link--parent';
      parent.href = parentHref;
      parent.textContent = parts[0];
      a.textContent = parts[parts.length - 1];
      nav.insertBefore(parent, a);
      parent.insertAdjacentHTML('afterend', chevron);
    });
  }

  /* ---------- Rows: show the deepest category only ("컴퓨터 공학/Java" -> "Java") ---------- */
  function initCatLabels() {
    $$('.idx__cat, .feat__cat').forEach(function (el) {
      var t = el.textContent.trim();
      if (t.indexOf('/') === -1) return;
      el.title = t;
      el.textContent = t.split('/').pop().trim();
    });
  }

  /* ---------- Category pages: chips for the current category's subcategories (or its siblings) ---------- */
  function initSubnav() {
    if (doc.body.id !== 'tt-body-category') return;
    var head = $('.list__head'), cur = $('.panel__tree a.is-current');
    if (!head || !cur || $('.subnav')) return;
    var li = cur.closest('li'), top, kids;
    if (cur.classList.contains('link_sub_item')) {
      var parentLi = li.parentNode.closest('li');
      top = parentLi && $('.link_item', parentLi);
      kids = parentLi ? $$('.sub_category_list > li > a', parentLi) : [];
    } else if (cur.classList.contains('link_item')) {
      top = cur;
      kids = $$('.sub_category_list > li > a', li);
    } else {
      top = cur;
      kids = $$('.category_list > li > a', li);
    }
    if (!top || !kids.length) return;
    var label = function (a) {
      var c = a.cloneNode(true);
      $$('.c_cnt, img', c).forEach(function (x) { x.remove(); });
      return c.textContent.trim();
    };
    var count = function (a) { var c = $('.c_cnt', a); return c && !c.hidden ? c.textContent : ''; };
    var nav = doc.createElement('nav');
    nav.className = 'subnav';
    nav.setAttribute('aria-label', '하위 카테고리');
    [top].concat(kids).forEach(function (a, i) {
      var chip = doc.createElement('a');
      chip.href = a.getAttribute('href');
      chip.className = 'subnav__chip' + (a === cur ? ' is-current' : '');
      if (a === cur) chip.setAttribute('aria-current', 'page');
      chip.textContent = i === 0 ? '전체' : label(a);
      var n = count(a);
      if (n) { var b = doc.createElement('span'); b.className = 'subnav__count'; b.textContent = n; chip.appendChild(b); }
      nav.appendChild(chip);
    });
    head.parentNode.insertBefore(nav, head.nextSibling);
  }

  /* ---------- Tistory's own end-of-post blocks ----------
     Tistory can insert "'부모 > 자식' 카테고리의 다른 글" at the end of the body. It is Tistory content, so the skin
     never hides or moves it: it gets the skin's list styling, and the skin's own same-category list steps aside
     so readers do not see the same list twice. */
  function prepTistoryBlocks() {
    var box = $('.post #article-view .another_category');
    if (!box) return;
    doc.body.classList.add('has-tistory-related');
    $$('th a', box).forEach(function (a) { a.classList.add('js-series'); });
    // Tistory prints its title as <h4> right after the post's <h2>s, skipping a level. Same text, same place,
    // only the element changes so the outline reads "post sections -> other posts in this category".
    var h4 = $('h4', box);
    if (h4) {
      var h2 = doc.createElement('h2');
      h2.className = 'another_category__title';
      while (h4.firstChild) h2.appendChild(h4.firstChild);
      h4.replaceWith(h2);
    }
  }

  /* ---------- Paging: disabled arrows are not links ---------- */
  function initPaging() {
    $$('.paging__arrow.no-more-prev, .paging__arrow.no-more-next').forEach(function (a) {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
    });
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
        y.setAttribute('role', 'presentation');
        y.textContent = m[1];
        list.insertBefore(y, row);
        lastYear = m[1];
      }
      lastList = list;
    });
  }

  /* ---------- Markdown pasted into the basic editor ----------
     Tistory's basic editor keeps pasted Markdown as plain text: one <p> with <br> line breaks, so lists,
     tables and headings show up raw. Pipe tables pasted into a code block show up as code. This turns
     those parts (and only those) into real HTML. Posts written with the editor's own blocks are left alone. */
  var MD = {
    esc: function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); },
    inline: function (s) {
      var codes = [];
      s = MD.esc(s).replace(/`([^`]+)`/g, function (_, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
      s = s.replace(/!\[([^\]]*)\]\(((?:https?:)?\/\/[^\s)]+|\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
        .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^\s)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
        .replace(/~~([^~]+)~~/g, '<del>$1</del>');
      return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return '<code>' + codes[+i] + '</code>'; });
    },
    cells: function (line) {
      var t = line.trim().replace(/^\|/, '').replace(/\|$/, '');
      return t.split('|').map(function (c) { return c.trim(); });
    },
    isSep: function (line) { return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line); },
    table: function (rows) {
      rows = rows.filter(function (r) { return !MD.isSep(r); });
      var head = MD.cells(rows[0]), n = head.length;
      var h = '<table><thead><tr>' + head.map(function (c) { return '<th>' + MD.inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      rows.slice(1).forEach(function (r) {
        var c = MD.cells(r); while (c.length < n) c.push('');
        h += '<tr>' + c.slice(0, Math.max(n, c.length)).map(function (x) { return '<td>' + MD.inline(x) + '</td>'; }).join('') + '</tr>';
      });
      return h + '</tbody></table>';
    },
    // Block parser for the subset people actually paste: headings, lists, quotes, fences, tables, rules.
    render: function (src) {
      var lines = src.replace(/\r/g, '').split('\n'), out = [], i = 0;
      var isList = function (l) { return /^\s*([-*+]|\d+[.)])\s+\S/.test(l); };
      var isPipe = function (l) { return l.indexOf('|') !== -1 && MD.cells(l).length >= 2; };
      while (i < lines.length) {
        var l = lines[i];
        if (!l.trim()) { i++; continue; }
        var fence = l.match(/^\s*```\s*([\w+#.-]*)/);
        if (fence) {
          var code = []; i++;
          while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
          i++;
          out.push('<pre' + (fence[1] ? ' class="' + MD.esc(fence[1]) + '" data-ke-language="' + MD.esc(fence[1]) + '"' : '') + '><code>' + MD.esc(code.join('\n')) + '</code></pre>');
          continue;
        }
        var hd = l.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/);
        if (hd) { var lv = Math.min(4, Math.max(2, hd[1].length)); out.push('<h' + lv + '>' + MD.inline(hd[2]) + '</h' + lv + '>'); i++; continue; }
        if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(l)) { out.push('<hr>'); i++; continue; }
        if (/^\s*>/.test(l)) {
          var q = [];
          while (i < lines.length && /^\s*>/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
          out.push('<blockquote>' + MD.render(q.join('\n')) + '</blockquote>');
          continue;
        }
        if (isPipe(l) && i + 1 < lines.length && isPipe(lines[i + 1])) {
          var rows = [];
          while (i < lines.length && lines[i].trim() && (isPipe(lines[i]) || MD.isSep(lines[i]))) rows.push(lines[i++]);
          out.push('<div class="table-wrap" tabindex="0">' + MD.table(rows) + '</div>');
          continue;
        }
        if (isList(l)) {
          var items = [], ordered = /^\s*\d/.test(l), start = ordered ? parseInt(l, 10) : 1;
          while (i < lines.length && (isList(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
            var cur = lines[i++];
            if (isList(cur) && !/^\s{2,}/.test(cur)) items.push({ text: cur.replace(/^\s*([-*+]|\d+[.)])\s+/, ''), sub: [] });
            else items[items.length - 1].sub.push(cur.replace(/^\s{2,4}/, ''));
          }
          // A lone numbered line between paragraphs is a section heading that lost its "##".
          var nextBlank = i >= lines.length || !lines[i].trim();
          if (ordered && items.length === 1 && !items[0].sub.length && nextBlank && items[0].text.length <= 48 && !/[.!?。]$/.test(items[0].text)) {
            out.push('<h2>' + MD.inline(l.trim()) + '</h2>');
            continue;
          }
          var tag = ordered ? 'ol' : 'ul';
          out.push('<' + tag + (ordered && start !== 1 ? ' start="' + start + '"' : '') + '>' + items.map(function (it) {
            return '<li>' + MD.inline(it.text) + (it.sub.length ? MD.render(it.sub.join('\n')) : '') + '</li>';
          }).join('') + '</' + tag + '>');
          continue;
        }
        var para = [];
        while (i < lines.length && lines[i].trim() && !/^\s*(```|#{1,6}\s|>)/.test(lines[i]) && !isList(lines[i]) &&
               !(isPipe(lines[i]) && i + 1 < lines.length && isPipe(lines[i + 1]))) para.push(lines[i++]);
        // A line that is only an image becomes a figure; alt text doubles as the caption.
        var imgOnly = para.length === 1 && para[0].trim().match(/^!\[([^\]]*)\]\(([^\s)]+)\)$/);
        if (imgOnly) {
          out.push('<figure class="imageblock alignCenter">' + MD.inline(para[0].trim()) + (imgOnly[1] ? '<figcaption>' + MD.esc(imgOnly[1]) + '</figcaption>' : '') + '</figure>');
          continue;
        }
        // A short single line with no sentence ending, between paragraphs, is a heading too ("회고").
        if (para.length === 1 && para[0].trim().length <= 20 && !/[.!?。:,)]$/.test(para[0].trim()) && out.length && (i >= lines.length || !lines[i].trim())) {
          out.push('<h2>' + MD.inline(para[0].trim()) + '</h2>');
        } else {
          out.push('<p>' + para.map(MD.inline).join('<br>') + '</p>');
        }
      }
      return out.join('\n');
    },
    textOf: function (p) {
      var c = p.cloneNode(true);
      $$('br', c).forEach(function (b) { b.replaceWith('\n'); });
      return c.textContent.replace(/ /g, ' ');
    },
    score: function (text) {
      var lines = text.split('\n'), s = 0, pipes = 0, fence = false;
      lines.forEach(function (l) {
        if (/^\s*```/.test(l)) fence = true;
        if (/^\s*(#{1,6}\s|[-*+]\s+\S|>\s)/.test(l)) s++;
        if (l.indexOf('|') !== -1 && MD.cells(l).length >= 2) pipes++;
      });
      if (/\*\*[^*]+\*\*|`[^`\n]+`/.test(text)) s++;
      return fence || pipes >= 2 ? s + 3 : s;
    }
  };

  function initMarkdown(content) {
    var root = $('.contents_style', content) || content;
    // 1) Pipe tables pasted into a code block become real tables.
    $$('pre', root).forEach(function (pre) {
      var lines = pre.textContent.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (lines.length >= 2 && lines.every(function (l) { return /^\|.*\|$/.test(l) || MD.isSep(l); })) {
        var wrap = doc.createElement('div');
        wrap.className = 'table-wrap'; wrap.setAttribute('tabindex', '0');
        wrap.innerHTML = MD.table(lines);
        pre.replaceWith(wrap);
      }
    });
    // 2) Runs of plain paragraphs that are really Markdown text.
    var plain = function (el) {
      return el && el.tagName === 'P' && !el.querySelector('img, iframe, video, figure, table, pre, input');
    };
    var kids = Array.prototype.slice.call(root.children), run = [];
    var flush = function () {
      if (!run.length) return;
      var text = run.map(MD.textOf).join('\n\n');
      if (MD.score(text) >= 3) {
        var box = doc.createElement('div');
        box.className = 'md-rendered';
        box.innerHTML = MD.render(text);
        run[0].parentNode.insertBefore(box, run[0]);
        run.forEach(function (p) { p.remove(); });
        if (window.hljs) $$('pre code', box).forEach(function (c) { try { (window.hljs.highlightElement || window.hljs.highlightBlock).call(window.hljs, c); } catch (e) {} });
      }
      run = [];
    };
    kids.forEach(function (el) { if (plain(el)) run.push(el); else flush(); });
    flush();
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
    var sheet = initSheet(list);
    var links = $$('.toc a'), last, ticking = false;
    function mark() {
      var active = null, activeText = '';
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top < innerHeight * 0.3) { active = heads[i].id; activeText = heads[i].textContent.trim(); } else break;
      }
      if (active !== last) {
        last = active;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-target') === active); });
        if (sheet) sheet.label(activeText || '목차');
      }
      if (sheet) {
        var r = content.getBoundingClientRect();
        sheet.show(r.top < 0 && r.bottom > innerHeight * 0.5);
      }
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }
  /* Phones/tablets: floating "current section" button that opens the contents as a bottom sheet. */
  function initSheet(list) {
    var fab = $('.toc-fab'), sheet = $('#toc-sheet');
    if (!fab || !sheet) return null;
    var btn = $('.js-sheet-open', fab), label = $('.toc-fab__label', fab), lastFocus = null;
    $('.toc', sheet).appendChild(list.cloneNode(true));
    function setOpen(open) {
      sheet.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      doc.body.classList.toggle('sheet-open', open);
      if (open) { lastFocus = doc.activeElement; var a = $('.toc a.is-active', sheet) || $('.toc a', sheet); if (a) a.focus(); }
      else if (lastFocus) lastFocus.focus();
    }
    btn.addEventListener('click', function () { setOpen(true); });
    $$('.js-sheet-close', sheet).forEach(function (el) { el.addEventListener('click', function () { setOpen(false); }); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    sheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    return {
      label: function (t) { label.textContent = t; $$('.toc a', sheet).forEach(function (l) { l.classList.toggle('is-active', l.textContent.trim() === t); }); },
      show: function (on) { if (fab.hidden === on) fab.hidden = !on; }
    };
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
    prepTistoryBlocks();
    initSeries();
    initCounts();
    initCurrent();
    initSubnav();
    initCrumbs();
    initCatLabels();
    initPaging();
    initIndex();
    var content = $('.post #article-view');
    if (content) { initMarkdown(content); initCode(content); initTables(content); initReadTime(content); initToc(content); initProgress(content); }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
