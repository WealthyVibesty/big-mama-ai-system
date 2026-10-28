// Edge function: send-welcome-email
// Sends Email 1 of the welcome sequence immediately through Resend and
// enrolls the contact in public.email_sequences for steps 2 and 3
// (a scheduled worker or cron picks up due enrollments).
// Secrets: RESEND_API_KEY, RESEND_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY.
// Deploy: supabase functions deploy send-welcome-email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { welcomeSequence } from '../_shared/email-templates.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { contact_id, email, name, organization_id } = await req.json()
    if (!email) return new Response(JSON.stringify({ error: 'email is required' }), { status: 400, headers: cors })

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Wealthy Vibes Ty <hello@wealthyvibesty.com>'
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://wealthyvibesty.com'
    const firstName = (name ?? 'there').split(' ')[0]
    const [first] = welcomeSequence(firstName, siteUrl)

    let sent = false
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [email], subject: first.subject, html: first.html }),
      })
      sent = res.ok
      if (!res.ok) console.error('Resend error', await res.text())
    } else {
      console.warn('RESEND_API_KEY not set: welcome email simulated, not sent.')
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    if (contact_id && organization_id) {
      await supabase.from('email_sequences').insert({
        organization_id,
        contact_id,
        sequence_key: 'welcome',
        step: 1,
        status: 'active',
        next_send_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      })
    }

    return new Response(JSON.stringify({ ok: true, sent }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: cors })
  }
})
