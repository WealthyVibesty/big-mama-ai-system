import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { PROJECT_STATUSES } from '@/lib/templates'
import { KanbanBoard } from '@/components/KanbanBoard'
import type { ProjectStatus } from '@/lib/database.types'

export default function ProjectsPage() {
  const { data, reload } = useAsync(async () => {
    const [projects, contacts] = await Promise.all([store.listProjects(), store.listContacts()])
    return { projects, contacts }
  })

  const contactName = (id: string) => data?.contacts.find((c) => c.id === id)?.name ?? 'Contact'

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Project pipeline</h1>
      <p className="text-sm text-muted-foreground">New Client to Completed, then Follow-Up and Upsell.</p>
      <div className="mt-5">
        {data && (
          <KanbanBoard
            stages={PROJECT_STATUSES}
            items={data.projects.map((project) => ({
              id: project.id,
              title: project.title,
              subtitle: contactName(project.contact_id),
              value: project.budget,
              stage: project.status,
            }))}
            onMove={async (id, status) => {
              await store.updateProjectStatus(id, status as ProjectStatus)
              reload()
            }}
          />
        )}
      </div>
    </div>
  )
}
