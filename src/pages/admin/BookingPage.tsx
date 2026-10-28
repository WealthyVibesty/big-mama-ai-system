import { CalendarDays, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'

/*
  Booking: your booking link lives in Cal.com (VITE_CAL_LINK). Confirmations
  and reminders go out by text and email through the follow-up workflows;
  reschedule and cancel are handled on the booking link itself, and every
  new booking fires an internal alert to the owner.
*/
export default function BookingPage() {
  const calLink = import.meta.env.VITE_CAL_LINK as string | undefined
  const { data } = useAsync(async () => {
    const [appointments, contacts] = await Promise.all([store.listAppointments(), store.listContacts()])
    return { appointments, contacts }
  })
  const contactName = (id: string) => data?.contacts.find((c) => c.id === id)?.name ?? 'Contact'

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Booking</h1>
      <p className="text-sm text-muted-foreground">One link for discovery calls. Confirmations and reminders run automatically.</p>

      <Card className="mt-5">
        <CardHeader><CardTitle>Your booking link</CardTitle></CardHeader>
        <CardContent>
          {calLink ? (
            <div className="space-y-4">
              <p className="break-all rounded-md bg-muted p-3 text-sm">{calLink}</p>
              <a href={calLink} target="_blank" rel="noreferrer">
                <Button variant="accent"><ExternalLink className="h-4 w-4" /> Open Booking Page</Button>
              </a>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border">
                <iframe title="Booking calendar" src={calLink} className="h-full w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                The Cal.com embed slot is ready. Add your booking link as <code>VITE_CAL_LINK</code> in .env and this
                page shows your live calendar, your public link, and the embed.
              </p>
              <p className="text-muted-foreground">
                What runs either way: confirmation text and email on booking, reminders 24 hours and 1 hour before,
                reschedule and cancel from the booking page, and an internal alert to you the moment someone books.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold">
        <CalendarDays className="h-5 w-5 text-secondary" /> Upcoming appointments
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(data?.appointments ?? []).map((appt) => (
          <Card key={appt.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{appt.title}</p>
                <Badge variant="outline">{appt.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{contactName(appt.contact_id)}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(appt.starts_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </CardContent>
          </Card>
        ))}
        {(data?.appointments ?? []).length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
      </div>
    </div>
  )
}
