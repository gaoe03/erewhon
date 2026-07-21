// Phase 4b: add a genuinely-new ingredient to the canon in ingredients.js, so the
// site and later runs resolve it. New entries go at the END of the canon (lowest
// match priority, cannot shadow existing rules) with the 'jar' fallback icon, marked
// auto-added. You review the icon and category in the PR, then merge. All string
// values are JSON-serialized so a stray quote or newline cannot break the file.
import { readFileSync, writeFileSync } from 'node:fs';

const SENTINEL = '// AUTO-CANON: the pipeline appends new ingredients below this line (jar icon, review it)';
const CATS = new Set(['fruit', 'veg', 'liquid', 'brew', 'sweet', 'fat', 'super', 'supplement', 'topping', 'branded']);
const BANDS = new Set(['everyday', 'functional', 'treats']);
const STOP = /^(organic|vegan|raw|erewhon|grass|fed|grassfed|the|and|with|of|a|farms?|brand)$/;

const slugify = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// A lowercase, no-flags regex source (matching the file's style). The keyword must
// actually appear in the raw string; otherwise fall back to the name's last real word.
function safePattern(keyword, name, raw) {
  const low = norm(raw);
  let kw = norm(keyword);
  if (!kw || !low.includes(kw)) {
    const words = norm(name).split(' ').filter((w) => w.length > 2 && !STOP.test(w));
    kw = words[words.length - 1] || '';
  }
  if (!kw || kw.length < 3) return null;
  try { new RegExp(kw); } catch { return null; }
  return kw;
}

export function addCanonEntry(repoRoot, { name, cat, band, keyword, blurb, raw }) {
  const path = `${repoRoot}/ingredients.js`;
  const src = readFileSync(path, 'utf8');
  const id = slugify(name);
  if (!id) return { status: 'skip', reason: 'no id' };
  if (new RegExp(`\\bid:\\s*'${id}'`).test(src)) return { status: 'skip', reason: 'exists', id };
  if (!src.includes(SENTINEL)) return { status: 'skip', reason: 'no sentinel', id };
  const pat = safePattern(keyword, name, raw);
  if (!pat) return { status: 'skip', reason: 'no safe pattern', id };
  const c = CATS.has(cat) ? cat : 'super';
  const b = BANDS.has(band) ? band : 'everyday';
  const text = blurb && String(blurb).length > 8 ? String(blurb) : 'Auto-added from the tonic bar. Review this entry.';
  const entry = `    { id: '${id}', name: ${JSON.stringify(name)}, cat: '${c}', band: '${b}', icon: 'jar', re: /${pat}/,\n`
    + `      blurb: ${JSON.stringify(text)} }, // auto-added\n`;
  writeFileSync(path, src.replace(SENTINEL, `${SENTINEL}\n${entry}`));
  return { status: 'added', id, pattern: pat };
}
