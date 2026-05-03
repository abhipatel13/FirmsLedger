import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? Math.round(n) : null;
};
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export async function POST(request) {
  try {
    const body = await request.json();

    const agency_id = str(body.agency_id);
    const user_id = str(body.user_id);
    const rating_overall = num(body.rating_overall);
    const rating_quality = num(body.rating_quality);
    const rating_communication = num(body.rating_communication);
    const rating_value = num(body.rating_value);
    const rating_timeliness = num(body.rating_timeliness);
    const title = str(body.title);
    const reviewBody = str(body.body);
    const role_hired = str(body.role_hired);
    const company_name = str(body.company_name);
    const work_duration = str(body.work_duration);

    if (!agency_id || !user_id || !rating_overall || !title || !reviewBody) {
      return NextResponse.json(
        { error: 'agency_id, user_id, rating_overall, title, and body are required.' },
        { status: 400 }
      );
    }

    const record = {
      agency_id,
      user_id,
      rating_overall,
      rating_quality: rating_quality || rating_overall,
      rating_communication: rating_communication || rating_overall,
      rating_value: rating_value || rating_overall,
      rating_timeliness: rating_timeliness || rating_overall,
      title,
      body: reviewBody,
      role_hired: role_hired || null,
      company_name: company_name || null,
      work_duration: work_duration || null,
      verified: false,
      approved: false,
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(record)
      .select('id')
      .single();

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY && process.env.NOTIFY_SUBMISSION_EMAIL) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'FirmsLedger <noreply@firmsledger.com>',
          to: process.env.NOTIFY_SUBMISSION_EMAIL,
          subject: `New review pending: ${title}`,
          html: `
            <h2>New Review Pending Approval</h2>
            <p><strong>Agency ID:</strong> ${agency_id}</p>
            <p><strong>User ID:</strong> ${user_id}</p>
            <p><strong>Rating:</strong> ${rating_overall} / 5</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Body:</strong></p>
            <p>${reviewBody.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (emailErr) {
        console.error('Review notification email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Review route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
