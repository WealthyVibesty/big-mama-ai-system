// Edge function: gmail-oauth (stub)
// Setup wizard step 1. Exchanges the Google OAuth flow for the CRM Gmail
// Assistant: send and receive business email inside the unified inbox.
// Secrets: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI.
// Deploy: supabase functions deploy gmail-oauth
//
// GET  ?action=authorize  -> { url } Google consent screen URL
// GET  ?code=...          -> exchanges the code, stores the refresh token
//                            against the organization (store in a private
//                            table or Vault before production use).

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const url = new URL(req.url)
  const clientId = Deno.env.get('GMAIL_CLIENT_ID')
  const redirectUri = Deno.env.get('GMAIL_REDIRECT_URI')

  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({ error: 'Gmail OAuth is not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI as Supabase secrets.' }),
      { status: 501, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  if (url.searchParams.get('action') === 'authorize') {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly')
    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const code = url.searchParams.get('code')
  if (code) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: Deno.env.get('GMAIL_CLIENT_SECRET')!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: 'Token exchange failed', detail: tokens }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    // TODO before production: persist tokens.refresh_token in Supabase Vault
    // keyed by organization_id. Never store it in a public table.
    return new Response(JSON.stringify({ ok: true, connected: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Missing action or code' }), {
    status: 400,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
