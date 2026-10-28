import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { buildInsights } from '@/lib/insights'

/*
  AI Business Assistant: queries live CRM data and recommends the next
  actions and messages. Every item below is derived from real rows:
  overdue tasks, deals untouched 48 hours, stalled projects, quiet leads.
*/
export default function AssistantPage() {
  const { data, loading } = useAsync(async () => {
    const [contacts, deals, projects, tasks, appointments] = await Promise.all([
      store.listContacts(),
      store.listDeals(),
      store.listProjects(),
      store.listTasks(),
      store.listAppointments(),
    ])
    return buildInsights({ contacts, deals, projects, tasks, appointments })
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <Sparkles className="h-6 w-6 text-secondary" /> AI Business Assistant
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live read of your CRM: overdue tasks, deals untouched in 48 hours, stalled projects, and the next message to send for each.
      </p>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Reading your pipeline...</p>}

      {data && data.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <Lightbulb className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 font-semibold">Nothing needs you right now</p>
            <p className="text-sm text-muted-foreground">No overdue tasks, no stale deals, no stalled projects.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {data?.map((insight, i) => (
          <Card key={`${insight.kind}-${i}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-start gap-2 text-base">
                  {insight.priority === 'high' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  )}
                  {insight.title}
                </CardTitle>
                <Badge variant={insight.priority === 'high' ? 'secondary' : 'muted'}>{insight.priority}</Badge>
              </div>
              <CardDescription>{insight.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              {insight.contactId ? (
                <Link to={`/admin/inbox?contact=${insight.contactId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-link">
                  Draft the message <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-link">
                  Open the task list <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
