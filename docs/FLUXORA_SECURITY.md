# Fluxora Security — AfDigital

Documento de segurança da plataforma **Fluxora** (multi-tenant). WaterPro é tenant inicial, não nome estrutural.

## MFA administrativo

### Princípios

1. **Authentication ≠ Authorization ≠ MFA**
2. Admin autenticado sem MFA **não** executa ações sensíveis
3. OTP/QR/secret **nunca** em audit, logs ou API responses
4. Supabase Auth MFA nativo — sem TOTP caseiro

### Níveis de sessão

| Nível | Significado |
|-------|-------------|
| `NORMAL_SESSION` | Login password (`aal1`) |
| `STEP_UP_REQUIRED` | MFA configurado, ação sensível pendente |
| `MFA_VERIFIED` | JWT `aal2` ou step-up local (15 min) |

### Recovery

- Perda do autenticador: recovery via Supabase (email) ou intervenção platform admin auditada
- **Sem bypass** silencioso — remoção de fator exige fluxo Supabase + audit `MFA_REMOVED`
- Troca de dispositivo: re-enroll após unenroll autenticado

### Brute force

- Supabase limita tentativas MFA
- Backend retorna 403 sem revelar detalhes
- Rate limit HTTP recomendado em endpoints sensíveis (Fase 7)

## Secret manager (decisão Fase 5)

| Ambiente | Recomendação |
|----------|--------------|
| Staging | Vercel env secrets + `secret_reference` opaco no vault |
| Produção | AWS Secrets Manager ou GCP Secret Manager |
| Critérios | rotação, IAM mínimo, audit trail, sem exposição ao frontend |

Tokens Meta **nunca** em `whatsapp_connections` em plain text.

## Tenant isolation

MFA não altera RLS. Tenant A não acede audit/credenciais/config de Tenant B.

## Meta real

**OFF** até Fase 6B. Checklist em `docs/FLUXORA_META_STAGING.md`.

## Staging (Fase 6A)

| Ambiente | MFA | CORS | Secrets |
|----------|-----|------|---------|
| Local dev | opcional | permissivo | `.env.local` gitignored |
| Staging publicado | **obrigatório** (`ADMIN_MFA_REQUIRED=true`) | allowlist explícita | Render/Vercel dashboards |
| Production | **obrigatório** | allowlist explícita | nunca em Git |

`E2E_SKIP_MFA` — **apenas** testes Playwright locais, nunca no Render staging.
