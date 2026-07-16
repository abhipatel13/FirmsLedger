import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { getAdminFromCookie } from '@/lib/admin-auth';
import { db } from '@/db/client';
import { company_invites } from '@/db/schema';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getAppUrl(request) {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, '');
  try {
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  } catch {
    return 'http://localhost:3000';
  }
}

function buildHtml(joinLink) {
  const safe = joinLink.replace(/"/g, '&quot;');
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:8px;">You're invited to FirmsLedger</h1>
    <p style="color:#64748b;margin-bottom:24px;">The US manufacturer directory — get your company listed for free.</p>
    <p style="color:#334155;margin-bottom:16px;">Click the button below to add your company to our directory.</p>
    <a href="${safe}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;">List Your Company</a>
    <p style="margin-top:24px;font-size:13px;color:#94a3b8;">Link valid for 30 days. Or copy: <a href="${safe}" style="color:#0a0a0a;">${safe}</a></p>
    <hr style="margin:28px 0;border:0;border-top:1px solid #e2e8f0;">
    <p style="font-size:12px;color:#94a3b8;">— FirmsLedger</p>
  </div></body></html>`;
}

export async function POST(request) {
  try {
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 });
    }

    const body = await request.json();
    const rawInvites = body.invites;
    const list = Array.isArray(rawInvites)
      ? rawInvites.map((i) => ({ email: (i.email || '').trim(), company_name: (i.company_name || i.companyName || '').trim() || null })).filter((i) => i.email)
      : (() => {
          const email = (body.email || '').trim();
          return email ? [{ email, company_name: (body.company_name || body.companyName || '').trim() || null }] : [];
        })();

    if (!list.length) {
      return NextResponse.json({ error: 'At least one email is required' }, { status: 400 });
    }

    const appUrl = getAppUrl(request);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
    let sent = 0, failed = 0;

    for (const { email, company_name: companyName } of list) {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      try {
        await db.insert(company_invites).values({
          token,
          email,
          company_name: companyName || null,
          expires_at: expiresAt,
        });
      } catch (err) {
        console.error('Invite insert error:', err);
        failed++;
        continue;
      }

      const joinLink = `${appUrl}/join?token=${token}`;

      if (resend) {
        const { error: sendError } = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: companyName ? `You're invited to list ${companyName} on FirmsLedger` : "You're invited to list your company on FirmsLedger",
          html: buildHtml(joinLink),
        });
        if (sendError) { console.error('Resend error:', sendError); failed++; }
        else sent++;
      } else {
        sent++;
      }
    }

    if (failed === list.length) {
      return NextResponse.json({ error: 'Failed to create or send invites' }, { status: 500 });
    }
    return NextResponse.json({
      message: `Invites sent to ${sent} of ${list.length}.${failed ? ` ${failed} failed.` : ''}`,
      sent, failed, total: list.length,
    });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
