import sitemapFn, { generateSitemaps } from '../../../../sitemap';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export async function GET(request, { params }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (isNaN(id) || id < 0) {
    return new Response('Not Found', { status: 404 });
  }

  const routes = await sitemapFn({ id });

  if (!routes || routes.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const urls = routes
    .map((r) => {
      const lastmod =
        r.lastModified instanceof Date
          ? r.lastModified.toISOString().split('T')[0]
          : new Date(r.lastModified).toISOString().split('T')[0];
      // Normalise &amp; in URLs to a single & then re-encode for valid XML
      const loc = r.url.replace(/&amp;/g, '&').replace(/&/g, '&amp;');
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changeFrequency}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
