// Phase 4: ingredient normalization. Regex matchCanon first (free, deterministic),
// the agent only on what regex misses. A genuinely new ingredient is returned so a
// later step can add it to ingredients.js and flag it in the PR.
import { readFileSync } from 'node:fs';

// Load the site's own canonical matcher (ingredients.js assigns to window).
export function loadArchiveIngredients() {
  const win = {};
  const code = readFileSync(new URL('../ingredients.js', import.meta.url), 'utf8');
  // eslint-disable-next-line no-new-func
  new Function('window', code)(win);
  const A = win.ArchiveIngredients;
  return { matchCanon: A.matchCanon, canon: (A.CANON || []).map((c) => ({ id: c.id, name: c.name })) };
}

// Ingredients come as a comma list ending in an "ALLERGENS:" line. Stop before it.
export function cleanRawIngredients(rawList) {
  const out = [];
  for (const raw of rawList) {
    if (/^\s*allergens\b/i.test(raw)) break;
    const t = String(raw).trim();
    if (t) out.push(t);
  }
  return out;
}

// regex first, agentFn (async, optional) only for misses.
export async function normalizeIngredients(rawList, matchCanon, agentFn) {
  const clean = cleanRawIngredients(rawList);
  const matched = []; // { raw, id, via }
  const newOnes = []; // { raw, proposedName }
  for (const raw of clean) {
    const id = matchCanon(raw);
    if (id) { matched.push({ raw, id, via: 'regex' }); continue; }
    if (agentFn) {
      let a = null;
      try { a = await agentFn(raw); } catch { a = null; } // a flaky model call becomes a miss, never aborts the run
      if (a && a.id) matched.push({ raw, id: a.id, via: 'agent' });
      else newOnes.push({ raw, proposal: (a && a.newEntry) || null });
    } else {
      newOnes.push({ raw, proposal: null });
    }
  }
  return { count: clean.length, matched, newOnes };
}

// The Sonnet agent, used only when a raw ingredient misses the regex. Needs
// ANTHROPIC_API_KEY (a GitHub Actions secret in production). Returns { id } to map
// to an existing canonical ingredient, or { newEntry } (a proposed canon row) when it
// is genuinely new, so add-canon.mjs can append it to ingredients.js for review.
export function makeAgent(canon) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // no key: misses fall through as new + flagged, no auto-add
  const names = canon.map((c) => `${c.id}: ${c.name}`).join('\n');
  const cats = 'fruit veg liquid brew sweet fat super supplement topping branded';
  return async (raw) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 220,
        messages: [{
          role: 'user',
          content: `Canonical ingredients (id: name):\n${names}\n\n`
            + `A smoothie lists this raw ingredient: "${raw}".\n`
            + `If it is the same thing as one canonical ingredient above (a brand or wording variant), reply with EXACTLY that id and nothing else.\n`
            + `If it is genuinely not in the list, reply with ONLY this JSON object:\n`
            + `{"new":true,"name":"<short clean ingredient name>","cat":"<one of: ${cats}>","band":"<everyday|functional|treats>","keyword":"<a lowercase word that appears in the raw string>","blurb":"<one factual sentence>"}`,
        }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const out = (data.content?.[0]?.text || '').trim();
    if (canon.some((c) => c.id === out)) return { id: out }; // bare id -> existing match
    try {
      const j = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
      if (j && j.name) return { newEntry: { name: j.name, cat: j.cat, band: j.band, keyword: j.keyword, blurb: j.blurb } };
    } catch { /* fall through to a derived proposal */ }
    // Neither a known id nor parseable JSON. Still add it: derive a name from the raw
    // string and let add-canon fill the keyword and defaults, so nothing is dropped.
    const name = raw.replace(/\b(organic|vegan|raw|grass-?fed|erewhon|the)\b/gi, '').replace(/\s+/g, ' ').trim();
    return { newEntry: { name: name || raw, cat: '', band: '', keyword: '', blurb: '' } };
  };
}
