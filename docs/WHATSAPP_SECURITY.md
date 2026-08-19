# WhatsApp Security — WaterPro

Documento de referência para credenciais, auditoria e preparação Meta.

## Princípios

1. **Frontend nunca recebe tokens Meta** — apenas estados e referências opacas.
2. **Backend nunca expõe onboarding secrets** — `onboardingState`, `nonce`, etc. são filtrados via `toPublicConnectionDTO()`.
3. **Auditoria best-effort** — falha de audit não derruba operação WhatsApp; erro é logado.
4. **Meta real OFF** até staging gate — provider mock permanece default.

## Audit events

Tabela: `audit_events` (migration `0006_audit_events.sql`)

| Campo | Descrição |
|-------|-----------|
| `company_id` | Tenant |
| `actor_user_id` | Utilizador que executou a ação |
| `event_type` | Ex.: `WHATSAPP_CONNECT_COMPLETED` |
| `resource_type` | `whatsapp_connection`, `whatsapp_number`, `whatsapp_credential` |
| `resource_id` | UUID do recurso |
| `metadata` | JSON sanitizado — **sem tokens** |

### Eventos WhatsApp registrados

- `WHATSAPP_CONNECT_STARTED`
- `WHATSAPP_CONNECT_COMPLETED`
- `WHATSAPP_CONNECT_FAILED`
- `WHATSAPP_DISCONNECTED`
- `WHATSAPP_SYNC_STARTED` / `COMPLETED` / `FAILED`
- `WHATSAPP_NUMBER_TESTED`
- `WHATSAPP_NUMBER_ASSIGNED`
- `WHATSAPP_REAUTH_REQUIRED` (preparado)
- `WHATSAPP_CONNECTION_RECONNECTED` (preparado)

### RLS

- **SELECT:** `company_admin` do tenant ou `platform_admin`
- **INSERT:** apenas backend (service role) via `AuditService`
- Frontend consulta via `GET /api/v1/audit/events` com JWT + RLS

## Token vault (PREPARADO)

Tabela: `whatsapp_credential_vault` (migration `0007_whatsapp_credential_vault.sql`)

### Separação de dados

| Camada | Conteúdo |
|--------|----------|
| `whatsapp_connections` | Estado, WABA ID, metadata, `access_token_reference` |
| `whatsapp_credential_vault` | Referência opaca ao secret manager |
| Secret manager (produção) | Token Meta real cifrado |

### Decisão arquitetural

**Não armazenar access token em coluna plain text.**

Fluxo Meta staging (futuro):

1. OAuth retorna token no backend
2. Token vai para secret manager (AWS/GCP/Supabase Vault)
3. DB guarda `secret_reference` opaca
4. `whatsapp_connections.access_token_reference` aponta para vault row

### Lifecycle (PREPARADO)

| Estado | Significado |
|--------|-------------|
| `ACTIVE` | Credencial válida |
| `EXPIRED` | Token expirado |
| `REVOKED` | Disconnect / rotação |
| `REAUTH_REQUIRED` | Meta pediu reautorização |

## CORS

`CORS_ALLOWED_ORIGINS` — comma-separated.

| Ambiente | Comportamento |
|----------|---------------|
| Dev (sem env) | Permissivo |
| Staging/Prod | Allowlist explícita — **nunca `*`** |

## Rate limit (P2 — recomendações)

| Endpoint | Recomendação |
|----------|--------------|
| `POST /connect/start` | 5/min por tenant |
| `POST /sync` | Guard in-flight (implementado) |
| `POST /numbers/:id/test` | 10/min por número |

## Backup / rollback

Migrations 0006–0007 são aditivas. Rollback operacional = não usar novas features; não apagar tabelas existentes.

## HTTP route tests

Integração HTTP com Supabase dedicado: **BLOQUEADO** — coberto por service tests + DTO tests.

## E2E determinístico

Script idempotente: `backend/scripts/seed-e2e-tenant.ts` (executado via `e2e/global-setup.ts`).

- Garante `tenant-a-admin-mock@test.local` com `company_admin` ativo em `tenant-a-e2e`
- Desativa memberships conflitantes (constraint `company_members_single_active_per_user`)
- Backend dev carrega `.env.staging` automaticamente se `.env` não existir (`loadEnv.ts`)

## Meta staging gate

Antes de `WHATSAPP_PROVIDER=meta`:

- Token vault + secret manager
- Audit validado em staging
- E2E determinístico
- CORS produção
- Webhook Meta
