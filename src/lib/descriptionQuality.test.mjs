// Run: node src/lib/descriptionQuality.test.mjs
// Every case below is real text from the companies table.
import assert from 'node:assert/strict';
import { isProperDescription } from './descriptionQuality.js';

const JUNK = [
  'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic.',
  'This site uses cookies and related technologies to enhance user experience, analyze performance and traffic.',
  'For the best experience on our site, be sure to turn on Javascript in your browser.',
  "Since 2005, we've helped thousands of people get the perfect domain name",
  'If this is your domain, you can manage it in your Hostinger account.',
  '404 means the file is not found. If you have already uploaded the file then the name may be misspelled.',
  'Copyright © 2026 Micro Mold Plastics USA, Inc. - All Rights Reserved.',
  '© 2021 Central Florida Metals | I Orlando Sheet Metal & Metal Fabrication',
  'This field is for validation purposes and should be left unchanged.',
  'Delivery, taxes, and discount codes are calculated at checkout',
  'Subscribe to our mailing list for insider news, product launches, and more.',
  '<p>ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Ï¥Î®Ø¬[,ï¿½ï¿½ï¿½Oï¿½zï¿½</p>',
  'short',
  '',
  null,
];

const KEEP = [
  'EBM specializes in machinery for cookies, crackers, frozen dough, cereal bars, cakes, muffins, pie and other sweet goods.',
  'Midlands Packaging primarily produces folding cartons, corrugated containers, and thermoformed plastics.',
  'For practically every situation, our cartridge and baghouse styles are built for a safer work environment.',
  'Founded in 1923, the company has a long history of providing high-quality folding cartons and set-up boxes.',
  'Providing quality service, engineering, and design in Plastics Injection Molding.',
];

for (const d of JUNK) assert.equal(isProperDescription(d), false, `should reject: ${d}`);
for (const d of KEEP) assert.equal(isProperDescription(d), true, `should keep: ${d}`);
console.log(`ok: ${JUNK.length} rejected, ${KEEP.length} kept`);
