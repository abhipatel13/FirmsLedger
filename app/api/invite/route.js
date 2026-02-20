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
    expiresAt.setDate(expiresAt.getDate() + 14);

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
      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: companyName
          ? `You're invited to list ${companyName} on FirmsLedger`
          : "You're invited to list your company on FirmsLedger",
        html: `
          <p>Hi${companyName ? ` from ${companyName}` : ''},</p>
          <p>You've been invited to add your company to <strong>FirmsLedger</strong> – India's trusted platform for business service providers.</p>
          <p>Click the link below to submit your company details. The link is valid for 14 days.</p>
          <p><a href="${joinLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">Add your company</a></p>
          <p>Or copy this link: <a href="${joinLink}">${joinLink}</a></p>
          <p>— FirmsLedger</p>
        `,
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
