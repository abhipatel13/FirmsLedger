// Run: node src/lib/emailHtml.test.mjs
import assert from 'node:assert/strict';
import { escapeHtml, safeHttpUrl, safeLink } from './emailHtml.js';

// ── escapeHtml covers all five, and `&` is handled first ────────────────────
assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
assert.equal(escapeHtml('a & b'), 'a &amp; b');
assert.equal(escapeHtml(`"'`), '&quot;&#39;');
// If `&` were escaped last, this would double-encode to &amp;lt;
assert.equal(escapeHtml('&lt;'), '&amp;lt;');
assert.equal(escapeHtml(null), '');
assert.equal(escapeHtml(undefined), '');
assert.equal(escapeHtml(0), '0');

// The exact flaw the security review found: the old escaper only handled `<`,
// so a value inside href="..." could close the attribute and add its own.
const breakout = '" onmouseover="alert(1)';
assert.ok(!escapeHtml(breakout).includes('"'), 'attribute breakout still possible');

// ── safeHttpUrl is an allowlist ─────────────────────────────────────────────
assert.ok(safeHttpUrl('https://example.com/x'));
assert.ok(safeHttpUrl('http://example.com'));
for (const bad of [
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  'data:text/html;base64,PHNjcmlwdD4=',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'example.com',          // not absolute
  '',
  null,
]) {
  assert.equal(safeHttpUrl(bad), null, `should have rejected: ${bad}`);
}

// ── safeLink never emits an unvalidated href ────────────────────────────────
const good = safeLink('https://acme.test/shop');
assert.ok(good.includes('<a href="https://acme.test/shop"'), good);

// A javascript: URL renders as escaped TEXT — still visible to the reviewer,
// but not clickable and not an href.
const js = safeLink('javascript:alert(1)');
assert.ok(!js.includes('href'), `javascript: reached an href: ${js}`);
assert.ok(js.includes('javascript:alert(1)'), 'value should still be shown as text');

// Attribute-breakout attempt must not produce a second attribute.
//
// Substring-matching for "onmouseover=" is the wrong check: new URL()
// percent-encodes the quote, so the handler text survives harmlessly inside
// the URL path (href="https://x.test/%22%20onmouseover=%22alert(1)"). What
// actually matters is that no raw `"` escapes into the markup and closes an
// attribute early — so count the delimiters. A clean anchor has exactly four:
// href open/close and style open/close.
const brk = safeLink('https://x.test/" onmouseover="alert(1)');
assert.equal(
  (brk.match(/"/g) || []).length, 4,
  `attribute delimiters injected — breakout survived: ${brk}`
);
// And the href value itself must terminate where we put it.
const href = brk.match(/href="([^"]*)"/)?.[1];
assert.ok(href && !href.includes('"'), `href value not properly quoted: ${brk}`);

assert.equal(safeLink(''), '—');
assert.equal(safeLink(null, { fallback: 'n/a' }), 'n/a');

console.log('emailHtml OK — escaping, scheme allowlist and href breakout all covered');
