// Regenerates data.js from data/smoothies.json (the source of truth).
// Run: node scripts/build-data.mjs
// The browser still loads a plain data.js, so the site stays zero-build.
import { readFileSync, writeFileSync } from 'node:fs';

export function buildData() {
  const arr = JSON.parse(readFileSync(new URL('../data/smoothies.json', import.meta.url), 'utf8'));
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('data/smoothies.json is not a non-empty array. Refusing to write.');
  }
  const header = '/* Generated from data/smoothies.json by scripts/build-data.mjs. Do not edit by hand. */\n';
  writeFileSync(new URL('../data.js', import.meta.url), header + 'window.SMOOTHIES = ' + JSON.stringify(arr, null, 2) + ';\n');
  return arr.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('wrote data.js from', buildData(), 'smoothies');
}
