/**
 * Escaping helpers for the notification emails built in app/api/*.
 *
 * Why this exists: those routes each grew their own escaper and none was
 * complete. /api/listing and /api/leads escaped only `<`; the marketplace
 * routes escaped `& < >`; /api/reviews and /api/claim escaped nothing at all.
 * Every one of those routes takes input from a public, unauthenticated form
 * (or from an account anyone can register) and interpolates it into an HTML
 * email sent to the site operator — so the operator's mail client is the sink.
 *
 * Leaving `"` unescaped is the sharp edge: a value landing inside
 * href="${...}" can close the attribute and add its own, and an unvalidated
 * href can carry a javascript: or data: URL. Mail clients strip a lot of that,
 * but not consistently, and a convincing attacker-controlled link in an email
 * that looks like it came from your own site is worth phishing with.
 */

/** Escape for HTML text AND double-quoted attribute values. `&` must be first. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The URL if it is a plain http(s) URL, otherwise null.
 *
 * An allowlist, not a denylist: `javascript:`, `data:`, `vbscript:` and
 * anything else never reach an href. Callers render the escaped text instead
 * when this returns null, so a bad value is still visible to the reviewer —
 * it just isn't clickable.
 */
export function safeHttpUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null; // not absolute / unparseable
  }
}

/**
 * An <a> for a user-supplied URL, or the escaped text when it is not a safe
 * http(s) URL, or `fallback` when empty. Never emits an unvalidated href.
 */
export function safeLink(value, { fallback = '—', style = 'color:#1A2E4A;' } = {}) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const href = safeHttpUrl(raw);
  const text = escapeHtml(raw);
  return href ? `<a href="${escapeHtml(href)}" style="${style}">${text}</a>` : text;
}
