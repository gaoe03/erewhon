// Transactional menu refresh. Dry run is the default and writes nothing.
import { readFileSync, writeFileSync, renameSync, mkdirSync, rmSync, rmdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { fetchLiveSmoothies, hitToCandidate } from './fetch-live.mjs';
import { classify, EXCLUDE } from './dedupe.mjs';
import { checkGuards } from './guards.mjs';
import { planClassifications } from './append.mjs';
import { fetchIngredients } from './fetch-ingredients.mjs';
import { loadArchiveIngredients } from './enrich.mjs';
import { fetchImage } from './images.mjs';
import { renderData } from './build-data.mjs';
import { healthCheck } from './health.mjs';

const DEFAULT_REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const unique = (values) => [...new Set(values.filter(Boolean))];
const reasonFor = (prefix) => (reason) => String(reason).startsWith(prefix);

function menuIdFor(cand, cls) {
  if (cls.action === 'still-live' || cls.action === 'rename') return cls.matchId;
  return String(cand.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function syncReview(entry, currentReasons, unresolved) {
  const oldReasons = entry.reviewReasons || [];
  const preserved = oldReasons.filter((r) => !reasonFor('Recipe fetch failed:')(r) && !reasonFor('Unresolved ingredient:')(r));
  if (entry.needsReview && oldReasons.length === 0) preserved.push('Existing editorial review still required');
  entry.reviewReasons = unique([...preserved, ...currentReasons, ...unresolved.map((raw) => `Unresolved ingredient: ${raw}`)]);
  entry.needsReview = entry.reviewReasons.length > 0;
}

function makePrBody(report) {
  const body = ['Automated Grove tonic bar menu refresh.', '', `Menu checked: ${report.menu.checkedAt}`, `Source: ${report.menu.source}`, `Current menu: ${report.menu.smoothieIds.length} smoothies`, ''];
  if (report.added.length) body.push('New archive entries:', ...report.added.map((x) => `- ${x}`), '');
  if (report.returned.length) body.push('Returned to the current menu:', ...report.returned.map((x) => `- ${x}`), '');
  if (report.removed.length) body.push('No longer on the current Grove menu:', ...report.removed.map((x) => `- ${x}`), '');
  if (report.prices.length) body.push('Price changes:', ...report.prices.map((x) => `- ${x.name}: ${x.before || 'not recorded'} to ${x.after}`), '');
  if (report.recipes.length) body.push('Recipe changes:', ...report.recipes.flatMap((x) => [
    `- ${x.name}`,
    `  - Before: ${x.before.join(', ') || 'not recorded'}`,
    `  - After: ${x.after.join(', ')}`,
    `  - Source: ${x.source}`,
  ]), '');
  if (report.ingredientReview.length) body.push('Ingredient mappings to review:',
    'These labels remain ungrouped until reviewed. Suggested matches are not approvals.',
    ...report.ingredientReview.map((x) => `- ${x.raw}: ${x.suggestion ? `suggested ${x.suggestion.name} (${x.suggestion.id})` : 'no suggested profile'}. Appears in ${x.smoothies.join(', ')}.`),
    '', 'Reuse an existing ingredient type where it fits. Keep juices, milks, oils and whole ingredients distinct. Collagen-containing mixes share Collagen, while collagen boosters without collagen do not. Brands and low usage alone do not create profiles.',
    'Review README.md and docs/ingredient-audit-2026-09-05.md, then add approved labels to data/ingredient-labels.js. Do not infer components from a product name.', '');
  if (report.review.length) body.push('Human review needed:', ...report.review.flatMap((x) => x.reasons.map((r) => `- ${x.name}: ${r}`)), '');
  return body.join('\n').trim() + '\n';
}

export async function planRefresh({
  repoRoot = DEFAULT_REPO,
  now = new Date(),
  liveHits,
  fetchLive = fetchLiveSmoothies,
  fetchRecipe = fetchIngredients,
  fetchImageBytes = fetchImage,
} = {}) {
  const original = JSON.parse(readFileSync(resolve(repoRoot, 'data/smoothies.json'), 'utf8'));
  const previousMenu = JSON.parse(readFileSync(resolve(repoRoot, 'data/menu.json'), 'utf8'));
  const hits = liveHits || await fetchLive();
  const sourceMeta = hits.sourceMeta || null;
  const candidates = hits.map(hitToCandidate).filter((c) => !EXCLUDE.has(c.productId));
  const classifications = candidates.map((c) => classify(c, original));
  const guard = checkGuards(candidates, classifications, { previousMenu, sourceMeta });
  if (!guard.ok) throw new Error('GUARDS FAILED: ' + guard.errors.join('; '));

  const archive = structuredClone(original);
  const planned = planClassifications(archive, candidates, classifications, { now });
  const menuIds = candidates.map((cand, i) => menuIdFor(cand, classifications[i]));
  if (new Set(menuIds).size !== menuIds.length) throw new Error('menu id collision after classification');
  const previousIds = new Set(previousMenu.smoothieIds || []);
  const menu = {
    checkedAt: now.toISOString(),
    source: previousMenu.source,
    scope: previousMenu.scope,
    ...(previousMenu.index ? { index: previousMenu.index } : {}),
    smoothieIds: menuIds,
  };
  if (sourceMeta && menu.index && sourceMeta.index !== menu.index) throw new Error('live source does not match the saved Grove menu source');

  const report = { menu, added: planned.added, returned: [], removed: [], prices: [], recipes: [], review: [], ingredientReview: [] };
  const { matchCanon, suggestCanon, normalizeRaw, canon } = loadArchiveIngredients(repoRoot);
  const pendingIngredients = new Map();
  const imageWrites = [];
  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const id = menuIds[i];
    const entry = archive.find((s) => s.id === id);
    if (!entry) throw new Error(`planned menu id is missing from archive: ${id}`);
    const before = original.find((s) => s.id === id);
    if (before && !previousIds.has(id)) report.returned.push(entry.name);
    if (before && before.price !== cand.price) report.prices.push({ name: entry.name, before: before.price, after: cand.price });
    entry.price = cand.price;
    entry.lastSeen = now.toISOString().slice(0, 10);
    entry.productId = cand.productId;
    entry.productIds = unique([...(entry.productIds || []), cand.productId]);

    const reasons = [];
    let raw = null;
    try { raw = await fetchRecipe(cand.productId, id, { matchIngredient: matchCanon }); } catch (error) { reasons.push(`Recipe fetch failed: ${error.message}`); }
    if (Array.isArray(raw) && raw.length >= 2) {
      const recipeSource = `https://erewhon.com/product/${cand.productId}/${id}`;
      if (!same(entry.ingredients || [], raw)) {
        const old = entry.ingredients || [];
        if (old.length) entry.recipeHistory = [...(entry.recipeHistory || []), { observedAt: entry.ingredientsCheckedAt || null, source: entry.ingredientsSource || null, ingredients: old }];
        entry.ingredients = raw;
        report.recipes.push({ name: entry.name, before: old, after: raw, source: recipeSource });
      }
      entry.ingredientsSource = recipeSource;
      if (!entry.sources.includes(recipeSource)) entry.sources.unshift(recipeSource);
      entry.ingredientsComplete = true;
      entry.ingredientsCheckedAt = now.toISOString();
    } else reasons.push('Recipe fetch failed: no complete ingredient list returned');

    const unresolved = (entry.ingredients || []).filter((ingredient) => !matchCanon(ingredient));
    for (const raw of unresolved) {
      const key = normalizeRaw(raw);
      if (!pendingIngredients.has(key)) pendingIngredients.set(key, { raw, suggestion: canon.find((c) => c.id === suggestCanon(raw)) || null, smoothies: [] });
      const pending = pendingIngredients.get(key);
      if (!pending.smoothies.includes(entry.name)) pending.smoothies.push(entry.name);
    }
    syncReview(entry, reasons, unresolved);
    if (entry.needsReview) report.review.push({ name: entry.name, reasons: entry.reviewReasons || ['Editorial review needed'] });

    if (!before && cand.imageUrl) {
      const image = await fetchImageBytes(cand.imageUrl);
      if (image.status !== 'downloaded') throw new Error(`image fetch failed for ${entry.name}: ${image.reason}`);
      const path = `img/${id}.${image.extension}`;
      entry.image = path;
      imageWrites.push({ path, bytes: image.bytes });
    }
  }
  report.removed = (previousMenu.smoothieIds || []).filter((id) => !menuIds.includes(id)).map((id) => original.find((s) => s.id === id)?.name || id);
  report.ingredientReview = [...pendingIngredients.values()];
  const generated = renderData(archive, menu);
  const imageMap = new Map(imageWrites.map((item) => [item.path, item.bytes]));
  const health = healthCheck(repoRoot, { smoothies: archive, menu, dataJs: generated, readImage: (path) => imageMap.get(path) || (existsSync(resolve(repoRoot, path)) ? readFileSync(resolve(repoRoot, path)) : null) });
  if (!health.ok) throw new Error('HEALTH FAILED: ' + health.errors.join('; '));
  return { archive, menu, generated, prBody: makePrBody(report), imageWrites, report, health };
}

export async function runRefresh({ apply = false, commitFile = renameSync, ...options } = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO;
  const result = await planRefresh(options);
  if (!apply) return result;
  const scratch = resolve(repoRoot, '.refresh');
  mkdirSync(scratch, { recursive: true });
  const stage = await mkdtemp(resolve(scratch, 'stage-'));
  const backup = await mkdtemp(resolve(scratch, 'backup-'));
  const writes = [
    ['data/smoothies.json', JSON.stringify(result.archive, null, 2) + '\n'],
    ['data/menu.json', JSON.stringify(result.menu, null, 2) + '\n'],
    ['data.js', result.generated],
    ['pr-body.md', result.prBody],
    ...result.imageWrites.map((x) => [x.path, x.bytes]),
  ];
  try {
    for (const [relative, contents] of writes) {
      const path = resolve(stage, relative);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, contents);
    }
    const touched = [];
    try {
      for (const [relative] of writes) {
        const target = resolve(repoRoot, relative);
        const saved = resolve(backup, relative);
        if (existsSync(target)) {
          mkdirSync(dirname(saved), { recursive: true });
          renameSync(target, saved);
        }
        touched.push(relative);
        mkdirSync(dirname(target), { recursive: true });
        commitFile(resolve(stage, relative), target, relative);
      }
    } catch (error) {
      for (const relative of touched.reverse()) {
        const target = resolve(repoRoot, relative);
        if (existsSync(target)) rmSync(target, { force: true });
        const saved = resolve(backup, relative);
        if (existsSync(saved)) renameSync(saved, target);
      }
      throw error;
    }
  } finally {
    rmSync(stage, { recursive: true, force: true });
    rmSync(backup, { recursive: true, force: true });
    try { rmdirSync(scratch); } catch { /* another refresh may own it */ }
  }
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const apply = process.argv.includes('--apply');
    const result = await runRefresh({ apply });
    console.log(`live ${result.menu.smoothieIds.length} | ${apply ? 'APPLIED' : 'dry run'} | recipe changes ${result.report.recipes.length} | review ${result.report.review.length}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
