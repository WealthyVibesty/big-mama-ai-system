// Edge function: draft-ai-reply
// The AI Response Agent. Drafts a reply to an inbound message in the
// Wealthy Vibes Ty voice. The draft is returned to the CRM composer and a
// human approves it before anything sends. Nothing auto-sends, ever.
// Secret: OPENAI_API_KEY. Without it, returns a template-based draft.
// Deploy: supabase functions deploy draft-ai-reply

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You draft short replies for Wealthy Vibes Ty, an AI systems business.
Voice: confident, aspirational, direct, modern, entrepreneur-focused. Short lines.
Rules: never invent numbers, results, or offers. Prices, only if asked: Digital Architect
tiers are $97 DIY guidance, $297 we create you post, $997 full service, never discounted.
Handle objections calmly, answer booking questions by offering a short call, and ask one
qualifying question when the lead is vague. No em dashes.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { message, channel, contact_name } = await req.json()
    const firstName = (contact_name ?? 'there').split(' ')[0]
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      const draft = `Hi ${firstName}, thanks for reaching out. Happy to help with that. The fastest next step is a short call so we can map exactly what your second brain should take off your plate first. Want me to send a couple of times that work this week?`
      return new Response(JSON.stringify({ draft, source: 'template' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Channel: ${channel}\nContact: ${contact_name}\nTheir message: """${message}"""\nDraft the reply.` },
        ],
        temperature: 0.6,
      }),
    })
    const data = await res.json()
    const draft = data?.choices?.[0]?.message?.content ?? ''
    return new Response(JSON.stringify({ draft, source: 'openai' }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: cors })
  }
})
