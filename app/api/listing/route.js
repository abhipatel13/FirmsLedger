import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/db/client';
import { listing_requests } from '@/db/schema';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const notifyEmail = process.env.NOTIFY_SUBMISSION_EMAIL || 'abhipatel8675@gmail.com';

/**
 * POST /api/listing
 * Submit a "List Your Company" request — saves to listing_requests table.
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

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!contact_email) {
      return NextResponse.json({ error: 'Contact email is required' }, { status: 400 });
    }

    // Send notification email immediately (fire-and-forget)
    if (resend && notifyEmail) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
      const esc = (s) => (s || '').replace(/</g, '&lt;');
      resend.emails.send({
        from: fromEmail,
        to: [notifyEmail],
        subject: `New Listing Request: ${company_name.slice(0, 60)}`,
        html: `
          <h2 style="color:#0a0a0a;">New Listing Request</h2>
          <table style="border-collapse:collapse;font-size:14px;width:100%;">
            <tr><td style="padding:8px 12px;font-weight:600;width:140px;">Company</td><td style="padding:8px 12px;">${esc(company_name)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Email</td><td style="padding:8px 12px;">${esc(contact_email)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Website</td><td style="padding:8px 12px;">${esc(website) || '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Location</td><td style="padding:8px 12px;">${[hq_city, hq_state].filter(Boolean).join(', ') || '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Category</td><td style="padding:8px 12px;">${esc(category_slug) || '—'}</td></tr>
            ${description ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 12px;">${esc(description).replace(/\n/g, '<br/>')}</td></tr>` : ''}
          </table>
          <p style="margin-top:20px;"><a href="https://firmsledger.com/admin" style="background:#0a0a0a;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Review in Admin →</a></p>
        `,
      }).catch((err) => console.error('Listing notify email failed:', err));
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

    return NextResponse.json({ id: row.id, success: true });
  } catch (err) {
    console.error('Listing API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
