import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/Seo'

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Tyler McGregory | Wealthy Vibes Ty"
        description="Tyler McGregory is an AI Business Architect. He installs second brain systems for owner-led companies so the business keeps running while the owner leads."
        path="/about"
      />
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <h1 className="text-4xl font-extrabold tracking-tight">The mission: give owners their days back</h1>
        <p className="mt-6 leading-relaxed">
          Most owners did not start a business to live inside email, follow-up, and content calendars. But that is where
          the hours go: leads waiting on replies, posts that only ship when there is spare time, bookings handled by hand.
          Wealthy Vibes Ty exists to hand that work to a system.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Meet Tyler McGregory</h2>
        <p className="mt-4 leading-relaxed">
          Tyler McGregory is an AI Business Architect and the founder of Wealthy Vibes Ty. His discipline is AI Business
          Architecture: designing the systems a business runs on, then installing them so they keep working without him
          or the owner standing over them.
        </p>
        <p className="mt-4 leading-relaxed">
          His path here ran through family and community first. He grew up around the Rich Park Raiders youth football
          and cheerleading organization, where his father served as president, and later came to South Florida when his
          sister invited him to come figure things out. That season turned into the work: learning AI systems deeply,
          then building them for other owners.
        </p>
        <p className="mt-4 leading-relaxed">
          The signature install is Big Mama AI, the second brain: one system that runs follow-up, content, outbound,
          support, and booking for the whole business, owned and controlled by the customer.
        </p>

        <h2 className="mt-10 text-2xl font-bold">How he works</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
          <li>Systems over motivation. If it matters, it gets automated.</li>
          <li>Your voice, your brand. The system is built on your identity, not templates that flatten it.</li>
          <li>You own it. Prompts, workflows, and data stay under your control.</li>
          <li>Straight talk. No hype claims, no invented numbers, ever.</li>
        </ul>

        <div className="mt-10">
          <Link to="/services">
            <Button variant="accent" size="lg">See the Services <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </>
  )
}
