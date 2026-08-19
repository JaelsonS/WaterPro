-- Credential vault references (secrets stored outside whatsapp_connections)

alter table public.whatsapp_connections
add column if not exists access_token_reference text null;

comment on column public.whatsapp_connections.access_token_reference is
  'Opaque reference to encrypted credential in whatsapp_credential_vault. Never expose to clients.';

create table if not exists public.whatsapp_credential_vault (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  connection_id uuid null references public.whatsapp_connections (id) on delete set null,
  provider text not null default 'meta',
  secret_reference text not null,
  status text not null default 'ACTIVE',
  expires_at timestamptz null,
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (secret_reference)
);

drop trigger if exists whatsapp_credential_vault_set_updated_at on public.whatsapp_credential_vault;
create trigger whatsapp_credential_vault_set_updated_at
before update on public.whatsapp_credential_vault
for each row
execute function public.set_updated_at();

create index if not exists whatsapp_credential_vault_company_id_idx
on public.whatsapp_credential_vault (company_id);

create index if not exists whatsapp_credential_vault_connection_id_idx
on public.whatsapp_credential_vault (connection_id);

alter table public.whatsapp_credential_vault enable row level security;

-- No direct client access to credential vault rows.
-- Backend service role reads/writes; frontend never receives secret_reference values.

drop policy if exists "whatsapp_credential_vault_deny_all" on public.whatsapp_credential_vault;
create policy "whatsapp_credential_vault_deny_all"
on public.whatsapp_credential_vault
for all
using (false)
with check (false);
