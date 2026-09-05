// Phase 6b: apply the dedupe result to the archive.
//  still-live -> update lastSeen
//  rename     -> attach the productId to the legacy entry, update lastSeen
//  relaunch   -> add a new edition and preserve the reused id in the older history
//  new        -> add, with mechanical fields filled and ingredients left for review
// Images for new entries are fetched and staged by run.mjs.
export const slugify = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function makeNewEntry(cand, slug, imagePath, now = new Date()) {
  const seen = now.toISOString().slice(0, 10);
  const namedCollab = cand.name.match(/\bby (.+)$/i)?.[1] || '';
  const collab = namedCollab || (/^erewhon$/i.test(cand.brand) ? '' : cand.brand);
  return {
    id: slug,
    productId: cand.productId,
    image: imagePath,
    name: cand.name,
    collaborator: collab,
    collabType: 'unknown',
    sortKey: Math.round((now.getFullYear() + (now.getMonth() + 0.5) / 12) * 1000) / 1000,
    date: now.toLocaleString('en-US', { month: 'short' }) + ' ' + now.getFullYear(),
    dateKind: 'first-seen',
    era: String(now.getFullYear()),
    status: 'unknown',
    firstSeen: seen,
    lastSeen: seen,
    price: cand.price || '',
    color: '#E7DFCF',
    colorDark: '#B7A98C',
    ingredients: [],
    ingredientsComplete: false,
    notes: '',
    sources: cand.productId ? [`https://erewhon.com/product/${cand.productId}/${slug}`] : [],
    subcategory: cand.subcategory || '',
    needsReview: true,
    reviewReasons: ['New archive entry needs editorial review'],
  };
}

export function planClassifications(archive, candidates, classifications, { now = new Date() } = {}) {
  const bySlug = Object.fromEntries(archive.map((s) => [s.id, s]));
  const summary = { stillLive: 0, rename: 0, relaunch: 0, new: 0, skip: 0, images: 0 };
  const added = [];
  const addedEntries = [];
  const relaunches = [];
  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const cls = classifications[i];
    if (cls.action === 'skip') { summary.skip++; continue; }
    if (cls.action === 'still-live') {
      summary.stillLive++;
      const e = bySlug[cls.matchId];
      e.lastSeen = now.toISOString().slice(0, 10);
      e.price = cand.price;
      e.productId = cand.productId;
      e.productIds = [...new Set([...(e.productIds || []), cand.productId].filter(Boolean))];
      continue;
    }
    if (cls.action === 'rename') {
      summary.rename++;
      const e = bySlug[cls.matchId];
      e.productId = cand.productId;
      e.productIds = [...new Set([...(e.productIds || []), cand.productId].filter(Boolean))];
      e.lastSeen = now.toISOString().slice(0, 10);
      e.price = cand.price;
      continue;
    }
    // new or relaunch -> a new archive entry
    summary[cls.action]++;
    const slug = slugify(cand.name);
    const imagePath = `img/${slug}.jpg`;
    if (cls.action === 'relaunch') {
      // Erewhon reassigned the active listing id. Preserve it in the older edition's
      // productIds history while the current productId points to the live edition.
      const prev = bySlug[cls.reusedFrom];
      relaunches.push({ id: slug, name: cand.name, productId: cand.productId, fromId: cls.reusedFrom, fromName: prev ? prev.name : cls.reusedFrom });
      if (prev && prev.productId === cand.productId) {
        prev.productIds = [...new Set([...(prev.productIds || []), prev.productId].filter(Boolean))];
        prev.productId = '';
      }
    }
    if (bySlug[slug]) throw new Error(`slug collision for ${cand.name}: ${slug}`);
    const entry = makeNewEntry(cand, slug, imagePath, now);
    archive.push(entry);
    bySlug[slug] = entry;
    addedEntries.push(entry);
    added.push(cand.name);
  }
  return { summary, added, addedEntries, relaunches };
}
