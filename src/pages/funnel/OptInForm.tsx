import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { store } from '@/lib/store'
import { trackEvent } from '@/lib/analytics'

export function OptInForm({ source = 'AI Workflow Map opt-in', compact = false }: { source?: string; compact?: boolean }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.includes('@')) {
      setStatus('error')
      return
    }
    setStatus('saving')
    try {
      const contact = await store.createContact({
        name: email.split('@')[0],
        email,
        source,
        tags: ['lead-magnet'],
      })
      await store.enrollWelcome(contact)
      trackEvent('form_submit', { form: 'lead_magnet_optin', source })
      trackEvent('generate_lead', { source })
      navigate('/thank-you')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'flex w-full flex-col gap-2 sm:flex-row' : 'flex w-full max-w-md flex-col gap-3'}>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your work email"
        aria-label="Email address"
        className="bg-card"
      />
      <Button type="submit" variant="accent" size="lg" disabled={status === 'saving'} className="shrink-0">
        {status === 'saving' ? 'Sending...' : 'Send My Free Map'}
        <ArrowRight className="h-4 w-4" />
      </Button>
      {status === 'error' && <p className="text-sm text-destructive">That email did not go through. Check it and try again.</p>}
      {!compact && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          Free PDF edition. No spam, unsubscribe anytime.
        </p>
      )}
    </form>
  )
}
