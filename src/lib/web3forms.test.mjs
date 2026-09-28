// Run: node src/lib/web3forms.test.mjs
//
// The contract that matters: this never throws. Callers await it *after* the
// row is already persisted, so a rejected promise would turn a successful
// submission into a 500 — trading a lost email for lost data.
import assert from 'node:assert/strict';
import { notifyViaWeb3Forms } from './web3forms.js';

const realFetch = globalThis.fetch;
const realWarn = console.warn;
const realError = console.error;
console.warn = () => {};
console.error = () => {};

function withFetch(impl, fn) {
  globalThis.fetch = impl;
  return fn().finally(() => { globalThis.fetch = realFetch; });
}

const KEY = 'WEB3FORMS_ACCESS_KEY';
const saved = process.env[KEY];

// ── happy path: posts JSON, returns true ───────────────────────────────────
process.env[KEY] = 'test-key';
let captured = null;
await withFetch(async (url, opts) => {
  captured = { url, body: JSON.parse(opts.body) };
  return { ok: true, status: 200 };
}, async () => {
  const ok = await notifyViaWeb3Forms({
    subject: 'New Listing → Acme',
    from: 'a@acme.test',
    fields: { Company: 'Acme', Phone: '', Website: null },
  });
  assert.equal(ok, true);
});
assert.equal(captured.url, 'https://api.web3forms.com/submit');
assert.equal(captured.body.access_key, 'test-key');
assert.equal(captured.body.subject, 'New Listing → Acme');
assert.equal(captured.body.email, 'a@acme.test');
assert.equal(captured.body.Company, 'Acme');
// empty and null become an em dash rather than "" or "null"
assert.equal(captured.body.Phone, '—');
assert.equal(captured.body.Website, '—');

// ── a network failure must resolve false, never reject ─────────────────────
await withFetch(async () => { throw new Error('ECONNRESET'); }, async () => {
  const ok = await notifyViaWeb3Forms({ subject: 's', fields: {} });
  assert.equal(ok, false, 'network error must resolve false, not reject');
});

// ── a non-2xx must resolve false, never reject ─────────────────────────────
await withFetch(async () => ({ ok: false, status: 422 }), async () => {
  const ok = await notifyViaWeb3Forms({ subject: 's', fields: {} });
  assert.equal(ok, false, 'non-2xx must resolve false');
});

// ── no access key: skip quietly, do not call fetch, do not throw ───────────
delete process.env[KEY];
const savedPublic = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
let called = false;
await withFetch(async () => { called = true; return { ok: true, status: 200 }; }, async () => {
  const ok = await notifyViaWeb3Forms({ subject: 's', fields: {} });
  assert.equal(ok, false);
});
assert.equal(called, false, 'must not call fetch without an access key');

// ── falls back to the NEXT_PUBLIC_ key when the server-only one is absent ──
process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = 'public-key';
await withFetch(async (_u, opts) => {
  assert.equal(JSON.parse(opts.body).access_key, 'public-key');
  return { ok: true, status: 200 };
}, async () => {
  assert.equal(await notifyViaWeb3Forms({ subject: 's', fields: {} }), true);
});

if (saved !== undefined) process.env[KEY] = saved;
if (savedPublic !== undefined) process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = savedPublic;
else delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
console.warn = realWarn;
console.error = realError;

console.log('web3forms OK — never throws, skips without a key, em-dashes empty fields');
