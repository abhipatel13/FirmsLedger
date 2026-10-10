import { cleanFacets } from './cleanFacets.js';

const titleCase = (s) => s.toLowerCase().replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());
const GENERIC = /^(personali[sz]ed|customer|quality|excellent|fast|reliable|friendly|professional|competitive|affordable|great)\b/i;

function tally(pairs) {
  const counts = new Map();
  for (const [key, name] of pairs) {
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { name, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function companyCity(c) {
  const city = String(c?.hq_city || '').trim();
  return city ? titleCase(city) : null;
}

export function companySpecialties(c, limit = 3) {
  return cleanFacets([...(c?.capabilities || []), ...(c?.products || [])], limit + 3).filter((s) => !GENERIC.test(s)).slice(0, limit);
}

export function companyCertifications(c) {
  const certs = (c?.certifications || []).map((x) => String(x).replace(/\s+/g, ' ').trim().replace(/^(ISO|AS|IATF)\s*(?=\d)/i, (m, p) => `${p.toUpperCase()} `)).filter(Boolean);
  return [...new Map(certs.map((x) => [x.replace(/\s+/g, '').toLowerCase(), x])).values()];
}

export function buildListingFacts(companies) {
  const list = companies || [];
  const stamps = list.map((c) => Date.parse(c.updated_at)).filter(Number.isFinite);
  return {
    count: list.length,
    cities: tally(list.map(companyCity).filter(Boolean).map((city) => [city.toLowerCase(), city])),
    specialties: tally(list.flatMap((c) => companySpecialties(c, 6).map((s) => [s.toLowerCase(), s]))).filter((s) => s.count >= 2),
    certifications: tally(list.flatMap((c) => companyCertifications(c).map((x) => [x.replace(/\s+/g, '').toLowerCase(), x]))),
    withWebsite: list.filter((c) => c.website).length,
    lastUpdated: stamps.length ? new Date(Math.max(...stamps)) : null,
  };
}
