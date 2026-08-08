#!/usr/bin/env node
/**
 * S1–S7 — Offline logo discovery/download pipeline orchestrator.
 *
 * Phases A/B/C make ZERO Neon queries. The only network calls are fetching
 * company homepages and logo images. R2 uploads default to dry-run until real
 * R2 credentials exist in the environment.
 *
 *   node pipeline/logo-pipeline/index.cjs --limit 300 --concurrency 5 --resume
 *   node pipeline/logo-pipeline/index.cjs --dry-run --limit 50
 *   node pipeline/logo-pipeline/index.cjs --retry-failed --limit 100
 *   node pipeline/logo-pipeline/index.cjs --from input.csv
 *
 * Cost controls (do not raise without a reason):
 *   --limit 300 default; never unbounded. --concurrency capped at 5.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env.local') });
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const DEFAULT_INPUT = path.join(DIR, 'input.csv');
const STATE_FILE = path.join(DIR, 'state.jsonl');
const RESULTS_FILE = path.join(DIR, 'results.csv');
const CACHE_DIR = path.join(DIR, 'html_cache');

const R2_ENV_KEYS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];

function parseArgs() {
  const args = process.argv.slice(2);
  const getValue = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
  };
  let limit = parseInt(getValue('--limit') || '300', 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 300;
  let concurrency = parseInt(getValue('--concurrency') || '5', 10);
  if (!Number.isFinite(concurrency) || concurrency < 1) concurrency = 5;
  if (concurrency > 5) {
    console.warn(`⚠ --concurrency ${concurrency} exceeds the cap of 5; clamping to 5.`);
    concurrency = 5;
  }
  return {
    limit,
    concurrency,
    dryRun: args.includes('--dry-run'),
    retryFailed: args.includes('--retry-failed'),
    resume: args.includes('--resume'),
    from: getValue('--from') || DEFAULT_INPUT,
  };
}

function resolveInput(candidate) {
  if (path.isAbsolute(candidate)) return candidate;
  const cwdPath = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(cwdPath)) return cwdPath;
  return path.resolve(DIR, candidate);
}

function r2Configured() {
  return R2_ENV_KEYS.every((k) => Boolean(process.env[k]));
}

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c === '\r') {
      if (text[i + 1] !== '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      }
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function readInputRows(filePath) {
  const rows = parseCSV(fs.readFileSync(filePath, 'utf8'));
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const rec = {};
    headers.forEach((h, i) => {
      rec[h] = (r[i] ?? '').trim();
    });
    return rec;
  });
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

async function main() {
  const opts = parseArgs();
  const inputPath = resolveInput(opts.from);
  if (!fs.existsSync(inputPath)) {
    console.error(`✗ input file not found: ${inputPath}\n   Run prepare-input.cjs first.`);
    process.exit(1);
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const state = await import('./state.js');
  const discover = await import('./discover.js');
  const download = await import('./download.js');
  const normalize = await import('./normalize.js');
  const r2 = await import('../../src/lib/r2.js');

  const effectiveDryRun = opts.dryRun || !r2Configured();
  if (effectiveDryRun && !opts.dryRun) {
    console.log('ℹ R2 credentials not configured — running in dry-run (no uploads).');
  }

  const rows = readInputRows(inputPath);
  const existing = state.loadState(STATE_FILE);

  let resumeSkipped = 0;
  const candidates = rows.filter((r) => {
    const prev = existing.get(r.id);
    if (!prev) return true;
    if (opts.retryFailed && prev.status === 'failed') return true;
    if (state.TERMINAL_STATUSES.includes(prev.status)) {
      resumeSkipped++;
      return false;
    }
    return true;
  });
  const toProcess = candidates.slice(0, opts.limit);

  console.log(`input rows:         ${rows.length}`);
  console.log(`skipped (resume):   ${resumeSkipped}`);
  console.log(`skipped (overlimit): ${candidates.length - toProcess.length}`);
  console.log(`to process:         ${toProcess.length} (limit ${opts.limit})`);
  console.log(`concurrency:        ${opts.concurrency}`);
  console.log(`dry-run:            ${effectiveDryRun}`);

  if (toProcess.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  state.ensureResultsHeader(RESULTS_FILE);

  const attemptLogo = async (url, source, base) => {
    const dl = await download.downloadImage(url);
    if (!dl.ok) {
      return { ok: false, retryable: dl.retryable || false, error: dl.error };
    }
    let webpBuffer;
    try {
      webpBuffer = await normalize.normalizeLogoImage(dl.buffer);
    } catch (e) {
      return { ok: false, retryable: false, error: `normalize failed: ${e.message}` };
    }
    if (effectiveDryRun) {
      const r2Url = process.env.R2_PUBLIC_URL
        ? r2.getCompanyLogoUrl(base.id)
        : r2.getLogoObjectKey(base.id);
      return { ok: true, status: 'would_upload', source, r2_url: r2Url };
    }
    try {
      const uploaded = await r2.uploadObject({
        key: r2.getLogoObjectKey(base.id),
        body: webpBuffer,
        contentType: 'image/webp',
      });
      return { ok: true, status: 'found', source, r2_url: uploaded.url };
    } catch (e) {
      return { ok: false, retryable: true, error: `r2 upload failed: ${e.message}` };
    }
  };

  const processCompany = async (row) => {
    const base = {
      id: row.id,
      slug: row.slug,
      domain: domainOf(row.website),
      source: null,
      r2_url: null,
      error: null,
      processed_at: new Date().toISOString(),
    };

    let transientError = null;

    let outcome = null;
    try {
      const discovered = await discover.discoverLogo(base.domain, CACHE_DIR);
      if (discovered) {
        outcome = await attemptLogo(discovered.url, discovered.source, base);
        if (outcome.ok) {
          return { ...base, status: outcome.status, source: outcome.source, r2_url: outcome.r2_url };
        }
        if (outcome.retryable) transientError = outcome.error;
      }
    } catch (e) {
      transientError = transientError || e.message;
    }

    // S6 — last-resort DuckDuckGo favicon endpoint (same convention as
    // scripts/update-roofing-logos.cjs). One bounded request per domain,
    // only reached when nothing above worked.
    const ddgUrl = `https://icons.duckduckgo.com/ip3/${base.domain}.ico`;
    const fb = await attemptLogo(ddgUrl, 'favicon', base);
    if (fb.ok) {
      return { ...base, status: fb.status, source: 'favicon', r2_url: fb.r2_url };
    }
    if (fb.retryable) transientError = transientError || fb.error;

    if (transientError) {
      return { ...base, status: 'failed', error: `${transientError}; fallback also failed` };
    }
    return {
      ...base,
      status: 'not_found',
      error: outcome && outcome.error ? outcome.error : 'no logo found',
    };
  };

  let index = 0;
  const workers = [];
  const results = [];
  for (let w = 0; w < opts.concurrency; w++) {
    workers.push(
      (async () => {
        while (index < toProcess.length) {
          const row = toProcess[index++];
          const rec = await processCompany(row);
          state.appendState(STATE_FILE, rec);
          state.appendResult(RESULTS_FILE, rec);
          results.push(rec);
          const tag = rec.status === 'found' || rec.status === 'would_upload' ? '✓' : '✗';
          console.log(`[${index}/${toProcess.length}] ${tag} ${rec.status.padEnd(12)} ${rec.slug} ${rec.source ? `(${rec.source})` : ''} ${rec.error || ''}`);
        }
      })()
    );
  }
  await Promise.all(workers);

  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  console.log('\nSummary:');
  for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`);
  console.log('\nAppended to results.csv and state.jsonl.');
}

main().catch((e) => {
  console.error(`Fatal: ${e.stack || e.message}`);
  process.exit(1);
});
