import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** GET – campaign detail with per-recipient logs */
export async function GET(request, { params }) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceSupabase();

  const [{ data: campaign, error: campErr }, { data: logs, error: logsErr }] = await Promise.all([
    supabase.from('email_campaigns').select('*').eq('id', id).single(),
    supabase
      .from('email_logs')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (campErr) return NextResponse.json({ error: campErr.message }, { status: 404 });
  if (logsErr) return NextResponse.json({ error: logsErr.message }, { status: 500 });

  return NextResponse.json({ campaign, logs: logs || [] });
}
