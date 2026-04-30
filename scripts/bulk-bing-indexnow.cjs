/**
 * bulk-bing-indexnow.cjs
 *
 * Reads seo-tracking.csv, filters to URLs with ≥3 live agencies (matches
 * the noindex gate in app/directory/[[...slug]]/page.jsx), and submits
 * them to Bing/Yandex/Naver via IndexNow in batches of 10,000.
 *
 * Run: node scripts/bulk-bing-indexnow.cjs
 *
 * Setup (one-time):
 *   1. Key file already at public/d37e97116b054d6bbe3275ef4a0f5db1.txt
 *   2. Verify it's reachable: curl https://www.firmsledger.com/d37e97116b054d6bbe3275ef4a0f5db1.txt
 *   3. Run this script — Bing indexes within minutes.
 */

const fs = require('fs');
const path = require('path');

const INDEXNOW_KEY = 'd37e97116b054d6bbe3275ef4a0f5db1';
const HOST = 'www.firmsledger.com';
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const MIN_LIVE = 3;
const BATCH_SIZE = 10000;
const BATCH_DELAY_MS = 1500;

function parseCsvLine(line) {
  // Simple CSV parser handling quoted fields with embedded commas/quotes.
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else {
      if (ch === ',') { fields.push(cur); cur = ''; }
      else if (ch === '"') inQuotes = true;
      else cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function loadCsvUrls() {
  const csvPath = path.join(__dirname, '..', 'seo-tracking.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`✘ ${csvPath} not found. Run scripts/generate-seo-tracking.cjs first.`);
    process.exit(1);
  }

  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  const header = parseCsvLine(lines[0]);
  const urlIdx = header.indexOf('URL');
  const liveIdx = header.indexOf('Live Companies');
  if (urlIdx < 0 || liveIdx < 0) {
    console.error('✘ CSV missing URL or Live Companies column.');
    process.exit(1);
  }

  const urls = [];
  let skippedThin = 0;
  let skippedTbd = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const url = fields[urlIdx]?.trim();
    const liveRaw = fields[liveIdx]?.trim();
    if (!url) continue;

    if (liveRaw === 'TBD' || liveRaw === '') { skippedTbd++; continue; }
    const live = parseInt(liveRaw, 10);
    if (Number.isNaN(live) || live < MIN_LIVE) { skippedThin++; continue; }

    urls.push(url);
  }

  console.log(`Loaded ${urls.length} URLs (≥${MIN_LIVE} live).`);
  console.log(`Skipped: ${skippedThin} thin (<${MIN_LIVE} live), ${skippedTbd} TBD/empty.`);
  return urls;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function submitBatch(urlList, batchNum, totalBatches) {
  const body = { host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`  ✓ Batch ${batchNum}/${totalBatches}: ${urlList.length} URLs accepted (HTTP ${res.status})`);
    return true;
  }
  const text = await res.text().catch(() => '');
  console.log(`  ✘ Batch ${batchNum}/${totalBatches} failed (HTTP ${res.status}): ${text}`);
  return false;
}

async function main() {
  console.log('Verifying key file is reachable...');
  try {
    const verify = await fetch(KEY_LOCATION, { method: 'HEAD' });
    if (!verify.ok) {
      console.warn(`  ⚠ Key file ${KEY_LOCATION} returned HTTP ${verify.status}.`);
      console.warn('    IndexNow will reject submissions until the key file is publicly reachable.');
      console.warn('    Verify public/d37e97116b054d6bbe3275ef4a0f5db1.txt is deployed.\n');
    } else {
      console.log(`  ✓ Key file reachable (${KEY_LOCATION})\n`);
    }
  } catch {
    console.warn(`  ⚠ Could not verify key file. Proceeding anyway.\n`);
  }

  const urls = loadCsvUrls();
  if (!urls.length) {
    console.log('Nothing to submit.');
    return;
  }

  const batches = chunk(urls, BATCH_SIZE);
  console.log(`\nSubmitting ${urls.length} URLs in ${batches.length} batch(es) of up to ${BATCH_SIZE}...`);

  let okCount = 0;
  for (let i = 0; i < batches.length; i++) {
    const ok = await submitBatch(batches[i], i + 1, batches.length);
    if (ok) okCount += batches[i].length;
    if (i < batches.length - 1) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`\nDone. ${okCount}/${urls.length} URLs submitted.`);
  console.log('Bing/Yandex/Naver will crawl these within minutes.');
  console.log('Verify in Bing Webmaster Tools: https://www.bing.com/webmasters');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
