import { NextResponse } from 'next/server';

// A list of common user agent substrings used by automated scrapers and bad bots
const BLOCKED_USER_AGENTS = [
  'lightpanda',
  'scrapy',
  'python-requests',
  'python-urllib',
  'curl',
  'wget',
  'headlesschrome',
  'puppeteer',
  'phantomjs',
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'rsiteauditor',
  'dotbot',
  'rogerbot',
  'megaindex',
  'petalbot',
  'grapeshot',
  'ltx71',
  'barkrowler',
  'blexbot',
  'magpie-crawler',
  'piplbot',
  'domaincrawler',
  'seekport'
];

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block requests with missing or empty User-Agent
  // Legitimate browsers always send a User-Agent.
  if (!userAgent || userAgent.trim().length === 0) {
    return new NextResponse('Forbidden: Missing User-Agent', { status: 403 });
  }

  const lowerCaseUserAgent = userAgent.toLowerCase();

  // 2. Check if the User-Agent contains any known bad bot signatures
  const isBlockedBot = BLOCKED_USER_AGENTS.some((bot) => lowerCaseUserAgent.includes(bot));

  if (isBlockedBot) {
    return new NextResponse('Forbidden: Automated Access Denied', { status: 403 });
  }

  // Allow the request to proceed if no blocks match
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets, API routes, and Next.js internals
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
