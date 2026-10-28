// Edge function: stripe-checkout
// Creates a Stripe Checkout session for the funnel offer stack.
// TEST MODE until live keys replace the test keys in Supabase secrets.
// Secrets: STRIPE_SECRET_KEY. Prices are read from public.products so the
// catalog in /products and the database stay the source of truth.
// Deploy: supabase functions deploy stripe-checkout

import Stripe from 'https://esm.sh/stripe@16?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { items, email, organization_id } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'items are required' }), { status: 400, headers: cors })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: products, error } = await supabase.from('products').select('*').in('slug', items).eq('active', true)
    if (error || !products?.length) throw new Error('Products not found')

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://wealthyvibesty.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: products.map((p) => ({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: p.price,
          product_data: { name: `Wealthy Vibes Ty: ${p.name}` },
        },
      })),
      metadata: { organization_id: organization_id ?? '', slugs: items.join(',') },
      success_url: `${siteUrl}/thank-you?checkout=success`,
      cancel_url: `${siteUrl}/thank-you?checkout=cancelled`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: cors })
  }
})
