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

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { rfq_id, supplier_id, responder_name, responder_email, responder_company, message } = body;

    if (!responder_name?.trim() || !responder_email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }
    if (!rfq_id && !supplier_id) {
      return NextResponse.json({ error: 'rfq_id or supplier_id required.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('marketplace_responses')
      .insert({
        rfq_id: rfq_id || null,
        supplier_id: supplier_id || null,
        responder_name: responder_name.trim(),
        responder_email: responder_email.trim().toLowerCase(),
        responder_company: responder_company?.trim() || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Increment response/inquiry counter
    if (rfq_id) {
      await supabase.rpc('increment_rfq_responses', { rfq_uuid: rfq_id }).catch(() => {});
    }
    if (supplier_id) {
      await supabase.rpc('increment_supplier_inquiries', { supplier_uuid: supplier_id }).catch(() => {});
    }

    // Notify admin + poster
    if (resend) {
      let posterEmail = null;
      let posterName = null;
      let subject = '';
      let context = '';

      if (rfq_id) {
        const { data: rfq } = await supabase
          .from('marketplace_rfqs')
          .select('contact_email, contact_name, product_name')
          .eq('id', rfq_id)
          .single();
        if (rfq) {
          posterEmail = rfq.contact_email;
          posterName = rfq.contact_name;
          subject = `Response to your RFQ: ${rfq.product_name}`;
          context = `RFQ for: <strong>${esc(rfq.product_name)}</strong>`;
        }
      } else if (supplier_id) {
        const { data: supplier } = await supabase
          .from('marketplace_suppliers')
          .select('contact_email, contact_name, product_name, company_name')
          .eq('id', supplier_id)
          .single();
        if (supplier) {
          posterEmail = supplier.contact_email;
          posterName = supplier.contact_name;
          subject = `Inquiry about your product: ${supplier.product_name}`;
          context = `Supplier listing: <strong>${esc(supplier.company_name)}</strong> — ${esc(supplier.product_name)}`;
        }
      }

      const html = `
        <h2>New Message on FirmsLedger Marketplace</h2>
        <p>${context}</p>
        <hr/>
        <p><strong>From:</strong> ${esc(responder_name)} (${esc(responder_company)})</p>
        <p><strong>Email:</strong> ${esc(responder_email)}</p>
        <h3>Message:</h3>
        <blockquote style="background:#f5f5f5;padding:12px;border-radius:6px;">${esc(message)}</blockquote>
        <p style="color:#888;font-size:12px;">Reply directly to this email to respond.</p>
      `;

      const sends = [
        resend.emails.send({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject: `[Marketplace] ${subject}`, html }).catch(() => {}),
      ];
      if (posterEmail) {
        sends.push(
          resend.emails.send({
            from: FROM_EMAIL,
            to: posterEmail,
            replyTo: responder_email,
            subject,
            html,
          }).catch(() => {})
        );
      }
      await Promise.all(sends);
    }

    return NextResponse.json({ response: data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/marketplace/respond error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
