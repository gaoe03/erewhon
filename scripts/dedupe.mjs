// Phase 3: classify each live candidate against the archive.
// productId is a JOIN HINT, not a unique key: Erewhon reuses listing ids across
// relaunches, so a matching id with a changed name is a new edition, not "still live".
// The archive's own slug `id` is the real primary key.

// Build-your-own and other non-smoothies to never ingest.
export const EXCLUDE = new Set(['6852951000']); // Custom Smoothie

export function normName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\bsmoothie\b/g, '')
    .replace(/\borganic\b/g, '')
    .replace(/\bby [a-z0-9 .'-]+$/i, '') // "by Jolie", "by Simplehuman"
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// returns one of: skip | still-live | relaunch | rename | new
export function classify(cand, archive) {
  if (EXCLUDE.has(cand.productId)) return { action: 'skip', reason: 'exclude list' };

  const byPid = archive.filter((s) => s.productId && s.productId === cand.productId);
  if (byPid.length) {
    const sameName = byPid.find((s) => normName(s.name) === normName(cand.name));
    if (sameName) return { action: 'still-live', matchId: sameName.id };
    return { action: 'relaunch', reusedFrom: byPid[0].id };
  }

  // no id match: fall back to fuzzy name, mainly to catch legacy entries with no productId
  const nn = normName(cand.name);
  const fuzzy = archive.find((s) => normName(s.name) === nn);
  if (fuzzy) return { action: 'rename', matchId: fuzzy.id };

  return { action: 'new' };
}
