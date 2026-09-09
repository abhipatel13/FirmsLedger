// Run: node src/lib/emailDomain.test.mjs
import assert from 'node:assert/strict';
import { domainOf, domainFromUrl, isFreeMail, verifyClaimEmail } from './emailDomain.js';

// ── parsing ───────────────────────────────────────────────────────────────────
assert.equal(domainOf('Jane@Acme.com'), 'acme.com');
assert.equal(domainOf('jane@www.acme.com'), 'acme.com');
assert.equal(domainOf('jane+tag@mail.acme.com'), 'mail.acme.com');
assert.equal(domainOf('not-an-email'), '');
assert.equal(domainOf('@acme.com'), '');          // no local part
assert.equal(domainOf('jane@localhost'), '');     // no dot, unusable
assert.equal(domainOf(null), '');

assert.equal(domainFromUrl('https://www.acme.com/about?x=1'), 'acme.com');
assert.equal(domainFromUrl('acme.com'), 'acme.com');
assert.equal(domainFromUrl('http://ACME.com.'), 'acme.com');
assert.equal(domainFromUrl(''), '');
assert.equal(domainFromUrl('not a url at all'), '');

assert.equal(isFreeMail('GMAIL.com'), true);
assert.equal(isFreeMail('acme.com'), false);

const v = (args) => verifyClaimEmail(args).verification;

// ── auto-approves ─────────────────────────────────────────────────────────────
assert.equal(v({ email: 'jane@acme.com', website: 'https://www.acme.com' }), 'domain_match');
assert.equal(v({ email: 'jane@acme.com', website: null, contactEmail: 'info@acme.com' }), 'domain_match');
// Subdomain of the company domain is still the company.
assert.equal(v({ email: 'jane@mail.acme.com', website: 'acme.com' }), 'domain_match');

// ── must NOT auto-approve ─────────────────────────────────────────────────────
// The impersonation case the whole check exists to stop.
assert.equal(v({ email: 'jane@notacme.com', website: 'acme.com' }), 'manual');
// Suffix collision must not pass: acme.com is not a subdomain of me.com.
assert.equal(v({ email: 'jane@acme.com', website: 'me.com' }), 'manual');
// Anyone can make a gmail address, so it never proves ownership...
assert.equal(v({ email: 'jane@gmail.com', website: 'acme.com' }), 'manual');
// ...not even when the company's own contact email is that same free provider.
assert.equal(v({ email: 'jane@gmail.com', contactEmail: 'acme@gmail.com' }), 'manual');
// Nothing to compare against.
assert.equal(v({ email: 'jane@acme.com' }), 'manual');
assert.equal(v({ email: 'jane@acme.com', website: '', contactEmail: '' }), 'manual');
assert.equal(v({ email: 'garbage', website: 'acme.com' }), 'manual');

console.log('emailDomain: all assertions passed');
