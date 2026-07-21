// The whole pipeline, in order. Dry run by default (writes nothing), or --apply.
//   node scripts/run.mjs            plan only
//   node scripts/run.mjs --apply    write smoothies.json, images, regenerate data.js
import { readFileSync, writeFileSync } from 'node:fs';
import { fetchLiveSmoothies, hitToCandidate } from './fetch-live.mjs';
import { classify, findDiscontinued } from './dedupe.mjs';
import { checkGuards } from './guards.mjs';
import { applyClassifications } from './append.mjs';
import { fetchIngredients } from './fetch-ingredients.mjs';
import { loadArchiveIngredients, normalizeIngredients, makeAgent } from './enrich.mjs';
import { addCanonEntry } from './add-canon.mjs';
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

// Archived drinks no longer on the live menu become discontinued. The guard above
// already aborted a suspicious fetch, so this only runs on a full, sane menu. Last
// safety net: never discontinue more than half the archive in a single run.
const gone = findDiscontinued(archive, candidates);
const active = archive.filter((s) => s.status !== 'discontinued').length;
if (gone.length > active * 0.5) { console.error(`ABORT: ${gone.length} of ${active} live drinks would be discontinued, too many.`); process.exit(1); }

// Only touch the archive when there is something worth a human's review. This keeps
// quiet runs a true no-op, so the workflow opens no pull request when nothing changed.
const reviewable = classifications.filter((c) => ['new', 'relaunch', 'rename'].includes(c.action)).length + gone.length;
if (reviewable === 0) { console.log(`live ${candidates.length}, nothing new or gone. No changes.`); process.exit(0); }

const { summary, added, addedEntries } = await applyClassifications(archive, candidates, classifications, { imgDir: `${REPO}/img`, apply });
console.log(`live ${candidates.length} | ${JSON.stringify(summary)} | ${apply ? 'APPLIED' : 'dry run'}`);
if (added.length) console.log('new/relaunch:', added.join(', '));
if (gone.length) console.log(`discontinued ${gone.length}:`, gone.map((g) => g.name).join(', '));

if (apply) {
  for (const g of gone) { const e = archive.find((s) => s.id === g.id); if (e) e.status = 'discontinued'; }
  // fetch each new drink's ingredients from its product page; match by regex first,
  // and only fall back to the Sonnet agent on a miss (a handful of calls a month).
  const { matchCanon, canon } = loadArchiveIngredients();
  const agent = makeAgent(canon); // null when ANTHROPIC_API_KEY is unset -> regex only
  const allCanonAdds = [];
  for (const e of addedEntries) {
    const raw = await fetchIngredients(e.productId, e.id);
    if (raw && raw.length) {
      const { matched, newOnes } = await normalizeIngredients(raw, matchCanon, agent);
      // a genuinely-new ingredient the agent could describe gets appended to the canon
      const canonAdds = [];
      for (const n of newOnes) {
        if (!n.proposal) continue;
        const r = addCanonEntry(REPO, { ...n.proposal, raw: n.raw });
        if (r.status === 'added') canonAdds.push(r.id);
      }
      allCanonAdds.push(...canonAdds);
      e.ingredients = raw;
      e.ingredientsComplete = true;
      e.needsReview = newOnes.length > 0; // a new canon row exists -> you review its icon
      const viaAgent = matched.filter((m) => m.via === 'agent').length;
      console.log(`  ${e.id}: ${raw.length} ingredients, ${matched.length} matched (${viaAgent} via agent)`
        + (canonAdds.length ? `, canon += ${canonAdds.join(', ')} (jar icon, review it)` : '')
        + (newOnes.length && !canonAdds.length ? `, ${newOnes.length} new but not auto-added` : ''));
    } else {
      console.log(`  ${e.id}: ingredients not fetched, left for review`);
    }
  }
  writeFileSync(`${REPO}/data/smoothies.json`, JSON.stringify(archive, null, 2) + '\n');
  console.log('regenerated data.js from', buildData(), 'smoothies');
  const h = healthCheck(REPO);
  console.log(`health: ${h.ok ? 'OK' : 'FAIL'} | ${h.count} smoothies | errors: ${h.errors.join('; ') || 'none'} | ingredient warnings: ${h.warns.length}`);
  if (!h.ok) process.exit(1);

  // a neutral, third-person changelog used as the pull request body (this is a public repo)
  const body = ['Automated menu refresh.', ''];
  if (added.length) body.push('New or updated smoothies:', ...added.map((n) => `- ${n}`), '');
  if (gone.length) body.push('Marked discontinued, no longer on the menu:', ...gone.map((g) => `- ${g.name}`), '');
  if (summary.rename) body.push(`Backfilled the product id for ${summary.rename} returning item${summary.rename > 1 ? 's' : ''}.`, '');
  if (allCanonAdds.length) body.push('New canonical ingredients, added with a placeholder icon:', ...allCanonAdds.map((id) => `- ${id}`), '');
  writeFileSync(`${REPO}/pr-body.md`, body.join('\n').trim() + '\n');
}
