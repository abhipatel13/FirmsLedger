/**
 * Web3Forms notification sender.
 *
 * Web3Forms — not Resend — is the email provider for this project. Several
 * routes still carry Resend blocks that cannot run because RESEND_API_KEY has
 * never been set in production, so those notifications have never been
 * delivered. This is the path that actually works.
 *
 * MUST BE AWAITED BY CALLERS. On Vercel the function invocation is frozen the
 * moment the handler returns its response, so an un-awaited fetch is killed
 * mid-flight. That is exactly how the PDI Duct listing request was lost on
 * 2026-09-11: `ac8f1fd` moved this call out of the browser (where it was
 * awaited and always completed) into the route handler without awaiting it.
 *
 * Never throws. A notification failure must not fail the user's submission —
 * the row is already saved and the DB is the source of truth.
 */

const ENDPOINT = 'https://api.web3forms.com/submit';

function accessKey() {
  // Both names exist in the Vercel project; prefer the server-only one.
  return process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || null;
}

/**
 * @param {object}  opts
 * @param {string}  opts.subject  email subject line
 * @param {object}  opts.fields   label -> value; sent as discrete keys so
 *                                Web3Forms renders its own table rather than
 *                                one text blob. Empty values become an em dash.
 * @param {string} [opts.from]    reply-to address, when the submitter is known
 * @param {string} [opts.label]   short tag for the console on failure
 * @returns {Promise<boolean>}    true if Web3Forms accepted it
 */
export async function notifyViaWeb3Forms({ subject, fields, from, label = 'notify' }) {
  const key = accessKey();
  if (!key) {
    console.warn(`[${label}] no WEB3FORMS_ACCESS_KEY — notification skipped`);
    return false;
  }

  const body = { access_key: key, subject };
  if (from) body.email = from;
  for (const [k, v] of Object.entries(fields || {})) {
    const s = v == null ? '' : String(v).trim();
    body[k] = s || '—';
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[${label}] Web3Forms returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    // Swallowed on purpose: the submission is already persisted.
    console.error(`[${label}] Web3Forms send failed:`, err?.message || err);
    return false;
  }
}
