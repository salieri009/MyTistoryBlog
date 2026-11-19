// `npm run package`: zip only what Tistory's "스킨 등록" accepts → dist/salieri-index-skin.zip
// Minimal ZIP writer (deflate) on node:zlib, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { deflateRawSync, crc32 } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.xml', 'skin.html', 'style.css', 'preview.jpg', 'preview256.jpg', 'preview560.jpg', 'preview1600.jpg']
  .filter((f) => existsSync(join(ROOT, f)))
  .concat(['images/'], readdirSync(join(ROOT, 'images')).map((f) => `images/${f}`));

// DOS timestamp (some unzippers reject the all-zero 1980-00-00 date)
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

const locals = [], centrals = [];
let offset = 0;
for (const name of files) {
  const isDir = name.endsWith('/');
  const data = isDir ? Buffer.alloc(0) : readFileSync(join(ROOT, name));
  const method = isDir ? 0 : 8;
  const comp = isDir ? data : deflateRawSync(data, { level: 9 });
  const nameBuf = Buffer.from(name, 'utf8');
  const crc = crc32(data) >>> 0;
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(method, 8);
  local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12);
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(method, 10); central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14);
  central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20);
  central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(isDir ? 0x10 : 0x20, 38); central.writeUInt32LE(offset, 42);
  locals.push(local, nameBuf, comp);
  centrals.push(central, nameBuf);
  offset += 30 + nameBuf.length + comp.length;
}
const cd = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);

mkdirSync(join(ROOT, 'dist'), { recursive: true });
const out = join(ROOT, 'dist', 'salieri-index-skin.zip');
writeFileSync(out, Buffer.concat([...locals, cd, end]));
console.log(`packaged ${files.length} files → dist/salieri-index-skin.zip\n  ${files.join('\n  ')}`);
