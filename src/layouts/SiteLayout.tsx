import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoiceWidget } from '@/components/VoiceWidget'
import { store } from '@/lib/store'
import { trackEvent, trackPageView } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

function FooterSignup() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.includes('@')) return
    const contact = await store.createContact({ name: email.split('@')[0], email, source: 'Footer newsletter signup', tags: ['newsletter'] })
    await store.enrollWelcome(contact)
    trackEvent('form_submit', { form: 'footer_signup' })
    setDone(true)
  }

  if (done) return <p className="text-sm font-medium text-accent">You are in. Check your inbox for the map.</p>
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for the free map" aria-label="Email address" />
      <Button type="submit" variant="accent">Get It Free</Button>
    </form>
  )
}

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link to="/home" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">WV</span>
            Wealthy Vibes Ty
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('text-sm font-medium hover:text-link', isActive && 'text-secondary')}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/">
              <Button variant="accent" size="sm">Get the Free Map</Button>
            </Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav className="border-t bg-card px-5 py-3 md:hidden" aria-label="Mobile">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="block py-2 font-medium">
                {item.label}
              </NavLink>
            ))}
            <Link to="/" className="block py-2 font-semibold text-link">Get the Free Map</Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
          <div>
            <p className="font-extrabold">Wealthy Vibes Ty</p>
            <p className="mt-2 text-sm text-muted-foreground">AI Systems for the Modern Entrepreneur.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Questions: <a className="text-link" href="mailto:tyler@wealthyvibesty.com">tyler@wealthyvibesty.com</a>
            </p>
          </div>
          <nav className="space-y-2 text-sm" aria-label="Footer">
            <p className="font-semibold">Pages</p>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="block text-muted-foreground hover:text-link">{item.label}</Link>
            ))}
            <Link to="/" className="block text-muted-foreground hover:text-link">Free AI Workflow Map</Link>
          </nav>
          <div>
            <p className="font-semibold">Start free</p>
            <p className="mb-3 mt-2 text-sm text-muted-foreground">The AI Workflow Map, delivered to your inbox.</p>
            <FooterSignup />
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Wealthy Vibes Ty. All rights reserved.
        </div>
      </footer>

      <VoiceWidget />
    </div>
  )
}
