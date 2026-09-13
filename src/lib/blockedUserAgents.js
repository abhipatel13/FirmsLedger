// User-agent substrings that middleware.js 403s. Kept OUT of middleware.js so
// it can be unit-tested — middleware.js imports next/server, which does not
// resolve under plain `node`, and this list is the part worth asserting on.
//
// app/robots.js is the SOURCE OF TRUTH for which crawlers we allow, and this
// list must not contradict it. AhrefsBot, SemrushBot and RSiteAuditor are
// DELIBERATELY ABSENT: we pay for those tools, and 403ing them here made our
// own site audits return nothing while robots.txt told them they were welcome.
// The contradiction went unnoticed for a month.
//
// middlewareRobotsAgree.test.mjs asserts the two files stay in sync. If you add
// a bot here, check app/robots.js first.
export const BLOCKED_USER_AGENTS = [
  'lightpanda',
  'scrapy',
  'python-requests',
  'python-urllib',
  'curl',
  'wget',
  'headlesschrome',
  'puppeteer',
  'phantomjs',
  'mj12bot',
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
  'seekport',
];

export function isBlockedUserAgent(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  return BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot));
}
