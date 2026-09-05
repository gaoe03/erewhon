import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loadBrowserFile = (name, exportName) => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/ingredient-labels.js'), 'utf8'), context);
  vm.runInNewContext(fs.readFileSync(path.join(root, name), 'utf8'), context);
  return context.window[exportName];
};

const ingredients = loadBrowserFile('ingredients.js', 'ArchiveIngredients');
const icons = loadBrowserFile('icons.js', 'ArchiveIcons');
const smoothies = JSON.parse(fs.readFileSync(path.join(root, 'data/smoothies.json'), 'utf8'));

test('ingredient proposals preserve intended identity and form', () => {
  const fixtures = new Map([
    ['Banagua Organic Banana Water', 'banana-water'],
    ['Ancient Nutrition Vanilla Bone Broth Protein', 'bone-broth-protein'],
    ['Organic Pitaya Whipped Cream', 'whipped-cream'],
    ['Organic Blue Spirulina Whipped Cream', 'whipped-cream'],
    ['Grassfed Whipped Cream', 'dairy-whip'],
    ['MALK Organics Coconut MALK', 'coconut-milk'],
    ['SIBU Sea Buckthorn Puree', 'sea-buckthorn'],
    ['Organic Vegan Coconut Bacon', 'coconut-bacon'],
    ['Erewhon Organic Blueberry Muffin Crumbles', 'muffin-crumbles'],
    ['Organic Housemade Fig Jam', 'fig-jam'],
    ['Organic Black Mission Figs', 'fig'],
    ['Organic Balsamic Vinegar', 'balsamic-vinegar'],
    ['Organic Thyme', 'thyme'],
    ['Organic Pistachio', 'pistachio'],
    ['Coffee Beans', 'coffee-beans'],
    ['Cacao Nibs', 'cacao-nibs'],
    ['Raw Cacao Powder', 'cacao-powder'],
    ['Superfood Chocolate Sauce', 'superfood-chocolate-sauce'],
    ['THE FULLEST CO Saffron Latte', 'latte-mix'],
    ['Pumpkin Spice', 'pumpkin-spice'],
    ['Arugula', 'arugula'],
    ['Agua de Kefir Dragon Fruit Fresa', 'water-kefir'],
    ['Organic Coconut Yogurt', 'coconut-yogurt'],
    ['Whipped Cream', 'whipped-cream'],
    ['Organic Coconut Whipped Cream', 'coconut-whip'],
  ]);
  for (const [raw, expected] of fixtures) assert.equal(ingredients.suggestCanon(raw), expected, raw);
});

test('materially different forms do not collapse together', () => {
  assert.notEqual(ingredients.suggestCanon('Banana'), ingredients.suggestCanon('Banana Water'));
  const coconut = ['Coconut Water', 'Coconut Milk', 'Coconut Cream', 'Coconut Meat', 'Coconut Whip'];
  assert.equal(new Set(coconut.map(ingredients.matchCanon)).size, coconut.length);
  assert.notEqual(ingredients.suggestCanon('Apple'), ingredients.suggestCanon('Apple Juice'));
  assert.equal(ingredients.suggestCanon('Pumpkin'), ingredients.suggestCanon('Pumpkin Puree'));
  assert.notEqual(ingredients.suggestCanon('Cold Brew Coffee'), ingredients.suggestCanon('Coffee Beans'));
  assert.notEqual(ingredients.suggestCanon('Cacao Nibs'), ingredients.suggestCanon('Cacao Powder'));
  assert.notEqual(ingredients.suggestCanon('Saffron'), ingredients.suggestCanon('Saffron Latte'));
  assert.notEqual(ingredients.suggestCanon('Arugula'), ingredients.suggestCanon('Fresh Herbs'));
  assert.equal(ingredients.suggestCanon('Mystery Fruit Jam'), null);
  assert.equal(ingredients.suggestCanon('Unknown Future Foam'), null);
});

test('groupIngredients preserves encounter order and distinct raw source labels', () => {
  const raw = ['Banana', 'Organic Banana', 'Future Foam', ' future   foam ', 'Banana Water', 'Banana'];
  const groups = ingredients.groupIngredients(raw);
  assert.deepEqual(JSON.parse(JSON.stringify(groups)), [
    { id: 'banana', variants: ['Banana', 'Organic Banana'] },
    { id: null, variants: ['Future Foam', ' future   foam '] },
    { id: 'banana-water', variants: ['Banana Water'] },
  ]);
  assert.deepEqual(raw, ['Banana', 'Organic Banana', 'Future Foam', ' future   foam ', 'Banana Water', 'Banana']);
});

test('full archive sweep loses no ingredient strings', () => {
  const raw = smoothies.flatMap((smoothie) => smoothie.ingredients || []);
  const grouped = ingredients.groupIngredients(raw);
  const groupedVariants = grouped.flatMap((group) => group.variants);
  const distinctRaw = [...new Set(raw)];
  assert.equal(groupedVariants.length, distinctRaw.length);
  assert.deepEqual(new Set(groupedVariants), new Set(distinctRaw));
  assert.equal(raw.length, smoothies.reduce((sum, smoothie) => sum + (smoothie.ingredients || []).length, 0));
});

test('unfamiliar labels cannot silently inherit a substring match', () => {
  for (const raw of ['Mango Juice', 'Banana Milk', 'Coconut Milk Powder', 'Future Collagen Support', 'New Brand Vanilla Collagen']) {
    assert.equal(ingredients.matchCanon(raw), null, raw);
    const groups = ingredients.groupIngredients(['Mango', raw]);
    assert.equal(groups.length, 2, raw);
    assert.equal(groups[1].id, null);
    assert.equal(groups[1].variants[0], raw);
  }
  assert.equal(ingredients.suggestCanon('Mango Juice'), 'mango', 'a broad proposal is not an approved mapping');
  assert.equal(ingredients.matchCanon('  ORGANIC   BANANA  '), 'banana');
  assert.equal(ingredients.matchCanon('Organic Carrot Juice'), 'carrot-juice');
  assert.equal(ingredients.matchCanon('Organic Green Apple'), 'apple');
  assert.equal(ingredients.matchCanon('Organic Mango Juice'), null);
  assert.equal(ingredients.matchCanon('Organic Banana Milk'), null);
  assert.equal(ingredients.matchCanon('Organic Future Collagen Support'), null);
  assert.equal(ingredients.matchCanon('Copina Co. Vanilla Plant-based Collagen Boost'), 'plant-creamer');
  assert.equal(ingredients.matchCanon('Thorne Collagen Plus Passionberry'), 'collagen');
});

test('every canonical entry has a real icon and separated forms differ', () => {
  for (const entry of ingredients.CANON) assert.ok(icons.ICONS[entry.icon], `${entry.id} uses missing icon ${entry.icon}`);
  const separated = ['banana', 'bananaWater', 'coconutWater', 'cartonCoconut', 'coconutcream', 'coconutMeat', 'coconutWhip'];
  assert.equal(new Set(separated.map((key) => icons.ICONS[key])).size, separated.length);
  assert.notEqual(icons.ICONS.fig, icons.ICONS.figJam);
  assert.notEqual(icons.ICONS.apple, icons.ICONS.appleJuice);
  assert.notEqual(icons.ICONS.yogurt, icons.ICONS.genericYogurt);
});

test('every ingredient has exactly one supported culinary category', () => {
  const expectedKeys = [
    'fruit', 'veg', 'liquid', 'cultured', 'brew', 'sweet',
    'fat', 'super', 'supplement', 'topping', 'specialty',
  ];
  assert.deepEqual(Object.keys(ingredients.CATS), expectedKeys);
  assert.equal(new Set(ingredients.CANON.map((entry) => entry.id)).size, ingredients.CANON.length);
  for (const entry of ingredients.CANON) {
    assert.equal(typeof entry.cat, 'string', `${entry.id} has no single category`);
    assert.ok(expectedKeys.includes(entry.cat), `${entry.id} has unsupported category ${entry.cat}`);
  }
  for (const key of expectedKeys) {
    assert.ok(ingredients.CATS[key].trim(), `${key} has an empty label`);
    assert.ok(ingredients.CANON.some((entry) => entry.cat === key), `${key} has no ingredients`);
  }
});

test('categories follow ingredient identity and preparation', () => {
  const expected = {
    banana: 'fruit',
    'blueberry-powder': 'super',
    'pitaya-powder': 'super',
    pumpkin: 'veg',
    'sea-buckthorn': 'fruit',
    lucuma: 'fruit',
    'camu-camu': 'fruit',
    arugula: 'veg',
    thyme: 'veg',
    'carrot-juice': 'liquid',
    'beet-juice': 'liquid',
    'coconut-milk': 'liquid',
    'coconut-water': 'liquid',
    'banana-water': 'liquid',
    'coconut-cream': 'liquid',
    'elderberry-syrup': 'sweet',
    lemonade: 'brew',
    'aloe-juice': 'liquid',
    aloe: 'veg',
    'water-kefir': 'cultured',
    'coconut-yogurt': 'cultured',
    kombucha: 'cultured',
    coffee: 'brew',
    matcha: 'brew',
    'cacao-powder': 'sweet',
    cinnamon: 'sweet',
    'balsamic-vinegar': 'sweet',
    'cacao-nibs': 'fat',
    tocos: 'fat',
    cordyceps: 'super',
    spirulina: 'super',
    multivitamin: 'supplement',
    nootropic: 'supplement',
    'superfood-chocolate': 'topping',
    'coconut-whip': 'topping',
    'energy-drink': 'brew',
    'latte-mix': 'brew',
  };
  for (const [id, category] of Object.entries(expected)) {
    assert.equal(ingredients.BY_ID.get(id)?.cat, category, id);
  }
});

test('source preparations reach the right browsing filters without absorbing flavored products', () => {
  const cases = [
    ['Organic Lemon Juice', 'lemon-juice', 'liquid'],
    ['fresh lime juice', 'lime-juice', 'liquid'],
    ['White Grape Juice', 'grape-juice', 'liquid'],
    ['Watermelon Juice', 'watermelon-juice', 'liquid'],
    ['Lily of the Desert Whole Leaf Aloe Vera Juice', 'aloe-juice', 'liquid'],
    ['Lemonade', 'lemonade', 'brew'],
    ['Ultima Replenisher Lemonade Electrolytes', 'electrolytes', 'supplement'],
    ['Gaia Herbs Certified Black Elderberry Syrup', 'elderberry-syrup', 'sweet'],
    ['Gaia Herbs Elderberry Glaze', 'glaze', 'topping'],
    ['Pumpkin Purée', 'pumpkin', 'veg'],
    ['SIBU Sea Buckthorn Puree', 'sea-buckthorn', 'fruit'],
    ['organic pitaya powder', 'pitaya-powder', 'super'],
    ['organic pitaya', 'pitaya', 'fruit'],
    ['Organic Pitaya Whipped Cream', 'whipped-cream', 'topping'],
    ['Wild Blueberry Powder', 'blueberry-powder', 'super'],
    ['Four Sigmatic Sweet Vanilla Protein Powder', 'plant-protein', 'supplement'],
    ['Hojicha Powder', 'hojicha', 'brew'],
    ['Raw Cacao Powder', 'cacao-powder', 'sweet'],
  ];
  for (const [raw, id, category] of cases) {
    const actual = ingredients.matchCanon(raw);
    assert.equal(actual, id, raw);
    assert.equal(ingredients.BY_ID.get(actual).cat, category, raw);
  }
});

test('simple produce preparations share profiles while juices and powders remain separate', () => {
  for (const raw of ['Strawberry', 'Frozen Strawberries', 'organic freeze-dried strawberries']) {
    assert.equal(ingredients.suggestCanon(raw), 'strawberry', raw);
  }
  assert.equal(ingredients.suggestCanon('Pumpkin Purée'), 'pumpkin');
  assert.equal(ingredients.suggestCanon('SIBU Sea Buckthorn Puree'), 'sea-buckthorn');
  assert.notEqual(ingredients.suggestCanon('Apple'), ingredients.suggestCanon('Apple Juice'));
  assert.notEqual(ingredients.suggestCanon('Pitaya'), ingredients.suggestCanon('Pitaya Powder'));
  for (const [oldId, id] of Object.entries(ingredients.ALIASES)) {
    assert.ok(ingredients.BY_ID.has(id), `${oldId} aliases a missing profile`);
  }
});

test('brand and generic proposals reuse ordinary ingredient profiles', () => {
  const cases = [
    ['GORGIE Cherry Lime', 'Energy Drink', 'energy-drink', 'brew'],
    ['Barcode Lemon Lime', 'Hydration Drink', 'hydration-drink', 'brew'],
    ["GT's Alive Cola", 'Cola', 'cola', 'brew'],
    ['De Soi Spritz Italiano', 'Nonalcoholic Aperitif', 'nonalcoholic-aperitif', 'brew'],
    ['KIN High Rhode', 'Non-alcoholic Apéritif', 'nonalcoholic-aperitif', 'brew'],
    ['Yerba Madre Bluephoria Yerba Mate', 'Yerba Mate', 'yerba-mate', 'brew'],
    ['Bio-K Blueberry', 'Probiotic Drink', 'probiotic-drink', 'cultured'],
    ['Natural Vitality Original Calm Powder (magnesium)', 'Magnesium', 'magnesium', 'supplement'],
    ['Ultima Replenisher Raspberry Electrolytes', 'Electrolytes', 'electrolytes', 'supplement'],
    ['PerfectAmino Chocolate Powder', 'Amino Acids', 'amino', 'supplement'],
    ['Sprout Living Vanilla Lucuma Epic Protein', 'Plant Protein', 'plant-protein', 'supplement'],
    ['Huel Daily Greens', 'Greens Powder', 'greens-powder', 'super'],
    ['Heart and Soil Immunomilk', 'Colostrum', 'colostrum', 'supplement'],
    ['Nordic Naturals Ultimate Omega', 'Fish Oil', 'fish-oil', 'fat'],
    ["Udo's Oil", 'Plant Oil Blend', 'oil-blend', 'fat'],
    ['Dandy Blend', 'Herbal Coffee Blend', 'herbal-coffee', 'brew'],
    ['Blume Pumpkin Spice Latte Blend', 'Pumpkin Spice Latte Mix', 'latte-mix', 'brew'],
    ['THE FULLEST CO Saffron Latte', 'Saffron Latte', 'latte-mix', 'brew'],
    ['BodyHealth Reds powder', 'Reds Powder', 'reds-powder', 'super'],
    ['Codeage Hair Vitamins', 'Hair Vitamin Blend', 'multivitamin', 'supplement'],
    ['Klar Blood Orange Nootropics Drink Mix', 'Nootropic Drink Mix', 'nootropic', 'supplement'],
    ['Agent Nateur Holi(Mane) Marine Collagen & Pearl Powder', 'Collagen & Pearl Blend', 'collagen', 'supplement'],
    ['JS Health Greens and Collagen', 'Greens & Collagen Blend', 'collagen', 'supplement'],
    ['Thorne Collagen Plus Passionberry', 'Collagen Blend', 'collagen', 'supplement'],
    ['Ancient Nutrition Multi-Collagen Hydrate (Lemon Lime)', 'Collagen Blend', 'collagen', 'supplement'],
    ['Copina Co. Vanilla Plant-based Collagen Boost', 'Plant-based Creamer', 'plant-creamer', 'brew'],
    ['Passionfruit Perfect Amino Electrolytes', 'Amino Acid & Electrolyte Blend', 'amino', 'supplement'],
    ['Copina Co. Citrus Blossom Sea Moss Refresher Drink', 'Sea Moss Drink', 'sea-moss-drink', 'brew'],
    ['B. Powered Superfood Honey', 'Honey Blend', 'honey', 'sweet'],
    ['MALK Almond Milk', 'Almond Milk', 'almond-milk', 'liquid'],
    ['Vita Coco Coconut Water', 'Coconut Water', 'coconut-water', 'liquid'],
  ];
  for (const [brand, generic, id, cat] of cases) {
    assert.equal(ingredients.suggestCanon(brand), id, brand);
    assert.equal(ingredients.suggestCanon(generic), id, generic);
    assert.equal(ingredients.BY_ID.get(id).cat, cat, id);
  }
});

test('specialty formulas and distinct preparations do not disappear into components', () => {
  for (const [raw, id] of [
    ['Biosil collagen', 'biosil'],
    ['NOVOS Core Longevity Formula', 'novos'],
    ['Sakara Beauty Drops', 'beauty-drops'],
    ['Anima Mundi EUPHORIA Powder (Mood, Joy + Bliss)', 'euphoria'],
    ['ION Gut Support', 'ion-gut-support'],
    ['Four Sigmatic Gut Health Blend', 'four-sigmatic-gut-health'],
    ['Alo Immunity Rescue Drizzle', 'immunity-shot'],
    ['Magic Mind Mental Performance Shot', 'magic-mind'],
  ]) {
    assert.equal(ingredients.suggestCanon(raw), id, raw);
    assert.equal(ingredients.BY_ID.get(id).cat, 'specialty', id);
  }
  for (const [prepared, component] of [
    ['Probiotic Drink', 'Probiotics'],
    ['Hydration Drink', 'Electrolytes'],
    ['Plant-based Collagen Booster', 'Collagen'],
    ['Greens & Collagen Blend', 'Greens Powder'],
    ['Sea Moss Drink', 'Sea Moss'],
    ['Pumpkin Spice Latte Mix', 'Pumpkin Spice'],
    ['Saffron Latte', 'Saffron'],
    ['Fish Oil', 'Plant Oil Blend'],
    ['Herbal Coffee Blend', 'Cold Brew Coffee'],
    ['Flaxseed Oil', 'Flaxseed'],
  ]) {
    assert.notEqual(ingredients.suggestCanon(prepared), ingredients.suggestCanon(component), prepared);
  }
  assert.equal(ingredients.suggestCanon('Homemade Superfood Caramel (dates, maple syrup, Dandy Blend, he shou wu)'), 'caramel');
  assert.equal(ingredients.suggestCanon('Future Mystery Formula'), null);
  for (const raw of ['GORGIE Energy Drink Mix', 'Energy Drink Powder', 'Huel Daily Greens Ready-to-drink', 'Huel Daily Greens Juice']) {
    assert.equal(ingredients.suggestCanon(raw), null, `${raw} needs a preparation review`);
  }
  assert.equal(ingredients.suggestCanon('Electrolyte Drink Mix'), 'electrolytes');
});

test('consolidation preserves every source variant and counts each smoothie once', () => {
  const labels = ['Huel Daily Greens', 'Vitality Greens', 'Greens Powder'];
  const groups = ingredients.groupIngredients(labels);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].id, 'greens-powder');
  assert.deepEqual([...groups[0].variants], labels);





  for (const [oldId, id] of Object.entries(ingredients.ALIASES)) {
    assert.ok(!ingredients.BY_ID.has(oldId), `${oldId} is both an alias and a profile`);
    assert.ok(ingredients.BY_ID.has(id), `${oldId} aliases a missing profile`);
    assert.ok(!ingredients.ALIASES[id], `${oldId} needs more than one redirect`);
  }
});

test('collagen browsing groups keep actual collagen separate from marketing claims', () => {
  const labels = ['Grass-fed Vanilla Collagen', 'Agent Nateur Marine Collagen', 'Agent Nateur Holi(Mane) Marine Collagen & Pearl Powder'];
  const groups = ingredients.groupIngredients(labels);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].id, 'collagen');
  assert.deepEqual([...groups[0].variants], labels);
  assert.equal(ingredients.matchCanon('Copina Co. Vanilla Plant-based Collagen Boost'), 'plant-creamer');
  assert.equal(ingredients.matchCanon('Biosil collagen'), 'biosil');
  assert.equal(ingredients.suggestCanon('Collagen Ice Cream'), 'ice-cream');
  assert.equal(ingredients.suggestCanon('Collagen Latte Mix'), 'latte-mix');
  for (const raw of ['Vegan Collagen Booster', 'Plant-based Collagen Support', 'Collagen-free Mix']) {
    assert.equal(ingredients.matchCanon(raw), null, `${raw} does not establish collagen or creamer`);
  }
  const containing = smoothies.filter((s) => ingredients.groupIngredients(s.ingredients).some((g) => g.id === 'collagen'));
  assert.equal(new Set(containing.map((s) => s.id)).size, containing.length);
  const malibu = smoothies.find((s) => s.name === 'Malibu Mango Smoothie');
  const collagen = ingredients.groupIngredients(malibu.ingredients).filter((g) => g.id === 'collagen');
  assert.equal(collagen.length, 1);
  assert.equal(collagen[0].variants.length, 2);
});

test('low-use corrections retain useful forms and accept reusable profile names', () => {
  assert.equal(ingredients.matchCanon("Barlean's flax oil"), 'flax-oil');
  assert.equal(ingredients.matchCanon('Flaxseed'), 'flax');
  assert.notEqual(ingredients.BY_ID.get('flax-oil').icon, ingredients.BY_ID.get('flax').icon);
  assert.equal(ingredients.matchCanon('Gold Dust (Keto Brown Sugar & Turmeric)'), 'spiced-sugar');
  assert.equal(ingredients.matchCanon('Gold Dust'), null, 'an unspecified future gold topping needs review');
  assert.equal(ingredients.matchCanon('Harmless Harvest Vanilla Flavored Dairy-Free Cup Yogurt Alternative'), 'coconut-yogurt');
  assert.equal(ingredients.matchCanon('Chia Yogurt'), 'yogurt');
  for (const entry of ingredients.CANON) {
    assert.equal(ingredients.matchCanon(entry.name), entry.id, entry.name);
  }
});
