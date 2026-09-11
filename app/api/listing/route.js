import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/db/client';
import { listing_requests } from '@/db/schema';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Mathematical Sans-Serif Bold Unicode block — renders as genuinely bold text
// in an inbox subject line (Gmail, Outlook, Apple Mail) with no HTML/CSS involved.
const BOLD_MAP = (() => {
  const map = {};
  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1d5d4 + i); // A-Z
    map[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1d5ee + i); // a-z
  }
  for (let i = 0; i < 10; i++) map[String(i)] = String.fromCodePoint(0x1d7ec + i); // 0-9
  return map;
})();
const toBoldUnicode = (str) => [...str].map((ch) => BOLD_MAP[ch] || ch).join('');

function notifyNewListing({ company_name, contact_email, contact_phone, website, hq_city, hq_state, description, team_size }) {
  const location = [hq_city, hq_state].filter(Boolean).join(', ') || '—';
  const notifyEmail = process.env.NOTIFY_SUBMISSION_EMAIL || 'abhipatel8675@gmail.com';
  const subject = `${toBoldUnicode('New Listing')} → ${company_name}`;

  if (resend) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
    const esc = (s) => (s || '').replace(/</g, '&lt;');
    return resend.emails.send({
      from: fromEmail,
      to: [notifyEmail],
      subject,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#1A2E4A;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="display:inline-block;background:#22c55e;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;">New Submission</span>
            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:12px 0 0;">${esc(company_name)}</h1>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 28px 24px;">
            <table style="border-collapse:collapse;font-size:14px;width:100%;">
              <tr><td style="padding:7px 0;color:#64748b;font-weight:600;width:110px;">Location</td><td style="padding:7px 0;color:#0f172a;">${esc(location)}</td></tr>
              <tr><td style="padding:7px 0;color:#64748b;font-weight:600;">Email</td><td style="padding:7px 0;color:#0f172a;">${esc(contact_email)}</td></tr>
              <tr><td style="padding:7px 0;color:#64748b;font-weight:600;">Phone</td><td style="padding:7px 0;color:#0f172a;">${esc(contact_phone) || '—'}</td></tr>
              <tr><td style="padding:7px 0;color:#64748b;font-weight:600;">Website</td><td style="padding:7px 0;color:#0f172a;">${website ? `<a href="${esc(website)}" style="color:#1A2E4A;">${esc(website)}</a>` : '—'}</td></tr>
              <tr><td style="padding:7px 0;color:#64748b;font-weight:600;">Team Size</td><td style="padding:7px 0;color:#0f172a;">${esc(team_size) || '—'}</td></tr>
            </table>
            ${description ? `<div style="margin-top:16px;padding:14px 16px;background:#f8fafc;border-left:3px solid #1A2E4A;border-radius:6px;color:#334155;font-size:13px;line-height:1.6;">${esc(description).replace(/\n/g, '<br/>')}</div>` : ''}
          </div>
        </div>
      `,
    }).catch((err) => console.error('Listing notify email (Resend) failed:', err));
  }

  // No Resend key configured yet — fall back to Web3Forms, with fields kept
  // separate (not one text blob) so its own default template renders a table.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return Promise.resolve();
  return fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      Company: company_name,
      Email: contact_email,
      Phone: contact_phone || '—',
      Website: website || '—',
      Location: location,
      'Team Size': team_size || '—',
      Details: description || '—',
    }),
  }).catch((err) => console.error('Listing notify email (Web3Forms) failed:', err));
}

/**
 * POST /api/listing
 * Submit a "List Your Company" request — saves to listing_requests table
 * and emails a notification (Resend if configured, Web3Forms fallback otherwise).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const company_name = (body.company_name || body.name || '').trim();
    const contact_email = (body.email || body.contact_email || '').trim();
    const contact_phone = (body.phone || body.contact_phone || '').trim() || null;
    const website = (body.website || '').trim() || null;
    const hq_state = (body.hq_state || '').trim() || null;
    const hq_city = (body.hq_city || '').trim() || null;
    const category_slug = (body.category_slug || '').trim() || null;
    const description = (body.description || body.message || '').trim() || null;
    const team_size = (body.team_size || '').trim() || null;

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!contact_email) {
      return NextResponse.json({ error: 'Contact email is required' }, { status: 400 });
    }

    const [row] = await db.insert(listing_requests).values({
      company_name,
      contact_email,
      contact_phone,
      website,
      hq_state,
      hq_city,
      category_slug,
      description,
      status: 'pending',
    }).returning();

    notifyNewListing({ company_name, contact_email, contact_phone, website, hq_city, hq_state, description, team_size });

    return NextResponse.json({ id: row.id, success: true });
  } catch (err) {
    console.error('Listing API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
