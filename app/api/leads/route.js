import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/db/client';
import { company_leads, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { escapeHtml } from '@/lib/emailHtml';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * POST /api/leads
 * A visitor's "Request Proposal" submission on a company profile.
 * Saves to company_leads and emails the company (falls back to the
 * site notification address if the company has no contact_email).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const company_id = (body.company_id || '').trim();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim() || null;
    const message = (body.message || '').trim();

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const [company] = await db
      .select({ id: companies.id, name: companies.name, contact_email: companies.contact_email })
      .from(companies)
      .where(eq(companies.id, company_id))
      .limit(1);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const [row] = await db.insert(company_leads).values({
      company_id,
      name,
      email,
      phone,
      message,
      status: 'new',
    }).returning({ id: company_leads.id });

    const notifyEmail = company.contact_email || process.env.NOTIFY_SUBMISSION_EMAIL || 'abhipatel8675@gmail.com';
    if (resend && notifyEmail) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
      resend.emails.send({
        from: fromEmail,
        to: [notifyEmail],
        subject: `New proposal request for ${company.name}`,
        html: `
          <h2 style="color:#0a0a0a;">New Proposal Request</h2>
          <table style="border-collapse:collapse;font-size:14px;width:100%;">
            <tr><td style="padding:8px 12px;font-weight:600;width:140px;">Company</td><td style="padding:8px 12px;">${escapeHtml(company.name)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">From</td><td style="padding:8px 12px;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Email</td><td style="padding:8px 12px;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;">Phone</td><td style="padding:8px 12px;">${escapeHtml(phone) || '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 12px;">${escapeHtml(message).replace(/\n/g, '<br/>')}</td></tr>
          </table>
        `,
      }).catch((err) => console.error('Lead notify email failed:', err));
    }

    return NextResponse.json({ success: true, id: row.id });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
