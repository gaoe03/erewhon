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
      const a = await agentFn(raw);
      if (a && a.id) matched.push({ raw, id: a.id, via: 'agent' });
      else newOnes.push({ raw, proposedName: (a && a.newName) || raw });
    } else {
      newOnes.push({ raw, proposedName: raw });
    }
  }
  return { count: clean.length, matched, newOnes };
}

// The real agent, used only when a raw ingredient misses the regex. Needs
// ANTHROPIC_API_KEY (a GitHub Actions secret in production). Returns { id } to map
// to an existing canonical ingredient, or { newName } if it is genuinely new.
export function makeAgent(canon) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // no key: misses fall through as new + flagged
  const names = canon.map((c) => `${c.id}: ${c.name}`).join('\n');
  return async (raw) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 40,
        messages: [{
          role: 'user',
          content: `Canonical ingredients (id: name):\n${names}\n\nRaw ingredient: "${raw}"\n`
            + `Reply with ONLY the matching id, or the word NEW if none fits.`,
        }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const out = (data.content?.[0]?.text || '').trim();
    if (!out || out.toUpperCase() === 'NEW') return { newName: raw };
    return canon.some((c) => c.id === out) ? { id: out } : { newName: raw };
  };
}
