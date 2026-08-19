alter table public.whatsapp_connections
add column if not exists onboarding_state text null;

alter table public.whatsapp_connections
add column if not exists onboarding_nonce text null;

alter table public.whatsapp_connections
add column if not exists onboarding_expires_at timestamptz null;

alter table public.whatsapp_connections
add column if not exists onboarding_callback_consumed boolean not null default false;

alter table public.whatsapp_connections
add column if not exists onboarding_callback_consumed_at timestamptz null;

