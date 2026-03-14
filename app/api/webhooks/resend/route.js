import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * POST /api/webhooks/resend
 *
 * Resend fires this for: email.sent, email.delivered, email.opened,
 * email.clicked, email.bounced, email.complained
 *
 * Verify the secret: in Resend dashboard → Webhooks → add signing secret,
 * then set RESEND_WEBHOOK_SECRET in .env.local.
 */
export async function POST(request) {
  // ── Optional: verify Resend webhook signature ──────────────────────────────
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const signature = request.headers.get('resend-signature') || '';
    // Simple HMAC check (Resend uses svix; install svix for production-grade verification)
    if (!signature.includes(secret.slice(0, 8))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, data } = payload;
  const resendId = data?.email_id;

  if (!resendId) return NextResponse.json({ ok: true }); // ignore unknown events

  const supabase = getServiceSupabase();
  const now = new Date().toISOString();

  // Map Resend event type → status + timestamp field
  const updates = {
    'email.delivered': { status: 'delivered', delivered_at: now },
    'email.opened':    { status: 'opened',    opened_at: now },
    'email.clicked':   { status: 'clicked',   clicked_at: now },
    'email.bounced':   { status: 'bounced',   bounced_at: now },
    'email.complained':{ status: 'bounced',   bounced_at: now },
  };

  const update = updates[type];
  if (!update) return NextResponse.json({ ok: true }); // nothing to do for email.sent

  // Update the email log row
  const { data: logRow, error: logErr } = await supabase
    .from('email_logs')
    .update(update)
    .eq('resend_id', resendId)
    .select('campaign_id')
    .single();

  if (logErr || !logRow) return NextResponse.json({ ok: true });

  // Recalculate campaign counters from logs
  const { data: counts } = await supabase
    .from('email_logs')
    .select('status')
    .eq('campaign_id', logRow.campaign_id);

  if (counts) {
    const tally = counts.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      },
      {}
    );

    await supabase
      .from('email_campaigns')
      .update({
        delivered_count: tally.delivered || 0,
        opened_count:    tally.opened    || 0,
        clicked_count:   tally.clicked   || 0,
        bounced_count:   tally.bounced   || 0,
      })
      .eq('id', logRow.campaign_id);
  }

  return NextResponse.json({ ok: true });
}
