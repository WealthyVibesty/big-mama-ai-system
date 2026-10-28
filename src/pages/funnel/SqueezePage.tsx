import { motion } from 'framer-motion'
import { CalendarCheck2, Inbox, Megaphone, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'
import { OptInForm } from './OptInForm'

/*
  FUNNEL SURFACE: this page and /thank-you only.
  No navbar, no footer links, no other routes. Every CTA is the opt-in.
*/

const OUTCOMES = [
  { icon: CalendarCheck2, text: 'A 5-day content calendar mapped to your voice, ready to post' },
  { icon: Inbox, text: 'The first three workflows to hand off: follow-up, content, booking' },
  { icon: Megaphone, text: 'A clear picture of what your second brain takes over first' },
]

export default function SqueezePage() {
  return (
    <div className="min-h-screen bg-background pb-28">
      <Seo
        title="The AI Workflow Map, Free | Wealthy Vibes Ty"
        description="Get the free 5-day content calendar edition of The AI Workflow Map. See the first workflows your business should hand to its second brain."
        path="/"
      />
      <main className="mx-auto w-full max-w-3xl px-5">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center pt-14 text-center"
        >
          <Badge variant="secondary" className="mb-5">Wealthy Vibes Ty</Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Your Second Brain, Installed For You
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Big Mama AI runs your follow-up, content, outbound, support, and booking while you run the business. You own the system.
          </p>
          <div className="mt-8 flex w-full flex-col items-center">
            <OptInForm />
          </div>
        </motion.section>

        {/* Problem agitation */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold">The computer work is eating your day</h2>
          <div className="mt-4 space-y-3 text-base leading-relaxed">
            <p>Leads come in and wait. Follow-up lives in your head and gets forgotten.</p>
            <p>Content only ships when you find a spare hour, which is almost never.</p>
            <p>Your business runs on texts, emails, spreadsheets, and memory. That is the bottleneck.</p>
          </div>
        </motion.section>

        {/* Promise */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14"
        >
          <h2 className="text-2xl font-bold">One system does the work</h2>
          <p className="mt-4 leading-relaxed">
            Big Mama AI is the done-for-you automation layer for your whole business. It follows up, posts, reaches out,
            supports, and books while you do the work only you can do. Start with the free map.
          </p>
        </motion.section>

        {/* Outcome stack */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14"
        >
          <h2 className="text-2xl font-bold">Inside The AI Workflow Map</h2>
          <div className="mt-5 grid gap-3">
            {OUTCOMES.map((item) => (
              <Card key={item.text}>
                <CardContent className="flex items-center gap-4 p-5">
                  <item.icon className="h-6 w-6 shrink-0 text-secondary" />
                  <p className="font-medium">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Social proof placeholders: no invented results, filled only with approved client stories */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold">What owners say</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border-dashed">
                <CardContent className="p-5">
                  <Quote className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Testimonial placeholder {n}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Approved client story publishes here.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky CTA bar with the same opt-in form */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm font-semibold">Get The AI Workflow Map, free</p>
          <div className="w-full sm:w-auto sm:min-w-[380px]">
            <OptInForm compact source="AI Workflow Map opt-in (sticky bar)" />
          </div>
        </div>
      </div>
    </div>
  )
}
