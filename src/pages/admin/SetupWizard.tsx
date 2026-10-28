import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Mail, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CsvImport } from '@/components/CsvImport'
import { supabaseConfigured } from '@/lib/supabase'

const DONE_KEY = 'big-mama-ai-setup-done'

const STEPS = [
  { icon: Mail, title: 'Connect Gmail', text: 'Plug your Gmail into the CRM so email sends and lands in the unified inbox.' },
  { icon: Users, title: 'Import your customers', text: 'Upload your existing list on day one. Map the fields, and they are in.' },
  { icon: CalendarClock, title: 'Set your hours', text: 'Availability and business hours drive booking confirmations and reminders.' },
]

export default function SetupWizard() {
  const [step, setStep] = useState(0)
  const [hours, setHours] = useState({ open: '09:00', close: '17:00', days: 'Mon to Fri' })
  const [finished, setFinished] = useState(() => localStorage.getItem(DONE_KEY) === 'yes' && new URLSearchParams(window.location.search).get('force') !== '1')

  function finish() {
    localStorage.setItem(DONE_KEY, 'yes')
    localStorage.setItem('big-mama-ai-business-hours', JSON.stringify(hours))
    setFinished(true)
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-4 text-2xl font-bold">Setup is done</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your command center is ready. Re-run the wizard anytime from here.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/admin"><Button variant="accent">Open the Dashboard</Button></Link>
              <Button variant="outline" onClick={() => setFinished(false)}>Run Setup Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Current = STEPS[step]

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">First-login setup</h1>
      <p className="mt-1 text-sm text-muted-foreground">Three steps and the command center is yours.</p>

      <div className="mt-5 flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setStep(i)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.title}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Current.icon className="h-5 w-5 text-secondary" />
            Step {step + 1}: {Current.title}
          </CardTitle>
          <CardDescription>{Current.text}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">
                Gmail connects through Google OAuth. The authorize flow lives in the <code>gmail-oauth</code> edge
                function and needs GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your Supabase secrets.
              </p>
              <div className="rounded-md bg-muted p-4 text-sm">
                {supabaseConfigured
                  ? 'Supabase is connected. Deploy the gmail-oauth edge function, then start the connect flow from here.'
                  : 'Demo mode: Gmail OAuth activates once Supabase and the Gmail client credentials are added. Nothing to connect yet.'}
              </div>
              <Button variant="accent" disabled={!supabaseConfigured}>Connect Gmail</Button>
              {!supabaseConfigured && <p className="text-xs text-muted-foreground">Button activates when the backend is connected.</p>}
            </div>
          )}

          {step === 1 && <CsvImport />}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="open">Opens</Label>
                  <Input id="open" type="time" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="close">Closes</Label>
                  <Input id="close" type="time" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="days">Days</Label>
                  <Input id="days" value={hours.days} onChange={(e) => setHours({ ...hours, days: e.target.value })} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Saved to the organization record when Supabase is connected. Kept on this device in demo mode.</p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="accent" onClick={() => setStep((s) => s + 1)}>Next Step</Button>
            ) : (
              <Button variant="accent" onClick={finish}>Finish Setup</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
