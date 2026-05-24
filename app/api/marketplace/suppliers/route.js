import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.NOTIFY_SUBMISSION_EMAIL || 'abhipatel8675@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'FirmsLedger <onboarding@resend.dev>';

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET() {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from('marketplace_suppliers')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ suppliers: data });
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { company_name, product_name, description, certifications, min_order_qty,
      lead_time, price_range, category, contact_name, contact_email, website, country, patents } = body;

    if (!company_name?.trim() || !product_name?.trim() || !contact_name?.trim() || !contact_email?.trim()) {
      return NextResponse.json(
        { error: 'Company name, product name, contact name, and email are required.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('marketplace_suppliers')
      .insert({
        company_name: company_name.trim(),
        product_name: product_name.trim(),
        description: description?.trim() || null,
        certifications: Array.isArray(certifications)
          ? certifications.filter(Boolean)
          : certifications?.split(',').map((c) => c.trim()).filter(Boolean) || [],
        min_order_qty: min_order_qty?.trim() || null,
        lead_time: lead_time?.trim() || null,
        price_range: price_range?.trim() || null,
        category: category?.trim() || null,
        contact_name: contact_name.trim(),
        contact_email: contact_email.trim().toLowerCase(),
        website: website?.trim() || null,
        country: country?.trim() || null,
        patents: patents?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (resend) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `[FirmsLedger Marketplace] New Supplier: ${data.company_name}`,
        html: `
          <h2>New Supplier Listing</h2>
          <p><strong>Company:</strong> ${esc(data.company_name)}</p>
          <p><strong>Product:</strong> ${esc(data.product_name)}</p>
          <p><strong>Country:</strong> ${esc(data.country)}</p>
          <p><strong>Certifications:</strong> ${esc((data.certifications || []).join(', '))}</p>
          <p><strong>Contact:</strong> ${esc(data.contact_name)} — ${esc(data.contact_email)}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'}/marketplace/suppliers/${data.id}">View Listing →</a></p>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ supplier: data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/marketplace/suppliers error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
