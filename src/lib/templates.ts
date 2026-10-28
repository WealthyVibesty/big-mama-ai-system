import type { DealStage, ProjectStatus } from './database.types'

export const DEAL_STAGES: { key: DealStage; label: string }[] = [
  { key: 'new_lead', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interested', label: 'Interested' },
  { key: 'appointment_booked', label: 'Appointment Booked' },
  { key: 'proposal_sent', label: 'Proposal Sent' },
  { key: 'follow_up_needed', label: 'Follow-Up Needed' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' },
]

export const PROJECT_STATUSES: { key: ProjectStatus; label: string }[] = [
  { key: 'new_client', label: 'New Client' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'information_needed', label: 'Information Needed' },
  { key: 'project_started', label: 'Project Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'waiting_on_client', label: 'Waiting on Client' },
  { key: 'internal_review', label: 'Internal Review' },
  { key: 'client_review', label: 'Client Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'follow_up_upsell', label: 'Follow-Up / Upsell' },
]

export interface MessageTemplate {
  key: string
  label: string
  channel: 'sms' | 'email'
  body: string
}

/* Written for an AI systems business. {first_name} is filled per contact. */
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    key: 'new_lead_confirmation',
    label: 'New lead confirmation',
    channel: 'sms',
    body: 'Hi {first_name}, this is Tyler with Wealthy Vibes Ty. Got your request. Your AI Workflow Map is in your inbox now. Want me to walk you through the first workflow to automate?',
  },
  {
    key: 'missed_call_textback',
    label: 'Missed call text-back',
    channel: 'sms',
    body: 'Hi {first_name}, sorry we missed your call. What can we help you automate first: follow-up, content, or booking?',
  },
  {
    key: 'appointment_reminder',
    label: 'Appointment reminder',
    channel: 'sms',
    body: 'Hi {first_name}, quick reminder about our call. We will map the first system your business should hand off. Reply C to confirm.',
  },
  {
    key: 'follow_up',
    label: 'Follow-up',
    channel: 'sms',
    body: 'Hi {first_name}, circling back. The computer work does not slow down on its own. Want the short version of how the second brain handles it?',
  },
  {
    key: 'no_response_follow_up',
    label: 'No-response follow-up',
    channel: 'email',
    body: 'Hi {first_name},\n\nNo pressure at all. If follow-up, content, and booking are still eating your week, the offer stands: we install the system, you own it, and it runs while you run the business.\n\nWant me to send the one-page map of what it would take over first?\n\nTyler\nWealthy Vibes Ty',
  },
  {
    key: 'proposal_follow_up',
    label: 'Proposal follow-up',
    channel: 'email',
    body: 'Hi {first_name},\n\nChecking in on the proposal. The install starts with the highest-friction work first, so you feel the time back in week one.\n\nAny questions I can clear up on a quick call?\n\nTyler\nWealthy Vibes Ty',
  },
  {
    key: 'reactivation',
    label: 'Reactivation',
    channel: 'sms',
    body: 'Hi {first_name}, it has been a while. Still doing follow-up and content by hand? The second brain setup is open again if you want it handled.',
  },
]

export interface WorkflowDefinition {
  key: string
  label: string
  trigger: string
  steps: string[]
}

export const FOLLOW_UP_WORKFLOWS: WorkflowDefinition[] = [
  { key: 'new_lead', label: 'New lead follow-up', trigger: 'Contact created', steps: ['Send lead magnet delivery email', 'New lead confirmation text', 'Day 2 value email', 'Day 7 soft call invite'] },
  { key: 'missed_call', label: 'Missed call follow-up', trigger: 'Missed call webhook (Twilio)', steps: ['Missed call text-back within 2 minutes', 'Create follow-up task for owner'] },
  { key: 'booked', label: 'Appointment booked', trigger: 'Appointment created', steps: ['Confirmation text and email', 'Reminder 24 hours before', 'Reminder 1 hour before', 'Internal alert to owner'] },
  { key: 'no_show', label: 'No-show follow-up', trigger: 'Appointment marked no-show', steps: ['Same-day reschedule text', 'Day 2 reschedule email'] },
  { key: 'proposal', label: 'Proposal follow-up', trigger: 'Deal moves to Proposal Sent', steps: ['Day 2 check-in email', 'Day 5 follow-up text', 'Owner task if no reply by day 7'] },
  { key: 'closed_onboarding', label: 'Closed deal onboarding', trigger: 'Deal moves to Closed Won', steps: ['Welcome email', 'Create project in Onboarding', 'Information request message'] },
  { key: 'project_updates', label: 'Project update reminders', trigger: 'Project status change', steps: ['Client update message on each stage change', 'Weekly owner summary'] },
  { key: 'info_request', label: 'Client information requests', trigger: 'Project moves to Information Needed', steps: ['Information request email', 'Reminder after 3 days waiting'] },
  { key: 'reactivation', label: 'Old lead reactivation', trigger: 'Lead untouched 30 days', steps: ['Reactivation text', 'Reactivation email if no reply in 4 days'] },
  { key: 'post_project', label: 'Post-project follow-up', trigger: 'Project completed', steps: ['Delivery confirmation', 'Day 14 check-in', 'Upsell review task for owner'] },
]
