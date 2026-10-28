/*
  Database types for the Big Mama AI Supabase schema.
  Mirrors supabase/migrations/0001_init.sql. Regenerate against a live
  project with: supabase gen types typescript --linked > src/lib/database.types.ts
*/

export type UserRole = 'owner' | 'admin' | 'team'
export type ContactStatus = 'lead' | 'customer' | 'churned'
export type DealStage =
  | 'new_lead'
  | 'contacted'
  | 'interested'
  | 'appointment_booked'
  | 'proposal_sent'
  | 'follow_up_needed'
  | 'closed_won'
  | 'closed_lost'
export type ProjectStatus =
  | 'new_client'
  | 'onboarding'
  | 'information_needed'
  | 'project_started'
  | 'in_progress'
  | 'waiting_on_client'
  | 'internal_review'
  | 'client_review'
  | 'completed'
  | 'follow_up_upsell'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type MessageChannel = 'sms' | 'email' | 'instagram' | 'messenger' | 'note'
export type MessageDirection = 'inbound' | 'outbound'
export type AppointmentStatus = 'booked' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_show' | 'completed'
export type ProductKind = 'lead_magnet' | 'tripwire' | 'order_bump' | 'signature'
export type SequenceStatus = 'active' | 'paused' | 'completed' | 'unsubscribed'

export interface Organization {
  id: string
  name: string
  owner_email: string
  business_hours: Record<string, string>
  created_at: string
}

export interface AppUser {
  id: string
  organization_id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Contact {
  id: string
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  status: ContactStatus
  tags: string[]
  notes: string | null
  appointment_status: string | null
  deal_status: string | null
  last_contacted_at: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  organization_id: string
  contact_id: string
  title: string
  value: number
  stage: DealStage
  expected_close: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  organization_id: string
  contact_id: string
  title: string
  budget: number
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  organization_id: string
  assigned_user_id: string | null
  contact_id: string | null
  title: string
  due_date: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  organization_id: string
  contact_id: string
  channel: MessageChannel
  direction: MessageDirection
  body: string
  created_at: string
}

export interface Appointment {
  id: string
  organization_id: string
  contact_id: string
  title: string
  starts_at: string
  ends_at: string | null
  status: AppointmentStatus
  created_at: string
}

export interface Product {
  id: string
  organization_id: string | null
  slug: string
  name: string
  kind: ProductKind
  price: number
  file_path: string
  stripe_price_id: string | null
  active: boolean
  created_at: string
}

export interface EmailSequenceEnrollment {
  id: string
  organization_id: string
  contact_id: string
  sequence_key: string
  step: number
  status: SequenceStatus
  next_send_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> }
      users: { Row: AppUser; Insert: Partial<AppUser>; Update: Partial<AppUser> }
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> }
      deals: { Row: Deal; Insert: Partial<Deal>; Update: Partial<Deal> }
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> }
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> }
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> }
      appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      email_sequences: {
        Row: EmailSequenceEnrollment
        Insert: Partial<EmailSequenceEnrollment>
        Update: Partial<EmailSequenceEnrollment>
      }
    }
  }
}
