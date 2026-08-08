import sharp from 'sharp';

// S4 — normalize a downloaded logo to 256x256 WebP (locked decision D1).
// fit:'contain' on a transparent canvas matches the profile page's
// object-contain rendering — no cropping or stretching. Local CPU only,
// adds no network traffic and does not touch Neon.

export async function normalizeLogoImage(buffer) {
  return sharp(buffer)
    .resize(256, 256, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .webp()
    .toBuffer();
}
