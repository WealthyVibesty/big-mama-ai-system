-- Big Mama AI system schema (Wealthy Vibes Ty)
-- Every business table is scoped by organization_id and protected by RLS.
-- Apply with: supabase db push  (or paste into the SQL editor)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organizations and users
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_email text not null,
  business_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create type public.user_role as enum ('owner', 'admin', 'team');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'team',
  created_at timestamptz not null default now()
);

-- The organization the current session belongs to (null for anonymous).
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------
create type public.contact_status as enum ('lead', 'customer', 'churned');

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text,
  status public.contact_status not null default 'lead',
  tags text[] not null default '{}',
  notes text,
  appointment_status text,
  deal_status text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_org_idx on public.contacts (organization_id);
create index contacts_email_idx on public.contacts (email);

-- ---------------------------------------------------------------------------
-- Deals
-- ---------------------------------------------------------------------------
create type public.deal_stage as enum (
  'new_lead', 'contacted', 'interested', 'appointment_booked',
  'proposal_sent', 'follow_up_needed', 'closed_won', 'closed_lost'
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  title text not null,
  value integer not null default 0, -- cents
  stage public.deal_stage not null default 'new_lead',
  expected_close date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deals_org_idx on public.deals (organization_id);
create index deals_contact_idx on public.deals (contact_id);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create type public.project_status as enum (
  'new_client', 'onboarding', 'information_needed', 'project_started',
  'in_progress', 'waiting_on_client', 'internal_review', 'client_review',
  'completed', 'follow_up_upsell'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  title text not null,
  budget integer not null default 0, -- cents
  status public.project_status not null default 'new_client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_org_idx on public.projects (organization_id);
create index projects_contact_idx on public.projects (contact_id);

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------
create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assigned_user_id uuid references public.users (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  title text not null,
  due_date timestamptz,
  status public.task_status not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_org_idx on public.tasks (organization_id);
create index tasks_due_idx on public.tasks (due_date);

-- ---------------------------------------------------------------------------
-- Messages (unified inbox: sms, email, social)
-- ---------------------------------------------------------------------------
create type public.message_channel as enum ('sms', 'email', 'instagram', 'messenger', 'note');
create type public.message_direction as enum ('inbound', 'outbound');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  channel public.message_channel not null,
  direction public.message_direction not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_org_idx on public.messages (organization_id);
create index messages_contact_idx on public.messages (contact_id, created_at);

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------
create type public.appointment_status as enum (
  'booked', 'confirmed', 'rescheduled', 'cancelled', 'no_show', 'completed'
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.appointment_status not null default 'booked',
  created_at timestamptz not null default now()
);
create index appointments_org_idx on public.appointments (organization_id);

-- ---------------------------------------------------------------------------
-- Products (digital products, auto-delivered)
-- ---------------------------------------------------------------------------
create type public.product_kind as enum ('lead_magnet', 'tripwire', 'order_bump', 'signature');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  slug text not null unique,
  name text not null,
  kind public.product_kind not null,
  price integer not null default 0, -- cents
  file_path text not null,
  stripe_price_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Email sequences (welcome sequence enrollments)
-- ---------------------------------------------------------------------------
create type public.sequence_status as enum ('active', 'paused', 'completed', 'unsubscribed');

create table public.email_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  sequence_key text not null default 'welcome',
  step integer not null default 0,
  status public.sequence_status not null default 'active',
  next_send_at timestamptz,
  created_at timestamptz not null default now()
);
create index email_sequences_org_idx on public.email_sequences (organization_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_touch before update on public.contacts
  for each row execute function public.touch_updated_at();
create trigger deals_touch before update on public.deals
  for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: every table, scoped by organization_id.
-- Authenticated team members see only their own organization's rows.
-- The service role (edge functions, webhooks) bypasses RLS by design.
-- Public funnel forms insert contacts through edge functions using the
-- service role, never through the anonymous role.
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.appointments enable row level security;
alter table public.products enable row level security;
alter table public.email_sequences enable row level security;

create policy organizations_select_own on public.organizations
  for select to authenticated
  using (id = public.current_organization_id());

create policy users_select_own_org on public.users
  for select to authenticated
  using (organization_id = public.current_organization_id());
create policy users_update_self on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Generic org-scoped policies for the CRM tables
create policy contacts_org_all on public.contacts
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy deals_org_all on public.deals
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy projects_org_all on public.projects
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy tasks_org_all on public.tasks
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy messages_org_all on public.messages
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy appointments_org_all on public.appointments
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy email_sequences_org_all on public.email_sequences
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

-- Products are a shared catalog (organization_id null) plus per-org rows.
create policy products_read on public.products
  for select to anon, authenticated
  using (active = true and (organization_id is null or organization_id = public.current_organization_id()));
create policy products_org_write on public.products
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
