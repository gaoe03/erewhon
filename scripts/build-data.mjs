// Regenerates data.js from data/smoothies.json (the source of truth).
// Run: node scripts/build-data.mjs
// The browser still loads a plain data.js, so the site stays zero-build.
import { readFileSync, writeFileSync } from 'node:fs';

const jsonPath = new URL('../data/smoothies.json', import.meta.url);
const outPath = new URL('../data.js', import.meta.url);

const arr = JSON.parse(readFileSync(jsonPath, 'utf8'));
if (!Array.isArray(arr) || arr.length === 0) {
  console.error('data/smoothies.json is not a non-empty array. Refusing to write.');
  process.exit(1);
}

const header = '/* Generated from data/smoothies.json by scripts/build-data.mjs. Do not edit by hand. */\n';
writeFileSync(outPath, header + 'window.SMOOTHIES = ' + JSON.stringify(arr, null, 2) + ';\n');
console.log('wrote data.js from', arr.length, 'smoothies');
