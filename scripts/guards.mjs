// Phase 5: fail loud. Refuse to proceed if the fetch looks wrong, so a backend
// hiccup can never corrupt the archive. On any error the run aborts and writes nothing.
export function checkGuards(candidates, classifications) {
  const errors = [];
  if (candidates.length < 15) errors.push(`only ${candidates.length} smoothies returned, expected 15 or more`);
  const newCount = classifications.filter((c) => c.action === 'new').length;
  if (newCount > 5) errors.push(`${newCount} new at once, expected 5 or fewer (likely schema drift, not real launches)`);
  const missing = candidates.filter((c) => !c.productId || !c.name).length;
  if (missing) errors.push(`${missing} candidate(s) missing a productId or name`);
  return { ok: errors.length === 0, errors };
}
