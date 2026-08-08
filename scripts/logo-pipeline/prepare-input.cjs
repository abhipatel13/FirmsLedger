#!/usr/bin/env node
/**
 * S0 — Build scripts/logo-pipeline/input.csv from the two local CSV snapshots.
 *
 * Joins approved companies (pending/approved-2026-07-31.csv: id, name, slug)
 * with website data (companies_2026-07-31.csv: slug, website) on lowercased,
 * trimmed slug. Rows that cannot be joined (no id, no website, malformed URL)
 * are written to unprocessable.csv, never silently dropped.
 *
 * Zero network calls. Zero Neon calls. Runs once.
 *
 *   node scripts/logo-pipeline/prepare-input.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const APPROVED = path.join(ROOT, 'pending', 'approved-2026-07-31.csv');
const COMPANIES = path.join(ROOT, 'companies_2026-07-31.csv');
const OUT_DIR = __dirname;

/**
 * Real CSV parser: handles BOM, quoted fields, escaped quotes (""), embedded
 * newlines/commas inside quoted fields, and CRLF / lone CR line endings.
 * The main companies CSV is known to contain multi-line quoted fields.
 */
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

function readTable(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`✗ missing input file: ${filePath}`);
    process.exit(1);
  }
  const rows = parseCSV(fs.readFileSync(filePath, 'utf8'));
  if (rows.length < 2) {
    console.error(`✗ ${label}: no data rows`);
    process.exit(1);
  }
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const rec = {};
    headers.forEach((h, i) => {
      rec[h] = (r[i] ?? '').trim();
    });
    return rec;
  });
}

function isValidWebsiteUrl(raw) {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return (u.protocol === 'http:' || u.protocol === 'https:') && Boolean(u.hostname);
  } catch {
    return false;
  }
}

function csvField(value) {
  const s = String(value == null ? '' : value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main() {
  const approved = readTable(APPROVED, 'approved');
  const companies = readTable(COMPANIES, 'companies');

  const websiteBySlug = new Map();
  for (const c of companies) {
    const slug = (c.slug || '').toLowerCase().trim();
    if (slug && !websiteBySlug.has(slug)) websiteBySlug.set(slug, c.website || '');
  }

  const inputRows = [];
  const unprocessableRows = [];
  for (const a of approved) {
    const slug = (a.slug || '').toLowerCase().trim();
    const id = (a.id || '').trim();
    const name = a.name || '';
    const website = websiteBySlug.get(slug) || '';

    if (!id) {
      unprocessableRows.push({ id, slug, name, website, reason: 'no id' });
    } else if (!slug) {
      unprocessableRows.push({ id, slug, name, website, reason: 'no slug' });
    } else if (!website) {
      unprocessableRows.push({ id, slug, name, website, reason: 'no website' });
    } else if (!isValidWebsiteUrl(website)) {
      unprocessableRows.push({ id, slug, name, website, reason: 'malformed url' });
    } else {
      inputRows.push({ id, slug, name, website });
    }
  }

  const inputCsv = ['id,slug,name,website'];
  for (const r of inputRows) {
    inputCsv.push([r.id, r.slug, r.name, r.website].map(csvField).join(','));
  }
  fs.writeFileSync(path.join(OUT_DIR, 'input.csv'), inputCsv.join('\n') + '\n');

  const unprocCsv = ['id,slug,name,website,reason'];
  for (const r of unprocessableRows) {
    unprocCsv.push([r.id, r.slug, r.name, r.website, r.reason].map(csvField).join(','));
  }
  fs.writeFileSync(path.join(OUT_DIR, 'unprocessable.csv'), unprocCsv.join('\n') + '\n');

  console.log(`input.csv:         ${inputRows.length} rows`);
  console.log(`unprocessable.csv: ${unprocessableRows.length} rows`);
  if (unprocessableRows.length > 0) {
    const byReason = {};
    for (const r of unprocessableRows) byReason[r.reason] = (byReason[r.reason] || 0) + 1;
    for (const [k, v] of Object.entries(byReason)) console.log(`  ${k}: ${v}`);
  }
}

main();
