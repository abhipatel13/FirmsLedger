const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
        ],
        crawlDelay: 2, // Ask polite bots to wait 2 seconds between requests
      },
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'RSiteAuditor', 'DotBot', 'Rogerbot', 'MegaIndex.ru', 'PetalBot', 'Lightpanda'],
        disallow: '/', // Completely disallow these known scraper/SEO bots
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
