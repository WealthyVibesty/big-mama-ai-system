# Big Mama AI System — Wealthy Vibes Ty

The full Big Mama AI stack in one repo, built from the Stage 6 prompts of the
"Idea to Big Mama AI" workflow:

- **Part A — Funnel (2 routes only).** `/` squeeze page for The AI Workflow
  Map (free lead magnet) and `/thank-you` one-time offer: Brand Starter Kit
  $27 with the Canva Templates Pack $17 order bump, single Stripe Checkout CTA.
  No navbar, no footer links, nothing else on the funnel surface.
- **Part B — Website.** `/home`, `/about`, `/services`, `/contact` with
  per-page SEO, JSON-LD Organization schema, GA4 and Meta Pixel slots, an
  ElevenLabs voice widget slot, and a contact form that writes into the CRM.
- **Part C — CRM at `/admin`.** Owner command center behind login: 3-step
  setup wizard (Gmail OAuth, CSV import with field mapping, business hours),
  contacts with CSV import/export, unified inbox (SMS, email, social-ready)
  with a template library and a "Draft AI Reply" agent, deal pipeline,
  project pipeline, owner dashboard, AI Business Assistant that reads live
  data, booking with a Cal.com slot, follow-up workflows, reports, and voice
  dictation on message and note fields.

Digital products live in `/products` and are wired to delivery on opt-in and
checkout events: `lead_magnet.md`, `tripwire_offer.md`, `order_bump.md`,
`signature_offer.md`.

## Stack

React + Vite + Tailwind + shadcn/ui + Supabase (Postgres, Auth, RLS, Edge
Functions) + Framer Motion. Light theme only. Brand tokens live in
`src/index.css`: primary `#CFC8D8`, secondary `#7F54B3`, accent `#958E09`,
background `#F9F9F9`, text `#111111`. No hardcoded hex anywhere else.

## Quick start

```bash
npm install
cp .env.example .env   # fill in what you have; everything degrades gracefully
npm run dev
```

With no Supabase keys set, the app runs in demo mode: the funnel still writes
contact rows (to a local store), the CRM is fully usable with seed data, and
`/admin` login checks `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` from `.env`.
Nothing is hardcoded, and no credential ships in this repo.

## Going live with Supabase

1. Create a Supabase project.
2. `supabase link --project-ref <ref>` then `supabase db push` to apply
   `supabase/migrations/` (schema, RLS scoped by `organization_id`, product
   catalog with locked prices).
3. Create your owner user in Supabase Auth, insert an `organizations` row and
   a `users` row linking your auth user to it.
4. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
   `VITE_DEFAULT_ORGANIZATION_ID` in `.env`.
5. Deploy the edge functions in `supabase/functions/` and set their secrets:
   Resend for the 3-email welcome sequence, OpenAI for reply drafts, Stripe
   (test mode keys until you flip to live), Twilio for SMS, Gmail OAuth for
   the inbox.

## What is stubbed today

- **Gmail OAuth**: authorize flow scaffolded in the `gmail-oauth` edge
  function; token storage needs a Vault-backed table before production.
- **Twilio**: inbound SMS webhook writes to the inbox; outbound send uses the
  same credentials once added.
- **Stripe**: Checkout runs in **test mode** through the edge function.
  Webhook marks buyers as customers and records product delivery.
- **ElevenLabs**: widget slot renders when `VITE_ELEVENLABS_AGENT_ID` is set.
- **Cal.com**: booking embed slot renders when `VITE_CAL_LINK` is set.
- **Admin auth in demo mode** is an env-credential gate for local review.
  Production uses Supabase Auth with RLS.

## Copy rules honored

No invented testimonials, numbers, or claims anywhere. Testimonial slots are
clearly marked placeholders until real client stories are approved. Prices are
exactly: lead magnet free, tripwire $27, order bump $17, signature tiers
$97 / $297 / $997, never discounted.
