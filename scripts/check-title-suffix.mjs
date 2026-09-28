// Guards against the '| FirmsLedger | FirmsLedger' regression: the root layout
// in app/layout.jsx applies title.template to every child segment, so no page
// may append the brand suffix by hand. Run after `npm run build`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '.next/server/app';
const SUFFIX = ' | FirmsLedger';
const failures = [];

const files = readdirSync(ROOT, { recursive: true })
  .filter((f) => String(f).endsWith('.html'))
  .map((f) => join(ROOT, String(f)));

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const match = html.match(/<title>([^<]*)<\/title>/);
  if (!match) continue;
  const title = match[1];
  const count = title.split(SUFFIX).length - 1;
  if (count > 1) failures.push(`${file}: ${title}`);
}

if (failures.length) {
  console.error(`Duplicate brand suffix in ${failures.length} title(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('Titles OK — no duplicate brand suffix.');
