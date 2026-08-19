# FASE 5 — MFA Administrativo + Security Gate (Fluxora)

**STATUS:** CONCLUÍDA (Meta real continua **OFF**)

## Produto / Identidade

| Camada | Nome |
|--------|------|
| Empresa | AfDigital Soluções Tecnológicas |
| Produto / plataforma | **Fluxora** |
| Tenant inicial | WaterPro (cliente, não hardcoded na arquitetura) |

## MFA — IMPLEMENTADO

- Supabase Auth MFA nativo (TOTP) — sem secret manual, sem OTP em logs/audit
- `requireAdminMfa` middleware (`enrollment` | `step_up`)
- `GET /api/v1/auth/security-status`
- Frontend: `useAdminSecurity`, `MfaSetupPanel`, `MfaStepUpModal`, `AdminSecurityProvider`
- Step-up window local: 15 min (`sessionStorage`) + JWT `aal2`

### Quem exige MFA

- `company_admin` e `platform_admin` quando `ADMIN_MFA_REQUIRED=true`
- Desativado em dev/E2E via `ADMIN_MFA_REQUIRED=false` ou `E2E_SKIP_MFA=1`

### Rotas protegidas (step-up)

- WhatsApp: connect/start, callback, disconnect, sync, numbers mutate/test
- Audit: `GET /audit/events` (enrollment)

### Audit events MFA

`MFA_SETUP_STARTED`, `MFA_ENABLED`, `MFA_VERIFICATION_*`, `MFA_REMOVED`, `MFA_STEP_UP_*`

## Token Vault — REVISADO (PREPARADO)

`CredentialVaultService`: `store`, `get`, `rotate`, `revoke`, `delete` — referências opacas apenas.

## Secret Manager — DOCUMENTADO

Recomendação staging: **Vercel Environment Variables** + referência opaca no vault; produção: secret manager dedicado (AWS/GCP) com rotação auditada. Ver `docs/FLUXORA_SECURITY.md`.

## Meta — OFF + checklist staging

Ver `docs/FLUXORA_META_STAGING.md` (PREPARADO — sem credenciais reais).

## Testes (evidência)

| Suite | Resultado |
|-------|-----------|
| Vitest root | ver `npm test` |
| Playwright | ver `npm run test:e2e` |

## Variáveis

```env
ADMIN_MFA_REQUIRED=true          # produção/staging gate
E2E_SKIP_MFA=1                   # apenas dev/E2E
```

## Próxima fase

**FASE 6 — Meta Staging Real** (após gates aprovados + secret manager staging)
