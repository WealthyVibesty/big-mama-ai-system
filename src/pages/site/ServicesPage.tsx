import { Link } from 'react-router-dom'
import { ArrowRight, Bot, BrainCircuit, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'

const SERVICES = [
  {
    icon: BrainCircuit,
    title: 'AI Systems',
    outcome: 'Your business runs on rails instead of memory',
    body: 'We map the work your business repeats every week, then install the systems that do it: lead capture, follow-up, booking, and the owner dashboard that shows what needs you and what does not.',
  },
  {
    icon: Bot,
    title: 'Big Mama AI Automation',
    outcome: 'A second brain that works while you do',
    body: 'The done-for-you automation layer for the whole business: finances follow-up, outbound, support, marketing, and voice agents, connected and running. You bring the business. The system does the computer work.',
  },
  {
    icon: PenLine,
    title: 'Content Systems',
    outcome: 'Consistent content in your voice, on schedule',
    body: 'A content engine built on your brand identity, so posts, emails, and campaigns ship every week without you sitting down to write them. Your voice, your offers, your calendar.',
  },
]

const TIERS = [
  { name: 'DIY Guidance', price: '$97', note: 'The map, the prompts, and the guidance to install it yourself.' },
  { name: 'We Create, You Post', price: '$297', note: 'Your system and content built for you. You approve and post.' },
  { name: 'Full Service', price: '$997', note: 'The full install, managed. The 24/7 Digital Architect, running.' },
]

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Services | Wealthy Vibes Ty"
        description="AI Systems, Big Mama AI automation, and content systems for owner-led companies. Benefits and transformations, priced at $97, $297, and $997 tiers."
        path="/services"
      />
      <section className="mx-auto w-full max-w-6xl px-5 py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight">Systems that give you your week back</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Every service ends the same way: the work gets done without you doing it, and you own the system that does it.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SERVICES.map((service) => (
            <Card key={service.title} className="flex flex-col">
              <CardHeader>
                <service.icon className="h-8 w-8 text-secondary" />
                <CardTitle className="pt-2">{service.title}</CardTitle>
                <CardDescription className="font-semibold text-accent">{service.outcome}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed">{service.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-extrabold tracking-tight">The 24/7 Digital Architect</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The signature offer. Pick the level of help that fits where you are. Prices are set and never discounted.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Card key={tier.name} className={i === 2 ? 'border-secondary' : undefined}>
              <CardContent className="p-6">
                {i === 2 && <Badge variant="secondary" className="mb-3">Full install</Badge>}
                <p className="font-bold">{tier.name}</p>
                <p className="mt-2 text-3xl font-extrabold text-secondary">{tier.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tier.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/contact">
            <Button variant="accent" size="lg">Talk About Your Install <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Not sure yet? <Link to="/" className="text-link font-medium">Start with the free AI Workflow Map.</Link>
          </p>
        </div>
      </section>
    </>
  )
}
