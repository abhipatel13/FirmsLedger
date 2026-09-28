// Run: node src/lib/middlewareRobotsAgree.test.mjs
//
// middleware.js 403s bots by user-agent substring; app/robots.js tells crawlers
// what they may fetch. For a month these two disagreed: robots.js carried a
// comment saying AhrefsBot/SemrushBot/RSiteAuditor were "deliberately allowed —
// we pay for those tools", while middleware.js silently 403'd all three. Our own
// site audits came back empty and nobody connected the two files.
//
// These assertions make that class of contradiction fail loudly instead.
import assert from 'node:assert/strict';
import { BLOCKED_USER_AGENTS } from './blockedUserAgents.js';
import robots from '../../app/robots.js';

const blocks = (ua) => BLOCKED_USER_AGENTS.some((b) => ua.toLowerCase().includes(b));

// ── 1. Tools we pay for must reach the site ──────────────────────────────────
// Their whole value is crawling us. Blocking them buys nothing and hides our
// own SEO data from us.
for (const ua of ['AhrefsBot/7.0', 'SemrushBot/7~bl', 'RSiteAuditor']) {
  assert.equal(blocks(ua), false, `${ua} must not be blocked — robots.js allows it (we pay for it)`);
}

// ── 2. Bots robots.js disallows must actually be stopped ─────────────────────
// robots.txt is advisory; the middleware is the enforcement. If we bother to
// name a bot in the disallow list, the 403 should back it up.
const disallowedInRobots = robots()
  .rules.filter((r) => r.disallow === '/')
  .flatMap((r) => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]));

assert.ok(disallowedInRobots.length > 0, 'expected robots.js to fully disallow at least one bot');
for (const ua of disallowedInRobots) {
  assert.equal(blocks(ua), true, `robots.js disallows ${ua} but middleware would let it through`);
}

// ── 3. Real search engines are never blocked ─────────────────────────────────
// The reason this site exists. A substring added to the blocklist must never
// catch one of these — 'bot' or 'google' in a new entry would be caught here.
const SEARCH_ENGINES = [
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/128.0.0.0 Safari/537.36',
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; https://duckduckgo.com/duckduckgo-help-pages/results/duckduckbot/)',
  'Mozilla/5.0 (compatible; Google-InspectionTool/1.0)',
];
for (const ua of SEARCH_ENGINES) {
  assert.equal(blocks(ua), false, `search engine must never be blocked: ${ua}`);
}

console.log('middlewareRobotsAgree: all assertions passed');
