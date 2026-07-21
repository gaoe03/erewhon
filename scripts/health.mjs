// Phase 7: prove the archive is still valid before proposing a merge. Errors block
// the run; ingredient warnings surface in the PR (a new ingredient to add to the canon).
import { readFileSync, existsSync } from 'node:fs';
import { loadArchiveIngredients } from './enrich.mjs';

export function healthCheck(repoRoot) {
  const errors = [];
  const warns = [];
  let arr;
  try { arr = JSON.parse(readFileSync(`${repoRoot}/data/smoothies.json`, 'utf8')); }
  catch (e) { return { ok: false, errors: ['smoothies.json does not parse: ' + e.message] }; }
  if (!Array.isArray(arr) || arr.length === 0) errors.push('not a non-empty array');

  const ids = arr.map((s) => s.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate id');
  const pids = arr.map((s) => s.productId).filter(Boolean);
  if (new Set(pids).size !== pids.length) errors.push('duplicate productId');

  const { matchCanon } = loadArchiveIngredients();
  for (const s of arr) {
    if (s.image && !existsSync(`${repoRoot}/${s.image}`)) errors.push(`missing image file ${s.image} (${s.id})`);
    for (const ing of s.ingredients || []) if (!matchCanon(ing)) warns.push(`unresolved ingredient "${ing}" in ${s.id}`);
  }
  return { ok: errors.length === 0, count: arr.length, errors, warns };
}
