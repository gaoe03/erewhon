// Offline validation for archive, menu snapshot, generated browser data and images.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadArchiveIngredients } from './enrich.mjs';
import { imageType } from './images.mjs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function parseGeneratedData(source) {
  const win = {};
  // eslint-disable-next-line no-new-func
  new Function('window', source)(win);
  return { smoothies: win.SMOOTHIES, menu: win.MENU || null };
}

export function healthCheck(repoRoot, options = {}) {
  const errors = [];
  const warns = [];
  let arr = options.smoothies;
  let menu = options.menu;
  let generated = options.dataJs;
  try {
    arr ??= readJson(resolve(repoRoot, 'data/smoothies.json'));
    if (menu === undefined) menu = readJson(resolve(repoRoot, 'data/menu.json'));
    generated ??= readFileSync(resolve(repoRoot, 'data.js'), 'utf8');
  } catch (error) {
    return { ok: false, count: 0, errors: ['source artifact does not parse: ' + error.message], warns };
  }
  if (!Array.isArray(arr) || arr.length === 0) errors.push('smoothies is not a non-empty array');
  const ids = Array.isArray(arr) ? arr.map((s) => s.id) : [];
  if (new Set(ids).size !== ids.length) errors.push('duplicate archive id');

  let matchCanon = () => null;
  try {
    const loaded = loadArchiveIngredients(repoRoot);
    matchCanon = loaded.matchCanon;
    const canonIds = loaded.canon.map((c) => c.id);
    if (new Set(canonIds).size !== canonIds.length) errors.push('duplicate canonical ingredient id');
  } catch (error) { errors.push('ingredients.js does not load: ' + error.message); }

  const imageReader = options.readImage || ((relativePath) => {
    const path = resolve(repoRoot, relativePath);
    return existsSync(path) ? readFileSync(path) : null;
  });
  for (const s of Array.isArray(arr) ? arr : []) {
    if (!s || typeof s !== 'object' || !s.id || !s.name || !Array.isArray(s.ingredients) || !Array.isArray(s.sources)) {
      errors.push(`invalid smoothie shape for ${s?.id || 'unknown row'}`);
      continue;
    }
    if (s.ingredients.some((ingredient) => typeof ingredient !== 'string' || !ingredient.trim())) errors.push(`invalid ingredient value in ${s.id}`);
    if (s.sources.some((source) => typeof source !== 'string' || !/^https?:\/\//.test(source))) errors.push(`invalid source URL in ${s.id}`);
    if (s.image) {
      const bytes = imageReader(s.image);
      if (!bytes) errors.push(`missing image file ${s.image} (${s.id})`);
      else {
        const actual = imageType(bytes);
        const expected = s.image.toLowerCase().split('.').pop();
        if (!actual || (expected === 'jpeg' ? 'jpg' : expected) !== actual) errors.push(`image extension does not match bytes for ${s.image}`);
      }
    }
    for (const ingredient of s.ingredients) if (!matchCanon(ingredient)) warns.push(`unresolved ingredient "${ingredient}" in ${s.id}`);
    if (s.needsReview && (!Array.isArray(s.reviewReasons) || s.reviewReasons.length === 0)) warns.push(`${s.id} needs review but has no review reason`);
  }

  if (!menu || typeof menu.checkedAt !== 'string' || Number.isNaN(Date.parse(menu.checkedAt)) || !/^https?:\/\//.test(menu.source)
    || menu.scope !== 'Grove online tonic bar menu' || menu.index !== 'GROVE_SEARCH_INDEX' || !Array.isArray(menu.smoothieIds)) {
    errors.push('menu snapshot has an invalid shape');
  } else {
    if (new Set(menu.smoothieIds).size !== menu.smoothieIds.length) errors.push('menu contains duplicate smoothie ids');
    for (const id of menu.smoothieIds) if (!ids.includes(id)) errors.push(`menu references missing smoothie ${id}`);
  }

  try {
    const parsed = parseGeneratedData(generated);
    if (JSON.stringify(parsed.smoothies) !== JSON.stringify(arr)) errors.push('data.js smoothies do not match data/smoothies.json');
    if (JSON.stringify(parsed.menu) !== JSON.stringify(menu)) errors.push('data.js menu does not match data/menu.json');
  } catch (error) { errors.push('data.js does not execute: ' + error.message); }
  return { ok: errors.length === 0, count: ids.length, errors, warns };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repoRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  const result = healthCheck(repoRoot);
  console.log(`health: ${result.ok ? 'OK' : 'FAIL'} | ${result.count} smoothies | ${result.warns.length} warnings`);
  for (const error of result.errors) console.error('ERROR:', error);
  for (const warning of result.warns) console.warn('WARN:', warning);
  if (!result.ok) process.exitCode = 1;
}
