import { supabase, supabaseConfigured, DEFAULT_ORGANIZATION_ID } from './supabase'
import type {
  Appointment,
  Contact,
  Deal,
  DealStage,
  Message,
  Product,
  Project,
  ProjectStatus,
  Task,
} from './database.types'

/*
  Data layer for the whole system.
  - With VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set: reads and writes go
    to Supabase Postgres, always filtered by organization_id (RLS enforces
    the same boundary server side).
  - Without them: a localStorage demo store with seed data, so the funnel
    still writes a contact row and the CRM is fully reviewable offline.
*/

export const ORG_ID = DEFAULT_ORGANIZATION_ID
const LS_KEY = 'big-mama-ai-demo-store-v1'

interface DemoDb {
  contacts: Contact[]
  deals: Deal[]
  projects: Project[]
  tasks: Task[]
  messages: Message[]
  appointments: Appointment[]
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString()
}
function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString()
}
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function seed(): DemoDb {
  const contacts: Contact[] = [
    { id: 'c1', organization_id: ORG_ID, name: 'Jordan Blake', email: 'jordan@example.com', phone: '555-0101', source: 'AI Workflow Map opt-in', status: 'lead', tags: ['lead-magnet'], notes: 'Downloaded the AI Workflow Map. Runs a growing service brand.', appointment_status: null, deal_status: 'new_lead', last_contacted_at: hoursAgo(72), created_at: hoursAgo(96), updated_at: hoursAgo(72) },
    { id: 'c2', organization_id: ORG_ID, name: 'Priya Nair', email: 'priya@example.com', phone: '555-0102', source: 'Website contact form', status: 'lead', tags: ['inbound'], notes: 'Asked about content systems for her team.', appointment_status: 'booked', deal_status: 'appointment_booked', last_contacted_at: hoursAgo(5), created_at: hoursAgo(50), updated_at: hoursAgo(5) },
    { id: 'c3', organization_id: ORG_ID, name: 'Marcus Reed', email: 'marcus@example.com', phone: '555-0103', source: 'Referral', status: 'customer', tags: ['digital-architect'], notes: 'Full service client. Weekly content system live.', appointment_status: null, deal_status: 'closed_won', last_contacted_at: hoursAgo(26), created_at: hoursAgo(400), updated_at: hoursAgo(26) },
    { id: 'c4', organization_id: ORG_ID, name: 'Elena Torres', email: 'elena@example.com', phone: '555-0104', source: 'Instagram DM', status: 'lead', tags: ['social'], notes: 'Interested, went quiet after proposal.', appointment_status: null, deal_status: 'proposal_sent', last_contacted_at: hoursAgo(120), created_at: hoursAgo(200), updated_at: hoursAgo(120) },
    { id: 'c5', organization_id: ORG_ID, name: 'Sam Whitfield', email: 'sam@example.com', phone: '555-0105', source: 'AI Workflow Map opt-in', status: 'customer', tags: ['starter-kit'], notes: 'Bought the Brand Starter Kit.', appointment_status: null, deal_status: 'closed_won', last_contacted_at: hoursAgo(30), created_at: hoursAgo(300), updated_at: hoursAgo(30) },
  ]
  const deals: Deal[] = [
    { id: 'd1', organization_id: ORG_ID, contact_id: 'c1', title: 'Digital Architect, DIY tier', value: 9700, stage: 'new_lead', expected_close: daysFromNow(9), created_at: hoursAgo(96), updated_at: hoursAgo(72) },
    { id: 'd2', organization_id: ORG_ID, contact_id: 'c2', title: 'Content system build', value: 29700, stage: 'appointment_booked', expected_close: daysFromNow(5), created_at: hoursAgo(50), updated_at: hoursAgo(5) },
    { id: 'd3', organization_id: ORG_ID, contact_id: 'c4', title: 'Digital Architect, full service', value: 99700, stage: 'proposal_sent', expected_close: daysFromNow(2), created_at: hoursAgo(200), updated_at: hoursAgo(120) },
    { id: 'd4', organization_id: ORG_ID, contact_id: 'c3', title: 'Digital Architect, full service', value: 99700, stage: 'closed_won', expected_close: null, created_at: hoursAgo(400), updated_at: hoursAgo(300) },
    { id: 'd5', organization_id: ORG_ID, contact_id: 'c5', title: 'Brand Starter Kit', value: 2700, stage: 'closed_won', expected_close: null, created_at: hoursAgo(300), updated_at: hoursAgo(290) },
  ]
  const projects: Project[] = [
    { id: 'p1', organization_id: ORG_ID, contact_id: 'c3', title: 'Second brain install, full service', budget: 99700, status: 'in_progress', created_at: hoursAgo(300), updated_at: hoursAgo(26) },
    { id: 'p2', organization_id: ORG_ID, contact_id: 'c5', title: 'Brand Starter Kit delivery', budget: 2700, status: 'waiting_on_client', created_at: hoursAgo(200), updated_at: hoursAgo(140) },
    { id: 'p3', organization_id: ORG_ID, contact_id: 'c2', title: 'Discovery and system map', budget: 0, status: 'onboarding', created_at: hoursAgo(20), updated_at: hoursAgo(20) },
  ]
  const tasks: Task[] = [
    { id: 't1', organization_id: ORG_ID, assigned_user_id: null, contact_id: 'c1', title: 'Follow up with Jordan, no reply in 3 days', due_date: hoursAgo(10), status: 'todo', created_at: hoursAgo(80), updated_at: hoursAgo(80) },
    { id: 't2', organization_id: ORG_ID, assigned_user_id: null, contact_id: 'c4', title: 'Send proposal follow-up to Elena', due_date: hoursAgo(30), status: 'todo', created_at: hoursAgo(100), updated_at: hoursAgo(100) },
    { id: 't3', organization_id: ORG_ID, assigned_user_id: null, contact_id: 'c2', title: 'Prep for discovery call with Priya', due_date: daysFromNow(0.2), status: 'todo', created_at: hoursAgo(6), updated_at: hoursAgo(6) },
    { id: 't4', organization_id: ORG_ID, assigned_user_id: null, contact_id: 'c3', title: 'Send weekly content batch to Marcus', due_date: daysFromNow(1), status: 'in_progress', created_at: hoursAgo(30), updated_at: hoursAgo(2) },
    { id: 't5', organization_id: ORG_ID, assigned_user_id: null, contact_id: null, title: 'Review pipeline and clear follow-ups', due_date: hoursAgo(50), status: 'done', created_at: hoursAgo(90), updated_at: hoursAgo(50) },
  ]
  const messages: Message[] = [
    { id: 'm1', organization_id: ORG_ID, contact_id: 'c1', channel: 'email', direction: 'inbound', body: 'Got the workflow map, thanks. Still doing all follow-up by hand here.', created_at: hoursAgo(72) },
    { id: 'm2', organization_id: ORG_ID, contact_id: 'c2', channel: 'sms', direction: 'inbound', body: 'Hi, I booked a call for Thursday. What should I have ready?', created_at: hoursAgo(5) },
    { id: 'm3', organization_id: ORG_ID, contact_id: 'c4', channel: 'email', direction: 'outbound', body: 'Proposal sent over. The full service tier covers install plus ongoing management.', created_at: hoursAgo(120) },
    { id: 'm4', organization_id: ORG_ID, contact_id: 'c3', channel: 'sms', direction: 'inbound', body: 'The follow-up sequence caught two leads I would have missed. Keep it running.', created_at: hoursAgo(26) },
  ]
  const appointments: Appointment[] = [
    { id: 'a1', organization_id: ORG_ID, contact_id: 'c2', title: 'Discovery call, Priya Nair', starts_at: daysFromNow(1), ends_at: null, status: 'booked', created_at: hoursAgo(5) },
    { id: 'a2', organization_id: ORG_ID, contact_id: 'c3', title: 'Weekly systems review, Marcus Reed', starts_at: daysFromNow(3), ends_at: null, status: 'confirmed', created_at: hoursAgo(30) },
  ]
  return { contacts, deals, projects, tasks, messages, appointments }
}

function loadDemo(): DemoDb {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as DemoDb
  } catch {
    /* fall through to seed */
  }
  const db = seed()
  saveDemo(db)
  return db
}

function saveDemo(db: DemoDb) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db))
  } catch {
    /* storage unavailable */
  }
}

async function list<T extends { id: string }>(table: string, demo: (db: DemoDb) => T[]): Promise<T[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from(table).select('*').eq('organization_id', ORG_ID)
    if (error) throw error
    return (data ?? []) as T[]
  }
  return demo(loadDemo())
}

export const store = {
  async listContacts(): Promise<Contact[]> {
    return list<Contact>('contacts', (db) => [...db.contacts].sort((a, b) => b.created_at.localeCompare(a.created_at)))
  },
  async createContact(input: Partial<Contact>): Promise<Contact> {
    const now = new Date().toISOString()
    const contact: Contact = {
      id: uid(),
      organization_id: ORG_ID,
      name: input.name ?? 'New lead',
      email: input.email ?? null,
      phone: input.phone ?? null,
      source: input.source ?? 'Website',
      status: input.status ?? 'lead',
      tags: input.tags ?? [],
      notes: input.notes ?? null,
      appointment_status: null,
      deal_status: 'new_lead',
      last_contacted_at: null,
      created_at: now,
      updated_at: now,
    }
    if (supabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contacts').insert(contact).select().single()
      if (error) throw error
      return data as Contact
    }
    const db = loadDemo()
    db.contacts.unshift(contact)
    saveDemo(db)
    return contact
  },
  async updateContact(id: string, patch: Partial<Contact>): Promise<void> {
    if (supabaseConfigured && supabase) {
      const { error } = await supabase.from('contacts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      return
    }
    const db = loadDemo()
    const row = db.contacts.find((c) => c.id === id)
    if (row) Object.assign(row, patch, { updated_at: new Date().toISOString() })
    saveDemo(db)
  },
  async importContacts(rows: Partial<Contact>[]): Promise<number> {
    let count = 0
    for (const row of rows) {
      if (!row.name && !row.email) continue
      await store.createContact({ ...row, source: row.source ?? 'CSV import' })
      count++
    }
    return count
  },
  async listDeals(): Promise<Deal[]> {
    return list<Deal>('deals', (db) => db.deals)
  },
  async updateDealStage(id: string, stage: DealStage): Promise<void> {
    if (supabaseConfigured && supabase) {
      const { error } = await supabase.from('deals').update({ stage, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      return
    }
    const db = loadDemo()
    const row = db.deals.find((d) => d.id === id)
    if (row) {
      row.stage = stage
      row.updated_at = new Date().toISOString()
    }
    saveDemo(db)
  },
  async listProjects(): Promise<Project[]> {
    return list<Project>('projects', (db) => db.projects)
  },
  async updateProjectStatus(id: string, status: ProjectStatus): Promise<void> {
    if (supabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      return
    }
    const db = loadDemo()
    const row = db.projects.find((p) => p.id === id)
    if (row) {
      row.status = status
      row.updated_at = new Date().toISOString()
    }
    saveDemo(db)
  },
  async listTasks(): Promise<Task[]> {
    return list<Task>('tasks', (db) => db.tasks)
  },
  async updateTask(id: string, patch: Partial<Task>): Promise<void> {
    if (supabaseConfigured && supabase) {
      const { error } = await supabase.from('tasks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      return
    }
    const db = loadDemo()
    const row = db.tasks.find((t) => t.id === id)
    if (row) Object.assign(row, patch, { updated_at: new Date().toISOString() })
    saveDemo(db)
  },
  async listMessages(contactId?: string): Promise<Message[]> {
    const all = await list<Message>('messages', (db) => [...db.messages].sort((a, b) => a.created_at.localeCompare(b.created_at)))
    return contactId ? all.filter((m) => m.contact_id === contactId) : all
  },
  async createMessage(input: { contact_id: string; channel: Message['channel']; direction: Message['direction']; body: string }): Promise<Message> {
    const message: Message = {
      id: uid(),
      organization_id: ORG_ID,
      created_at: new Date().toISOString(),
      ...input,
    }
    if (supabaseConfigured && supabase) {
      const { data, error } = await supabase.from('messages').insert(message).select().single()
      if (error) throw error
      await store.updateContact(input.contact_id, { last_contacted_at: new Date().toISOString() })
      return data as Message
    }
    const db = loadDemo()
    db.messages.push(message)
    const contact = db.contacts.find((c) => c.id === input.contact_id)
    if (contact) contact.last_contacted_at = message.created_at
    saveDemo(db)
    return message
  },
  async listAppointments(): Promise<Appointment[]> {
    return list<Appointment>('appointments', (db) => db.appointments)
  },
  async listProducts(): Promise<Product[]> {
    if (supabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('active', true)
      if (error) throw error
      return (data ?? []) as Product[]
    }
    return LOCAL_PRODUCTS
  },
  /**
   * Starts Stripe Checkout through the stripe-checkout edge function.
   * Returns a checkout URL, or null in demo mode (no backend connected),
   * in which case the UI explains test mode instead of charging anyone.
   */
  async startCheckout(items: string[], email?: string): Promise<string | null> {
    if (!supabaseConfigured || !supabase) return null
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { items, email, organization_id: ORG_ID },
    })
    if (error) throw error
    return (data as { url?: string })?.url ?? null
  },
  /** Enrolls a contact in the 3-email welcome sequence (Resend edge function). */
  async enrollWelcome(contact: Contact): Promise<void> {
    if (supabaseConfigured && supabase) {
      await supabase.functions.invoke('send-welcome-email', {
        body: { contact_id: contact.id, email: contact.email, name: contact.name, organization_id: ORG_ID },
      })
      return
    }
    // Demo mode: recorded locally, nothing is sent.
    const db = loadDemo()
    void db
    console.info('[demo] Welcome sequence enrolled for', contact.email)
  },
  /** Asks the draft-ai-reply edge function for a reply draft. Falls back to a local template draft. */
  async draftAiReply(message: Message, contact: Contact): Promise<string> {
    if (supabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('draft-ai-reply', {
          body: { message: message.body, channel: message.channel, contact_name: contact.name },
        })
        if (!error && (data as { draft?: string })?.draft) return (data as { draft: string }).draft
      } catch {
        /* fall back to local draft */
      }
    }
    const first = contact.name.split(' ')[0]
    return `Hi ${first}, thanks for reaching out. Happy to help with that. The fastest next step is a short call so we can map exactly what your second brain should take off your plate first. Want me to send a couple of times that work this week?`
  },
}

export const LOCAL_PRODUCTS: Product[] = [
  { id: 'prod-lead-magnet', organization_id: null, slug: 'lead_magnet', name: 'The AI Workflow Map', kind: 'lead_magnet', price: 0, file_path: 'products/lead_magnet.md', stripe_price_id: null, active: true, created_at: new Date().toISOString() },
  { id: 'prod-tripwire', organization_id: null, slug: 'tripwire_offer', name: 'Brand Starter Kit', kind: 'tripwire', price: 2700, file_path: 'products/tripwire_offer.md', stripe_price_id: null, active: true, created_at: new Date().toISOString() },
  { id: 'prod-bump', organization_id: null, slug: 'order_bump', name: 'Canva Templates Pack', kind: 'order_bump', price: 1700, file_path: 'products/order_bump.md', stripe_price_id: null, active: true, created_at: new Date().toISOString() },
  { id: 'prod-signature', organization_id: null, slug: 'signature_offer', name: 'The 24/7 Digital Architect', kind: 'signature', price: 99700, file_path: 'products/signature_offer.md', stripe_price_id: null, active: true, created_at: new Date().toISOString() },
]
