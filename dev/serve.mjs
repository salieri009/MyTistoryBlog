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
const RELOAD = `<script>new EventSource('/__reload').onmessage=()=>location.reload()</script>`;
const clients = new Set();

function build() {
  const r = spawnSync(process.execPath, [join(ROOT, 'dev', 'render.mjs')], { cwd: ROOT, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) process.stderr.write(r.stderr || '');
  for (const res of clients) res.write('data: reload\n\n');
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n'); clients.add(res); req.on('close', () => clients.delete(res));
    return;
  }
  let file = normalize(join(OUT, url === '/' ? 'index.html' : url));
  if (!file.startsWith(OUT)) { res.writeHead(403).end(); return; }
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
  console.log(`\n  이정표 skin preview → http://localhost:${PORT}/\n  pages: home, post, post-dark, post-blue, category, search, protected, tags, guestbook\n`);
});

let timer;
const rebuild = (_, name) => { if (name && /out[\\/]/.test(name)) return; clearTimeout(timer); timer = setTimeout(build, 120); };
for (const f of ['skin.html', 'style.css', 'index.xml']) watch(join(ROOT, f), rebuild);
watch(join(ROOT, 'images'), rebuild);
watch(join(ROOT, 'dev', 'sample.mjs'), () => { console.log('sample.mjs changed: restart `npm run dev` to reload sample data'); });
