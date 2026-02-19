import { readFileSync } from 'fs';

/**
 * Parse a CSV string into an array of objects.
 * Handles quoted fields and escaped quotes.
 */
export function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = parseRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj = {};
    header.forEach((key, j) => {
      let val = values[j];
      if (val === undefined) val = '';
      obj[key] = val;
    });
    rows.push(obj);
  }
  return rows;
}

function parseRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((c === ',' && !inQuotes) || c === '\n' || c === '\r') {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

export function readCSV(filePath) {
  return parseCSV(readFileSync(filePath, 'utf-8'));
}
