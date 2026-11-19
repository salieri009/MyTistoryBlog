// Static checks on the skin before packaging.
// - every <s_*> block opened in skin.html is closed (Tistory silently breaks otherwise)
// - every Tistory feature block the stock skin used is still present (tag checklist from legacy/skin.html)
// - index.xml declares every [##_var_*_##] used, and every declared cover name has a <s_cover name>
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const skin = readFileSync(join(ROOT, 'skin.html'), 'utf8');
const legacy = readFileSync(join(ROOT, 'legacy', 'skin.html'), 'utf8');
const xml = readFileSync(join(ROOT, 'index.xml'), 'utf8');
const errors = [];

const count = (re, s) => (s.match(re) || []).length;
const blocks = new Set([...skin.matchAll(/<s_([a-zA-Z0-9_]+)/g)].map((m) => m[1]));
for (const b of blocks) {
  const opens = count(new RegExp(`<s_${b}(?=[\\s>])`, 'g'), skin);
  const closes = count(new RegExp(`</s_${b}>`, 'g'), skin);
  if (opens !== closes) errors.push(`<s_${b}> opened ${opens}× but closed ${closes}×`);
}

const legacyBlocks = new Set([...legacy.matchAll(/<s_([a-zA-Z0-9_]+)/g)].map((m) => m[1]).filter((b) => !b.startsWith('if_var_') && !b.startsWith('not_var_')));
for (const b of legacyBlocks) if (!blocks.has(b)) errors.push(`stock skin feature <s_${b}> is missing`);

const usedVars = new Set([...skin.matchAll(/\[##_var_([a-zA-Z0-9_]+)_##\]|<s_(?:if|not)_var_([a-zA-Z0-9_]+)/g)].map((m) => m[1] || m[2]));
const declared = new Set([...xml.matchAll(/<variable>\s*<name>([^<]+)<\/name>/g)].map((m) => m[1].trim()));
for (const v of usedVars) if (!declared.has(v)) errors.push(`skin uses var "${v}" but index.xml does not declare it`);

const coverNames = [...xml.matchAll(/<cover>[\s\S]*?<\/cover>/g)].pop()?.[0].match(/<name>([^<]+)<\/name>/g)?.map((n) => n.replace(/<\/?name>/g, '')) || [];
for (const c of coverNames) if (!new RegExp(`<s_cover name=['"]${c}['"]`).test(skin)) errors.push(`index.xml cover "${c}" has no <s_cover name='${c}'>`);

if (!/<s_t3>[\s\S]*<\/s_t3>/.test(skin)) errors.push('<s_t3> wrapper missing (Tistory common scripts)');

// style.css: braces must balance and never go negative (a stray "}" silently kills the next rule)
const css = readFileSync(join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""');
let depth = 0, line = 1;
for (const ch of css) {
  if (ch === '\n') line++;
  if (ch === '{') depth++;
  if (ch === '}' && --depth < 0) { errors.push(`style.css: stray "}" near line ${line}`); depth = 0; }
}
if (depth !== 0) errors.push(`style.css: ${depth} unclosed "{"`);
if (!/^<\?xml[^>]*\?>\s*<skin>[\s\S]*<\/skin>\s*$/.test(xml)) errors.push('index.xml is not a single <skin> document');

if (errors.length) { console.error('skin check failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`skin check passed: ${blocks.size} block types, ${usedVars.size} options, ${coverNames.length} covers, stock-skin features covered`);
