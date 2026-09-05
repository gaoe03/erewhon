#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/ingredient-labels.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'ingredients.js'), 'utf8'), context);

const { CANON, matchCanon, groupIngredients } = context.window.ArchiveIngredients;
const smoothies = JSON.parse(fs.readFileSync(path.join(root, 'data/smoothies.json'), 'utf8'));
const rawIngredients = smoothies.flatMap((smoothie) => smoothie.ingredients || []);
const uniqueRaw = [...new Set(rawIngredients)];

const unmatched = uniqueRaw.filter((raw) => matchCanon(raw) === null);
const duplicateGroups = [];
for (const smoothie of smoothies) {
  const groups = groupIngredients(smoothie.ingredients || []).filter((group) => group.variants.length > 1);
  for (const group of groups) duplicateGroups.push({ smoothie: smoothie.name, ...group });
}

const composedFirstMatches = new Set([
  'hydration-drink', 'cola', 'yerba-mate', 'probiotic-drink', 'magnesium',
  'electrolytes', 'amino', 'collagen', 'plant-creamer',
  'biosil', 'fish-oil', 'honey', 'plant-protein', 'colostrum',
  'greens-powder', 'sea-moss-drink', 'latte-mix',
  'aloe-juice', 'lemonade', 'elderberry-syrup',
  'almond-milk', 'apple-juice', 'banana-water', 'beet-juice', 'blueberry-juice',
  'blueberry-powder', 'bone-broth-protein', 'cacao-nibs', 'cacao-powder', 'caramel', 'carrot-juice', 'cherry-juice', 'coffee-beans',
  'chocho',
  'coconut-cream', 'coconut-kefir', 'coconut-milk', 'coconut-soft-serve', 'coconut-water', 'coconut-whip',
  'coconut-yogurt', 'compote', 'cookie', 'dairy-whip', 'energy-drink',
  'earl-grey', 'fig-jam', 'glaze', 'spiced-sugar', 'granola',
  'grape-juice', 'holy-basil', 'ice-cream', 'juice-blend', 'kombucha', 'lemon-juice', 'lime-juice', 'lions-mane', 'muffin-crumbles', 'oat-milk',
  'orange-juice', 'pitaya-powder', 'pomegranate-juice', 'pumpkin',
  'pumpkin-seed-oil', 'pumpkin-spice', 'probiotics', 'sea-buckthorn', 'superfood-chocolate', 'superfood-chocolate-sauce', 'dairy-kefir', 'vanilla-syrup',
  'watermelon-juice', 'whipped-cream', 'whey', 'yogurt', 'blue-spirulina',
  'flax-oil', 'cinnamon', 'ginger-juice', 'turmeric-juice', 'water-kefir',
]);
const suspicious = [];
for (const raw of uniqueRaw) {
  const normalized = raw.toLowerCase();
  const matches = CANON.filter((entry) => entry.re.test(normalized)).map((entry) => entry.id);
  if (matches.length < 2) continue;
  if (!composedFirstMatches.has(matches[0])) suspicious.push({ raw, matches });
}

console.log(`Archive: ${smoothies.length} smoothies, ${rawIngredients.length} ingredient rows, ${uniqueRaw.length} unique raw labels`);
console.log(`Canonical entries: ${CANON.length}`);
console.log(`Unmatched raw labels: ${unmatched.length}`);
for (const raw of unmatched) console.log(`  - ${raw}`);
if (unmatched.length && process.argv.includes('--check')) process.exitCode = 1;
console.log(`Same-canonical groups within a smoothie: ${duplicateGroups.length}`);
for (const item of duplicateGroups) console.log(`  - ${item.smoothie}: ${item.id ?? 'unmatched'} <= ${item.variants.join(' | ')}`);
console.log(`Suspicious multiple regex matches: ${suspicious.length}`);
for (const item of suspicious) console.log(`  - ${item.raw}: ${item.matches.join(', ')}`);

if (process.argv.includes('--low-use')) {
  const usage = new Map();
  for (const smoothie of smoothies) {
    for (const group of groupIngredients(smoothie.ingredients || [])) {
      if (!group.id) continue;
      if (!usage.has(group.id)) usage.set(group.id, []);
      usage.get(group.id).push({ smoothie: smoothie.name, variants: group.variants });
    }
  }
  const lowUse = CANON.filter((entry) => usage.has(entry.id) && usage.get(entry.id).length <= 2);
  console.log(`Low-use profiles (1 or 2 smoothies): ${lowUse.length}`);
  for (const entry of lowUse) {
    const hits = usage.get(entry.id);
    console.log(`  ${entry.name} [${entry.cat}] (${hits.length})`);
    for (const hit of hits) console.log(`    ${hit.smoothie}: ${hit.variants.join(' | ')}`);
  }
}
