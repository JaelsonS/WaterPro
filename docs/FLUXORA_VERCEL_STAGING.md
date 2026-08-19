# Fluxora — Deploy Frontend Staging (Vercel)

## Projeto existente

| Campo | Valor |
|-------|-------|
| URL staging | https://waterpro-chi.vercel.app |
| Framework | Next.js 15 |
| Branch staging | `staging` (recomendado para preview/production staging) |

## Build

| Campo | Valor |
|-------|-------|
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` |
| Output | Next.js default |
| Install | `npm install` |

## Environment Variables (Staging / Preview)

Template: `.env.example` na raiz do repo.

### Públicas (OK no browser)

| Variável | Staging | Secret? |
|----------|---------|---------|
| `NEXT_PUBLIC_APP_ENV` | `staging` | não |
| `NEXT_PUBLIC_BACKEND_URL` | URL Render staging API | não |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase STAGING URL | não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | público por design |
| `NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER` | `mock` | não |

### Nunca configurar no frontend

- `SUPABASE_SERVICE_ROLE_KEY`
- `META_APP_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- Qualquer secret backend

## Development local

`.env.local` (gitignored):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER=mock
NEXT_PUBLIC_APP_ENV=development
```

## Supabase Auth redirects

No dashboard Supabase STAGING → Authentication → URL Configuration:

- **Site URL:** `https://waterpro-chi.vercel.app`
- **Redirect URLs:** adicionar staging + `http://localhost:3000/**`

Não alterar Production Supabase nesta fase.

## Validação pós-deploy

1. Landing `/` — smoke (header, footer, form)
2. `/dashboard` — login
3. `/dashboard/definicoes` — secção segurança Fluxora
4. API calls apontam para Render (Network tab → `NEXT_PUBLIC_BACKEND_URL`)

## Domínio

Staging atual: `waterpro-chi.vercel.app`. Domínio oficial produção — PENDING decisão.
