// Edge function: stripe-webhook
// Handles checkout.session.completed: marks the buyer as a customer in the
// CRM, tags the purchased products, and records delivery of the product
// files listed in public.products (file_path under /products).
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// Deploy with JWT verification off: supabase functions deploy stripe-webhook --no-verify-jwt
// Point the Stripe webhook endpoint at this function URL (test mode first).

import Stripe from 'https://esm.sh/stripe@16?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (err) {
    return new Response(`Webhook signature failed: ${String(err)}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email ?? session.customer_email
    const organizationId = session.metadata?.organization_id
    const slugs = (session.metadata?.slugs ?? '').split(',').filter(Boolean)

    if (email && organizationId) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      const { data: contact } = await supabase
        .from('contacts')
        .select('id, tags')
        .eq('organization_id', organizationId)
        .eq('email', email)
        .maybeSingle()

      if (contact) {
        const tags = Array.from(new Set([...(contact.tags ?? []), ...slugs]))
        await supabase
          .from('contacts')
          .update({ status: 'customer', tags, deal_status: 'closed_won', last_contacted_at: new Date().toISOString() })
          .eq('id', contact.id)
        await supabase.from('messages').insert({
          organization_id: organizationId,
          contact_id: contact.id,
          channel: 'note',
          direction: 'outbound',
          body: `Stripe checkout completed (test mode unless live keys are set). Deliver: ${slugs.join(', ')}. Product files live in /products and are emailed by the delivery worker.`,
        })
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
