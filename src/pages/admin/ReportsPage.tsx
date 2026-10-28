import { Card, CardContent } from '@/components/ui/card'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { formatMoney, isOverdue } from '@/lib/utils'

export default function ReportsPage() {
  const { data, loading } = useAsync(async () => {
    const [contacts, deals, projects, tasks, appointments, messages] = await Promise.all([
      store.listContacts(),
      store.listDeals(),
      store.listProjects(),
      store.listTasks(),
      store.listAppointments(),
      store.listMessages(),
    ])
    return { contacts, deals, projects, tasks, appointments, messages }
  })

  if (loading || !data) return <p className="text-sm text-muted-foreground">Building your report...</p>

  const openDeals = data.deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.stage))
  const sources = new Map<string, number>()
  for (const contact of data.contacts) {
    const key = contact.source ?? 'Unknown'
    sources.set(key, (sources.get(key) ?? 0) + 1)
  }

  const stats: { label: string; value: string }[] = [
    { label: 'Total leads', value: String(data.contacts.filter((c) => c.status === 'lead').length) },
    { label: 'Customers', value: String(data.contacts.filter((c) => c.status === 'customer').length) },
    { label: 'Active opportunities', value: String(openDeals.length) },
    { label: 'Booked appointments', value: String(data.appointments.filter((a) => ['booked', 'confirmed'].includes(a.status)).length) },
    { label: 'Pipeline value', value: formatMoney(openDeals.reduce((s, d) => s + d.value, 0)) },
    { label: 'Closed deals', value: String(data.deals.filter((d) => d.stage === 'closed_won').length) },
    { label: 'Closed value', value: formatMoney(data.deals.filter((d) => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0)) },
    { label: 'Active projects', value: String(data.projects.filter((p) => p.status !== 'completed').length) },
    { label: 'Completed projects', value: String(data.projects.filter((p) => p.status === 'completed').length) },
    { label: 'Tasks due', value: String(data.tasks.filter((t) => t.status !== 'done').length) },
    { label: 'Overdue tasks', value: String(data.tasks.filter((t) => t.status !== 'done' && isOverdue(t.due_date)).length) },
    { label: 'Follow-up messages sent', value: String(data.messages.filter((m) => m.direction === 'outbound').length) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Reports</h1>
      <p className="text-sm text-muted-foreground">The numbers that run the business, straight from the CRM.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Lead sources</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...sources.entries()].map(([source, count]) => (
          <Card key={source}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">{source}</span>
              <span className="text-xl font-extrabold text-secondary">{count}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
