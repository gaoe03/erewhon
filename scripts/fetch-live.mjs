// Phase 1 + 2: fetch the current tonic-bar smoothie menu from Erewhon's PUBLIC
// Algolia search index, and map each hit to a candidate.
//
// Credentials are Erewhon's public, search-only Algolia key (the one their own
// site ships to the browser). They are read from the environment, never committed,
// and never touch Erewhon's private ordering backend. Get them from the live site's
// frontend JS. Locally: export ALGOLIA_APP_ID / ALGOLIA_API_KEY / ALGOLIA_INDEX.
// In GitHub Actions: repository secrets.

export async function fetchLiveSmoothies({
  fetchImpl = fetch,
  appId = process.env.ALGOLIA_APP_ID,
  apiKey = process.env.ALGOLIA_API_KEY,
  index = process.env.ALGOLIA_INDEX || 'GROVE_SEARCH_INDEX',
  hitsPerPage = 100,
} = {}) {
  if (!appId || !apiKey) throw new Error('Set ALGOLIA_APP_ID and ALGOLIA_API_KEY in the environment.');
  const url = `https://${appId}-dsn.algolia.net/1/indexes/${index}/query`;
  const allHits = [];
  let page = 0;
  let expectedPages = 1;
  let reportedHits = null;
  do {
    const params = new URLSearchParams({ query: 'smoothie', hitsPerPage: String(hitsPerPage), page: String(page) });
    const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params: params.toString() }),
    });
    if (!res.ok) throw new Error(`Algolia returned ${res.status}. The key may have rotated, recopy it from the live site.`);
    const data = await res.json();
    if (!Array.isArray(data.hits) || !Number.isInteger(data.nbPages) || data.nbPages < 1 || data.nbPages > 100
      || !Number.isInteger(data.nbHits) || !Number.isInteger(data.page) || data.page !== page) {
      throw new Error('Algolia response is missing pagination metadata or hits.');
    }
    if (page === 0) {
      expectedPages = data.nbPages;
      reportedHits = data.nbHits;
    } else if (data.nbPages !== expectedPages || data.nbHits !== reportedHits) {
      throw new Error('Algolia pagination changed during the fetch. Retry the refresh.');
    }
    allHits.push(...data.hits);
    page++;
  } while (page < expectedPages);

  if (Number.isInteger(reportedHits) && allHits.length !== reportedHits) {
    throw new Error(`Algolia pagination returned ${allHits.length} of ${reportedHits} reported hits.`);
  }
  // Keep only real tonic-bar smoothies, never groceries.
  const hits = allHits.filter((h) => h.Department === 'Tonic' && h.Category === 'Smoothies');
  Object.defineProperty(hits, 'sourceMeta', {
    enumerable: false,
    value: { index, pages: expectedPages, queryHits: allHits.length, tonicSmoothieHits: hits.length },
  });
  return hits;
}

// subcategory is recorded as metadata, NOT used to guess permanent vs limited.
export function hitToCandidate(hit) {
  return {
    productId: hit.objectID == null ? '' : String(hit.objectID),
    name: typeof hit.ProductName === 'string' ? hit.ProductName.trim() : '',
    price: hit.DisplayPrice ? '$' + hit.DisplayPrice : '',
    subcategory: hit.SubCategory || '',
    brand: hit.BrandName || '',
    imageUrl: hit.ImageFileName || '',
    source: hit,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = await fetchLiveSmoothies();
  const candidates = hits.map(hitToCandidate);
  console.log('live smoothie hits:', hits.length);
  for (const c of candidates) console.log(' ', c.productId.padEnd(12), (c.subcategory || '?').padEnd(12), c.name);
}
