import { NextResponse } from 'next/server';
// Relative, not the '@/' alias: middleware.js sits at the repo root and is the
// only file up here, so it has no alias precedent to lean on.
import { isBlockedUserAgent } from './src/lib/blockedUserAgents.js';


export function middleware(request) {
  // Legacy /directory/* URLs are from the pre-pivot services directory (IT,
  // BPO, clinics) and have no manufacturing equivalent, so there is nothing
  // honest to 301 them to. 410 says "permanently gone", which Google acts on
  // faster than a 404. Deliberately NOT robots-disallowed: a blocked URL can't
  // be crawled, so Google would never see this and would keep them indexed.
  if (/^\/directory(\/|$)/.test(request.nextUrl.pathname)) {
    return new NextResponse('Gone', { status: 410 });
  }

  // Every indexable URL is lowercase, but /furniture-woodworking/Texas or
  // /company/PDQ-South 404'd instead of reaching the real page. 301 them so
  // links typed or pasted with capitals keep their value. RequestProposal and
  // WriteReview are the only routes whose folder names are mixed-case.
  const { pathname } = request.nextUrl;
  if (/[A-Z]/.test(pathname) && !/^\/(requestproposal|writereview)(\/|$)/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }

  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block requests with missing or empty User-Agent
  // Legitimate browsers always send a User-Agent.
  if (!userAgent || userAgent.trim().length === 0) {
    return new NextResponse('Forbidden: Missing User-Agent', { status: 403 });
  }

  // 2. Check if the User-Agent contains any known bad bot signatures.
  // The list lives in src/lib/blockedUserAgents.js so it can be unit-tested
  // against app/robots.js — see middlewareRobotsAgree.test.mjs.
  if (isBlockedUserAgent(userAgent)) {
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
