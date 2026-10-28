import type { Appointment, Contact, Deal, Project, Task } from './database.types'
import { isOverdue, isUntouched48h } from './utils'

export interface CrmSnapshot {
  contacts: Contact[]
  deals: Deal[]
  projects: Project[]
  tasks: Task[]
  appointments: Appointment[]
}

export interface Insight {
  kind: 'overdue_task' | 'stale_deal' | 'stale_project' | 'follow_up' | 'waiting_client' | 'proposal'
  title: string
  detail: string
  contactId?: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * The AI Business Assistant brain: pure queries over live CRM data.
 * Overdue tasks, deals untouched in 48 hours, stalled projects, clients
 * waiting, proposals pending. Recommendations are derived from the rows,
 * never hard-coded.
 */
export function buildInsights(snap: CrmSnapshot): Insight[] {
  const insights: Insight[] = []
  const contactName = (id: string) => snap.contacts.find((c) => c.id === id)?.name ?? 'A contact'

  for (const task of snap.tasks) {
    if (task.status !== 'done' && isOverdue(task.due_date)) {
      insights.push({
        kind: 'overdue_task',
        title: `Overdue task: ${task.title}`,
        detail: task.contact_id ? `Linked to ${contactName(task.contact_id)}. Clear it or reschedule it today.` : 'Clear it or reschedule it today.',
        contactId: task.contact_id ?? undefined,
        priority: 'high',
      })
    }
  }

  const openStages = ['new_lead', 'contacted', 'interested', 'appointment_booked', 'proposal_sent', 'follow_up_needed']
  for (const deal of snap.deals) {
    if (openStages.includes(deal.stage) && isUntouched48h(deal.updated_at)) {
      insights.push({
        kind: deal.stage === 'proposal_sent' ? 'proposal' : 'stale_deal',
        title: deal.stage === 'proposal_sent' ? `Proposal waiting on ${contactName(deal.contact_id)}` : `Deal untouched 48h+: ${deal.title}`,
        detail:
          deal.stage === 'proposal_sent'
            ? 'Send the proposal follow-up template today. Silence after a proposal is where deals cool off.'
            : 'Send a follow-up message today so this one does not go cold.',
        contactId: deal.contact_id,
        priority: deal.stage === 'proposal_sent' ? 'high' : 'medium',
      })
    }
  }

  for (const project of snap.projects) {
    if (project.status === 'waiting_on_client' && isUntouched48h(project.updated_at)) {
      insights.push({
        kind: 'waiting_client',
        title: `Client waiting: ${project.title}`,
        detail: `${contactName(project.contact_id)} has been waiting on the other side for over 48 hours. Send the information request reminder.`,
        contactId: project.contact_id,
        priority: 'medium',
      })
    }
    if (['onboarding', 'information_needed'].includes(project.status) && isUntouched48h(project.updated_at)) {
      insights.push({
        kind: 'stale_project',
        title: `Project needs a push: ${project.title}`,
        detail: 'Stalled early. One clear next-step message to the client restarts it.',
        contactId: project.contact_id,
        priority: 'medium',
      })
    }
  }

  for (const contact of snap.contacts) {
    if (contact.status === 'lead' && contact.last_contacted_at && isUntouched48h(contact.last_contacted_at)) {
      const hasOpenDeal = snap.deals.some((d) => d.contact_id === contact.id && openStages.includes(d.stage))
      if (!hasOpenDeal) {
        insights.push({
          kind: 'follow_up',
          title: `Lead gone quiet: ${contact.name}`,
          detail: 'No contact in over 48 hours and no open deal. A short follow-up or the reactivation template fits here.',
          contactId: contact.id,
          priority: 'low',
        })
      }
    }
  }

  const order = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => order[a.priority] - order[b.priority])
}

export function dashboardStats(snap: CrmSnapshot) {
  const today = new Date().toDateString()
  const openDeals = snap.deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.stage))
  return {
    followUpsDue: snap.tasks.filter((t) => t.status !== 'done' && t.due_date && new Date(t.due_date).toDateString() === today).length,
    overdueTasks: snap.tasks.filter((t) => t.status !== 'done' && isOverdue(t.due_date)),
    tasksDueToday: snap.tasks.filter((t) => t.status !== 'done' && t.due_date && new Date(t.due_date).toDateString() === today),
    dealsWaiting: openDeals.filter((d) => isUntouched48h(d.updated_at)),
    projectsInProgress: snap.projects.filter((p) => ['project_started', 'in_progress', 'internal_review', 'client_review'].includes(p.status)),
    clientsWaiting: snap.projects.filter((p) => p.status === 'waiting_on_client'),
    appointments: snap.appointments.filter((a) => ['booked', 'confirmed'].includes(a.status)),
    proposalsPending: snap.deals.filter((d) => d.stage === 'proposal_sent'),
    completedProjects: snap.projects.filter((p) => p.status === 'completed'),
    pipelineValue: openDeals.reduce((sum, d) => sum + d.value, 0),
    revenueOpportunities: openDeals.reduce((sum, d) => sum + d.value, 0),
  }
}
