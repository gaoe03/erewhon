// Phase 5: fail loud. Refuse to proceed if the fetch looks wrong, so a backend
// hiccup can never corrupt the archive. On any error the run aborts and writes nothing.
export function checkGuards(candidates, classifications, { previousMenu = null, sourceMeta = null } = {}) {
  const errors = [];
  const ids = candidates.map((c) => c.productId);
  if (new Set(ids).size !== ids.length) errors.push('candidate product ids are not unique');
  const names = candidates.map((c) => String(c.name || '').trim().toLowerCase());
  if (new Set(names).size !== names.length) errors.push('candidate names are not unique');
  if (sourceMeta && sourceMeta.pages > 0 && sourceMeta.queryHits < sourceMeta.tonicSmoothieHits) {
    errors.push('source pagination counts are inconsistent');
  }
  if (sourceMeta && previousMenu?.index && sourceMeta.index !== previousMenu.index) {
    errors.push(`source index ${sourceMeta.index} does not match snapshot index ${previousMenu.index}`);
  }
  const previousCount = previousMenu?.smoothieIds?.length || 0;
  const floor = previousCount ? Math.max(1, Math.floor(previousCount * 0.65)) : 15;
  if (candidates.length < floor) errors.push(`only ${candidates.length} smoothies returned, expected at least ${floor}`);
  const newCount = classifications.filter((c) => c.action === 'new').length;
  const changeLimit = Math.max(5, Math.ceil((previousCount || candidates.length) * 0.3));
  if (newCount > changeLimit) errors.push(`${newCount} new at once, expected ${changeLimit} or fewer`);
  if (previousCount) {
    const matched = new Set(classifications.map((c) => c.matchId).filter(Boolean));
    const removals = previousMenu.smoothieIds.filter((id) => !matched.has(id)).length;
    const removalLimit = Math.max(5, Math.ceil(previousCount * 0.35));
    if (removals > removalLimit) errors.push(`${removals} removals at once, expected ${removalLimit} or fewer`);
  }
  const missing = candidates.filter((c) => !c.productId || !c.name || !c.price || !c.source || typeof c.source !== 'object').length;
  if (missing) errors.push(`${missing} candidate(s) have an incomplete source shape`);
  const invalidPrices = candidates.filter((c) => !/^\$\d+(?:\.\d{1,2})?$/.test(c.price)).length;
  if (invalidPrices) errors.push(`${invalidPrices} candidate(s) have an invalid price`);
  return { ok: errors.length === 0, errors };
}
