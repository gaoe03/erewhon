// Download a product image and retain the extension identified from its bytes.
// Reject non-images and tiny error pages before any archive file is written.
export function imageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

export async function fetchImage(url, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(url);
  if (!res.ok) return { status: 'failed', reason: `http ${res.status}` };
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) return { status: 'failed', reason: `not an image (${ct})` };
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < 2000) return { status: 'failed', reason: `too small (${bytes.length} bytes)` };
  const extension = imageType(bytes);
  if (!extension) return { status: 'failed', reason: 'unrecognized image bytes' };
  return { status: 'downloaded', bytes, extension };
}
