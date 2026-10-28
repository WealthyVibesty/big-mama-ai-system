import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Package, Palette, ShieldCheck, Sparkles, Type } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'
import { store } from '@/lib/store'
import { formatMoney } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

/*
  Thank-you / one-time offer. The ONLY CTA on this page is Stripe Checkout.
  Prices are locked: Brand Starter Kit $27, Canva Templates Pack bump $17.
*/

const TRIPWIRE_CENTS = 2700
const BUMP_CENTS = 1700
const WINDOW_SECONDS = 15 * 60

const VALUE_STACK = [
  { icon: Type, text: 'Your voice profile, written down so every post sounds like you' },
  { icon: Palette, text: 'Brand identity sheet: colors, fonts, and visual rules in one place' },
  { icon: Sparkles, text: 'Ten ready-to-use prompts for content, follow-up, and outbound' },
  { icon: Package, text: 'Your first 5-day content calendar, planned and ready to post' },
  { icon: CheckCircle2, text: 'Setup checklist that plugs the kit straight into Big Mama AI' },
]

function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(WINDOW_SECONDS)
  useEffect(() => {
    const started = Number(sessionStorage.getItem('oto-window-start') ?? Date.now())
    sessionStorage.setItem('oto-window-start', String(started))
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000)
      setSecondsLeft(Math.max(0, WINDOW_SECONDS - elapsed))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const label = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])
  return { secondsLeft, label }
}

export default function ThankYouPage() {
  const { secondsLeft, label } = useCountdown()
  const [bump, setBump] = useState(true)
  const [state, setState] = useState<'idle' | 'working' | 'demo' | 'error'>('idle')
  const total = TRIPWIRE_CENTS + (bump ? BUMP_CENTS : 0)

  async function checkout() {
    setState('working')
    trackEvent('cta_click', { cta: 'stripe_checkout', bump })
    try {
      const items = bump ? ['tripwire_offer', 'order_bump'] : ['tripwire_offer']
      const url = await store.startCheckout(items)
      if (url) {
        window.location.href = url
        return
      }
      // No backend connected yet: Stripe runs through the edge function in
      // test mode once Supabase env vars are set. Nothing is charged here.
      setState('demo')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Check Your Inbox | Wealthy Vibes Ty"
        description="Your AI Workflow Map is on its way. Before you go, add the Brand Starter Kit for $27."
        path="/thank-you"
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        {/* Confirmation banner */}
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
          <div>
            <p className="font-semibold">Check your inbox</p>
            <p className="text-sm text-muted-foreground">The AI Workflow Map is on its way to you now.</p>
          </div>
        </div>

        {/* OTO hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Badge variant="accent">One-time offer</Badge>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">Start With Your Brand, Ready</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            The Brand Starter Kit turns the map into your system: your voice, your identity, your first calendar, done.
          </p>
          <p className="mt-4 text-3xl font-extrabold text-secondary">{formatMoney(TRIPWIRE_CENTS)}</p>
        </motion.section>

        {/* Value stack */}
        <Card className="mt-8">
          <CardContent className="space-y-4 p-6">
            {VALUE_STACK.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="font-medium">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order bump */}
        <Card className="mt-4 border-accent">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Checkbox id="order-bump" checked={bump} onChange={(e) => setBump(e.target.checked)} className="mt-1" />
              <div>
                <Label htmlFor="order-bump" className="text-base font-semibold">
                  Yes, add the Canva Templates Pack for {formatMoney(BUMP_CENTS)}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  On-brand post templates you can edit in minutes, matched to the identity sheet in your kit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-secondary" />
          {secondsLeft > 0 ? (
            <span>This launch window closes in {label}</span>
          ) : (
            <span>This launch window has closed. Checkout still runs in standard mode.</span>
          )}
        </div>

        {/* Risk reversal */}
        <p className="mt-4 flex items-start justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          If the kit is not useful, reply to your delivery email within 7 days and we will make it right.
        </p>

        {/* The single CTA */}
        <div className="mt-8">
          <Button variant="accent" size="lg" className="w-full text-base" onClick={checkout} disabled={state === 'working'}>
            {state === 'working' ? 'Opening secure checkout...' : `Get the Brand Starter Kit, ${formatMoney(total)} total`}
          </Button>
          {state === 'demo' && (
            <p className="mt-3 rounded-md bg-muted p-3 text-center text-sm text-muted-foreground">
              Stripe test mode: checkout activates as soon as the Supabase and Stripe test keys are added to .env. Nothing was charged.
            </p>
          )}
          {state === 'error' && <p className="mt-3 text-center text-sm text-destructive">Checkout did not open. Try again in a moment.</p>}
          <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout by Stripe. Test mode until live keys are added.</p>
        </div>
      </main>
    </div>
  )
}
