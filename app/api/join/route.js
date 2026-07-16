import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { company_invites } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/join?token=xxx
 * Validate an invite token and return invite details.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = (searchParams.get('token') || '').trim();
  if (!token) {
    return NextResponse.json({ error: 'missing_token', message: 'Missing invite token' }, { status: 400 });
  }

  try {
    const [invite] = await db
      .select({ id: company_invites.id, email: company_invites.email, company_name: company_invites.company_name, used_at: company_invites.used_at, expires_at: company_invites.expires_at })
      .from(company_invites)
      .where(eq(company_invites.token, token))
      .limit(1);

    if (!invite) {
      return NextResponse.json({ error: 'invalid_token', message: 'This invite link is invalid.' }, { status: 404 });
    }

    if (invite.used_at) {
      return NextResponse.json({ error: 'already_used', message: 'This invite link has already been used.' }, { status: 410 });
    }

    const graceMs = 24 * 60 * 60 * 1000;
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now() - graceMs) {
      return NextResponse.json({ error: 'expired', message: 'This invite link has expired.' }, { status: 410 });
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email ?? undefined,
        company_name: invite.company_name ?? undefined,
      },
    });
  } catch (err) {
    console.error('Join invite lookup error:', err);
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }
}
