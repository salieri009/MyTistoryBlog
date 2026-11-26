// `npm run dev`: render the skin with sample data, serve dev/out, re-render and live-reload on change.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dev', 'out');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
// Live reload by short polling: no long-lived connection, so headless tools (impeccable detect) still reach network idle.
const RELOAD = `<script>(function(){var v;setInterval(function(){fetch('/__version',{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){if(v&&t!==v)location.reload();v=t}).catch(function(){})},2000)})()</script>`;
let version = String(Date.now());

function build() {
  const r = spawnSync(process.execPath, [join(ROOT, 'dev', 'render.mjs')], { cwd: ROOT, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) process.stderr.write(r.stderr || '');
  version = String(Date.now());
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/__version') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }).end(version);
    return;
  }
  const PROPOSALS = join(ROOT, 'dev', 'proposals');
  const base = url.startsWith('/proposals') ? PROPOSALS : OUT;
  const rel = url.startsWith('/proposals') ? url.slice('/proposals'.length) || '/' : url;
  let file = normalize(join(base, rel === '/' ? 'index.html' : rel));
  if (!file.startsWith(base)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    let body = await readFile(file);
    const type = TYPES[extname(file)] || 'application/octet-stream';
    if (type.startsWith('text/html')) body = body.toString().replace('</body>', `${RELOAD}</body>`);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found');
  }
}).listen(PORT, () => {
  build();
  console.log(`\n  Salieri Index preview → http://localhost:${PORT}/\n  pages: home, home-dark, home-nocover, post, post-latest, post-notag, post-partial, post-dark, category, category-summary, search, protected, tags, guestbook · proposals: /proposals/\n`);
});

let timer;
const rebuild = (_, name) => { if (name && /out[\\/]/.test(name)) return; clearTimeout(timer); timer = setTimeout(build, 120); };
for (const f of ['skin.html', 'style.css', 'index.xml']) watch(join(ROOT, f), rebuild);
watch(join(ROOT, 'images'), rebuild);
watch(join(ROOT, 'dev', 'sample.mjs'), () => { console.log('sample.mjs changed: restart `npm run dev` to reload sample data'); });
