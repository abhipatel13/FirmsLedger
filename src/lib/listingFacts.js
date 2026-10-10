import { cleanFacets } from './cleanFacets.js';

const titleCase = (s) => s.toLowerCase().replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());
const GENERIC = /^(personali[sz]ed|customer|quality|excellent|exceptional|fast|reliable|friendly|professional|competitive|affordable|great|superior|dependable|commercial|residential|business|emergency|consumer|specialty|industrial|popular|featured|related|recently viewed|explore|compare|select|share|example|search|contact|become|skip|out of stock|recommended|see more|list of|view all|shop all|value[- ]added)\b|^(product|products|services?)( [a-z]+)?$|^services offered$|^capabilities( statement)?$|^parts & accessories$|^service (department|& support|& maintenance)$/i;

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

const nameWord = (c) => String(c?.name || '').toLowerCase().split(/[^a-z0-9]+/).find((w) => w.length > 3) || null;

export function companySpecialties(c, limit = 3) {
  const own = nameWord(c);
  return cleanFacets([...(c?.capabilities || []), ...(c?.products || [])], 50)
    .map((s) => s.replace(/[\s,;:.]+$/, ''))
    .filter((s) => s && !GENERIC.test(s) && s.split(/\s+/).length <= 5 && !(own && s.toLowerCase().includes(own)))
    .reduce((kept, s) => (kept.some((k) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())) ? kept : [...kept, s]), [])
    .slice(0, limit);
}

export function websiteDomain(website) {
  if (!website) return null;
  try {
    return new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
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

export const formatUpdated = (date) =>
  date ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date) : null;

export function formatPhone(raw) {
  if (!raw || /x{2,}|partial|n\/a/i.test(raw)) return null;
  const digits = String(raw || '').replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return raw || null;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}
