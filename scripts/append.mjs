// Phase 6b: apply the dedupe result to the archive.
//  still-live -> update lastSeen
//  rename     -> attach the productId to the legacy entry, update lastSeen
//  relaunch   -> add a new edition and hand the reused id to it (the older entry keeps
//                its copy in retiredProductId, so productId stays unique)
//  new        -> add, with mechanical fields filled and ingredients left for review
// Images for new/relaunch are downloaded to img/<slug>.jpg (skip if present).
import { downloadImage } from './images.mjs';

const today = () => new Date().toISOString().slice(0, 10);
const slugify = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function makeNewEntry(cand, slug, imagePath) {
  const now = new Date();
  const collab = cand.brand || (cand.name.match(/\bby (.+)$/i)?.[1] || '');
  return {
    id: slug,
    productId: cand.productId,
    image: imagePath,
    name: cand.name,
    collaborator: collab,
    collabType: collab ? 'unknown' : 'house',
    sortKey: Math.round((now.getFullYear() + (now.getMonth() + 0.5) / 12) * 1000) / 1000,
    date: now.toLocaleString('en-US', { month: 'short' }) + ' ' + now.getFullYear(),
    era: String(now.getFullYear()),
    status: 'limited', // provisional; longevity confirms permanent later
    firstSeen: today(),
    lastSeen: today(),
    price: cand.price || '',
    color: '#E7DFCF',
    colorDark: '#B7A98C',
    ingredients: [],
    ingredientsComplete: false,
    notes: '',
    sources: cand.productId ? [`https://erewhon.com/product/${cand.productId}/${slug}`] : [],
    subcategory: cand.subcategory || '',
    needsReview: true,
  };
}

export async function applyClassifications(archive, candidates, classifications, { imgDir, apply }) {
  const bySlug = Object.fromEntries(archive.map((s) => [s.id, s]));
  const summary = { stillLive: 0, rename: 0, relaunch: 0, new: 0, skip: 0, images: 0 };
  const added = [];
  const addedEntries = [];
  const relaunches = [];
  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const cls = classifications[i];
    if (cls.action === 'skip') { summary.skip++; continue; }
    if (cls.action === 'still-live') { summary.stillLive++; if (apply) bySlug[cls.matchId].lastSeen = today(); continue; }
    if (cls.action === 'rename') {
      summary.rename++;
      if (apply) { const e = bySlug[cls.matchId]; if (!e.productId) e.productId = cand.productId; e.lastSeen = today(); }
      continue;
    }
    // new or relaunch -> a new archive entry
    summary[cls.action]++;
    const slug = slugify(cand.name);
    const imagePath = `img/${slug}.jpg`;
    if (cls.action === 'relaunch') {
      // Erewhon reassigned the listing id, so the archive follows it: the newer drink
      // owns productId and the displaced entry keeps its copy in retiredProductId. That
      // keeps productId unique (health.mjs stays strict) and lets the displaced drink
      // fall off as discontinued on the next run instead of looking live forever.
      const prev = bySlug[cls.reusedFrom];
      relaunches.push({ id: slug, name: cand.name, productId: cand.productId, fromId: cls.reusedFrom, fromName: prev ? prev.name : cls.reusedFrom });
      if (apply && prev && prev.productId === cand.productId) { prev.retiredProductId = prev.productId; prev.productId = ''; }
    }
    if (apply && cand.imageUrl) {
      const r = await downloadImage(cand.imageUrl, `${imgDir}/${slug}.jpg`);
      if (r.status === 'downloaded' || r.status === 'skipped') summary.images++;
    }
    if (apply) { const entry = makeNewEntry(cand, slug, imagePath); archive.push(entry); addedEntries.push(entry); }
    added.push(cand.name);
  }
  return { summary, added, addedEntries, relaunches };
}
