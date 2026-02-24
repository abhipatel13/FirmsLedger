import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import { getAdminFromCookie } from '@/lib/admin-auth';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

export async function POST(request) {
  try {
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 });
    }

    const body = await request.json();
    const rawInvites = body.invites;
    const list = Array.isArray(rawInvites)
      ? rawInvites
          .map((i) => ({
            email: (i.email || '').trim(),
            company_name: (i.company_name || i.companyName || '').trim() || null,
          }))
          .filter((i) => i.email)
      : (() => {
        const email = (body.email || '').trim();
        return email
          ? [{ email, company_name: (body.company_name || body.companyName || '').trim() || null }]
          : [];
      })();

    if (!list.length) {
      return NextResponse.json({ error: 'At least one agency email is required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const appUrl = getAppUrl(request);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
    const buildHtml = (safeJoinLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to list on FirmsLedger</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">You're invited to FirmsLedger</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748b;">India's trusted platform for business service providers</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi from FirmsLedger,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">You've been invited to list your company on <strong>FirmsLedger</strong> for free. We're registering your company on our platform at no cost—submit your details once and we'll add you to the directory.</p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Why list with us?</p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
                <li style="margin-bottom:6px;"><strong>Free listing</strong> — no cost to join or stay listed</li>
                <li style="margin-bottom:6px;"><strong>Reach more clients</strong> — get discovered by businesses looking for your services</li>
                <li style="margin-bottom:6px;"><strong>Build credibility</strong> — appear on India's trusted platform for service providers</li>
                <li style="margin-bottom:6px;"><strong>One-time submission</strong> — we add you to the directory and you're set</li>
              </ul>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#64748b;">This link is valid for 30 days. Click the button below to get started.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td>
                    <a href="${safeJoinLink}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Add your company</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#94a3b8;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:8px 0 0;font-size:13px;word-break:break-all;color:#2563eb;"><a href="${safeJoinLink}" style="color:#2563eb;">${safeJoinLink}</a></p>
              <hr style="margin:28px 0 0;border:0;border-top:1px solid #e2e8f0;">
              <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">— FirmsLedger</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    let sent = 0;
    let failed = 0;
    for (const { email, company_name: companyName } of list) {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: insertError } = await supabase
        .from('company_invites')
        .insert({
          token,
          email,
          company_name: companyName || null,
          expires_at: expiresAt.toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Invite insert error:', insertError);
        failed++;
        continue;
      }

      const joinLink = `${appUrl}/join?token=${token}`;
      const safeJoinLink = joinLink.replace(/"/g, '&quot;');

      if (resend) {
        const { error: sendError } = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: companyName
            ? `You're invited to list ${companyName} on FirmsLedger`
            : "You're invited to list your company on FirmsLedger",
          html: buildHtml(safeJoinLink),
        });
        if (sendError) {
          console.error('Resend error:', sendError);
          failed++;
        } else {
          sent++;
        }
      } else {
        sent++;
      }
    }

    if (list.length === 1 && sent === 1) {
      return NextResponse.json({ message: 'Invite sent', sent: 1 });
    }
    if (failed === list.length) {
      return NextResponse.json(
        { error: 'Failed to create or send invites. Check server logs.' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: `Invites sent to ${sent} of ${list.length} agencies.${failed ? ` ${failed} failed.` : ''}`,
      sent,
      failed,
      total: list.length,
    });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
