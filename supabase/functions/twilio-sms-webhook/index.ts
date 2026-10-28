// Edge function: twilio-sms-webhook (stub)
// Receives inbound SMS from Twilio and writes it into the unified inbox
// (public.messages). Outbound SMS sends from the CRM through the Twilio
// REST API using the same secrets.
// Secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.
// Deploy with JWT off: supabase functions deploy twilio-sms-webhook --no-verify-jwt
// Point the Twilio number messaging webhook at this function URL.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const form = await req.formData()
  const from = form.get('From')?.toString() ?? ''
  const body = form.get('Body')?.toString() ?? ''
  const organizationId = Deno.env.get('DEFAULT_ORGANIZATION_ID')

  if (from && body && organizationId) {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('phone', from)
      .maybeSingle()

    if (contact) {
      await supabase.from('messages').insert({
        organization_id: organizationId,
        contact_id: contact.id,
        channel: 'sms',
        direction: 'inbound',
        body,
      })
      await supabase.from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', contact.id)
    } else {
      console.warn('Inbound SMS from unknown number, no contact created:', from)
    }
  }

  // Empty TwiML: acknowledge without auto-replying. Auto replies belong in
  // the follow-up workflows so a human stays in control of the voice.
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
})
