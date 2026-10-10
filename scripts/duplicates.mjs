// Flag new archive entries that may repeat a drink already in the archive.
// Code finds candidates by recipe overlap and name. Jev, TypeSafe's judgment model,
// rates each pair. Nothing is merged automatically. A person decides in the PR.
import { normName } from './dedupe.mjs';
import { TransientError, transientStatus, withRetry } from './retry.mjs';

export const RECIPE_OVERLAP = 0.4;
// Calibrated in October 2026 on eight archive pairs. Renames scored 0.83 and 0.85,
// separate releases and unrelated drinks 0.10 to 0.25, and Fall in Love against
// Love Your Gut, a reworked yearly collab, 0.66.
export const LIKELY_SAME = 0.75;
export const UNCLEAR = 0.5;

const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone';
const QUESTION = 'Is `new_listing` the same smoothie menu item as `archived_drink`, continuing under a changed or reworded name? A separate release counts as a different item, such as a later yearly edition, a numbered sequel, or another drink that shares many ingredients.';
const CRITERIA = {
  true: 'The same continuing menu item. Only the name, price or ingredient wording changed.',
  false: 'A different drink or a separate release.',
};

const tokens = (name) => normName(name).split(' ').filter(Boolean);

function nameContains(a, b) {
  const [short, long] = [tokens(a), tokens(b)].sort((x, y) => x.length - y.length);
  return short.length > 0 && short.every((t) => long.includes(t));
}

export function findCandidates(entry, archive, labelKey, { limit = 3 } = {}) {
  const mine = new Set((entry.ingredients || []).map(labelKey));
  return archive
    .filter((drink) => drink.id !== entry.id)
    .map((drink) => {
      const theirs = new Set((drink.ingredients || []).map(labelKey));
      const union = new Set([...mine, ...theirs]).size;
      const shared = [...mine].filter((k) => theirs.has(k)).length;
      return { drink, shared, union, overlap: union ? shared / union : 0, nameMatch: nameContains(entry.name, drink.name) };
    })
    .filter((c) => c.overlap >= RECIPE_OVERLAP || c.nameMatch)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit);
}

export async function judgeCandidates(entry, candidates, { apiKey, previousMenuIds = [], fetchImpl = fetch, retry = {} }) {
  const questions = Object.fromEntries(candidates.map((c, i) => [`same_${i}`, {
    type: 'noul',
    instructions: {
      archived_drink: {
        name: c.drink.name,
        collaborator: c.drink.collaborator || '',
        date: c.drink.date || '',
        lastSeen: c.drink.lastSeen || '',
        onPreviousMenu: previousMenuIds.includes(c.drink.id),
        price: c.drink.price || '',
        ingredients: c.drink.ingredients || [],
      },
      question: QUESTION,
    },
    criteria: CRITERIA,
  }]));
  const body = JSON.stringify({
    model: 'jev-latest',
    state: { new_listing: { name: entry.name, price: entry.price || '', firstSeen: entry.firstSeen || '', ingredients: entry.ingredients || [] } },
    questions,
  });
  const res = await withRetry(async () => {
    const response = await fetchImpl(TYPESAFE_URL, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body });
    if (transientStatus(response.status)) throw new TransientError(`TypeSafe returned ${response.status}`);
    return response;
  }, retry);
  if (!res.ok) throw new Error(`TypeSafe returned ${res.status}`);
  const data = await res.json();
  return candidates.map((_, i) => {
    const value = data?.answers?.[`same_${i}`]?.noul;
    if (typeof value !== 'number') throw new Error('TypeSafe response is missing an answer');
    return value;
  });
}

// A failed or missing Jev check never stops the refresh. Every candidate is then flagged.
export async function checkDuplicates(entries, archive, { labelKey, apiKey, previousMenuIds, fetchImpl, retry } = {}) {
  const results = [];
  for (const entry of entries) {
    const candidates = findCandidates(entry, archive, labelKey);
    if (!candidates.length) continue;
    let scores = null;
    let error = apiKey ? null : 'no TypeSafe key configured';
    if (apiKey) {
      try { scores = await judgeCandidates(entry, candidates, { apiKey, previousMenuIds, fetchImpl, retry }); } catch (e) { error = e.message; }
    }
    results.push({
      entry,
      error,
      candidates: candidates.map((c, i) => {
        const same = scores ? scores[i] : null;
        return { ...c, same, flagged: same === null || same >= UNCLEAR || c.overlap === 1 };
      }),
    });
  }
  return results;
}

export function describeCandidate(c) {
  const overlap = `shares ${c.shared} of the ${c.union} ingredients across both recipes`;
  if (c.same === null) return `${c.drink.name} ${overlap}${c.nameMatch ? ' and a similar name' : ''}.`;
  const verdict = c.same >= LIKELY_SAME ? 'likely the same drink' : c.same >= UNCLEAR ? 'unclear' : 'likely a different drink';
  return `${c.drink.name} ${overlap}. Jev rates it ${verdict} (${Math.round(c.same * 100)}%).`;
}
