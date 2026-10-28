import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, CalendarClock, FileText, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Seo } from '@/components/Seo'

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function HomePage() {
  return (
    <>
      <Seo
        title="Wealthy Vibes Ty | AI Systems for the Modern Entrepreneur"
        description="I install a second brain for your business. Big Mama AI runs follow-up, content, outbound, support and booking while you run the business."
        path="/home"
      />
      {/* Hero on the anchor phrase */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-16 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            AI Systems for the Modern Entrepreneur
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            I install a second brain for your business. It does the computer work, so your days go back to the work only you can do.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button variant="accent" size="lg" onClick={() => undefined}>
                Get the Free Workflow Map <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg">See How It Works</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Intro */}
      <motion.section {...fade} className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <Bot className="h-7 w-7 text-secondary" />
              <h2 className="mt-3 text-lg font-bold">The work gets done</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Follow-up, content, outbound, support, and booking run on one installed system, not on your memory.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <FileText className="h-7 w-7 text-secondary" />
              <h2 className="mt-3 text-lg font-bold">Your voice stays yours</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The system is built on your brand identity and your words, not generic AI output that sounds like everyone else.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CalendarClock className="h-7 w-7 text-secondary" />
              <h2 className="mt-3 text-lg font-bold">You own the system</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Done-for-you automation, prompts, and systems, owned and controlled by you. No course to finish, no homework.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Social proof: placeholders only until approved stories are cleared to publish */}
      <motion.section {...fade} className="border-y bg-card">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <h2 className="text-center text-2xl font-bold">Owners who handed off the computer work</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border-dashed">
                <CardContent className="p-6">
                  <Quote className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Testimonial placeholder {n}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Approved client story publishes here. No results are claimed until they are real and cleared.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Primary CTA to the funnel */}
      <motion.section {...fade} className="mx-auto w-full max-w-6xl px-5 py-16 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Start with the free map</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          The AI Workflow Map shows the first systems to hand off, in the order to hand them off.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="accent" size="lg">Get the Free Map <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </motion.section>
    </>
  )
}
