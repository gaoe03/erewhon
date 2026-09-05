import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { parseIngredients, fetchIngredients } from '../scripts/fetch-ingredients.mjs';
import { fetchLiveSmoothies } from '../scripts/fetch-live.mjs';
import { classify } from '../scripts/dedupe.mjs';
import { checkGuards } from '../scripts/guards.mjs';
import { runRefresh } from '../scripts/run.mjs';
import { planClassifications } from '../scripts/append.mjs';

const sydney = 'INGREDIENTS MALK Organic Almond Milk, Banagua Organic Banana Water, Codeage Hair Vitamins, Ancient Nutrition Vanilla Bone Broth Protein, Erewhon Organic A2 Whey Protein, Organic Blueberries, Organic Acai, Organic Banana, Organic Almond Butter, Organic Tocotrienols, Organic Lucuma, Organic Maple, Organic Pitaya Whipped Cream, Organic Blue Spirulina Whipped Cream, Organic Vegan Coconut Bacon and Erewhon Organic Blueberry Muffin Crumbles. Contains: Milk, Eggs, Wheat, Almonds';

test('ingredient parser preserves long rows and nested commas', () => {
  const parsed = parseIngredients(sydney);
  assert.equal(parsed.length, 16);
  assert.equal(parsed.at(-1), 'Erewhon Organic Blueberry Muffin Crumbles');
  assert.deepEqual(parseIngredients('Ingredients: Coconut cream (coconut, water), Banana. Contains: Coconut'), ['Coconut cream (coconut, water)', 'Banana']);
  assert.deepEqual(parseIngredients('Ingredients: Banana, Milk\nALLERGENS Milk'), ['Banana', 'Milk']);
  assert.deepEqual(parseIngredients('Organic Almond Milk, GROW Organic Banana, Organic Strawberry Glaze, Contains: Almonds'), ['Organic Almond Milk', 'GROW Organic Banana', 'Organic Strawberry Glaze']);
  assert.deepEqual(parseIngredients('Coconut Water, Agent Nateur Marine Collagen, Organic Mango Glaze, Contains: Fish (Marine Collagen) (Cod, Pollock, Haddock),'), ['Coconut Water', 'Agent Nateur Marine Collagen', 'Organic Mango Glaze']);
  assert.deepEqual(parseIngredients('Ingredients: Banana, Contains Vitamins'), ['Banana', 'Contains Vitamins']);
  assert.deepEqual(parseIngredients('Ingredients: Protein Powder (Milk and Soy), Banana'), ['Protein Powder (Milk and Soy)', 'Banana']);
  assert.equal(parseIngredients('Ingredients: Apple (juice, Banana'), null);
});

test('browser scrape reads only the observed ingredient panel', async () => {
  let selector = '';
  const page = {
    goto: async () => {},
    getByText: () => ({ first: () => ({ click: async () => {} }) }),
    waitForTimeout: async () => {},
    evaluate: async (fn) => {
      const previous = globalThis.document;
      globalThis.document = { querySelector(value) { selector = value; return { innerText: 'Ingredients: Banana, Milk. Contains: Milk' }; } };
      try { return fn(); } finally { globalThis.document = previous; }
    },
  };
  const chromium = { launch: async () => ({ newPage: async () => page, close: async () => {} }) };
  assert.deepEqual(await fetchIngredients('1', 'one', { chromium }), ['Banana', 'Milk']);
  assert.match(selector, /product-tabs-tabpane-nutri/);
});

test('ingredient parser preserves complete products containing and', () => {
  for (const product of ['JS Health Greens and Collagen', 'Heart and Soil Beef Organs']) {
    assert.deepEqual(parseIngredients(`Ingredients: Banana, ${product}.`), ['Banana', product]);
    assert.deepEqual(parseIngredients(`Ingredients: Milk, Banana and ${product}.`), ['Milk', 'Banana', product]);
  }
  assert.deepEqual(parseIngredients('Ingredients: Milk, Collagen and Banana.'), ['Milk', 'Collagen', 'Banana']);
  assert.deepEqual(parseIngredients('Ingredients: Banana, Future Greens and Collagen.'), ['Banana', 'Future Greens and Collagen']);
  assert.deepEqual(parseIngredients('Ingredients: Banana, Protein Powder (Milk and Soy).'), ['Banana', 'Protein Powder (Milk and Soy)']);
});

test('ambiguous product conjunctions survive the scrape and refresh for review', async (t) => {
  const root = await fixtureRepo(t);
  const result = await runRefresh({
    repoRoot: root,
    liveHits: [hit],
    fetchRecipe: async (_productId, _slug, options) => parseIngredients('Ingredients: Banana, Future Greens and Collagen.', options),
  });
  assert.deepEqual(result.archive[0].ingredients, ['Banana', 'Future Greens and Collagen']);
  assert.equal(result.archive[0].needsReview, true);
  assert.equal(result.report.ingredientReview[0].raw, 'Future Greens and Collagen');
});

test('Algolia fetch follows every page and rejects incomplete pagination', async () => {
  const pages = [[{ objectID: '1', Department: 'Tonic', Category: 'Smoothies' }], [{ objectID: '2', Department: 'Tonic', Category: 'Smoothies' }]];
  const fetchImpl = async (_url, init) => {
    const page = Number(new URLSearchParams(JSON.parse(init.body).params).get('page'));
    return { ok: true, json: async () => ({ hits: pages[page], nbPages: 2, nbHits: 2, page }) };
  };
  const hits = await fetchLiveSmoothies({ fetchImpl, appId: 'a', apiKey: 'k', hitsPerPage: 1 });
  assert.deepEqual(hits.map((x) => x.objectID), ['1', '2']);
  await assert.rejects(fetchLiveSmoothies({ fetchImpl: async () => ({ ok: true, json: async () => ({ hits: pages[0], nbPages: 2, nbHits: 2, page: 1 }) }), appId: 'a', apiKey: 'k' }), /pagination metadata/);
});

test('classification supports returns and product id reuse without duplicate archive ids', () => {
  const archive = [{ id: 'old', productId: '9', name: 'Old Smoothie' }, { id: 'returning', productId: '4', name: 'Returning Smoothie', status: 'discontinued' }];
  assert.equal(classify({ productId: '4', name: 'Returning Smoothie' }, archive).matchId, 'returning');
  assert.equal(classify({ productId: '9', name: 'New Edition' }, archive).action, 'relaunch');
  const copy = structuredClone(archive);
  planClassifications(copy, [{ productId: '9', name: 'New Edition', price: '$10', brand: '', imageUrl: '' }], [{ action: 'relaunch', reusedFrom: 'old' }], { now: new Date('2026-09-05T00:00:00Z') });
  assert.deepEqual(copy.find((x) => x.id === 'old').productIds, ['9']);
  assert.equal(copy.find((x) => x.id === 'old').productId, '');
  assert.equal(copy.find((x) => x.id === 'new-edition').productId, '9');
});

test('guard compares suspicious removals to the previous snapshot', () => {
  const previousMenu = { smoothieIds: Array.from({ length: 20 }, (_, i) => `old-${i}`) };
  const candidates = Array.from({ length: 12 }, (_, i) => ({ productId: String(i), name: `Drink ${i}`, price: '$10', source: {} }));
  const classifications = candidates.map((_, i) => ({ action: 'still-live', matchId: `old-${i}` }));
  assert.match(checkGuards(candidates, classifications, { previousMenu }).errors.join('\n'), /removals/);
});

async function fixtureRepo(t) {
  const root = await mkdtemp(resolve(tmpdir(), 'erewhon-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(resolve(root, 'data'));
  await mkdir(resolve(root, 'img'));
  const smoothie = { id: 'one', productId: '1', productIds: ['1'], image: 'img/one.jpg', name: 'One Smoothie', status: 'permanent', lastSeen: '2026-01-01', price: '$10', ingredients: ['Banana'], ingredientsComplete: true, sources: ['https://example.test/1'] };
  await writeFile(resolve(root, 'data/smoothies.json'), JSON.stringify([smoothie]));
  await writeFile(resolve(root, 'data/menu.json'), JSON.stringify({ checkedAt: '2026-01-01', source: 'https://erewhon.com/shop', scope: 'Grove online tonic bar menu', index: 'GROVE_SEARCH_INDEX', smoothieIds: ['one'] }));
  await writeFile(resolve(root, 'ingredients.js'), await readFile(new URL('../ingredients.js', import.meta.url)));
  await writeFile(resolve(root, 'data/ingredient-labels.js'), await readFile(new URL('../data/ingredient-labels.js', import.meta.url)));
  await writeFile(resolve(root, 'img/one.jpg'), Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(2100)]));
  await writeFile(resolve(root, 'data.js'), 'old');
  return root;
}

const hit = { objectID: '1', ProductName: 'One Smoothie', DisplayPrice: '12.00', Department: 'Tonic', Category: 'Smoothies', SubCategory: 'House' };

test('dry run writes nothing while planning price and recipe changes', async (t) => {
  const root = await fixtureRepo(t);
  const before = await readFile(resolve(root, 'data/smoothies.json'), 'utf8');
  const canonBefore = await readFile(resolve(root, 'ingredients.js'), 'utf8');
  const result = await runRefresh({ repoRoot: root, liveHits: [hit], now: new Date('2026-09-05T00:00:00Z'), fetchRecipe: async () => ['Banana', 'Unknown Dust'] });
  assert.equal((await readFile(resolve(root, 'data/smoothies.json'), 'utf8')), before);
  assert.equal(await readFile(resolve(root, 'ingredients.js'), 'utf8'), canonBefore);
  assert.equal(result.report.prices.length, 1);
  assert.equal(result.report.recipes.length, 1);
  assert.match(result.prBody, /Unresolved ingredient: Unknown Dust/);
});

test('refresh requires a persistent reviewed mapping even when regexes suggest a profile', async (t) => {
  const root = await fixtureRepo(t);
  const policyPath = resolve(root, 'data/ingredient-labels.js');
  const policyBefore = await readFile(policyPath, 'utf8');
  const canonBefore = await readFile(resolve(root, 'ingredients.js'), 'utf8');
  const options = { apply: true, repoRoot: root, liveHits: [hit], fetchRecipe: async () => ['Banana', 'Mango Juice', 'New Brand Vanilla Collagen'] };
  const first = await runRefresh(options);
  assert.equal(first.archive[0].needsReview, true);
  assert.deepEqual(first.archive[0].ingredients, ['Banana', 'Mango Juice', 'New Brand Vanilla Collagen']);
  assert.deepEqual(first.report.ingredientReview.map((x) => x.suggestion?.id), ['mango', 'collagen']);
  assert.match(first.prBody, /Suggested matches are not approvals/);
  assert.match(first.prBody, /Mango Juice: suggested Mango/);
  assert.equal(await readFile(policyPath, 'utf8'), policyBefore);
  assert.equal(await readFile(resolve(root, 'ingredients.js'), 'utf8'), canonBefore);
  const again = await runRefresh(options);
  assert.equal(again.archive[0].needsReview, true, 'saving the source label is not ingredient approval');
  assert.equal(again.report.ingredientReview.length, 2);

  // An explicit editorial decision can reuse Collagen without creating a profile.
  await writeFile(policyPath, policyBefore + '\nwindow.REVIEWED_INGREDIENTS["new brand vanilla collagen"] = "collagen";\n');
  const reviewed = await runRefresh({ ...options, fetchRecipe: async () => ['Banana', 'New Brand Vanilla Collagen'] });
  assert.equal(reviewed.archive[0].needsReview, false);
  assert.deepEqual(reviewed.report.ingredientReview, []);
  assert.equal(await readFile(resolve(root, 'ingredients.js'), 'utf8'), canonBefore);
});

test('refresh reuses the accepted taxonomy for named mixes without adding profiles', async (t) => {
  const root = await fixtureRepo(t);
  const labels = ['Banana', 'Copina Co. Vanilla Plant-based Collagen Boost', 'Thorne Collagen Plus Passionberry', 'Codeage Hair Vitamins', 'B. Powered Superfood Honey'];
  const result = await runRefresh({ repoRoot: root, liveHits: [hit], fetchRecipe: async () => labels });
  assert.equal(result.archive[0].needsReview, false);
  assert.deepEqual(result.report.ingredientReview, []);
  assert.deepEqual(result.archive[0].ingredients, labels);
});

test('apply retries a failed recipe without erasing it', async (t) => {
  const root = await fixtureRepo(t);
  await runRefresh({ apply: true, repoRoot: root, liveHits: [hit], now: new Date('2026-09-05T00:00:00Z'), fetchRecipe: async () => null });
  const row = JSON.parse(await readFile(resolve(root, 'data/smoothies.json'), 'utf8'))[0];
  assert.deepEqual(row.ingredients, ['Banana']);
  assert.match(row.reviewReasons.join('\n'), /Recipe fetch failed/);
  await runRefresh({ apply: true, repoRoot: root, liveHits: [hit], now: new Date('2026-09-06T00:00:00Z'), fetchRecipe: async () => ['Banana', 'Milk'] });
  const retried = JSON.parse(await readFile(resolve(root, 'data/smoothies.json'), 'utf8'))[0];
  assert.deepEqual(retried.reviewReasons, []);
  assert.equal(retried.needsReview, false);
});

test('hard guard failure leaves every tracked artifact unchanged', async (t) => {
  const root = await fixtureRepo(t);
  const paths = ['data/smoothies.json', 'data/menu.json', 'data.js'];
  const before = await Promise.all(paths.map((p) => readFile(resolve(root, p), 'utf8')));
  await assert.rejects(runRefresh({ apply: true, repoRoot: root, liveHits: [], fetchRecipe: async () => [] }), /GUARDS FAILED/);
  assert.deepEqual(await Promise.all(paths.map((p) => readFile(resolve(root, p), 'utf8'))), before);
});

test('apply rolls back tracked files if a staged replacement fails', async (t) => {
  const root = await fixtureRepo(t);
  const paths = ['data/smoothies.json', 'data/menu.json', 'data.js'];
  const before = await Promise.all(paths.map((p) => readFile(resolve(root, p), 'utf8')));
  const { renameSync } = await import('node:fs');
  await assert.rejects(runRefresh({
    apply: true,
    repoRoot: root,
    liveHits: [hit],
    fetchRecipe: async () => ['Banana', 'Milk'],
    commitFile(source, target, relative) {
      if (relative === 'data/menu.json') throw new Error('injected replacement failure');
      renameSync(source, target);
    },
  }), /injected replacement failure/);
  assert.deepEqual(await Promise.all(paths.map((p) => readFile(resolve(root, p), 'utf8'))), before);
});

test('candidate missing a product id fails before writes', async (t) => {
  const root = await fixtureRepo(t);
  await assert.rejects(runRefresh({ apply: true, repoRoot: root, liveHits: [{ ...hit, objectID: undefined }], fetchRecipe: async () => [] }), /incomplete source shape/);
});

test('menu snapshot records removal and later return without changing historical status', async (t) => {
  const root = await fixtureRepo(t);
  const second = { id: 'two', productId: '2', productIds: ['2'], image: 'img/two.jpg', name: 'Two Smoothie', status: 'discontinued', lastSeen: '2025-01-01', price: '$10', ingredients: ['Banana', 'Milk'], ingredientsComplete: true, sources: ['https://example.test/2'] };
  const rows = JSON.parse(await readFile(resolve(root, 'data/smoothies.json'), 'utf8'));
  rows.push(second);
  await writeFile(resolve(root, 'data/smoothies.json'), JSON.stringify(rows));
  await writeFile(resolve(root, 'img/two.jpg'), Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(2100)]));
  const removed = await runRefresh({ repoRoot: root, liveHits: [hit], fetchRecipe: async () => ['Banana', 'Milk'] });
  assert.deepEqual(removed.menu.smoothieIds, ['one']);
  const returnedHit = { ...hit, objectID: '2', ProductName: 'Two Smoothie' };
  const returned = await runRefresh({ repoRoot: root, liveHits: [hit, returnedHit], fetchRecipe: async () => ['Banana', 'Milk'] });
  assert.equal(returned.report.returned[0], 'Two Smoothie');
  assert.equal(returned.archive.find((x) => x.id === 'two').status, 'discontinued');
});
