import { NextResponse } from 'next/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { companies, claims } from '@/db/schema';
import { getUserFromCookie } from '@/lib/user-auth';
import { verifyClaimEmail } from '@/lib/emailDomain';

const ROLES = new Set(['owner', 'marketing', 'operations', 'other']);

// Every claim goes to /admin/claims for a human. We deliberately do NOT
// auto-approve on an email-domain match, because signup never confirms the
// address — anyone can register as jane@acme.com without owning that inbox, so
// a domain match is a SIGNAL for the reviewer, not proof of ownership.
// To auto-approve later, add email confirmation (or Google sign-in) first.
const MAX_CLAIMS_PER_HOUR = 5;

const clean = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(request) {
  try {
    // Identity comes from the session cookie, never from the request body — a
    // client-supplied user id would let anyone file a claim as someone else.
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to claim a listing.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const companySlug = clean(body.company_slug, 300);
    const name        = clean(body.name);
    const workEmail   = clean(body.email, 320).toLowerCase();
    const phone       = clean(body.phone, 40);
    const role        = clean(body.role, 40);

    if (!companySlug) {
      return NextResponse.json({ error: 'Select the company you want to claim.' }, { status: 400 });
    }
    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required.' }, { status: 400 });
    }
    if (!ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    // ponytail: rate limit by counting the claimant's own recent rows. No new
    // dependency, and unlike an in-memory counter it actually works across
    // serverless instances. Swap for a real limiter only if this is abused.
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [recent] = await db
      .select({ n: sql`count(*)::int` })
      .from(claims)
      .where(and(eq(claims.user_id, user.id), gte(claims.created_at, since)));
    if ((recent?.n ?? 0) >= MAX_CLAIMS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many claim attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Resolve the company server-side from its slug. Only approved (publicly
    // listed) companies can be claimed.
    const [company] = await db
      .select({
        id: companies.id,
        name: companies.name,
        website: companies.website,
        contact_email: companies.contact_email,
      })
      .from(companies)
      .where(and(eq(companies.slug, companySlug), eq(companies.approved, true)))
      .limit(1);

    if (!company) {
      return NextResponse.json({ error: 'That listing could not be found.' }, { status: 404 });
    }

    // Someone already owns it.
    const [approved] = await db
      .select({ user_id: claims.user_id })
      .from(claims)
      .where(and(eq(claims.company_id, company.id), eq(claims.status, 'approved')))
      .limit(1);

    if (approved) {
      return NextResponse.json(
        {
          error: approved.user_id === user.id
            ? 'You already own this listing.'
            : 'This listing has already been claimed. Contact support if you believe this is a mistake.',
        },
        { status: 409 }
      );
    }

    const { verification, reason } = verifyClaimEmail({
      email: workEmail || user.email,
      website: company.website,
      contactEmail: company.contact_email,
    });

    // Re-submitting updates the existing row rather than stacking duplicates
    // (claims_user_company_unique). Lets a rejected claimant correct and retry.
    await db
      .insert(claims)
      .values({
        company_id: company.id,
        user_id: user.id,
        status: 'pending',
        verification,
        role,
        contact_name: name,
        contact_email: workEmail || user.email,
        phone: phone || null,
        review_note: null,
        reviewed_at: null,
      })
      .onConflictDoUpdate({
        target: [claims.user_id, claims.company_id],
        set: {
          status: 'pending',
          verification,
          role,
          contact_name: name,
          contact_email: workEmail || user.email,
          phone: phone || null,
          review_note: null,
          reviewed_at: null,
        },
      });

    // Best-effort notification. The /admin/claims queue is the source of truth,
    // so a missing RESEND_API_KEY must never fail the claim.
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_SUBMISSION_EMAIL) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'FirmsLedger <noreply@firmsledger.com>',
          to: process.env.NOTIFY_SUBMISSION_EMAIL,
          subject: `Claim to review: ${company.name}`,
          html: `
            <h2>New listing claim</h2>
            <p><strong>Company:</strong> ${company.name}</p>
            <p><strong>Claimed by:</strong> ${name} (${user.email})</p>
            <p><strong>Work email:</strong> ${workEmail || '—'}</p>
            <p><strong>Phone:</strong> ${phone || '—'}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Domain check:</strong> ${verification} — ${reason}</p>
            <p>Review it in the admin panel under Listing Claims.</p>
          `,
        });
      } catch (emailErr) {
        console.error('Claim notification email failed:', emailErr);
      }
    }

    return NextResponse.json({ status: 'pending', verification });
  } catch (err) {
    console.error('Claim route error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
