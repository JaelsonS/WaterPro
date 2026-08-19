# Meta Staging Checklist — Fluxora

**Status:** PENDING CONFIGURATION — Meta real **OFF** (Fase 6A)

## Naming

- **Produto/plataforma:** Fluxora (AfDigital Soluções Tecnológicas)
- **Tenant inicial:** WaterPro
- **App Meta:** criar como Fluxora, não WaterPro SaaS

## Pré-requisitos (Fase 5–6A gates)

- [x] MFA admin + step-up (código)
- [x] Audit events + vault references
- [ ] `ADMIN_MFA_REQUIRED=true` no Render staging publicado
- [ ] Secret manager via Render env (sem AWS nesta fase)
- [ ] Backend Render URL real
- [ ] CORS staging configurado

## Meta Developer — PENDING CONFIGURATION

| Item | Status |
|------|--------|
| Meta App (Fluxora) | PENDING |
| Business Portfolio | PENDING |
| WhatsApp Business Account (test) | PENDING |
| Embedded Signup | PENDING |
| Config ID | PENDING |
| App ID | PENDING |
| App Secret | PENDING — backend only, Render secret |
| Webhook URL | PENDING — Render API URL |
| Verify Token | PENDING |
| Redirect URL | PENDING — staging frontend |
| Allowed domains | PENDING |
| Permissions | PENDING |

## Variáveis (Fase 6B — não configurar agora)

Backend (Render secrets):

```
WHATSAPP_PROVIDER=meta
META_APP_ID=PENDING
META_APP_SECRET=PENDING
META_EMBEDDED_SIGNUP_CONFIG_ID=PENDING
WHATSAPP_VERIFY_TOKEN=PENDING
WHATSAPP_APP_SECRET=PENDING
WHATSAPP_WEBHOOK_CALLBACK_URL=https://<render-staging>/api/v1/webhooks/whatsapp
```

Frontend (público):

```
NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER=meta
NEXT_PUBLIC_META_APP_ID=PENDING
```

## Validação (após 6B)

1. Embedded Signup staging WABA
2. Webhook verify + events
3. Sync numbers
4. MFA step-up em disconnect/reconnect
5. Audit trail completo
6. Nenhum token no frontend/Git/logs
