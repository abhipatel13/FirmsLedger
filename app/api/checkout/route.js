import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const body = await request.json();
    const { plan, email, agency_slug } = body;

    // Price IDs should be set in env vars after creating products in Stripe Dashboard
    const priceMap = {
      pro: process.env.STRIPE_PRO_PRICE_ID,
      featured: process.env.STRIPE_FEATURED_PRICE_ID,
    };

    const priceId = priceMap[plan];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/claim-listing?success=true&agency=${agency_slug || ''}`,
      cancel_url: `${APP_URL}/claim-listing`,
      metadata: {
        plan,
        agency_slug: agency_slug || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
