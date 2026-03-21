import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lid = searchParams.get('lid');
  const url = searchParams.get('url') || 'https://firmsledger.com';

  if (lid) {
    try {
      const supabase = db();
      const { data: log } = await supabase
        .from('email_logs')
        .select('id, status, campaign_id')
        .eq('id', lid)
        .single();

      if (log && ['sent', 'opened'].includes(log.status)) {
        const now = new Date().toISOString();
        // Update log
        await supabase
          .from('email_logs')
          .update({ status: 'clicked', clicked_at: now })
          .eq('id', lid);

        // Increment campaign clicked_count
        const { data: camp } = await supabase
          .from('email_campaigns')
          .select('clicked_count')
          .eq('id', log.campaign_id)
          .single();
        await supabase
          .from('email_campaigns')
          .update({ clicked_count: (camp?.clicked_count || 0) + 1 })
          .eq('id', log.campaign_id);
      }
    } catch {
      // silently ignore — always redirect
    }
  }

  return NextResponse.redirect(url);
}
