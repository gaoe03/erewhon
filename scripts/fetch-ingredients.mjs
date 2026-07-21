// Phase 4a: fetch a new drink's ingredient list from its PUBLIC product page.
// The page is client-side rendered, so we render it as a normal visitor with a
// headless browser, click the INGREDIENTS tab, and read the list. Returns an array
// of raw ingredient strings (as the archive stores them), or null on failure.
//
// Playwright is installed in the GitHub Actions runner, not committed to the repo,
// so the static site and its Vercel deploy are untouched. Locally, if Playwright is
// not installed the fetch returns null and the drink lands flagged for review.

export function parseIngredients(block) {
  if (!block) return null;
  let s = block.replace(/^[\s\S]*?\bINGREDIENTS\b/i, ''); // drop the tab header and anything before it
  s = s.split(/ALLERGENS/i)[0]; // ingredients only, never allergens
  const parts = s
    .split(',')
    .map((x) => x.trim().replace(/^(and |topped with )\s*/i, '').replace(/[.\s]+$/, '').trim())
    .filter((p) => p.length > 1 && p.length < 60);
  // a sane ingredient list is a handful of items; anything outside that is a broken
  // scrape (a layout change or the wrong text block), so return nothing and leave it for review
  return parts.length >= 2 && parts.length <= 30 ? parts : null;
}

export async function fetchIngredients(productId, slug, { timeoutMs = 30000 } = {}) {
  let chromium;
  try { const pw = await import('playwright'); chromium = pw.chromium || pw.default?.chromium; }
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
      const els = [...document.querySelectorAll('div,section,p,li,span')];
      let best = '';
      for (const el of els) {
        const t = (el.innerText || '').trim();
        if (/allergen|organic|collagen/i.test(t) && t.length > best.length && t.length < 1500) best = t;
      }
      return best;
    });
    return parseIngredients(block);
  } catch { return null; }
  finally { await browser.close(); }
}
