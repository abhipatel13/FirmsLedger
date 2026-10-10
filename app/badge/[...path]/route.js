import { SEO_OVERRIDES } from '@/lib/seoOverrides';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SEO_OVERRIDES).map((p) => ({ path: p.split('/').filter(Boolean) }));
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(_request, { params }) {
  const { path } = await params;
  const label = esc(SEO_OVERRIDES[`/${path.join('/')}`].label);
  const width = Math.max(220, Math.round(label.length * 7.4) + 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="48" viewBox="0 0 ${width} 48" role="img" aria-label="Listed on FirmsLedger: ${label}"><rect width="${width}" height="48" rx="8" fill="#1A2E4A"/><text x="16" y="19" fill="#F5A623" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1">LISTED ON FIRMSLEDGER</text><text x="16" y="36" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="13">${label}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
}
