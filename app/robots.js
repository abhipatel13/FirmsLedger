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
      },
      {
        // AhrefsBot/SemrushBot/RSiteAuditor deliberately allowed — we pay for
        // those tools and blocking them makes our own site audits return nothing.
        userAgent: ['MJ12bot', 'DotBot', 'Rogerbot', 'MegaIndex.ru', 'PetalBot', 'Lightpanda'],
        disallow: '/', // Completely disallow these known scraper/SEO bots
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
