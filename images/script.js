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
  var session = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  // "2026.11.08", "2026. 11. 8." -> ['2026', '11', '08']
  function ymd(s) {
    var m = (s || '').match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
    return m ? [m[1], ('0' + m[2]).slice(-2), ('0' + m[3]).slice(-2)] : null;
  }
  // "/512/" or "https://blog/512" -> "/512" (for comparing links to posts)
  function pathOf(h) {
    try { return new URL(h, location.href).pathname.replace(/\/+$/, ''); } catch (e) { return h; }
  }
  // Tistory prints only the time ("14:48:21") for a post written today.
  var TIME_ONLY = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;
  function todayYmd() {
    var n = new Date();
    return [String(n.getFullYear()), ('0' + (n.getMonth() + 1)).slice(-2), ('0' + n.getDate()).slice(-2)];
  }

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
    // "/" opens search from anywhere on the page (not while typing)
    if (setSearch) doc.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      e.preventDefault();
      if (setPanel) setPanel(false);
      setSearch(true);
    });
    initLiveSearch();
  }

  /* ---------- Search as you type ----------
     After a pause in typing, the header search shows the first five matches from the blog's own search page
     (same origin, the same request the full results page makes). Arrow keys move through them, Enter opens one;
     with nothing picked, Enter still runs Tistory's full search. */
  function escRe(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function markText(cls, text, re) {
    var el = doc.createElement('span');
    el.className = cls;
    text.split(re).forEach(function (part, i) {
      if (!part) return;
      if (i % 2) { var m = doc.createElement('mark'); m.className = 'hit'; m.textContent = part; el.appendChild(m); }
      else el.appendChild(doc.createTextNode(part));
    });
    return el;
  }
  function initLiveSearch() {
    var input = $('#search .search__input'), box = $('#search .search__suggest');
    if (!input || !box || !window.fetch || !window.DOMParser) return;
    var list = $('.search__results', box), status = $('.search__status', box);
    var timer = null, ctrl = null, active = -1, memo = {};
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    var opts = function () { return $$('[role="option"]', list); };
    function setActive(i) {
      var o = opts();
      if (!o.length) return;
      active = (i + o.length) % o.length;
      o.forEach(function (el, j) { el.setAttribute('aria-selected', j === active ? 'true' : 'false'); });
      input.setAttribute('aria-activedescendant', o[active].id);
    }
    function close() {
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function option(id, a) {
      var li = doc.createElement('li');
      li.id = id; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false');
      a.tabIndex = -1;
      li.appendChild(a);
      list.appendChild(li);
    }
    function render(q, res) {
      list.textContent = ''; active = -1; input.removeAttribute('aria-activedescendant');
      var re = new RegExp('(' + q.split(/\s+/).filter(Boolean).map(escRe).join('|') + ')', 'i');
      res.rows.slice(0, 5).forEach(function (r, i) {
        var a = doc.createElement('a'), parts = splitTitle(r.title);
        a.href = r.href; a.className = 'search__hit';
        if (parts) a.appendChild(markText('search__series', parts.label, re));
        a.appendChild(markText('search__title', parts ? parts.main : r.title, re));
        var meta = [dateLabel(r.date), r.cat.split('/').pop().trim()].filter(Boolean).join(' · ');
        if (meta) { var m = doc.createElement('span'); m.className = 'search__meta'; m.textContent = meta; a.appendChild(m); }
        option('search-opt-' + i, a);
      });
      if (res.count > 5) {
        var all = doc.createElement('a');
        all.href = '/search/' + encodeURIComponent(q); all.className = 'search__all';
        all.textContent = '‘' + q + '’ 검색 결과 ' + res.count + '편 모두 보기';
        option('search-opt-all', all);
      }
      status.textContent = res.rows.length ? '' : '‘' + q + '’와 일치하는 글이 없습니다';
      box.hidden = false;
      input.setAttribute('aria-expanded', res.rows.length ? 'true' : 'false');
    }
    function run() {
      var q = input.value.trim();
      if (q.length < 2 && !/[가-힣]/.test(q)) { close(); return; }
      if (memo[q]) { render(q, memo[q]); return; }
      if (ctrl) ctrl.abort();
      ctrl = window.AbortController ? new AbortController() : null;
      status.textContent = '찾는 중…';
      box.hidden = false;
      searchPage(q, ctrl && ctrl.signal).then(function (res) {
        memo[q] = res;
        if (input.value.trim() === q) render(q, res);
      }, function (e) {
        if (e && e.name === 'AbortError') return;
        status.textContent = ''; close(); // the full search (Enter) still works
      });
    }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
    input.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); location.href = $('a', opts()[active]).href; }
      else if (e.key === 'Escape') { e.stopPropagation(); close(); } // a second Esc closes the search bar
    });
    doc.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== input) close(); });
  }

  /* ---------- Lists: clearer heads, and an empty search that still leads somewhere ---------- */
  function initListHead() {
    var title = $('.list .list__title'), id = doc.body.id;
    if (title && id === 'tt-body-search' && title.textContent.trim()) title.textContent = '‘' + title.textContent.trim() + '’ 검색 결과';
    if (title && id === 'tt-body-tag' && title.textContent.trim() && title.textContent.trim().charAt(0) !== '#') title.textContent = '#' + title.textContent.trim();
    var empty = $('.list .empty');
    if (!empty || !empty.getClientRects().length || $('.empty-help')) return;
    var help = doc.createElement('div');
    help.className = 'empty-help';
    var section = function (heading, body) {
      var s = doc.createElement('section'), h = doc.createElement('h2');
      h.className = 'empty-help__title'; h.textContent = heading;
      s.appendChild(h); s.appendChild(body); help.appendChild(s);
    };
    var popular = $('.aside .module--popular .module__list'), moved = [];
    if (popular && popular.children.length) { section('많이 읽힌 글', popular.cloneNode(true)); moved.push('popular'); }
    var tops = $$('.panel__tree .category_list > li > a.link_item');
    if (tops.length) {
      var chips = doc.createElement('nav');
      chips.className = 'subnav'; chips.setAttribute('aria-label', '카테고리');
      tops.forEach(function (a) {
        var chip = doc.createElement('a'), c = $('.c_cnt', a), label = a.cloneNode(true);
        $$('.c_cnt, img', label).forEach(function (x) { x.remove(); });
        chip.href = a.getAttribute('href'); chip.className = 'subnav__chip'; chip.textContent = label.textContent.trim();
        if (c && !c.hidden && c.textContent) { var n = doc.createElement('span'); n.className = 'subnav__count'; n.textContent = c.textContent; chip.appendChild(n); }
        chips.appendChild(chip);
      });
      section('카테고리', chips);
      moved.push('tree');
    }
    if (!help.children.length) return;
    empty.parentNode.insertBefore(help, empty.nextSibling);
    // On a desktop search page the aside sits beside this: the modules shown here step out of it (moved, not doubled).
    if (id === 'tt-body-search') moved.forEach(function (m) { doc.body.classList.add('empty-moved-' + m); });
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

  /* ---------- Breadcrumb structured data ----------
     Tistory already prints BlogPosting JSON-LD for each post; the category path is the piece it leaves out. Built from
     the breadcrumb the reader sees (blog > parent > category), serialized with JSON.stringify so names are escaped. */
  function initBreadcrumbLd() {
    var crumbs = $$('.post .crumbs a[href]'), home = $('.logo');
    if (!crumbs.length || !home || $('script[data-salieri-ld]')) return;
    var logoImg = $('img', home), homeName = home.textContent.trim() || (logoImg ? (logoImg.getAttribute('alt') || '').trim() : '');
    var items = [{ name: homeName, href: home.href }]
      .concat(crumbs.map(function (a) { return { name: a.textContent.trim(), href: a.href }; }));
    var ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.filter(function (it) { return it.name && /^https?:/.test(it.href); }).map(function (it, i) {
      return { '@type': 'ListItem', position: i + 1, name: it.name, item: it.href };
    }) };
    if (ld.itemListElement.length < 2) return;
    var s = doc.createElement('script');
    s.type = 'application/ld+json'; s.setAttribute('data-salieri-ld', '');
    s.textContent = JSON.stringify(ld);
    doc.head.appendChild(s);
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
      var raw = row.getAttribute('data-date'), d = ymd(raw), today = !d && TIME_ONLY.test(raw || '');
      if (today) d = todayYmd();
      if (!d) return;
      var list = row.parentNode;
      var t = $('.idx__date', row);
      if (t) {
        t.textContent = today ? '오늘' : d[1] + '.' + d[2];
        t.setAttribute('datetime', d.join('-'));
        if (today) t.classList.add('is-today');
      }
      // Each cover/list starts its own year run; index_article_rep renders one <ul> per post, so those share one run.
      if (list !== lastList && !list.classList.contains('idx--loose')) lastYear = null;
      if (d[0] !== lastYear) {
        var y = doc.createElement('li');
        y.className = 'idx__year';
        y.setAttribute('role', 'presentation');
        y.textContent = d[0];
        list.insertBefore(y, row);
        lastYear = d[0];
      }
      lastList = list;
    });
    // Other dates that can come through as a bare time: prev/next, related posts, covers.
    $$('.post-nav__date, .related__date, .gallery__date').forEach(function (el) {
      if (TIME_ONLY.test(el.textContent)) el.textContent = '오늘';
    });
    $$('.feat__date').forEach(function (el) {
      el.textContent = el.textContent.replace(/^\s*\d{1,2}:\d{2}(:\d{2})?/, '오늘');
    });
  }

  /* ---------- Returning readers: what is new since the last visit ----------
     Stored in this browser only (localStorage "salieri-visit"). The first page of a session reads the previous visit
     and keeps it for the whole session, so the marks do not vanish while the reader moves between pages.
     Index rows newer than that visit get a "새 글" tag; a first-time visitor sees none. */
  function initVisitMarks() {
    var prev = session.get('salieri-visit-prev'), now = Date.now();
    if (prev === null) {
      var saved = null;
      try { saved = JSON.parse(store.get('salieri-visit') || 'null'); } catch (e) {}
      prev = saved && saved.last ? String(saved.last) : '';
      session.set('salieri-visit-prev', prev);
    }
    store.set('salieri-visit', JSON.stringify({ last: now }));
    if (!prev || !+prev) return;
    var since = new Date(+prev), sinceDay = since.getFullYear() * 10000 + (since.getMonth() + 1) * 100 + since.getDate();
    var today = todayYmd().join('');
    $$('.idx__row').forEach(function (row) {
      var t = $('.idx__date', row), iso = t && t.getAttribute('datetime');
      if (!iso || $('.idx__new', row)) return;
      var day = +iso.replace(/-/g, ''), fresh = day > sinceDay;
      // Today's rows carry the exact time ("14:48:21"): compare it when the last visit was also today.
      var raw = row.getAttribute('data-date') || '';
      if (!fresh && day === sinceDay && String(day) === today && TIME_ONLY.test(raw)) {
        var hm = raw.trim().split(':');
        var posted = new Date(); posted.setHours(+hm[0], +hm[1], +(hm[2] || 0), 0);
        fresh = posted.getTime() > since.getTime();
      }
      if (!fresh) return;
      row.classList.add('is-new');
      var tag = doc.createElement('span');
      tag.className = 'idx__new';
      tag.textContent = '새 글';
      var cat = $('.idx__cat', row);
      if (cat) cat.insertBefore(tag, cat.firstChild);
      else $('.idx__main', row).appendChild(tag);
    });
  }

  /* ---------- Tistory's fixed toolbar ----------
     On desktop Tistory pins a "구독하기" toolbar (.menu_toolbar, z-index 9999) to the top-right corner, over the
     header's search and theme buttons. The header keeps the toolbar's width free; the toolbar is left as it is. */
  function initToolbarGap() {
    var head = $('.site-header__in');
    if (!head) return;
    function fit() {
      var bar = $('.menu_toolbar'), gap = 0;
      if (bar) {
        var b = bar.getBoundingClientRect(), h = head.getBoundingClientRect();
        if (b.width && b.height && b.bottom > h.top && b.top < h.bottom && b.left < h.right) gap = Math.ceil(h.right - b.left) + 16;
      }
      var natural = parseFloat(getComputedStyle(head).paddingLeft) || 0; // the gutter on the other side
      head.classList.toggle('has-toolbar-gap', gap > natural);
      head.style.setProperty('--toolbar-gap', gap + 'px');
    }
    fit();
    var queued = false;
    window.addEventListener('resize', function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; fit(); }); } });
    window.addEventListener('load', fit);
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
      collapseLong(pre, code);
    });
  }
  /* Code longer than CODE_MAX lines starts folded to its first lines; copy still takes the whole block. */
  var CODE_MAX = 40;
  function collapseLong(pre, code) {
    var lines = code.textContent.replace(/\n+$/, '').split('\n').length;
    if (lines <= CODE_MAX || $('.code-more', pre)) return;
    var more = doc.createElement('button');
    more.type = 'button'; more.className = 'code-more';
    function sync() {
      var folded = pre.classList.contains('is-collapsed');
      more.textContent = folded ? '전체 보기 (' + lines + '줄)' : '접기';
      more.setAttribute('aria-expanded', folded ? 'false' : 'true');
    }
    more.addEventListener('click', function () {
      var folding = !pre.classList.contains('is-collapsed');
      pre.classList.toggle('is-collapsed');
      sync();
      if (folding && pre.getBoundingClientRect().top < 0) pre.scrollIntoView({ block: 'start' });
    });
    pre.classList.add('is-collapsed');
    sync();
    pre.appendChild(more);
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
    if (!el || !el.hidden) return; // already filled inline (skin.html salieriBody)
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
  /* Headings that make up the outline (contents, section links), each with a stable id. */
  function tocHeads(content) {
    var used = {};
    return $$('h2, h3', content).filter(function (h) {
      return h.textContent.replace(/\s| /g, '').length && !h.closest('.another_category, figure, blockquote');
    }).map(function (h) { if (!h.id) h.id = slug(h.textContent, used); return h; });
  }
  /* The rail starts where the post body starts (its column runs the full height, the inner part is sticky). */
  function placeRail(rail, content) {
    var place = function () {
      var page = $('.page');
      if (page) rail.style.setProperty('--toc-top', (content.getBoundingClientRect().top - page.getBoundingClientRect().top) + 'px');
    };
    place(); window.addEventListener('resize', place); window.addEventListener('load', place);
  }
  function initToc(content, heads) {
    if (doc.body.classList.contains('toc-off') || heads.length < 2) { var box = $('.toc-inline'); if (box) box.hidden = true; return; }
    // Labels are read once: section links get appended to the headings afterwards.
    var labels = heads.map(function (h) { return h.textContent.trim(); });
    var list = doc.createElement('ol'), current = null;
    heads.forEach(function (h, i) {
      var li = doc.createElement('li'), a = doc.createElement('a');
      a.href = '#' + h.id; a.setAttribute('data-target', h.id); a.textContent = labels[i];
      li.appendChild(a);
      if (h.tagName === 'H3' && current) {
        var sub = $('ol', current);
        if (!sub) { sub = doc.createElement('ol'); sub.className = 'toc__sub'; current.appendChild(sub); }
        sub.appendChild(li);
      } else { list.appendChild(li); current = li; }
    });
    var inline = $('.toc-inline'), rail = $('.toc-rail');
    if (inline) { $('.toc', inline).appendChild(list.cloneNode(true)); inline.hidden = false; }
    var railToc = rail && $('.toc', rail);
    if (rail) {
      railToc.appendChild(list); rail.hidden = false; root.classList.add('has-toc');
      placeRail(rail, content);
    }
    var sheet = initSheet(list);
    var links = $$('.toc a'), last, ticking = false;
    // A long outline scrolls inside the rail: keep the current section in view there (the page itself never moves).
    function keepInView(id) {
      if (!railToc || railToc.scrollHeight <= railToc.clientHeight) return;
      var a = $('a[data-target="' + id + '"]', railToc);
      if (!a) return;
      var top = a.offsetTop - railToc.offsetTop, h = railToc.clientHeight;
      if (top < railToc.scrollTop + 24 || top > railToc.scrollTop + h - 48) railToc.scrollTop = Math.max(0, top - h / 3);
    }
    function mark() {
      var active = null, activeText = '';
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top < innerHeight * 0.3) { active = heads[i].id; activeText = labels[i]; } else break;
      }
      if (active !== last) {
        last = active;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-target') === active); });
        if (active) keepInView(active);
        if (sheet) sheet.label(activeText || '목차');
      }
      if (sheet) {
        var r = content.getBoundingClientRect();
        sheet.show(r.top < 0 && r.bottom > innerHeight * 0.5 && !overAvoided());
      }
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }
  /* The floating button steps aside while an ad or Tistory's reaction row passes under it: Tistory's policy is
     that nothing covers its ads, and the reaction row is how readers answer a post. */
  var AVOID = '.revenue_unit_wrap, ins.adsbygoogle, iframe[id^="aswift"], .container_postbtn';
  var avoidEls = [], avoidAt = 0;
  function overAvoided() {
    var now = Date.now();
    if (now - avoidAt > 1500) { avoidEls = $$(AVOID); avoidAt = now; } // ads can be inserted late
    var band = innerHeight - 96; // the button: 44px tall, 16px above the bottom edge, plus air
    for (var i = 0; i < avoidEls.length; i++) {
      var r = avoidEls[i].getBoundingClientRect();
      if (r.height > 0 && r.bottom > band && r.top < innerHeight) return true;
    }
    return false;
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
      else (lastFocus && lastFocus !== doc.body && lastFocus.focus ? lastFocus : btn).focus();
    }
    btn.addEventListener('click', function () { setOpen(true); });
    $$('.js-sheet-close', sheet).forEach(function (el) { el.addEventListener('click', function () { setOpen(false); }); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      // aria-modal: Tab stays inside the sheet
      var f = $$('a[href], button:not([disabled])', sheet).filter(function (el) { return el.getClientRects().length; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
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

  /* ---------- Resume reading ----------
     Where the reader is in each post (progress and the section above the fold) is kept in this browser only
     (localStorage "salieri-read", the 30 most recent posts). The inline script under the post meta shows
     "지난번에 「…」까지 읽었습니다 · 이어 읽기" on the next visit; a post read to the end is marked done. */
  var READ_KEY = 'salieri-read', READ_MAX = 30;
  function readLog() { try { return JSON.parse(store.get(READ_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function initResume(content, heads) {
    var here = pathOf(location.href), titleEl = $('.post .post__title');
    var title = titleEl ? ($('.series-main', titleEl) || titleEl).textContent.trim() : doc.title;
    var labels = heads.map(function (h) { return h.textContent.trim(); }); // read before the "#" section links are added
    var line = $('.post .resume'), link = line && !line.hidden && $('.resume__link', line);
    function progress() {
      var r = content.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    }
    function save() {
      var p = progress();
      if (p < 0.03) return; // only arrived
      var log = readLog(), old = log[here], h = -1;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top < innerHeight * 0.3) h = i; else break; }
      log[here] = { p: (old && old.p === 1) || p >= 0.95 ? 1 : +p.toFixed(3), h: h >= 0 ? heads[h].id : '', l: h >= 0 ? labels[h] : '', t: title, at: Date.now() };
      var keys = Object.keys(log).sort(function (a, b) { return (log[b].at || 0) - (log[a].at || 0); });
      keys.slice(READ_MAX).forEach(function (k) { delete log[k]; });
      store.set(READ_KEY, JSON.stringify(log));
      if (line && !line.hidden && link && p > +link.getAttribute('data-p')) line.hidden = true; // caught up
    }
    var timer = null;
    addEventListener('scroll', function () { if (!timer) timer = setTimeout(function () { timer = null; save(); }, 1000); }, { passive: true });
    addEventListener('pagehide', save);
    doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'hidden') save(); });
    if (link) {
      link.addEventListener('click', function (e) {
        var id = (link.getAttribute('href') || '').slice(1), target = id && doc.getElementById(id);
        line.hidden = true;
        if (target && target !== content) return; // the section still exists: the anchor jump does it
        e.preventDefault(); // the section was renamed since: go to the same share of the post
        var r = content.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
        scrollTo(0, r.top + scrollY + total * +link.getAttribute('data-p'));
      });
    }
  }

  /* Section links: "#" after each outline heading copies the address of that section. */
  function initHeadingLinks(heads) {
    heads.forEach(function (h) {
      if ($('.heading-link', h)) return;
      var a = doc.createElement('a');
      a.className = 'heading-link';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', '이 소제목 주소 복사');
      a.textContent = '#';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        try { history.replaceState(null, '', '#' + h.id); } catch (err) {}
        copyText(location.href.split('#')[0] + '#' + h.id).then(function () {
          a.textContent = '복사됨'; a.classList.add('is-done');
          setTimeout(function () { a.textContent = '#'; a.classList.remove('is-done'); }, 1500);
        }, function () {});
      });
      h.appendChild(a);
    });
  }

  /* ---------- Series: posts titled "[과정] 최종 프로젝트 3일차 :: 주제" listed together at the end of the post ----------
     Tistory has no series feature: the series is the title label before "::". The list comes from the blog's own
     search page (same origin, rendered by this skin), keeping only titles whose label names the same series. */
  var SERIES_EP = /^(.+?)\s*(\d+)\s*(일\s*차|회차|회|편|화|부|주차|강|장)$/;
  function seriesOf(label) {
    var t = label.replace(/\s+/g, ' ').trim(), m = t.match(SERIES_EP);
    return m ? { key: m[1].trim(), n: +m[2], ep: m[2] + m[3].replace(/\s+/g, '') } : { key: t, n: null, ep: '' };
  }
  function splitTitle(text) {
    var i = text.indexOf('::');
    if (i < 1) return null;
    var label = text.slice(0, i).trim(), main = text.slice(i + 2).trim();
    return label && main ? { label: label, main: main } : null;
  }
  function initSeriesNav() {
    var box = $('.post .series-nav'), title = $('.post .post__title');
    var sEl = title && $('.series', title), mEl = title && $('.series-main', title);
    if (!box || !sEl || !mEl || !window.fetch || !window.DOMParser) return;
    var me = seriesOf(sEl.textContent);
    // Search words: the series name without its "[과정]" tag ("[LG CNS] 최종 프로젝트" -> "최종 프로젝트").
    var words = me.key.replace(/^\[[^\]]*\]\s*/, '').trim() || me.key.replace(/[[\]]/g, ' ').trim();
    if (words.length < 2) return;
    var cacheKey = 'salieri-series:' + me.key.toLowerCase(), cached = null;
    try { cached = JSON.parse(session.get(cacheKey) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < 10 * 60 * 1000) { renderSeries(box, me, cached.items, sEl, mEl, cached.complete); return; }
    searchAll(words).then(function (res) {
      var items = [];
      res.rows.forEach(function (row) {
        var parts = splitTitle(row.title);
        if (!parts) return;
        var s = seriesOf(parts.label);
        if (s.key.toLowerCase() !== me.key.toLowerCase()) return; // the words only appear in the body
        items.push({ href: row.href, main: parts.main, n: s.n, ep: s.ep, date: row.date });
      });
      session.set(cacheKey, JSON.stringify({ t: Date.now(), items: items, complete: res.complete }));
      renderSeries(box, me, items, sEl, mEl, res.complete);
    }).catch(function () {}); // no list: the post still has prev/next
  }
  /* Every page of a search (up to five), so a long series is not judged by its first 20 results.
     complete = all of Tistory's matches were read; only then may the skin state counts. */
  function searchAll(words) {
    var rows = [], seen = {}, total = 0;
    function next(page) {
      return searchPage(words, null, page).then(function (res) {
        total = res.count;
        var fresh = res.rows.filter(function (r) { if (seen[r.href]) return false; seen[r.href] = true; return true; });
        rows = rows.concat(fresh);
        if (fresh.length && rows.length < total && page < 5) return next(page + 1);
        return { rows: rows, count: total, complete: rows.length >= total };
      });
    }
    return next(1);
  }
  /* The blog's own search page (rows and total count, see readList). */
  function searchPage(words, signal, page) {
    // __SKIN_SEARCH__: set only by the local preview harness
    var url = (window.__SKIN_SEARCH__ || '/search/') + encodeURIComponent(words);
    if (page > 1) url += (url.indexOf('?') === -1 ? '?' : '&') + 'page=' + page;
    return readList(url, signal);
  }
  /* A list page of this blog (search, tag), read through this skin's markup: rows { href, title, date, cat, thumb, sum }
     and the total count Tistory prints in the list head. */
  function readList(url, signal) {
    return fetch(url, { credentials: 'same-origin', signal: signal })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var page = new DOMParser().parseFromString(html, 'text/html'), rows = [];
        $$('.list .idx__row', page).forEach(function (row) {
          var a = $('a[href]', row), t = $('.idx__title', row), c = $('.idx__cat', row), im = $('.idx__thumb', row), s = $('.idx__sum', row);
          if (a && t) rows.push({
            href: a.getAttribute('href'), title: t.textContent.replace(/\s+/g, ' ').trim(), date: row.getAttribute('data-date') || '',
            cat: c ? c.textContent.trim() : '', thumb: im ? im.getAttribute('src') || '' : '', sum: s ? s.textContent.replace(/\s+/g, ' ').trim() : ''
          });
        });
        var n = $('.list .list__count', page);
        return { rows: rows, count: (n && parseInt(n.textContent, 10)) || rows.length };
      });
  }
  /* complete: every search match was read (searchAll). Counts ("12편", "12편 중 3번째") are shown only then, and prev/next
     become episodes only when the neighbour's number is exactly one step away, so a partial list never invents facts. */
  function renderSeries(box, me, items, sEl, mEl, complete) {
    var here = pathOf(location.href), main = mEl.textContent.trim(), list = items.slice(), cur = null;
    list.forEach(function (it) { if (!cur && it.href && pathOf(it.href) === here) cur = it; });
    list.forEach(function (it) { if (!cur && it.main === main) cur = it; });
    if (!cur) { // search index not updated yet: the post itself still belongs in the list
      var t = $('.post .post__meta time');
      cur = { href: '', main: main, n: me.n, ep: me.ep, date: t ? t.textContent : '' };
      list.push(cur);
    }
    if (list.length < 2) return;
    var key = function (it) { var d = ymd(it.date); return d ? d.join('') : ''; };
    list.sort(function (a, b) {
      if (a.n !== null && b.n !== null && a.n !== b.n) return a.n - b.n;
      return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;
    });
    var head = $('.series-nav__title', box), ol = $('.series-nav__list', box), at = list.indexOf(cur);
    var span = function (cls, text) { var s = doc.createElement('span'); s.className = cls; s.textContent = text; return s; };
    // This browser's own reading log: which episodes this reader finished or started. A fact about the reader, so it
    // may be stated even when the list itself is partial.
    var log = readLog(), readN = 0;
    var stateOf = function (it) { var s = it.href && log[pathOf(it.href)]; return !s ? '' : s.p === 1 ? 'read' : s.p >= 0.1 ? 'reading' : ''; };
    head.textContent = '';
    head.appendChild(span('series-nav__label', '시리즈'));
    head.appendChild(span('series-nav__name', me.key));
    if (complete) head.appendChild(span('series-nav__count', list.length + '편'));
    list.forEach(function (it, i) {
      var li = doc.createElement('li'), el = doc.createElement(it === cur ? 'span' : 'a'), d = ymd(it.date);
      var st = stateOf(it), shown = it === cur ? '' : st;
      if (st === 'read') readN++;
      li.className = 'series-nav__item' + (it === cur ? ' is-current' : '') + (Math.abs(i - at) > 2 ? ' is-far' : '') +
        (shown === 'read' ? ' is-read' : shown === 'reading' ? ' is-reading' : '');
      el.className = 'series-nav__link';
      if (it === cur) el.setAttribute('aria-current', 'page'); else el.href = it.href;
      el.appendChild(span('series-nav__ep', it.ep || (d ? d[1] + '.' + d[2] : String(i + 1))));
      el.appendChild(span('series-nav__main', it.main));
      if (shown) el.appendChild(span('series-nav__state', shown === 'read' ? '읽음' : '읽는 중'));
      li.appendChild(el);
      ol.appendChild(li);
    });
    if (readN) head.appendChild(span('series-nav__read', readN + '편 읽음'));
    if (list.length > 5 && $$('.is-far', ol).length) { // long series: two episodes either side, then the rest on request
      var more = doc.createElement('button');
      more.type = 'button'; more.className = 'series-nav__more'; more.textContent = complete ? '전체 ' + list.length + '편 보기' : '목록 모두 보기';
      more.addEventListener('click', function () { box.classList.add('is-open'); more.remove(); });
      box.appendChild(more);
    } else box.classList.add('is-open');
    box.hidden = false;
    // The series label above the title now leads to the list, and says where this post stands in it.
    var link = doc.createElement('a');
    link.className = sEl.className + ' series--link';
    link.href = '#series';
    link.textContent = sEl.textContent;
    if (complete) link.appendChild(span('series__pos', list.length + '편 중 ' + (at + 1) + '번째'));
    sEl.parentNode.replaceChild(link, sEl);
    // Prev/next become the neighbouring episodes (n - 1 and n + 1 only); the next one is also the post's next read.
    var step = function (ep, d) { return ep && ep.href && cur.n !== null && ep.n === cur.n + d ? ep : null; };
    var prevEp = step(list[at - 1], -1), nextEp = step(list[at + 1], 1);
    seriesNavItem('prev', prevEp);
    seriesNavItem('next', nextEp);
    seriesStep(prevEp, nextEp);
    // The next read is the next episode; if this reader already finished it, the first episode after this one they
    // have not read (only from a complete list, so no unknown episode is skipped over).
    var target = nextEp, what = '다음 편';
    if (nextEp && complete && stateOf(nextEp) === 'read') {
      target = null; what = '안 읽은 편';
      for (var j = at + 1; j < list.length; j++) if (list[j].href && stateOf(list[j]) !== 'read') { target = list[j]; break; }
    }
    if (target) nextRead.set({ href: target.href, label: what + (target.ep ? ' · ' + target.ep : ''), title: target.main }, 4);
    // The latest episode is a dead end; say so plainly and point at Tistory's own subscribe button.
    var latest = complete && at === list.length - 1 && cur.n !== null && list.every(function (it) { return it.n === null || it.n <= cur.n; });
    if (latest) seriesEnd(box);
    dedupeFooter();
  }
  /* Arrows at the top of a series post (room reserved inline by salieriHead, so nothing moves when they fill in). */
  function seriesStep(prevEp, nextEp) {
    var nav = $('.post .series-step');
    if (!nav || (!prevEp && !nextEp)) return;
    [['prev', prevEp, '이전 편'], ['next', nextEp, '다음 편']].forEach(function (s) {
      var a = $('[data-dir="' + s[0] + '"]', nav), ep = s[1];
      if (!a || !ep) return;
      var label = s[2] + (ep.ep ? ' · ' + ep.ep : '') + ': ' + ep.main;
      a.href = ep.href;
      a.removeAttribute('aria-hidden'); a.removeAttribute('tabindex');
      a.setAttribute('aria-label', label); a.title = label;
      a.classList.add('is-ready');
    });
    nav.hidden = false;
  }
  /* Under the list on the latest episode: new episodes come through Tistory's subscription (or RSS). The skin only
     scrolls to Tistory's button and focuses it; pressing it stays the reader's choice. */
  function seriesEnd(box) {
    if ($('.series-nav__end', box)) return;
    var btnSel = '.post .container_postbtn .btn_subscription, .post .tt_btn_subscribe';
    var rss = $('link[type="application/rss+xml"]'), hasBtn = !!$(btnSel);
    if (!hasBtn && !(rss && rss.getAttribute('href'))) return;
    var p = doc.createElement('p');
    p.className = 'series-nav__end';
    p.appendChild(doc.createTextNode(hasBtn ? '가장 최근 편입니다. 새 편은 구독하면 받아 볼 수 있습니다.' : '가장 최근 편입니다. 새 편은 RSS로 받아 볼 수 있습니다.'));
    var go;
    if (hasBtn) {
      go = doc.createElement('button');
      go.type = 'button'; go.textContent = '구독 버튼으로';
      go.addEventListener('click', function () {
        var t = $(btnSel);
        if (!t) return;
        var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
        t.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
        t.classList.add('salieri-pointed');
        try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
        setTimeout(function () { t.classList.remove('salieri-pointed'); }, 2400);
      });
    } else {
      go = doc.createElement('a');
      go.href = rss.getAttribute('href'); go.textContent = 'RSS 주소';
    }
    go.className = 'series-nav__end-go';
    p.appendChild(go);
    box.appendChild(p);
  }
  function dateLabel(s) {
    var d = ymd(s);
    return d ? d.join('.') : TIME_ONLY.test(s || '') ? '오늘' : '';
  }
  /* Tistory's prev/next are by date, so on "3일차" the next post can be an unrelated diary entry. In a series the two
     links point to the neighbouring episodes instead; a side with no episode keeps Tistory's link. */
  function seriesNavItem(kind, ep) {
    var nav = $('.post .post-nav');
    if (!nav || !ep) return;
    var a = $(kind === 'next' ? '.post-nav__item--next' : '.post-nav__item:not(.post-nav__item--next)', nav);
    if (!a) {
      a = doc.createElement('a');
      a.className = 'post-nav__item' + (kind === 'next' ? ' post-nav__item--next' : '');
      a.innerHTML = '<span class="post-nav__label"></span><strong class="post-nav__title"></strong><time class="post-nav__date"></time>';
      if (kind === 'next') nav.appendChild(a); else nav.insertBefore(a, nav.firstChild);
    }
    a.href = ep.href;
    a.classList.add('post-nav__item--series');
    $('.post-nav__label', a).textContent = (kind === 'next' ? '다음 편' : '이전 편') + (ep.ep ? ' · ' + ep.ep : '');
    var title = $('.post-nav__title', a);
    title.textContent = ep.main;
    title.classList.remove('has-series');
    var date = $('.post-nav__date', a);
    if (date) date.textContent = dateLabel(ep.date);
  }

  /* ---------- Next read: one link to the next step, under the outline in the rail and the phone sheet ----------
     Ranked, the highest known wins: series next (or first unread) episode 4 (renderSeries) > the first post of the
     reader's own topic 3 (initAlso) > Tistory's next post 2 > the first same-category post 1. The rail shows it once
     60% of the post has been read; a post too short for an outline gets a rail with only this link. */
  var nextRead = { set: function () {} };
  function initNextRead(content) {
    var slots = $$('.next-read');
    var rail = $('.toc-rail'), railSlot = rail && $('.next-read', rail);
    if (!slots.length) return;
    var current = null, rank = 0;
    function fill(t, r) {
      r = r || 0;
      if (current && r < rank) return;
      current = t; rank = r;
      slots.forEach(function (slot) {
        slot.textContent = '';
        var a = doc.createElement('a'), label = doc.createElement('span'), title = doc.createElement('span');
        a.className = 'next-read__link'; a.href = t.href;
        label.className = 'next-read__meta'; label.textContent = t.label;
        title.className = 'next-read__title'; title.textContent = t.title;
        a.appendChild(title); a.appendChild(label); // the title leads; "다음 편 · 4일차" follows as quiet meta
        slot.appendChild(a);
        slot.hidden = false;
      });
      if (rail && rail.hidden && !doc.body.classList.contains('toc-off')) {
        rail.hidden = false;
        rail.classList.add('toc-rail--next-only');
        placeRail(rail, content);
      }
    }
    nextRead.set = fill;
    var mainText = function (el) { if (!el) return ''; var m = $('.series-main', el); return (m || el).textContent.trim(); };
    var next = $('.post .post-nav__item--next'), rel = $('.post .related__list a') || $('.post #article-view .another_category th a');
    if (next && next.getAttribute('href')) fill({ href: next.getAttribute('href'), label: '다음 글', title: mainText($('.post-nav__title', next)) }, 2);
    else if (rel) fill({ href: rel.getAttribute('href'), label: '같은 카테고리의 글', title: mainText($('.related__name', rel) || rel) }, 1);
    if (!railSlot) return;
    var ticking = false;
    function reveal() {
      ticking = false;
      if (!current) return;
      var r = content.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      if (total <= 0 || -r.top / total >= 0.6) { railSlot.classList.add('is-ready'); removeEventListener('scroll', onScroll); }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(reveal); } }
    addEventListener('scroll', onScroll, { passive: true });
    reveal();
  }

  /* ---------- Footer lists on a post: no repeats ----------
     The footer's 최근 글 · 인기 글 drop the post being read and any post already linked at the end of it
     (prev/next, series, same-category lists). Runs again once the series list arrives. */
  function dedupeFooter() {
    var foot = $('#tt-body-page .foot-mods');
    if (!foot) return;
    var seen = {};
    seen[pathOf(location.href)] = true;
    $$('.post .post-nav a[href], .post .series-nav a[href], .post .also a[href], .post .related a[href], .post #article-view .another_category th a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h && h.charAt(0) !== '#') seen[pathOf(h)] = true;
    });
    $$('.module__list > li', foot).forEach(function (li) {
      var a = $('a[href]', li), h = a && a.getAttribute('href');
      if (h && h.charAt(0) !== '#' && seen[pathOf(h)]) li.remove();
    });
    $$('.module', foot).forEach(function (m) { var l = $('.module__list', m); if (l && !l.children.length) m.hidden = true; });
  }

  /* ---------- Related by topic: "함께 읽을 글" ----------
     One post can be about more than one thing: a Spring Boot post that wires in Prometheus. The topics are the post's
     own tags (no dictionary), weighed by where they appear: title and section headings x3, code x2 (imports,
     Gradle/Maven lines, config: what the post actually uses), other text x1. A heading that is only the tag
     ("4. 회고") names a section, not a topic, and does not count as one.
     Each topic gets a chip and three posts from its tag page. Posts sharing more of this post's topics come first,
     rarer tags weigh more (1 / log2(2 + posts with the tag)). The chip selected first is the topic of the sections
     this reader actually spent time on: engaged seconds per section (tab visible, input in the last 15s), kept in
     memory only, never stored or sent. Tag pages are read only once the reader is halfway or near the end, at most
     ALSO_MAX_TAGS of them, cached for the session. */
  var ALSO_MAX_TAGS = 3, ALSO_ROWS = 3, TAG_TTL = 30 * 60 * 1000;
  var WORD = /[a-z0-9+#]+/g, ASCII_TAG = /^[a-z0-9+#.\-_\s]+$/i;
  function normTag(t) { return (t || '').toLowerCase().replace(/[\s\-_.·:/]+/g, ''); }
  // ASCII words and runs of two or three of them glued together, so "Spring Boot", "spring-boot" and "springboot"
  // meet, while "java" does not match inside "javascript".
  function wordRuns(text) {
    var w = text.toLowerCase().match(WORD) || [], c = {};
    for (var i = 0; i < w.length; i++) for (var k = 0, s = ''; k < 3 && i + k < w.length; k++) { s += w[i + k]; c[s] = (c[s] || 0) + 1; }
    return c;
  }
  function Region(text) { this.text = text; this.cmp = normTag(text); this.runs = null; }
  Region.prototype.count = function (tag) {
    if (tag.ascii) { if (!this.runs) this.runs = wordRuns(this.text); return this.runs[tag.key] || 0; }
    var n = 0, i = this.cmp.indexOf(tag.key);
    while (i !== -1) { n++; i = this.cmp.indexOf(tag.key, i + tag.key.length); }
    return n;
  };
  /* The post's tags, minus the ones that only repeat its series or category ("최종프로젝트", "LGCNS"). */
  function postTags(exclude) {
    var seen = {}, out = [];
    $$('.post .post__tags a[href]').forEach(function (a) {
      var name = a.textContent.replace(/^#/, '').trim(), ascii = ASCII_TAG.test(name), n = normTag(name);
      var key = ascii ? (name.toLowerCase().match(WORD) || []).join('') : n;
      if (!key || seen[key]) return;
      seen[key] = true;
      for (var i = 0; i < exclude.length; i++) if (exclude[i] && (exclude[i] === n || (n.length >= 3 && exclude[i].indexOf(n) !== -1))) return;
      out.push({ name: name, key: key, ascii: ascii, href: a.getAttribute('href') });
    });
    return out;
  }
  /* Weighted mentions of each tag per section (section 0 = before the first heading), and over the whole post. */
  function weighTags(content, heads, tags) {
    var secs = [], i, node, idx = 0, lastH = null;
    for (i = 0; i <= heads.length; i++) secs.push({ heads: [], code: '', body: '' });
    var SKIP = '.another_category, .container_postbtn, .revenue_unit_wrap, .code-bar, .code-more, script, style, noscript';
    var walker = doc.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
    while ((node = walker.nextNode())) {
      var el = node.parentNode, h;
      if (!el || !node.nodeValue.trim() || el.closest(SKIP)) continue;
      while (idx < heads.length && (heads[idx].compareDocumentPosition(node) & 4)) idx++; // 4: node follows heads[idx]
      var s = secs[idx];
      if (el.closest('pre')) s.code += node.nodeValue + '\n';
      else if ((h = el.closest('h2, h3, h4'))) { if (h !== lastH) { s.heads.push(''); lastH = h; } s.heads[s.heads.length - 1] += node.nodeValue; }
      else s.body += node.nodeValue + ' ';
    }
    secs.forEach(function (s) {
      s.code = new Region(s.code); s.body = new Region(s.body);
      s.heads = s.heads.map(function (t) { return { r: new Region(t), bare: normTag(t.replace(/^[\s\d.\-)·]+/, '')) }; });
    });
    var titleEl = $('.post .post__title'), title = new Region(titleEl ? titleEl.textContent : '');
    tags.forEach(function (tag) {
      var n = normTag(tag.name);
      tag.m = []; tag.sal = 3 * title.count(tag);
      secs.forEach(function (s, k) {
        var v = 2 * s.code.count(tag) + s.body.count(tag);
        s.heads.forEach(function (hd) { if (hd.bare !== n) v += 3 * hd.r.count(tag); });
        tag.m[k] = v; tag.sal += v;
      });
    });
    return tags;
  }
  function tagRows(tag) {
    var key = 'salieri-tag:' + tag.name, cached = null;
    try { cached = JSON.parse(session.get(key) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < TAG_TTL) return Promise.resolve(cached);
    // __SKIN_TAG__: set only by the local preview harness
    var url = window.__SKIN_TAG__ ? window.__SKIN_TAG__(tag.name) : tag.href;
    if (!url) return Promise.reject(new Error('no tag page'));
    return readList(url).then(function (res) {
      var v = { t: Date.now(), rows: res.rows, count: res.count };
      session.set(key, JSON.stringify(v));
      return v;
    });
  }
  function initAlso(content, heads) {
    var box = $('.post .also'), post = $('.post');
    if (!box || !window.fetch || !window.DOMParser || !window.Promise) return;
    var tablist = $('.also__topics', box), panelEl = $('.also__panel', box), list = $('.also__list', box), all = $('.also__all', box);
    var sEl = $('.post .post__title .series'), me = sEl ? seriesOf(sEl.textContent) : null;
    var exclude = $$('.post .crumbs a').map(function (a) { return normTag(a.textContent); }).concat(me ? [normTag(me.key)] : []);
    var topics = weighTags(content, heads, postTags(exclude))
      .filter(function (t) { return t.sal >= 1; })
      .sort(function (a, b) { return (b.sal - a.sal) || (b.name.length - a.name.length); })
      .slice(0, ALSO_MAX_TAGS);
    if (!topics.length) return;

    // Engaged seconds per section: counted only while the tab is visible and the reader did something recently.
    var dwell = [], lastInput = Date.now(), EVENTS = ['scroll', 'wheel', 'keydown', 'pointerdown', 'pointermove', 'touchstart'], k;
    for (k = 0; k <= heads.length; k++) dwell.push(0);
    var bump = function () { lastInput = Date.now(); };
    EVENTS.forEach(function (ev) { addEventListener(ev, bump, { passive: true }); });
    var tick = setInterval(function () {
      if (doc.visibilityState === 'hidden' || Date.now() - lastInput > 15000) return;
      var s = 0;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top < innerHeight * 0.3) s = i + 1; else break; }
      dwell[s]++;
    }, 1000);
    function stopTick() { clearInterval(tick); EVENTS.forEach(function (ev) { removeEventListener(ev, bump, { passive: true }); }); }
    // Topic order: the first chip is the topic of the reader's sections (each section's seconds shared among the topics
    // it mentions); the others follow the post's own weighting, which also decides alone while the reader has spent
    // under five seconds on sections that mention any topic.
    function ordered(pool) {
      var total = 0;
      pool.forEach(function (tp) {
        var r = 0;
        for (var s = 0; s < dwell.length; s++) {
          if (!dwell[s]) continue;
          var sum = 0;
          pool.forEach(function (t) { sum += t.m[s]; });
          if (sum) r += dwell[s] * tp.m[s] / sum;
        }
        tp.reader = r; total += r;
      });
      var bySal = pool.slice().sort(function (a, b) { return b.sal - a.sal; });
      if (total < 5) return bySal;
      var top = bySal.reduce(function (best, tp) { return tp.reader > best.reader ? tp : best; }, bySal[0]);
      return [top].concat(bySal.filter(function (tp) { return tp !== top; }));
    }

    var cands = null, shown = [], locked = false;
    var dateKey = function (c) { var d = ymd(c.row.date); return d ? d.join('') : TIME_ONLY.test(c.row.date) ? todayYmd().join('') : ''; };
    var byScore = function (a, b) { return (b.score - a.score) || (dateKey(a) < dateKey(b) ? 1 : dateKey(a) > dateKey(b) ? -1 : 0); };
    function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
    function panel(tp) {
      list.textContent = '';
      tp.rows.forEach(function (c) {
        var li = el('li', 'also__item'), a = el('a', 'also__link'), main = el('span', 'also__main'), name = el('strong', 'also__name');
        var parts = splitTitle(c.row.title);
        a.href = c.row.href;
        if (parts) { name.className += ' has-series'; name.appendChild(el('span', 'series', parts.label)); name.appendChild(el('span', 'series-main', parts.main)); }
        else name.textContent = c.row.title;
        main.appendChild(name);
        // Why this post: the shared topics, the selected one first
        var why = [tp].concat(c.topics.filter(function (t) { return t !== tp && shown.indexOf(t) !== -1; }).sort(function (x, y) { return y.w - x.w; }));
        main.appendChild(el('span', 'also__why', '같은 태그 · ' + why.slice(0, 3).map(function (t) { return t.name; }).join(' · ')));
        if (c.row.sum) main.appendChild(el('span', 'also__sum', c.row.sum));
        a.appendChild(main);
        if (c.row.thumb) {
          var img = el('img', 'also__thumb');
          img.src = c.row.thumb; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
          a.appendChild(img);
        }
        li.appendChild(a); list.appendChild(li);
      });
      all.href = tp.href || '#';
      all.textContent = '#' + tp.name + ' 글' + (tp.res.count ? ' ' + tp.res.count + '편' : '') + ' 모두 보기';
    }
    function select(i, focus) {
      var tabs = $$('.also__topic', tablist);
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      if (tabs[i]) { panelEl.setAttribute('aria-labelledby', tabs[i].id); if (focus) tabs[i].focus(); }
      panel(shown[i]);
    }
    tablist.addEventListener('keydown', function (e) {
      var tabs = $$('.also__topic', tablist), i = tabs.indexOf(doc.activeElement), n = tabs.length;
      if (i < 0) return;
      var j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (j < 0) return;
      e.preventDefault();
      select(j, true);
    });
    function render() {
      var skip = {}, mine = me ? me.key.toLowerCase() : null, pool = [], p;
      skip[pathOf(location.href)] = true;
      $$('.post .post-nav a[href], .post .series-nav a[href], .post #article-view .another_category th a[href]').forEach(function (a) { skip[pathOf(a.getAttribute('href'))] = true; });
      for (p in cands) {
        var c = cands[p], parts = splitTitle(c.row.title);
        if (skip[p] || (mine && parts && seriesOf(parts.label).key.toLowerCase() === mine)) continue; // the series list has those
        c.score = 0;
        c.topics.forEach(function (t) { c.score += t.w; });
        pool.push(c);
      }
      if (pool.length < 2) { box.hidden = true; if (post) post.classList.remove('has-also'); return; }
      var live = topics.filter(function (tp) { return tp.res && pool.some(function (c) { return c.topics.indexOf(tp) !== -1; }); });
      shown = ordered(live);
      shown.forEach(function (tp) { tp.rows = pool.filter(function (c) { return c.topics.indexOf(tp) !== -1; }).sort(byScore).slice(0, ALSO_ROWS); });
      tablist.textContent = '';
      if (shown.length > 1) {
        shown.forEach(function (tp, i) {
          var b = el('button', 'also__topic', tp.name);
          b.type = 'button'; b.id = 'also-tab-' + i;
          b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'also-panel');
          if (tp.res.count) { b.appendChild(el('span', 'also__count', String(tp.res.count))); b.setAttribute('aria-label', tp.name + ', 글 ' + tp.res.count + '편'); }
          b.addEventListener('click', function () { select(i, false); });
          tablist.appendChild(b);
        });
        tablist.hidden = false; panelEl.setAttribute('role', 'tabpanel');
      } else {
        tablist.hidden = true; panelEl.removeAttribute('role'); panelEl.removeAttribute('aria-labelledby');
      }
      select(0, false);
      box.hidden = false;
      if (post) post.classList.add('has-also'); // the category grid steps aside: one list of next posts, not two
      var first = shown[0].rows[0], fp = splitTitle(first.row.title);
      nextRead.set({ href: first.row.href, label: '같은 주제 · ' + shown[0].name, title: fp ? fp.main : first.row.title }, 3);
      dedupeFooter();
    }
    // The block changes the page only off screen: below the fold, or above it where scroll anchoring holds the view.
    function offScreen() {
      var prev = box.previousElementSibling;
      while (prev && !prev.getClientRects().length) prev = prev.previousElementSibling;
      var y = prev ? prev.getBoundingClientRect().bottom : box.getBoundingClientRect().top;
      if (y > innerHeight) return 'below';
      return y < 0 && window.CSS && CSS.supports && CSS.supports('overflow-anchor', 'auto') ? 'above' : '';
    }
    // Once the block is about to come into view the order is settled with the reader's latest sections, then kept.
    function lock() {
      if (locked) return;
      locked = true;
      stopTick();
      var before = shown[0];
      if (box.getBoundingClientRect().top > innerHeight && ordered(shown)[0] !== before) render();
    }
    function show() {
      var where = offScreen();
      if (!where) return false;
      render();
      if (box.hidden) { stopTick(); return true; }
      if (where === 'below' && window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) {
          for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { io.disconnect(); lock(); return; }
        }, { rootMargin: '0px 0px 50% 0px' });
        io.observe(box);
      } else lock();
      return true;
    }
    function build() {
      cands = {};
      topics.forEach(function (tp) {
        if (!tp.res || !tp.res.rows.length) return;
        tp.w = 1 / (Math.log(2 + Math.max(tp.res.count || 0, tp.res.rows.length)) / Math.LN2);
        tp.res.rows.forEach(function (r) {
          var p = pathOf(r.href), c = cands[p] || (cands[p] = { row: r, topics: [] });
          if (c.topics.indexOf(tp) === -1) c.topics.push(tp);
        });
      });
      if (show()) return;
      // In view right now (a short post, or a jump to the comments): wait until it can appear without moving the page.
      var waiting = false;
      var retry = function () {
        if (waiting) return;
        waiting = true;
        requestAnimationFrame(function () { waiting = false; if (show()) removeEventListener('scroll', retry); });
      };
      addEventListener('scroll', retry, { passive: true });
    }
    var started = false;
    function start() {
      if (started) return;
      started = true;
      Promise.all(topics.map(function (tp) {
        return tagRows(tp).then(function (res) { tp.res = res; }, function () { tp.res = null; });
      })).then(build);
    }
    // Read the tag pages only for readers who are going on: halfway through, or near the tags.
    var near = $('.post .post__tags') || $('.post .post-nav');
    if (window.IntersectionObserver && near) {
      var io = new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { io.disconnect(); start(); return; }
      }, { rootMargin: '0px 0px 150% 0px' });
      io.observe(near);
    } else start();
    var halfTicking = false;
    var half = function () {
      if (halfTicking) return;
      halfTicking = true;
      requestAnimationFrame(function () {
        halfTicking = false;
        var r = content.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
        if (total <= 0 || -r.top / total >= 0.5) { removeEventListener('scroll', half); start(); }
      });
    };
    addEventListener('scroll', half, { passive: true });
  }

  /* ---------- Author: one card with Tistory's namecard ----------
     [##_comment_group_##] renders Tistory's namecard (blog name, description, 구독하기) right before the comments.
     Once it shows up, the skin's own card steps aside and only its link row (GitHub, 포트폴리오 ...) moves under the
     namecard. Tistory's elements are never hidden or moved; without a namecard the skin's card stays as it is. */
  function initAuthorMerge() {
    var card = $('.post .author'), host = $('.post .comments [data-tistory-react-app="Namecard"]');
    var links = card && $('.author__links', card);
    if (!links || !host) return;
    function merge() {
      if (!$('.tt_box_namecard', host)) return false;
      links.classList.add('author__links--merged');
      host.parentNode.insertBefore(links, host.nextSibling);
      card.hidden = true;
      return true;
    }
    if (merge() || !window.MutationObserver) return;
    var mo = new MutationObserver(function () { if (merge()) mo.disconnect(); });
    mo.observe(host, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 8000);
  }

  /* ---------- Search results: the searched words are marked in titles and summaries ---------- */
  function initSearchMark() {
    if (doc.body.id !== 'tt-body-search') return;
    var input = $('#search input'), q = input ? input.value : '';
    if (!q) { var m = location.pathname.match(/\/search\/([^/]+)/); if (m) { try { q = decodeURIComponent(m[1]); } catch (e) {} } }
    var terms = (q || '').split(/\s+/).filter(Boolean).map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!terms.length) return;
    var re = new RegExp('(' + terms.join('|') + ')', 'i');
    $$('.list .idx__title, .list .idx__sum').forEach(function (el) {
      var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var parts = node.nodeValue.split(re);
        if (parts.length < 2) return;
        var frag = doc.createDocumentFragment();
        parts.forEach(function (p, i) {
          if (!p) return;
          if (i % 2) { var mk = doc.createElement('mark'); mk.className = 'hit'; mk.textContent = p; frag.appendChild(mk); }
          else frag.appendChild(doc.createTextNode(p));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  function init() {
    initTheme();
    initHeader();
    initToolbarGap();
    initHero();
    prepTistoryBlocks();
    initSeries();
    initCounts();
    initCurrent();
    initSubnav();
    initCrumbs();
    initBreadcrumbLd();
    initCatLabels();
    initListHead();
    initSearchMark();
    initPaging();
    initIndex();
    initVisitMarks();
    var content = $('.post #article-view');
    if (content) {
      initMarkdown(content); initCode(content); initTables(content); initReadTime(content);
      var heads = tocHeads(content);
      // initAlso reads the headings before the "#" section links are appended to them
      initToc(content, heads); initResume(content, heads); initAlso(content, heads); initHeadingLinks(heads); initProgress(content);
      initNextRead(content); dedupeFooter();
      initSeriesNav(); initAuthorMerge();
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
