# Fluxora — Staging Environment

**Produto:** Fluxora · **Empresa:** AfDigital · **Tenant inicial:** WaterPro

## Arquitetura staging

| Camada | Provider | URL |
|--------|----------|-----|
| Frontend | Vercel | https://waterpro-chi.vercel.app |
| Backend/API | Render | `https://<YOUR-RENDER-STAGING-API>.onrender.com` (PENDING) |
| Database/Auth | Supabase STAGING | PENDING — projeto existente |
| Meta | OFF | mock provider |

## Ambientes

| Ambiente | APP_ENV | MFA | WhatsApp |
|----------|---------|-----|----------|
| Local dev | development | opcional (`ADMIN_MFA_REQUIRED=false`) | mock |
| Staging publicado | staging | **obrigatório** | mock |
| Production | production | **obrigatório** | meta (futuro) |

## Checklist pré-deploy staging

### Supabase STAGING

- [ ] Migrations 0001–0007 aplicadas
- [ ] RLS ativo (audit_events, credential_vault, whatsapp_*)
- [ ] Auth Site URL: `https://waterpro-chi.vercel.app`
- [ ] Redirect URLs: staging frontend + localhost dev
- [ ] MFA habilitado no projeto Auth

### Backend Render

Ver [`FLUXORA_RENDER_STAGING.md`](FLUXORA_RENDER_STAGING.md)

### Frontend Vercel

Ver [`FLUXORA_VERCEL_STAGING.md`](FLUXORA_VERCEL_STAGING.md)

### Pós-deploy

- [ ] `GET /api/v1/health` → `{ status: "ok", environment: "staging" }`
- [ ] Login dashboard staging
- [ ] MFA setup + step-up
- [ ] WhatsApp mock connect/sync (com MFA)
- [ ] Landing smoke PASS

## Meta

**OFF** até Fase 6B. Ver [`FLUXORA_META_STAGING.md`](FLUXORA_META_STAGING.md).

## Secrets

Nunca em Git. Configurar apenas em Vercel/Render/Supabase dashboards.

Templates: `.env.example`, `backend/.env.staging.example`
