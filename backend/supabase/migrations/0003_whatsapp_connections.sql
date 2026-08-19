-- WhatsApp onboarding state + connection model (multi-tenant)

-- Connection states (stored as text for v1 flexibility)
-- PENDING, CONNECTING, CONNECTED, REAUTH_REQUIRED, DISCONNECTED, ERROR

create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  provider text not null default 'meta',
  provider_account_id text null,
  status text not null default 'PENDING',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, provider, provider_account_id)
);

create trigger whatsapp_connections_set_updated_at
before update on public.whatsapp_connections
for each row
execute function public.set_updated_at();

alter table public.whatsapp_numbers
add column if not exists connection_id uuid null references public.whatsapp_connections (id) on delete set null;

alter table public.whatsapp_numbers
add column if not exists verified boolean not null default false;

alter table public.whatsapp_numbers
add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists whatsapp_connections_company_id_idx
on public.whatsapp_connections(company_id);

create index if not exists whatsapp_numbers_connection_id_idx
on public.whatsapp_numbers(connection_id);

-- RLS enablement
alter table public.whatsapp_connections enable row level security;

-- Policies:
-- - select: company_admin / platform_admin
-- - insert/update/delete: company_admin / platform_admin

create policy "whatsapp_connections_select_company_admin_or_platform_admin"
on public.whatsapp_connections
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = whatsapp_connections.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  )
);

create policy "whatsapp_connections_write_company_admin_or_platform_admin"
on public.whatsapp_connections
for all
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = whatsapp_connections.company_id
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
      and cm.company_id = whatsapp_connections.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
  or exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
);

