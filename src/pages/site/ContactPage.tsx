import { useState, type FormEvent } from 'react'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Seo } from '@/components/Seo'
import { MicButton } from '@/components/MicButton'
import { store } from '@/lib/store'
import { trackEvent } from '@/lib/analytics'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setState('saving')
    try {
      // Writes straight into the CRM contacts table.
      const contact = await store.createContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: 'Website contact form',
        notes: form.message,
        tags: ['inbound'],
      })
      if (form.message) {
        await store.createMessage({ contact_id: contact.id, channel: 'email', direction: 'inbound', body: form.message })
      }
      trackEvent('form_submit', { form: 'contact' })
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <>
      <Seo
        title="Contact | Wealthy Vibes Ty"
        description="Talk to a human. Tell us what computer work is eating your week and we will map the first system to hand off."
        path="/contact"
      />
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <h1 className="text-4xl font-extrabold tracking-tight">Talk to a human</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          No pressure and no pitch deck. Tell us what is eating your week, and you will hear back from a person.
          We reply within one business day.
        </p>
        <p className="mt-4 flex items-center gap-2 font-medium">
          <Mail className="h-5 w-5 text-secondary" />
          <a href="mailto:tyler@wealthyvibesty.com" className="text-link">tyler@wealthyvibesty.com</a>
        </p>

        <Card className="mt-8">
          <CardContent className="p-6">
            {state === 'done' ? (
              <div className="py-6 text-center">
                <p className="text-lg font-bold">Got it. Your message is in.</p>
                <p className="mt-2 text-sm text-muted-foreground">It is already in the CRM, and a human will reply within one business day.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">What is eating your week?</Label>
                  <div className="flex items-start gap-2">
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Follow-up, content, booking, support... tell us where it hurts."
                      className="flex-1"
                    />
                    <MicButton onTranscript={(text) => setForm((f) => ({ ...f, message: f.message ? `${f.message} ${text}` : text }))} />
                  </div>
                </div>
                {state === 'error' && <p className="text-sm text-destructive">That did not send. Try again, or email tyler@wealthyvibesty.com directly.</p>}
                <Button type="submit" variant="accent" size="lg" disabled={state === 'saving'} className="w-full sm:w-auto">
                  {state === 'saving' ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
