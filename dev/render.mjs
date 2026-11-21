// Local preview harness for the Tistory skin. No dependencies.
// Renders skin.html with sample data (dev/sample.mjs) into dev/out/<page>.html,
// emulating Tistory template tags: [##_name_##], [##_var_name_##], <s_name>…</s_name>,
// <s_if_var_x>/<s_not_var_x>, and <s_cover name='x'>.
//
//   node dev/render.mjs          → render every page
//   node dev/render.mjs --check  → also fail on unknown tags left in the output
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, pages, injectedHead, injectedBody } from './sample.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dev', 'out');
const skin = readFileSync(join(ROOT, 'skin.html'), 'utf8');
const missing = new Set();

function findClose(tpl, name, from) {
  const re = new RegExp(`<s_${name}(?=[\\s>])[^>]*>|</s_${name}>`, 'g');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(tpl))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return { start: m.index, end: m.index + m[0].length };
  }
  throw new Error(`unclosed <s_${name}>`);
}

function render(tpl, ctx) {
  let out = '', i = 0;
  const open = /<s_([a-zA-Z0-9_]+)([^>]*)>/g;
  let m;
  while ((m = open.exec(tpl))) {
    const [tag, name, attrs] = m;
    const close = findClose(tpl, name, m.index + tag.length);
    out += values(tpl.slice(i, m.index), ctx);
    out += block(name, attrs, tpl.slice(m.index + tag.length, close.start), ctx);
    i = close.end;
    open.lastIndex = close.end;
  }
  return out + values(tpl.slice(i), ctx);
}

function block(name, attrs, inner, ctx) {
  if (name === 't3') return render(inner, ctx);
  if (name.startsWith('if_var_')) return ctx.vars[name.slice(7)] ? render(inner, ctx) : '';
  if (name.startsWith('not_var_')) return ctx.vars[name.slice(8)] ? '' : render(inner, ctx);
  if (name === 'cover') {
    const want = /name=['"]([^'"]+)['"]/.exec(attrs)?.[1];
    return ctx.__cover === want ? render(inner, ctx) : '';
  }
  const v = ctx[name];
  if (Array.isArray(v)) return v.map((item) => render(inner, { ...ctx, ...item })).join('');
  if (v && typeof v === 'object') return render(inner, { ...ctx, ...v });
  return v ? render(inner, ctx) : '';
}

function values(text, ctx) {
  return text
    .replace(/\[##_var_([a-zA-Z0-9_]+)_##\]/g, (_, k) => ctx.vars[k] ?? '')
    .replace(/\[##_([a-zA-Z0-9_]+)_##\]/g, (_, k) => {
      if (ctx[k] === undefined) { missing.add(k); return ''; }
      return String(ctx[k]);
    });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'images'), { recursive: true });
copyFileSync(join(ROOT, 'style.css'), join(OUT, 'style.css'));
for (const f of readdirSync(join(ROOT, 'images'))) copyFileSync(join(ROOT, 'images', f), join(OUT, 'images', f));

const index = [];
for (const [file, page] of Object.entries(pages)) {
  const ctx = { ...site, ...page, vars: { ...site.vars, ...(page.vars || {}) } };
  let html = render(skin, ctx);
  // page.path stands in for location.pathname (e.g. a category URL) so path-aware UI can be previewed
  const pathHook = page.path ? `\n<script>window.__SKIN_PATH__ = ${JSON.stringify(page.path)};</script>` : '';
  // The blog's /search/<words> page is stood in for by the rendered search-mock page (needs `npm run dev`, not file://)
  const searchHook = `\n<script>window.__SKIN_SEARCH__ = '/search-mock.html?q=';</script>`;
  html = html.replace('<head>', `<head>\n${injectedHead}${pathHook}${searchHook}`).replace('</body>', `${injectedBody}\n</body>`);
  // Sample images are data: URIs; Tistory's thumbnail resizer can't fetch those, so unwrap them locally.
  html = html.replace(/\/\/i1\.daumcdn\.net\/thumb\/[^"?]+\/\?fname=(data:)/g, '$1');
  writeFileSync(join(OUT, `${file}.html`), html);
  index.push(`<li><a href="${file}.html">${file}</a> — ${page.body_id}</li>`);
}
writeFileSync(join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>skin preview</title><ul>${index.join('')}</ul>`);

const leftovers = [];
for (const file of Object.keys(pages)) {
  const html = readFileSync(join(OUT, `${file}.html`), 'utf8');
  const hits = html.match(/\[##_[a-zA-Z0-9_]+_##\]|<\/?s_[a-zA-Z0-9_]+/g);
  if (hits) leftovers.push(`${file}: ${[...new Set(hits)].join(' ')}`);
}
console.log(`rendered ${Object.keys(pages).length} pages → dev/out/`);
if (missing.size) console.log(`tags without sample data (rendered empty): ${[...missing].sort().join(', ')}`);
if (leftovers.length) { console.log('UNRENDERED TAGS:\n' + leftovers.join('\n')); process.exitCode = 1; }
else console.log('no unrendered template tags');
