// The whole pipeline, in order. Dry run by default (writes nothing), or --apply.
//   node scripts/run.mjs            plan only
//   node scripts/run.mjs --apply    write smoothies.json, images, regenerate data.js
import { readFileSync, writeFileSync } from 'node:fs';
import { fetchLiveSmoothies, hitToCandidate } from './fetch-live.mjs';
import { classify } from './dedupe.mjs';
import { checkGuards } from './guards.mjs';
import { applyClassifications } from './append.mjs';
import { fetchIngredients } from './fetch-ingredients.mjs';
import { loadArchiveIngredients } from './enrich.mjs';
import { buildData } from './build-data.mjs';
import { healthCheck } from './health.mjs';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const apply = process.argv.includes('--apply');

const hits = await fetchLiveSmoothies();
const candidates = hits.map(hitToCandidate);
const archive = JSON.parse(readFileSync(`${REPO}/data/smoothies.json`, 'utf8'));
const classifications = candidates.map((c) => classify(c, archive));

const guard = checkGuards(candidates, classifications);
if (!guard.ok) { console.error('GUARDS FAILED, aborting:', guard.errors.join('; ')); process.exit(1); }

// Only touch the archive when there is something worth a human's review. This keeps
// quiet runs a true no-op, so the workflow opens no pull request when nothing is new.
const reviewable = classifications.filter((c) => ['new', 'relaunch', 'rename'].includes(c.action)).length;
if (reviewable === 0) { console.log(`live ${candidates.length}, nothing new. No changes.`); process.exit(0); }

const { summary, added, addedEntries } = await applyClassifications(archive, candidates, classifications, { imgDir: `${REPO}/img`, apply });
console.log(`live ${candidates.length} | ${JSON.stringify(summary)} | ${apply ? 'APPLIED' : 'dry run'}`);
if (added.length) console.log('new/relaunch:', added.join(', '));

if (apply) {
  // fetch each new drink's ingredients from its product page, match to the canon (regex only, no API cost)
  const { matchCanon } = loadArchiveIngredients();
  for (const e of addedEntries) {
    const raw = await fetchIngredients(e.productId, e.id);
    if (raw && raw.length) {
      const misses = raw.filter((r) => !matchCanon(r));
      e.ingredients = raw;
      e.ingredientsComplete = misses.length === 0;
      e.needsReview = misses.length > 0;
      console.log(`  ${e.id}: ${raw.length} ingredients, ${misses.length ? 'new to canon: ' + misses.join(', ') : 'all matched'}`);
    } else {
      console.log(`  ${e.id}: ingredients not fetched, left for review`);
    }
  }
  writeFileSync(`${REPO}/data/smoothies.json`, JSON.stringify(archive, null, 2) + '\n');
  console.log('regenerated data.js from', buildData(), 'smoothies');
  const h = healthCheck(REPO);
  console.log(`health: ${h.ok ? 'OK' : 'FAIL'} | ${h.count} smoothies | errors: ${h.errors.join('; ') || 'none'} | ingredient warnings: ${h.warns.length}`);
  if (!h.ok) process.exit(1);
}
