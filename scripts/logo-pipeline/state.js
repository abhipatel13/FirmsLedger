import fs from 'node:fs';

// S1/S7 — resume state (state.jsonl) + results CSV helpers.

export const TERMINAL_STATUSES = ['found', 'not_found', 'failed'];

export function loadState(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const rec = JSON.parse(trimmed);
      if (rec && rec.id) map.set(rec.id, rec);
    } catch {
      // ignore malformed lines; append-only log should only rarely hit this
    }
  }
  return map;
}

export function appendState(filePath, record) {
  fs.appendFileSync(filePath, JSON.stringify(record) + '\n');
}

export function ensureResultsHeader(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    fs.writeFileSync(filePath, 'id,slug,status,source,r2_url,error\n');
  }
}

export function appendResult(filePath, rec) {
  const row = [
    rec.id,
    rec.slug,
    rec.status,
    rec.source || '',
    rec.r2_url || '',
    (rec.error || '').replace(/[\n\r]+/g, ' '),
  ];
  const escaped = row.map((v) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  });
  fs.appendFileSync(filePath, escaped.join(',') + '\n');
}
