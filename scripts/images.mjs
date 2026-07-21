// Phase 6: download a product image to img/<slug>.jpg. Skip if it already exists,
// and never save a non-image or a tiny error page.
import { existsSync, writeFileSync, statSync } from 'node:fs';

export async function downloadImage(url, destPath) {
  if (existsSync(destPath) && statSync(destPath).size > 2000) return { status: 'skipped', destPath };
  const res = await fetch(url);
  if (!res.ok) return { status: 'failed', reason: `http ${res.status}` };
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) return { status: 'failed', reason: `not an image (${ct})` };
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) return { status: 'failed', reason: `too small (${buf.length} bytes)` };
  writeFileSync(destPath, buf);
  return { status: 'downloaded', bytes: buf.length, destPath };
}
