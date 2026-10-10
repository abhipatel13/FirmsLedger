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

const STOP = '(to|and|or|of|for|the|a|an|with|in|on|at|from|by|our|your|we|you|is|are|that|than|this)';
const FRAGMENT = new RegExp(`^${STOP}(\\s|$)|\\s${STOP}$|^[^a-z0-9]|^(click|choose|view|learn|read|see|browse|download)\\b`, 'i');

export function companySpecialties(c, limit = 3) {
  const own = nameWord(c);
  return cleanFacets([...(c?.capabilities || []), ...(c?.products || [])], 50)
    .flatMap((s) => s.split(/\s*[,;]\s*/))
    .map((s) => s.replace(/[\s,;:.]+$/, ''))
    .filter((s) => s && !GENERIC.test(s) && !FRAGMENT.test(s) && s.split(/\s+/).length <= 5 && !(own && s.toLowerCase().includes(own)))
    .reduce((kept, s) => (kept.some((k) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())) ? kept : [...kept, s]), [])
    .slice(0, limit);
}

export function companySummary(company, categoryName) {
  const place = [companyCity(company), company.hq_state_label].filter(Boolean).join(', ');
  const facts = [company.founded_year && `founded in ${company.founded_year}`, company.employee_count && `${company.employee_count} employees`].filter(Boolean);
  const certs = companyCertifications(company).slice(0, 2);
  return [
    `${company.name} is a${company.is_verified ? ' verified' : ''} US manufacturer${place ? ` in ${place}` : ''}${facts.length ? `, ${facts.join(', ')}` : ''}.`,
    categoryName && `Listed under ${categoryName}.`,
    certs.length > 0 && `Certified ${certs.join(', ')}.`,
    'See its location and contact details on FirmsLedger.',
  ].filter(Boolean).join(' ');
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
