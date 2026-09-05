// Phase 4a: fetch a new drink's ingredient list from its PUBLIC product page.
// The page is client-side rendered, so we render it as a normal visitor with a
// headless browser, click the INGREDIENTS tab, and read the list. Returns an array
// of raw ingredient strings (as the archive stores them), or null on failure.
//
// Playwright is installed in the GitHub Actions runner, not committed to the repo,
// so the static site and its Vercel deploy are untouched. Locally, if Playwright is
// not installed the fetch returns null and the drink lands flagged for review.

import { loadArchiveIngredients } from './enrich.mjs';

const { matchCanon } = loadArchiveIngredients();
const cleanLabel = (value) => value.trim().replace(/^(?:and|topped with)\s+/i, '').replace(/[.\s]+$/, '').trim();

export function parseIngredients(block, { matchIngredient = matchCanon } = {}) {
  if (!block) return null;
  let s = String(block).trim();
  if (/\bINGREDIENTS\b/i.test(s)) s = s.replace(/^[\s\S]*?\bINGREDIENTS\b\s*:*/i, '');
  s = s.split(/(?:^|\n|[.])\s*(?:ALLERGENS?|CONTAINS)\s*:?\s/i)[0].trim();
  if (!s || s.length > 5000) return null;
  const parts = [];
  let current = '';
  let depth = 0;
  for (const char of s) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) return null;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += char;
  }
  if (depth !== 0) return null;
  parts.push(current);
  const last = cleanLabel(parts.pop() || '');
  const splits = [];
  depth = 0;
  for (let i = 0; i < last.length; i++) {
    if (last[i] === '(') depth++;
    if (last[i] === ')') depth--;
    const rest = last.slice(i);
    const separator = depth === 0 && rest.match(/^\s+and\s+/i);
    if (!separator || matchIngredient(last)) continue;
    const left = cleanLabel(last.slice(0, i));
    const right = cleanLabel(last.slice(i + separator[0].length));
    if (matchIngredient(left) && matchIngredient(right)) splits.push([left, right]);
  }
  // Only split a final conjunction when both complete labels are approved.
  // A product such as Greens and Collagen stays intact. Ambiguous new wording
  // stays raw for mapping review instead of inventing separate components.
  parts.push(...(splits.length === 1 ? splits[0] : [last]));
  const clean = parts
    .map(cleanLabel)
    .filter(Boolean);
  // a sane ingredient list is a handful of items; anything outside that is a broken
  // scrape (a layout change or the wrong text block), so return nothing and leave it for review
  if (clean.some((p) => p.length < 2 || p.length > 250 || /\b(?:allergens?|contains)\s*:/i.test(p))) return null;
  return clean.length >= 2 && clean.length <= 40 ? clean : null;
}

export async function fetchIngredients(productId, slug, { timeoutMs = 30000, chromium: injectedChromium, matchIngredient = matchCanon } = {}) {
  let chromium;
  if (injectedChromium) chromium = injectedChromium;
  else try { const pw = await import('playwright'); chromium = pw.chromium || pw.default?.chromium; }
  catch { return null; }
  if (!chromium) return null;
  const url = `https://erewhon.com/product/${productId}/${slug}`;
  let browser;
  try { browser = await chromium.launch({ channel: 'chrome' }); } // system Chrome (local)
  catch { try { browser = await chromium.launch(); } catch { return null; } } // bundled (Actions runner)
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });
    try { await page.getByText(/^\s*ingredients\s*$/i).first().click({ timeout: 5000 }); } catch { /* tab already shown */ }
    await page.waitForTimeout(1200);
    const block = await page.evaluate(() => {
      const panel = document.querySelector('#product-tabs-tabpane-nutri, [role="tabpanel"][aria-labelledby="product-tabs-tab-nutri"]');
      if (!panel) return '';
      return (panel.innerText || '').trim();
    });
    return parseIngredients(block, { matchIngredient });
  } catch { return null; }
  finally { await browser.close(); }
}
