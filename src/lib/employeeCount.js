export const EMPLOYEE_BUCKETS = [
  { key: '1-10',   label: '1-10 Employees',   min: 1,   max: 10 },
  { key: '11-50',  label: '11-50 Employees',  min: 11,  max: 50 },
  { key: '51-200', label: '51-200 Employees', min: 51,  max: 200 },
  { key: '200+',   label: '200+ Employees',   min: 201, max: Infinity },
];

/** Extracts the first integer found in a free-text employee_count value. */
export function parseEmployeeCount(text) {
  if (!text) return null;
  const match = String(text).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/** Maps a parsed number to its bucket key, or null if out of range/unparseable. */
export function bucketKeyFor(n) {
  if (n == null || Number.isNaN(n)) return null;
  const bucket = EMPLOYEE_BUCKETS.find((b) => n >= b.min && n <= b.max);
  return bucket ? bucket.key : null;
}

/** Renders a clean "N-M Employees" label from a raw (possibly messy) employee_count string. */
export function formatEmployeeLabel(text) {
  const n = parseEmployeeCount(text);
  if (n == null) return null;
  const key = bucketKeyFor(n);
  const bucket = EMPLOYEE_BUCKETS.find((b) => b.key === key);
  return bucket ? bucket.label : null;
}
