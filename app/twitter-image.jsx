// Same artwork as the Open Graph image; X/Twitter reads twitter:image.
// The config exports are repeated, not re-exported: Next reads them statically.
import OpenGraphImage from './opengraph-image';

export const alt = 'FirmsLedger: the US manufacturer directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return OpenGraphImage();
}
