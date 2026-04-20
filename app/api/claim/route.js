import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, company_name, plan, agency_id, agency_slug } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    // Store claim request in a claims table (or leads table as fallback)
    const claimData = {
      company_name: company_name || 'Unknown',
      contact_email: email,
      contact_phone: phone || null,
      description: `CLAIM REQUEST\nPlan: ${plan || 'pro'}\nName: ${name}\nRole: ${role}\nAgency ID: ${agency_id || 'N/A'}\nAgency Slug: ${agency_slug || 'N/A'}`,
      status: 'Open',
    };

    const { error } = await supabase.from('leads').insert(claimData);

    if (error) {
      console.error('Claim insert error:', error);
      return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
    }

    // Send notification email if Resend is configured
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_SUBMISSION_EMAIL) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'FirmsLedger <noreply@firmsledger.com>',
          to: process.env.NOTIFY_SUBMISSION_EMAIL,
          subject: `New Claim Request: ${company_name || 'Unknown'} (${plan || 'pro'})`,
          html: `
            <h2>New Claim Request</h2>
            <p><strong>Company:</strong> ${company_name}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Plan:</strong> ${plan || 'pro'}</p>
            <p><strong>Agency Slug:</strong> ${agency_slug || 'N/A'}</p>
          `,
        });
      } catch (emailErr) {
        console.error('Claim notification email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Claim route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
