// `npm run package`: zip only what Tistory's "스킨 등록" accepts → dist/ijeongpyo-skin.zip
// Minimal ZIP writer (deflate) on node:zlib, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { deflateRawSync, crc32 } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['skin.html', 'style.css', 'index.xml', 'preview.jpg', 'preview256.jpg', 'preview560.jpg', 'preview1600.jpg']
  .filter((f) => existsSync(join(ROOT, f)))
  .concat(readdirSync(join(ROOT, 'images')).map((f) => `images/${f}`));

const locals = [], centrals = [];
let offset = 0;
for (const name of files) {
  const data = readFileSync(join(ROOT, name));
  const comp = deflateRawSync(data, { level: 9 });
  const nameBuf = Buffer.from(name, 'utf8');
  const crc = crc32(data) >>> 0;
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
  local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10); central.writeUInt32LE(0, 12); central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20);
  central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBuf.length, 28); central.writeUInt32LE(offset, 42);
  locals.push(local, nameBuf, comp);
  centrals.push(central, nameBuf);
  offset += 30 + nameBuf.length + comp.length;
}
const cd = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);

mkdirSync(join(ROOT, 'dist'), { recursive: true });
const out = join(ROOT, 'dist', 'ijeongpyo-skin.zip');
writeFileSync(out, Buffer.concat([...locals, cd, end]));
console.log(`packaged ${files.length} files → dist/ijeongpyo-skin.zip\n  ${files.join('\n  ')}`);
