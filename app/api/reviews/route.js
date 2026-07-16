import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { reviews } from '@/db/schema';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? String(Math.round(n)) : null;
};
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export async function POST(request) {
  try {
    const body = await request.json();

    const company_id = str(body.company_id || body.agency_id);
    const user_id = str(body.user_id);
    const rating_overall = num(body.rating_overall);
    const title = str(body.title);
    const reviewBody = str(body.body);

    if (!company_id || !rating_overall || !title || !reviewBody) {
      return NextResponse.json(
        { error: 'company_id, rating_overall, title, and body are required.' },
        { status: 400 }
      );
    }

    const [row] = await db.insert(reviews).values({
      company_id,
      user_id: user_id || null,
      reviewer_name: str(body.reviewer_name) || str(body.company_name) || null,
      reviewer_company: str(body.reviewer_company) || null,
      rating_overall,
      rating_quality: num(body.rating_quality) || rating_overall,
      rating_communication: num(body.rating_communication) || rating_overall,
      rating_value: num(body.rating_value) || rating_overall,
      rating_timeliness: num(body.rating_timeliness) || rating_overall,
      title,
      body: reviewBody,
      role_hired: str(body.role_hired) || null,
      work_duration: str(body.work_duration) || null,
      verified: false,
      approved: false,
    }).returning({ id: reviews.id });

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
            <p><strong>Company ID:</strong> ${company_id}</p>
            <p><strong>Rating:</strong> ${rating_overall} / 5</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Body:</strong></p><p>${reviewBody.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (emailErr) {
        console.error('Review notification email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, id: row?.id });
  } catch (err) {
    console.error('Review route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
