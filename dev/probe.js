// Contrast probe: appended to a rendered page, it lists text below 4.5:1 against its effective background.
window.addEventListener('load', function () { setTimeout(function () {
  function rgb(s) { var m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; }
  function lum(c) { c = c.slice(0, 3).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function bg(el) { while (el) { var c = rgb(getComputedStyle(el).backgroundColor); if (c.length < 4 || c[3] > .5) return { c: c, el: el }; el = el.parentElement; } return { c: [255, 255, 255], el: null }; }
  var out = [];
  document.querySelectorAll('body *').forEach(function (el) {
    var hasText = [].some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (!hasText) return;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || (el.offsetParent === null && cs.position !== 'fixed')) return;
    var b = bg(el), L1 = lum(rgb(cs.color)), L2 = lum(b.c), r = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    var large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    if (r < (large ? 3 : 4.5)) out.push(r.toFixed(2) + ' | ' + el.tagName + '.' + el.className + ' | ' + cs.color + ' on ' + b.c.join(',') + ' | ' + el.textContent.trim().slice(0, 30));
  });
  var p = document.createElement('pre'); p.id = 'probe-out'; p.textContent = out.join('\n') || 'clean'; document.body.appendChild(p);
}, 1500); });
