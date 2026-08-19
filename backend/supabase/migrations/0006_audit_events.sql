-- Administrative audit trail (multi-tenant, non-destructive)

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  actor_user_id uuid null,
  event_type text not null,
  resource_type text not null,
  resource_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_company_id_created_at_idx
on public.audit_events (company_id, created_at desc);

create index if not exists audit_events_event_type_idx
on public.audit_events (event_type);

alter table public.audit_events enable row level security;

-- company_admin can read own tenant audit events
drop policy if exists "audit_events_select_company_admin" on public.audit_events;
create policy "audit_events_select_company_admin"
on public.audit_events
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.user_id = auth.uid()
      and cm.company_id = audit_events.company_id
      and cm.role = 'company_admin'
      and cm.active = true
  )
);

-- platform admins can read all audit events
drop policy if exists "audit_events_select_platform_admin" on public.audit_events;
create policy "audit_events_select_platform_admin"
on public.audit_events
for select
using (
  exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid())
);

-- Inserts are performed by backend service role only (no client insert policy).
