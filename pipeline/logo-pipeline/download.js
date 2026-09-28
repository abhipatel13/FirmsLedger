import { fetchBounded } from './discover.js';

// S3 — logo image fetch + validation. 3MB cap, 10s timeout, <=5 redirects.
// Requires content-type image/* AND a magic-byte check on the body. Rejects
// images under 16px in either dimension.

const IMAGE_CAP_BYTES = 3 * 1024 * 1024; // 3MB response cap
const IMAGE_TIMEOUT_MS = 10_000;
const MIN_DIMENSION = 16;
// Favicons are routinely 16 or 32px. Upscaling those to 256 produces a blurry
// smear (see the first ace-solar run), so icon sources get a higher floor.
// SVG/AVIF report no dimensions and skip the check entirely.
const MIN_ICON_DIMENSION = 64;

function jpegDimensions(buf) {
  let offset = 2;
  while (offset + 9 <= buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
      offset += 2;
      continue;
    }
    // SOF0..SOF15 (excluding DHT C4, JPEG extensions C8, DAC CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return null;
}

function webpDimensions(buf) {
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8 ') {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (fourcc === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (fourcc === 'VP8X') {
    return {
      width: (buf.readUInt32LE(24) & 0xffffff) + 1,
      height: (buf.readUInt32LE(28) & 0xffffff) + 1,
    };
  }
  return null;
}

/**
 * Identify an image from its magic bytes (never trust content-type alone).
 * Returns { format, width, height } or null if not a recognized image.
 * width/height are undefined for formats without an easy header dimension
 * (SVG, AVIF) — those skip the min-size check.
 */
export function detectImageFormat(buf) {
  if (!buf || buf.length < 12) return null;

  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { format: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    const dims = jpegDimensions(buf);
    return {
      format: 'jpeg',
      width: dims ? dims.width : undefined,
      height: dims ? dims.height : undefined,
    };
  }
  if (buf.toString('ascii', 0, 4) === 'GIF8') {
    return { format: 'gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const dims = webpDimensions(buf);
    return {
      format: 'webp',
      width: dims ? dims.width : undefined,
      height: dims ? dims.height : undefined,
    };
  }
  if (buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1 && buf.length >= 8) {
    const count = buf.readUInt16LE(4);
    if (count > 0) {
      return { format: 'ico', width: buf[6] || 256, height: buf[7] || 256 };
    }
  }
  if (buf.toString('ascii', 0, 2) === 'BM') {
    return { format: 'bmp', width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)) };
  }
  if (buf.length >= 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12).toLowerCase();
    if (brand === 'avif' || brand === 'avis') {
      return { format: 'avif', width: undefined, height: undefined };
    }
  }
  const head = buf.slice(0, 4096).toString('utf8').replace(/^\uFEFF/, '').trimStart();
  if ((head.startsWith('<') || head.startsWith('<?xml') || head.startsWith('<!DOCTYPE')) && /<svg[\s>]/i.test(head)) {
    return { format: 'svg', width: undefined, height: undefined };
  }

  return null;
}

/**
 * Download and validate a candidate logo image.
 * Returns { ok:true, buffer, format } or { ok:false, error, retryable }.
 * retryable=true only for transient failures (network/timeout/5xx/429).
 */
export async function downloadImage(url, { minDimension = MIN_DIMENSION } = {}) {
  const res = await fetchBounded(url, {
    maxBytes: IMAGE_CAP_BYTES,
    timeoutMs: IMAGE_TIMEOUT_MS,
    headers: {
      Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
    },
  });
  if (!res.ok) return res;

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!ct.startsWith('image/')) {
    return { ok: false, error: `content-type "${ct || '(missing)'}" is not image/*`, retryable: false };
  }

  const info = detectImageFormat(res.body);
  if (!info) {
    return { ok: false, error: 'body failed magic-byte check (not a recognized image)', retryable: false };
  }
  if (info.width != null && info.height != null && (info.width < minDimension || info.height < minDimension)) {
    return { ok: false, error: `image too small (${info.width}x${info.height})`, retryable: false };
  }

  return { ok: true, buffer: res.body, format: info.format };
}

export { MIN_DIMENSION, MIN_ICON_DIMENSION };
