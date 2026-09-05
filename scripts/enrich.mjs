// Load the site's reviewed canonical ingredient matcher for pipeline audits.
import { readFileSync } from 'node:fs';

export function loadArchiveIngredients(repoRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '')) {
  const win = {};
  new Function('window', readFileSync(`${repoRoot}/data/ingredient-labels.js`, 'utf8'))(win);
  const code = readFileSync(`${repoRoot}/ingredients.js`, 'utf8');
  // eslint-disable-next-line no-new-func
  new Function('window', code)(win);
  const archive = win.ArchiveIngredients;
  if (!archive || typeof archive.matchCanon !== 'function' || typeof archive.suggestCanon !== 'function'
    || typeof archive.normalizeRaw !== 'function' || !Array.isArray(archive.CANON)) {
    throw new Error('ingredients.js did not expose a valid ArchiveIngredients object');
  }
  return {
    matchCanon: archive.matchCanon,
    suggestCanon: archive.suggestCanon,
    normalizeRaw: archive.normalizeRaw,
    canon: archive.CANON.map((row) => ({ id: row.id, name: row.name, cat: row.cat })),
  };
}
