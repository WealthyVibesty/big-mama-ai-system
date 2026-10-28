import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Gauge,
  Inbox,
  KanbanSquare,
  LogOut,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/admin/contacts', label: 'Contacts', icon: Users },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { to: '/admin/deals', label: 'Deals', icon: KanbanSquare },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/booking', label: 'Booking', icon: CalendarDays },
  { to: '/admin/workflows', label: 'Workflows', icon: Workflow },
  { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
  { to: '/admin/setup', label: 'Setup', icon: ClipboardList },
]

export default function AdminLayout() {
  const { email, demoMode, signOut } = useAuth()
  const navigate = useNavigate()

  async function onSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
          <Link to="/admin" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">WV</span>
            Big Mama AI CRM
          </Link>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline">
                Demo data: connect Supabase in .env to go live
              </span>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <button onClick={onSignOut} className="flex items-center gap-1 text-sm font-medium text-link" aria-label="Sign out">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2" aria-label="CRM">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
