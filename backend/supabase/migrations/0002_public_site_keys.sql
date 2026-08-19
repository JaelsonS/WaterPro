-- Public identifiers for tenant resolution (used by public endpoints)
-- Security: endpoints must never accept company_id as authority.

create table if not exists public.public_site_keys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  site_key text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_site_keys_company_id_idx
on public.public_site_keys(company_id);

create trigger public_site_keys_set_updated_at
before update on public.public_site_keys
for each row
execute function public.set_updated_at();

alter table public.public_site_keys enable row level security;

-- No public select policies: resolution is done by backend service role only.
-- (Service role bypasses RLS; normal user tokens won't be able to read keys.)

