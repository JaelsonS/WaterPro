# Fluxora — Deploy Backend Staging (Render)

## Pré-requisitos

- Repositório conectado ao GitHub
- **A pasta `backend/` tem de existir no GitHub** — o deploy falha com `Root directory 'backend' does not exist` se o backend só existir localmente e nunca foi pushed
- Branch com o código completo (`staging` recomendado, ou `main`)
- Supabase STAGING credentials disponíveis (dashboard Render, não no Git)

## 1. Criar Web Service

1. Render Dashboard → **New** → **Web Service**
2. Conectar repositório Fluxora/WaterPro
3. Branch: **`staging`** (ou `main` se ainda não existir `staging` no remoto)

## 2. Configuração do serviço

| Campo | Valor |
|-------|-------|
| **Name** | `fluxora-api-staging` (sugestão) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/v1/health` |

## 3. Node version

Render usa `engines` do `backend/package.json`: **Node >= 20**

## 4. Environment Variables

Copiar de `backend/.env.staging.example`. **Nunca colar secrets neste documento.**

### Obrigatórias

| Variável | Secret? |
|----------|---------|
| `APP_ENV` | não → `staging` |
| `NODE_ENV` | não → `production` |
| `PORT` | não → Render define (ex. 10000) |
| `SUPABASE_URL` | não |
| `SUPABASE_ANON_KEY` | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | **sim — crítico** |
| `ADMIN_MFA_REQUIRED` | não → `true` |
| `CORS_ALLOWED_ORIGINS` | não → `https://waterpro-chi.vercel.app` |
| `WHATSAPP_PROVIDER` | não → `mock` |

### NÃO configurar no staging publicado

| Variável | Motivo |
|----------|--------|
| `E2E_SKIP_MFA` | bypass MFA — apenas testes locais |

### Meta (Fase 6B — PENDING)

Placeholders `YOUR_*` — manter mock até gate aprovado.

## 5. CORS

Após obter URL Render, atualizar:

```
CORS_ALLOWED_ORIGINS=https://waterpro-chi.vercel.app
```

Se necessário adicionar preview URLs Vercel (comma-separated).

## 6. Deploy

1. Deploy manual ou auto-deploy on push to `staging`
2. Validar health: `curl https://<render-url>/api/v1/health`
3. Resposta esperada:

```json
{ "status": "ok", "environment": "staging", "service": "fluxora-api" }
```

## 7. Atualizar frontend

Em Vercel, definir:

```
NEXT_PUBLIC_BACKEND_URL=https://<render-staging-url>
```

## 8. Webhook (futuro Meta)

`WHATSAPP_WEBHOOK_CALLBACK_URL=https://<render-staging-url>/api/v1/webhooks/whatsapp`

**Não** apontar webhook para URL Vercel (frontend).

## 9. Migrations

Aplicar manualmente no Supabase STAGING (SQL Editor ou CLI):

```
0001_init.sql … 0007_whatsapp_credential_vault.sql
```

Não executar em Production nesta fase.

## 10. Rollback

Render → Deploys → selecionar deploy anterior → **Rollback**.
