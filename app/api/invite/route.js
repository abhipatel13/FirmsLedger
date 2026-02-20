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
    const email = body.email?.trim();
    const companyName = body.company_name || body.companyName || '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: invite, error: insertError } = await supabase
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
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    const appUrl = getAppUrl(request);
    const joinLink = `${appUrl}/join?token=${token}`;

    if (resend) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
      const safeJoinLink = joinLink.replace(/"/g, '&quot;');
      const html = `
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
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi${companyName ? ` from ${companyName}` : ''},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">You've been invited to add your company to <strong>FirmsLedger</strong>. Submit your details once and we'll list you on the directory.</p>
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
      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: companyName
          ? `You're invited to list ${companyName} on FirmsLedger`
          : "You're invited to list your company on FirmsLedger",
        html,
      });

      if (sendError) {
        console.error('Resend error:', sendError);
        return NextResponse.json({ error: 'Invite created but email failed to send', inviteId: invite?.id }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        message: 'Invite created. Set RESEND_API_KEY to send emails.',
        inviteId: invite?.id,
        joinLink,
      });
    }

    return NextResponse.json({ message: 'Invite sent', inviteId: invite?.id });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
