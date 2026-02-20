import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminFromCookie } from '@/lib/admin-auth';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: 'Email not configured. Add RESEND_API_KEY to .env.local' },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const to = body.to?.trim();
    const subject = body.subject?.trim();
    const bodyHtml = body.body?.trim() || body.html?.trim();

    if (!to) {
      return NextResponse.json({ error: 'Recipient email (to) is required' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
    const html = bodyHtml
      ? bodyHtml.replace(/\n/g, '<br />')
      : '<p>No message body.</p>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent', id: data?.id });
  } catch (err) {
    console.error('Admin email error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
