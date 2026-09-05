// Regenerates data.js from the JSON sources of truth.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

export function renderData(smoothies, menu = null) {
  if (!Array.isArray(smoothies) || smoothies.length === 0) throw new Error('data/smoothies.json is not a non-empty array. Refusing to write.');
  const header = '/* Generated from data/smoothies.json and data/menu.json by scripts/build-data.mjs. Do not edit by hand. */\n';
  let output = header + 'window.SMOOTHIES = ' + JSON.stringify(smoothies, null, 2) + ';\n';
  if (menu) output += 'window.MENU = ' + JSON.stringify(menu, null, 2) + ';\n';
  return output;
}

export function buildData({ repoRoot = DEFAULT_REPO, outputPath = resolve(repoRoot, 'data.js'), check = false } = {}) {
  const smoothies = JSON.parse(readFileSync(resolve(repoRoot, 'data/smoothies.json'), 'utf8'));
  let menu = null;
  try { menu = JSON.parse(readFileSync(resolve(repoRoot, 'data/menu.json'), 'utf8')); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const output = renderData(smoothies, menu);
  if (check) {
    if (readFileSync(outputPath, 'utf8') !== output) throw new Error('data.js is out of date. Run node scripts/build-data.mjs.');
  } else writeFileSync(outputPath, output);
  return smoothies.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes('--check');
  console.log(check ? 'data.js matches' : 'wrote data.js from', buildData({ check }), 'smoothies');
}
