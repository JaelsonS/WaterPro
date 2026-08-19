-- WaterPro backend (foundation)
-- Multi-tenant schema + RLS policies (tenant isolation by company_id)

create extension if not exists pgcrypto;

-- Generic updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ===== Platform roles =====
create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ===== Companies =====
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  timezone text not null default 'Europe/Lisbon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

-- ===== User -> Company membership =====
-- Assumption for v1: a user can be active in at most 1 company.
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null check (role in ('company_admin', 'seller')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, company_id)
);

create index if not exists company_members_company_id_idx on public.company_members(company_id);
create index if not exists company_members_user_id_idx on public.company_members(user_id);
create unique index if not exists company_members_single_active_per_user
on public.company_members(user_id)
where active = true;

create trigger company_members_set_updated_at
before update on public.company_members
for each row
execute function public.set_updated_at();

-- ===== Sellers =====
create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  -- Optional mapping between platform user and seller "entity"
  user_id uuid null references auth.users (id) on delete set null,
  name text not null,
  phone text null,
  email text null,
  role text not null default 'sales_rep',
  active boolean not null default true,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sellers_company_id_idx on public.sellers(company_id);
create index if not exists sellers_active_idx on public.sellers(company_id, active);
create trigger sellers_set_updated_at
before update on public.sellers
for each row
execute function public.set_updated_at();

-- ===== WhatsApp numbers connected to a seller =====
create table if not exists public.whatsapp_numbers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  display_name text not null,
  phone_number text not null,
  phone_number_id text null,
  business_account_id text null,
  -- Store a reference to the secret (not raw token) when possible
  access_token_reference text null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_numbers_company_id_idx on public.whatsapp_numbers(company_id);
create index if not exists whatsapp_numbers_company_seller_idx on public.whatsapp_numbers(company_id, seller_id);
create trigger whatsapp_numbers_set_updated_at
before update on public.whatsapp_numbers
for each row
execute function public.set_updated_at();

-- ===== AI settings per company =====
create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  enabled boolean not null default true,
  assistant_name text null,
  system_prompt text not null default '',
  welcome_message text null,
  handoff_enabled boolean not null default true,
  handoff_message text null,
  model text null,
  temperature_if_supported numeric null,
  max_output_tokens_if_supported integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id)
);

create trigger ai_settings_set_updated_at
before update on public.ai_settings
for each row
execute function public.set_updated_at();

-- ===== Knowledge base (simple text for v1) =====
create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  content text not null,
  type text not null default 'article',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_items_company_id_idx on public.knowledge_items(company_id);
create trigger knowledge_items_set_updated_at
before update on public.knowledge_items
for each row
execute function public.set_updated_at();

-- ===== Products =====
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text null,
  price numeric null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_company_id_idx on public.products(company_id);
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- ===== Conversations =====
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  whatsapp_number_id uuid not null references public.whatsapp_numbers (id) on delete cascade,
  customer_phone text not null,
  customer_name text null,
  channel text not null default 'whatsapp',
  status text not null default 'OPEN',
  ai_enabled boolean not null default true,
  assigned_at timestamptz null,
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_company_id_idx on public.conversations(company_id);
create index if not exists conversations_company_seller_idx on public.conversations(company_id, seller_id);
create index if not exists conversations_company_whatsapp_idx on public.conversations(company_id, whatsapp_number_id);
create index if not exists conversations_company_phone_idx on public.conversations(company_id, customer_phone);
create index if not exists conversations_last_message_at_idx on public.conversations(last_message_at);
create trigger conversations_set_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

-- ===== Messages =====
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction text not null, -- 'inbound' | 'outbound'
  sender_type text not null, -- 'customer' | 'seller' | 'ai' | 'system'
  content text not null,
  external_message_id text null,
  status text not null default 'sent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists messages_company_external_message_unique
on public.messages(company_id, external_message_id)
where external_message_id is not null;

create index if not exists messages_company_id_idx on public.messages(company_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- ===== Leads =====
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  name text null,
  phone text null,
  source text not null default 'website',
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_company_id_idx on public.leads(company_id);
create index if not exists leads_conversation_id_idx on public.leads(conversation_id);
create index if not exists leads_company_seller_idx on public.leads(company_id, seller_id);
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

-- ===== Routing rules =====
create table if not exists public.routing_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  type text not null,
  configuration jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routing_rules_company_id_idx on public.routing_rules(company_id);
create trigger routing_rules_set_updated_at
before update on public.routing_rules
for each row
execute function public.set_updated_at();

-- ===== Webhook events idempotency =====
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  payload_hash text not null,
  processed boolean not null default false,
  processed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique(company_id, provider, external_event_id)
);

create index if not exists webhook_events_company_id_idx on public.webhook_events(company_id);
create index if not exists webhook_events_processed_idx on public.webhook_events(processed);

-- ===== RLS enablement =====
-- Security principle: never open tables with USING (true)
alter table public.platform_admins enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.sellers enable row level security;
alter table public.whatsapp_numbers enable row level security;
alter table public.ai_settings enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.products enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.routing_rules enable row level security;
alter table public.webhook_events enable row level security;

-- ===== RLS policies: platform_admins =====
create policy "platform_admins_select_self"
on public.platform_admins
for select
using (user_id = auth.uid());

-- Insert/update/delete intentionally restricted to service role (backend).

-- ===== RLS policies: companies =====
create policy "companies_select_members"
on public.companies
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = companies.id
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "companies_write_company_admin"
on public.companies
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = companies.id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = companies.id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

-- ===== RLS policies: company_members =====
create policy "company_members_select_self_or_platform_admin"
on public.company_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "company_members_write_company_admin"
on public.company_members
for insert
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = company_members.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "company_members_update_company_admin"
on public.company_members
for update
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = company_members.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = company_members.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

-- ===== RLS policies: sellers =====
create policy "sellers_select_company_admin_or_self_seller"
on public.sellers
for select
using (
  -- Company admin can read all sellers in their company
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = sellers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or sellers.user_id = auth.uid()
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "sellers_write_company_admin"
on public.sellers
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = sellers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = sellers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

-- ===== RLS policies: whatsapp_numbers =====
create policy "whatsapp_numbers_select_company_admin_or_own_seller"
on public.whatsapp_numbers
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = whatsapp_numbers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.sellers s
    where s.id = whatsapp_numbers.seller_id
      and s.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "whatsapp_numbers_write_company_admin"
on public.whatsapp_numbers
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = whatsapp_numbers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = whatsapp_numbers.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

-- ===== RLS policies: ai_settings, knowledge_items, products, routing_rules =====
-- Company admin / platform admin only for writes.
-- Select allowed for any company member to support future "seller chat" UI, but private configs remain safe.

create policy "ai_settings_select_members"
on public.ai_settings
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = ai_settings.company_id
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "ai_settings_write_company_admin"
on public.ai_settings
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = ai_settings.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = ai_settings.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "knowledge_items_select_members"
on public.knowledge_items
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = knowledge_items.company_id
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "knowledge_items_write_company_admin"
on public.knowledge_items
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = knowledge_items.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = knowledge_items.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "products_select_members"
on public.products
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = products.company_id
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "products_write_company_admin"
on public.products
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = products.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = products.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "routing_rules_select_members"
on public.routing_rules
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = routing_rules.company_id
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

create policy "routing_rules_write_company_admin"
on public.routing_rules
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = routing_rules.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = routing_rules.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  )
);

-- ===== RLS policies: conversations, messages, leads, webhook_events =====
create policy "conversations_select_members"
on public.conversations
for select
using (
  -- platform admin
  exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
  or -- company admin
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = conversations.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or -- own seller
  exists (
    select 1
    from public.sellers s
    where s.id = conversations.seller_id
      and s.user_id = auth.uid()
  )
);

create policy "conversations_write_company_admin"
on public.conversations
for insert
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = conversations.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
);

create policy "conversations_update_company_admin"
on public.conversations
for update
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = conversations.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = conversations.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
);

-- Messages: read-scoped by conversation ownership (seller) or company admin
create policy "messages_select_members"
on public.messages
for select
using (
  exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = messages.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1
    from public.conversations c
    join public.sellers s on s.id = c.seller_id
    where c.id = messages.conversation_id
      and s.user_id = auth.uid()
  )
);

-- Inserts for messages: restricted to company admin/platform admin (webhook will be via service role)
create policy "messages_insert_company_admin"
on public.messages
for insert
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = messages.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
);

-- Leads: similar to conversations
create policy "leads_select_members"
on public.leads
for select
using (
  exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = leads.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.sellers s
    where s.id = leads.seller_id
      and s.user_id = auth.uid()
  )
);

create policy "leads_write_company_admin"
on public.leads
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = leads.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = leads.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
);

-- Webhook events: restrict to members of the company
create policy "webhook_events_select_members"
on public.webhook_events
for select
using (
  exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = webhook_events.company_id
      and cm.active = true
  )
);

create policy "webhook_events_write_company_admin"
on public.webhook_events
for all
using (
  exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = webhook_events.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
)
with check (
  exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
  or exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = webhook_events.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
);

