/**
 * Claim verification: does the claimant's work email actually belong to the
 * company they are trying to claim?
 *
 * Only an exact domain match auto-approves. Everything else goes to the manual
 * queue in /admin/claims. Free mail providers can NEVER auto-approve — anyone
 * can create jane@gmail.com, so a gmail address proves nothing about ownership.
 *
 * Subdomains of the company domain are accepted (mail.acme.com -> acme.com) but
 * the leading dot is required, so notacme.com never matches acme.com.
 */

// Not exhaustive, and does not need to be: an unlisted provider just means the
// claim goes to a human instead of being auto-approved. Failing closed is fine.
const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'aol.com',
  'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
  'gmx.com', 'mail.com', 'zoho.com', 'yandex.com', 'rediffmail.com',
  'qq.com', '163.com', 'inbox.com', 'fastmail.com', 'tutanota.com',
]);

function normalizeHost(host) {
  return String(host || '').trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

/** "Jane@Mail.Acme.com" -> "mail.acme.com". Returns '' if not a usable address. */
export function domainOf(email) {
  const at = String(email || '').trim().toLowerCase().lastIndexOf('@');
  if (at < 1) return '';
  const host = normalizeHost(String(email).slice(at + 1));
  return host.includes('.') ? host : '';
}

/** "https://www.acme.com/about?x=1" -> "acme.com". Tolerates a bare host. */
export function domainFromUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  try {
    return normalizeHost(new URL(raw.includes('://') ? raw : `https://${raw}`).hostname);
  } catch {
    return '';
  }
}

export function isFreeMail(domain) {
  return FREE_MAIL.has(normalizeHost(domain));
}

/** True when `emailDomain` is the company domain or a subdomain of it. */
function hostMatches(emailDomain, companyDomain) {
  if (!emailDomain || !companyDomain) return false;
  return emailDomain === companyDomain || emailDomain.endsWith(`.${companyDomain}`);
}

/**
 * Decide how a claim should be handled.
 *
 * @returns {{ verification: 'domain_match'|'manual', reason: string }}
 *   'domain_match' -> safe to auto-approve. 'manual' -> queue for a human.
 */
export function verifyClaimEmail({ email, website, contactEmail }) {
  const claimant = domainOf(email);
  if (!claimant) return { verification: 'manual', reason: 'no usable email domain' };
  if (isFreeMail(claimant)) return { verification: 'manual', reason: 'free mail provider' };

  const candidates = [domainFromUrl(website), domainOf(contactEmail)].filter(Boolean);
  if (!candidates.length) return { verification: 'manual', reason: 'company has no domain on file' };

  // A company's own contact_email being a free-mail address proves nothing
  // either — matching gmail.com to gmail.com must not auto-approve.
  const usable = candidates.filter((d) => !isFreeMail(d));
  if (!usable.length) return { verification: 'manual', reason: 'company domain is free mail' };

  return usable.some((d) => hostMatches(claimant, d))
    ? { verification: 'domain_match', reason: `matched ${claimant}` }
    : { verification: 'manual', reason: `${claimant} does not match ${usable.join(', ')}` };
}
