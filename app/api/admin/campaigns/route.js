import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** GET – list all campaigns with stats */
export async function GET() {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST – create and send a bulk email campaign */
export async function POST(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  if (!resend) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 501 });
  }

  const body = await request.json();
  const { name, subject, body_html, audience = 'all_with_email', custom_emails = [] } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
  if (!body_html?.trim()) return NextResponse.json({ error: 'Email body is required' }, { status: 400 });

  const supabase = getServiceSupabase();

  // ── 1. Resolve recipients ──────────────────────────────────────────────────
  let recipients = []; // [{ email, agency_id, agency_name }]

  if (audience === 'custom') {
    recipients = custom_emails
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .map((email) => ({ email, agency_id: null, agency_name: null }));
  } else {
    let query = supabase
      .from('agencies')
      .select('id, name, contact_email')
      .not('contact_email', 'is', null)
      .neq('contact_email', '');

    if (audience === 'approved') query = query.eq('approved', true);
    if (audience === 'pending') query = query.eq('approved', false);

    const { data: agencies, error: agErr } = await query;
    if (agErr) return NextResponse.json({ error: agErr.message }, { status: 500 });

    recipients = (agencies || []).map((a) => ({
      email: a.contact_email,
      agency_id: a.id,
      agency_name: a.name,
    }));
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found for this audience' }, { status: 400 });
  }

  // ── 2. Create campaign record ──────────────────────────────────────────────
  const { data: campaign, error: campErr } = await supabase
    .from('email_campaigns')
    .insert({
      name: name.trim(),
      subject: subject.trim(),
      body_html: body_html.trim(),
      audience,
      custom_emails,
      status: 'sending',
      total_recipients: recipients.length,
    })
    .select()
    .single();

  if (campErr) return NextResponse.json({ error: campErr.message }, { status: 500 });

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';
  const BATCH_SIZE = 50;
  let sentCount = 0;
  let failedCount = 0;
  const logs = [];

  // ── 3. Send in batches of 50 ───────────────────────────────────────────────
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);

    const batchPayload = chunk.map((r) => ({
      from: fromEmail,
      to: [r.email],
      subject: subject.trim(),
      html: body_html.trim(),
    }));

    try {
      const { data: batchData, error: batchErr } = await resend.batch.send(batchPayload);

      if (batchErr) {
        // Mark all in chunk as failed
        chunk.forEach((r) => {
          logs.push({
            campaign_id: campaign.id,
            recipient_email: r.email,
            agency_id: r.agency_id,
            agency_name: r.agency_name,
            resend_id: null,
            status: 'failed',
            error_message: batchErr.message,
          });
          failedCount++;
        });
      } else {
        // batchData is an array of { id } matching the chunk order
        const ids = Array.isArray(batchData) ? batchData : (batchData?.data ?? []);
        chunk.forEach((r, idx) => {
          const resendId = ids[idx]?.id || null;
          logs.push({
            campaign_id: campaign.id,
            recipient_email: r.email,
            agency_id: r.agency_id,
            agency_name: r.agency_name,
            resend_id: resendId,
            status: 'sent',
          });
          sentCount++;
        });
      }
    } catch (err) {
      chunk.forEach((r) => {
        logs.push({
          campaign_id: campaign.id,
          recipient_email: r.email,
          agency_id: r.agency_id,
          agency_name: r.agency_name,
          resend_id: null,
          status: 'failed',
          error_message: err.message,
        });
        failedCount++;
      });
    }

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  // ── 4. Insert all logs ─────────────────────────────────────────────────────
  if (logs.length > 0) {
    await supabase.from('email_logs').insert(logs);
  }

  // ── 5. Update campaign stats ───────────────────────────────────────────────
  await supabase
    .from('email_campaigns')
    .update({
      status: failedCount === recipients.length ? 'failed' : 'sent',
      sent_count: sentCount,
      failed_count: failedCount,
      sent_at: new Date().toISOString(),
    })
    .eq('id', campaign.id);

  return NextResponse.json({
    message: 'Campaign sent',
    campaign_id: campaign.id,
    total: recipients.length,
    sent: sentCount,
    failed: failedCount,
  });
}
