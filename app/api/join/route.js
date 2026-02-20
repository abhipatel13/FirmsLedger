import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * GET /api/join?token=xxx
 * Server-side invite lookup so link works reliably (no client Supabase).
 * Returns invite payload or 404/410 with reason.
 */
export async function GET(request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const token = (searchParams.get('token') || '').trim();
  if (!token) {
    return NextResponse.json({ error: 'missing_token', message: 'Missing invite token' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // Fetch by token only so we can distinguish "not found" vs "expired" vs "already used"
  const { data: invite, error } = await supabase
    .from('company_invites')
    .select('id, email, company_name, used_at, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('Join invite lookup error:', error);
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }

  if (!invite) {
    return NextResponse.json(
      { error: 'invalid_token', message: 'This invite link is invalid or the token was corrupted.' },
      { status: 404 }
    );
  }

  if (invite.used_at) {
    return NextResponse.json(
      { error: 'already_used', message: 'This invite link has already been used.' },
      { status: 410 }
    );
  }

  const now = new Date();
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
  // Allow 24-hour grace past expiry for clock skew
  const graceMs = 24 * 60 * 60 * 1000;
  if (expiresAt && expiresAt.getTime() < now.getTime() - graceMs) {
    return NextResponse.json(
      { error: 'expired', message: 'This invite link has expired.' },
      { status: 410 }
    );
  }

  return NextResponse.json({
    invite: {
      id: invite.id,
      email: invite.email ?? undefined,
      company_name: invite.company_name ?? undefined,
    },
  });
}
