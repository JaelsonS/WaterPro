# FASE 4 — Consolidação e Segurança
**STATUS:** CONCLUÍDA

## Implementado

### P0 — Audit & credentials
- Migration `0006_audit_events.sql` — tabela + RLS (select tenant/platform admin)
- Migration `0007_whatsapp_credential_vault.sql` — referências de credenciais + `access_token_reference` em connections
- `AuditService` centralizado com `sanitizeAuditMetadata()`
- Eventos WhatsApp registrados (connect, callback fail, disconnect, sync, test, assign)
- `GET /api/v1/audit/events` — consulta via JWT + RLS
- `CredentialVaultService` + repositório Supabase (PREPARADO — sem token real)

### P1 — Dashboard operacional
- Métricas reais: total, ativos, verificados, com/sem vendedor, pendências
- Visão **Por vendedor** em `/dashboard/whatsapp` com filtro
- `WhatsAppOperationalMetricsCard`, `WhatsAppNumbersBySeller`

### P1 — E2E determinístico
- `e2e/api/whatsappState.ts` — setup/teardown via API (não depende de estado prévio)
- `e2e/global-setup.ts` + `backend/scripts/seed-e2e-tenant.ts` — tenant E2E idempotente
- Sync, disconnect, test number **executam** (não skip)
- Cada teste: cleanup before + after
- Auth E2E: token da sessão browser + fallback Supabase direct

### P2 — CORS & segurança
- `CORS_ALLOWED_ORIGINS` documentado em `docs/WHATSAPP_SECURITY.md`
- `backend/src/loadEnv.ts` — carrega `.env.staging` quando `.env` ausente (dev local)
- Sync concurrency guard (409 se sync em andamento)
- Testes API sanitization automatizados
- Testes audit metadata redaction

## Documentação

- [`docs/WHATSAPP_SECURITY.md`](WHATSAPP_SECURITY.md) — audit, vault, CORS, rate limits, Meta gate

## Banco (migrations novas)

| Migration | Conteúdo |
|-----------|----------|
| `0006_audit_events.sql` | Audit trail multi-tenant |
| `0007_whatsapp_credential_vault.sql` | Vault references |

**Aplicar em Supabase antes de usar audit/vault em dev remoto.**

## Testes (evidência — 2026-08-19)

| Suite | Resultado |
|-------|-----------|
| Vitest (root `npm test`) | **61/61** |
| Backend Vitest | **38/38** |
| Playwright E2E | **9/9** |
| Landing smoke | 2/2 |
| WhatsApp E2E determinístico | 5/5 (sync, disconnect, test, por vendedor) |

Executar localmente:

```bash
npm test                                    # Vitest
E2E_TEST_EMAIL=tenant-a-admin-mock@test.local \
E2E_TEST_PASSWORD='Password123!' \
E2E_SKIP_WEBSERVER=1 npm run test:e2e       # Playwright (seed automático)
```

## Meta

**OFF** — mock permanece provider ativo.

## Pendências (Fase 5+)

- Integração secret manager real (staging)
- Rate limit HTTP nos endpoints sensíveis
- HTTP route tests com Supabase de teste dedicado
- Detecção Meta `REAUTH_REQUIRED` via Graph API
- Platform admin audit cross-tenant UI

---

# Roadmap histórico

## FASE 1 — Auditoria — CONCLUÍDA
## FASE 2 — Fundação UI — CONCLUÍDA
## FASE 3 — Fluxo WhatsApp Robusto — CONCLUÍDA
## FASE 4 — Consolidação e Segurança — CONCLUÍDA
## FASE 5 — MFA + Security Gate (Fluxora) — CONCLUÍDA
## FASE 6A — Staging Infrastructure — CONCLUÍDA
## FASE 6B — Meta Staging Real — BLOQUEADA
## FASE 7 — Segurança avançada — PARCIAL
## FASE 8 — E2E — CONCLUÍDA (determinístico Fase 4)

## Variáveis

```env
# Frontend
NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER=mock

# Backend CORS (staging/prod)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://waterpro.pt

# E2E
E2E_TEST_EMAIL=tenant-a-admin-mock@test.local
E2E_TEST_PASSWORD=Password123!
E2E_BACKEND_URL=http://localhost:3001
E2E_SKIP_WEBSERVER=1
# E2E_SKIP_SEED=1  # opcional — pular seed global
```
