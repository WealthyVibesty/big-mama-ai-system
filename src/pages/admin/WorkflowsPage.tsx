import { useState } from 'react'
import { Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FOLLOW_UP_WORKFLOWS } from '@/lib/templates'

const LS_KEY = 'big-mama-ai-workflow-toggles'

/*
  Follow-up workflows. Definitions ship with the system; toggles persist
  per device in demo mode and map to automation rows when the backend
  workers (Twilio and Resend edge functions) are deployed.
*/
export default function WorkflowsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as Record<string, boolean>
    } catch {
      return {}
    }
  })

  function toggle(key: string, value: boolean) {
    const next = { ...enabled, [key]: value }
    setEnabled(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const isOn = (key: string) => enabled[key] !== false

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Follow-up workflows</h1>
      <p className="text-sm text-muted-foreground">The sequences that keep leads, clients, and projects moving without you chasing them.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {FOLLOW_UP_WORKFLOWS.map((workflow) => (
          <Card key={workflow.key}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Workflow className="h-4 w-4 text-secondary" /> {workflow.label}
                </CardTitle>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--secondary)]"
                    checked={isOn(workflow.key)}
                    onChange={(e) => toggle(workflow.key, e.target.checked)}
                    aria-label={`Enable ${workflow.label}`}
                  />
                  {isOn(workflow.key) ? 'On' : 'Off'}
                </label>
              </div>
              <CardDescription>Trigger: {workflow.trigger}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {workflow.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <Badge variant="muted" className="mt-3">{isOn(workflow.key) ? 'Active' : 'Paused'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
