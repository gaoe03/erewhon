// Phase 1 + 2: fetch the current tonic-bar smoothie menu from Erewhon's PUBLIC
// Algolia search index, and map each hit to a candidate.
//
// Credentials are Erewhon's public, search-only Algolia key (the one their own
// site ships to the browser). They are read from the environment, never committed,
// and never touch Erewhon's private ordering backend. Get them from the live site's
// frontend JS. Locally: export ALGOLIA_APP_ID / ALGOLIA_API_KEY / ALGOLIA_INDEX.
// In GitHub Actions: repository secrets.

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_API_KEY;
const INDEX = process.env.ALGOLIA_INDEX || 'GROVE_SEARCH_INDEX';

export async function fetchLiveSmoothies() {
  if (!APP_ID || !API_KEY) throw new Error('Set ALGOLIA_APP_ID and ALGOLIA_API_KEY in the environment.');
  const url = `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': APP_ID,
      'X-Algolia-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params: 'query=smoothie&hitsPerPage=200' }),
  });
  if (!res.ok) throw new Error(`Algolia returned ${res.status}. The key may have rotated, recopy it from the live site.`);
  const data = await res.json();
  // Keep only real tonic-bar smoothies, never groceries.
  return (data.hits || []).filter((h) => h.Department === 'Tonic' && h.Category === 'Smoothies');
}

// subcategory is recorded as metadata, NOT used to guess permanent vs limited.
export function hitToCandidate(hit) {
  return {
    productId: String(hit.objectID),
    name: hit.ProductName,
    price: hit.DisplayPrice ? '$' + hit.DisplayPrice : '',
    subcategory: hit.SubCategory || '',
    brand: hit.BrandName || '',
    imageUrl: hit.ImageFileName || '',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = await fetchLiveSmoothies();
  const candidates = hits.map(hitToCandidate);
  console.log('live smoothie hits:', hits.length);
  for (const c of candidates) console.log(' ', c.productId.padEnd(12), (c.subcategory || '?').padEnd(12), c.name);
}
