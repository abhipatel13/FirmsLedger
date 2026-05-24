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
    .from('marketplace_rfqs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rfqs: data });
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { product_name, title, specifications, quantity, unit, budget_range, payment_terms,
      delivery_deadline, category, contact_name, contact_email, company_name, country } = body;

    if (!product_name?.trim() || !contact_name?.trim() || !contact_email?.trim()) {
      return NextResponse.json({ error: 'Product name, contact name, and email are required.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('marketplace_rfqs')
      .insert({
        title: title?.trim() || product_name.trim(),
        product_name: product_name.trim(),
        specifications: specifications?.trim() || null,
        quantity: quantity ? parseInt(quantity) : null,
        unit: unit?.trim() || 'units',
        budget_range: budget_range?.trim() || null,
        payment_terms: payment_terms?.trim() || null,
        delivery_deadline: delivery_deadline?.trim() || null,
        category: category?.trim() || null,
        contact_name: contact_name.trim(),
        contact_email: contact_email.trim().toLowerCase(),
        company_name: company_name?.trim() || null,
        country: country?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (resend) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `[FirmsLedger Marketplace] New RFQ: ${data.product_name}`,
        html: `
          <h2>New RFQ Posted</h2>
          <p><strong>Product:</strong> ${esc(data.product_name)}</p>
          <p><strong>Company:</strong> ${esc(data.company_name)}</p>
          <p><strong>Quantity:</strong> ${esc(data.quantity)} ${esc(data.unit)}</p>
          <p><strong>Budget:</strong> ${esc(data.budget_range)}</p>
          <p><strong>Specs:</strong> ${esc(data.specifications)}</p>
          <p><strong>Contact:</strong> ${esc(data.contact_name)} — ${esc(data.contact_email)}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'}/marketplace/rfqs/${data.id}">View RFQ →</a></p>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ rfq: data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/marketplace/rfqs error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
