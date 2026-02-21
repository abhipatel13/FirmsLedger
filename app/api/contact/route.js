import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = 'abhipatel8675@gmail.com';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : 'Contact form submission';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!resend) {
      console.warn('Contact form: RESEND_API_KEY not set. Add it to .env to receive emails.');
      return NextResponse.json(
        { error: 'Contact form is not configured. Please try again later or email us directly.' },
        { status: 503 }
      );
    }

    const html = `
      <h2>New contact form message</h2>
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <h3>Message:</h3>
      <pre style="white-space: pre-wrap; font-family: sans-serif; background: #f5f5f5; padding: 12px; border-radius: 6px;">${escapeHtml(message)}</pre>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FirmsLedger Contact <onboarding@resend.dev>',
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[FirmsLedger Contact] ${subject || 'No subject'}`,
      html,
    });

    if (error) {
      console.error('Contact form Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or email us directly.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (c) => map[c]);
}
