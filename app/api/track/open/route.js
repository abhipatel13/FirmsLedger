import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

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

  if (lid) {
    try {
      const supabase = db();
      const { data: log } = await supabase
        .from('email_logs')
        .select('id, status, campaign_id')
        .eq('id', lid)
        .single();

      if (log && log.status === 'sent') {
        const now = new Date().toISOString();
        // Update log
        await supabase
          .from('email_logs')
          .update({ status: 'opened', opened_at: now })
          .eq('id', lid);

        // Increment campaign opened_count
        const { data: camp } = await supabase
          .from('email_campaigns')
          .select('opened_count')
          .eq('id', log.campaign_id)
          .single();
        await supabase
          .from('email_campaigns')
          .update({ opened_count: (camp?.opened_count || 0) + 1 })
          .eq('id', log.campaign_id);
      }
    } catch {
      // silently ignore — always return the pixel
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
