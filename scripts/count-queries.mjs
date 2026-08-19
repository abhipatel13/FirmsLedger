// Hits each path twice against a locally running dev server and reports how
// many `[neon] query #` lines the server logged for each request.
//
// Run the dev server with the flag on, piping to a file:
//   NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
// then:
//   node scripts/count-queries.mjs /metal-fabrication/california /company/<slug>
//
// A `warm` count of 0 means the render was served entirely from the Next data
// cache and touched Neon zero times — the goal of the caching work in
// docs/superpowers/plans/2026-08-19-neon-compute-cost-reduction.md
import { readFileSync } from 'node:fs';

const LOG = process.env.DEV_LOG || '/tmp/dev.log';
const BASE = process.env.BASE || 'http://localhost:3000';
const FLUSH_MS = Number(process.env.FLUSH_MS || 2500);
const paths = process.argv.slice(2);

// middleware.js blocks 'curl' and empty user agents outright, so requests must
// present a browser UA or every check below silently measures a 403.
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

if (!paths.length) {
  console.error('usage: node scripts/count-queries.mjs <path> [path...]');
  process.exit(1);
}

const countLines = () => {
  try {
    return readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes('[neon] query #')).length;
  } catch {
    console.error(`cannot read ${LOG} — is the dev server running with NEON_LOG_QUERIES=1 and output redirected there?`);
    process.exit(1);
  }
};

for (const p of paths) {
  for (const pass of ['cold', 'warm']) {
    const before = countLines();
    const res = await fetch(`${BASE}${p}`, { headers: { 'user-agent': UA } });
    await res.text();
    await new Promise((r) => setTimeout(r, FLUSH_MS)); // let the server flush its log
    const queries = countLines() - before;
    console.log(`${pass.padEnd(4)} ${String(res.status).padEnd(4)} ${String(queries).padStart(4)} queries  ${p}`);
  }
}
