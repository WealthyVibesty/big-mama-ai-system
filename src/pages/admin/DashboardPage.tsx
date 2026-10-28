import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, FolderKanban, Hourglass, ListTodo, Send, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { dashboardStats } from '@/lib/insights'
import { formatMoney, timeAgo } from '@/lib/utils'

export default function DashboardPage() {
  const { data, loading } = useAsync(async () => {
    const [contacts, deals, projects, tasks, appointments] = await Promise.all([
      store.listContacts(),
      store.listDeals(),
      store.listProjects(),
      store.listTasks(),
      store.listAppointments(),
    ])
    return { contacts, deals, projects, tasks, appointments }
  })

  if (loading || !data) return <p className="text-sm text-muted-foreground">Loading your command center...</p>
  const stats = dashboardStats(data)
  const contactName = (id: string) => data.contacts.find((c) => c.id === id)?.name ?? 'Contact'

  const tiles = [
    { label: 'Follow-ups due today', value: stats.tasksDueToday.length, icon: ListTodo },
    { label: 'Overdue tasks', value: stats.overdueTasks.length, icon: AlertTriangle },
    { label: 'Deals waiting', value: stats.dealsWaiting.length, icon: Hourglass },
    { label: 'Projects in progress', value: stats.projectsInProgress.length, icon: FolderKanban },
    { label: 'Appointments coming', value: stats.appointments.length, icon: CalendarDays },
    { label: 'Proposals pending', value: stats.proposalsPending.length, icon: Send },
    { label: 'Completed projects', value: stats.completedProjects.length, icon: Trophy },
    { label: 'Pipeline value', value: formatMoney(stats.pipelineValue), icon: Trophy },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Owner dashboard</h1>
          <p className="text-sm text-muted-foreground">What needs you today, in one view.</p>
        </div>
        <Link to="/admin/assistant" className="text-sm font-semibold text-link">Ask the AI Assistant what to do first</Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="p-4">
              <tile.icon className="h-5 w-5 text-secondary" />
              <p className="mt-2 text-2xl font-extrabold">{tile.value}</p>
              <p className="text-xs text-muted-foreground">{tile.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks due and overdue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...stats.overdueTasks, ...stats.tasksDueToday].slice(0, 6).map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 rounded-md bg-muted p-3">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.contact_id ? contactName(task.contact_id) : 'General'}</p>
                </div>
                <Badge variant="muted" className={stats.overdueTasks.includes(task) ? 'border-transparent bg-destructive text-destructive-foreground' : undefined}>
                  {task.due_date ? timeAgo(task.due_date) : 'no date'}
                </Badge>
              </div>
            ))}
            {stats.overdueTasks.length + stats.tasksDueToday.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing due. The system is caught up.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deals waiting on you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.dealsWaiting.slice(0, 6).map((deal) => (
              <div key={deal.id} className="flex items-start justify-between gap-3 rounded-md bg-muted p-3">
                <div>
                  <p className="text-sm font-medium">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">{contactName(deal.contact_id)}, untouched since {timeAgo(deal.updated_at)}</p>
                </div>
                <span className="text-sm font-bold text-secondary">{formatMoney(deal.value)}</span>
              </div>
            ))}
            {stats.dealsWaiting.length === 0 && <p className="text-sm text-muted-foreground">No stale deals. Nice.</p>}
            <Link to="/admin/deals" className="inline-block pt-1 text-sm font-semibold text-link">Open the pipeline</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
