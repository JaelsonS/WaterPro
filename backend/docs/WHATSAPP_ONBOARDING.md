# WhatsApp Onboarding (SaaS multi-tenant)

Esta seção documenta a infraestrutura para conectar o WhatsApp **por empresa/tenant**, usando estado explícito e isolamento multi-tenant desde o início.

O objetivo é permitir que uma nova empresa:
1. inicie o onboarding do WhatsApp (Embedded Signup da Meta, futuramente no modo `meta`);
2. ao finalizar, o backend associe `whatsapp_numbers` à empresa correta;
3. mantenha o estado `CONNECTED`/`ERROR`/etc e proteja contra `callback` inválido (CSRF/tenant swapping).

> Status atual: `WHATSAPP_PROVIDER=mock` é o padrão e já suporta validação multi-tenant + one-time callback. O provider `meta` está implementado como “READY”, mas execução real depende de credenciais/env e do frontend iniciar o fluxo oficial da Meta.

## Data model

### `public.whatsapp_connections`
- `company_id`: tenant/empresa (RLS garantido)
- `provider`: hoje `meta`
- `status`: `PENDING | CONNECTING | CONNECTED | REAUTH_REQUIRED | DISCONNECTED | ERROR`
- `onboarding_state`: estado/nonce do onboarding (persistido)
- `onboarding_expires_at`: expiração do onboarding
- `onboarding_callback_consumed` + `onboarding_callback_consumed_at`: proteção one-time use
- `metadata`: informações não sensíveis (ex.: `waba_id` quando disponível)

### `public.whatsapp_numbers`
- `connection_id`: vínculo com `whatsapp_connections`
- `seller_id`: **nullable** (número pode existir antes da associação de vendedor)
- `verified`: boolean para sinalizar prontidão para Cloud API (v1)
- `status`: campo existente (ex.: `active`/`inactive`)

## Estado / segurança do callback

O serviço valida:
- o `connectionId` pertence à `companyId` autenticada (nunca confia em tenant enviado no corpo);
- o `onboardingState` recebido corresponde ao valor persistido;
- `onboardingExpiresAt` ainda é válido;
- o callback ainda não foi consumido (`one-time use`).

Se qualquer validação falhar, a conexão vai para erro (ou retorna falha) sem criar números duplicados.

## Rotas (API v1)

Todas as rotas abaixo exigem autenticação e papel `company_admin` ou `platform_admin`.

1. `POST /api/v1/whatsapp/connect/start`
   - Cria `whatsapp_connections` em `CONNECTING`
   - Retorna para o frontend o `embeddedSignupConfigId` e `state` (para iniciar Embedded Signup)

2. `GET /api/v1/whatsapp/connect/callback`
   - Finaliza o onboarding:
     - troca/executa onboarding no provider (`mock`/`meta`)
     - associa números à empresa e marca `CONNECTED`

3. `GET /api/v1/whatsapp/connections`
   - Lista conexões da empresa (status/metadata não sensível)

4. `GET /api/v1/whatsapp/connections/:id`
   - Busca uma conexão específica (por empresa)

5. `POST /api/v1/whatsapp/connections/:id/sync`
   - No modo `mock` revalida estado

6. `POST /api/v1/whatsapp/connections/:id/disconnect`
   - Marca conexão como `DISCONNECTED`
   - Soft-disconnect de números (`status=inactive`, `verified=false`)

Além disso:
- `GET /api/v1/whatsapp/numbers` (administrativo, contrato seguro)
- `POST /api/v1/whatsapp/numbers/:id/test` (checagem segura sem credenciais)

## Provider abstraction

### `mock`
- Simula a descoberta do(s) `phone_number_id`.
- Não envia mensagens reais.
- Serve para validar multi-tenant e o fluxo de estado.

### `meta`
- Implementa o fluxo “técnico” conforme documentação do **WhatsApp Embedded Signup v4**:
  - troca `embeddedCode` por token via Graph API (`/oauth/access_token`)
  - registra o `phone_number_id` via `/{phone_number_id}/register`
  - subscreve webhooks do WABA via `/{waba_id}/subscribed_apps`
  - fallback quando `phone_number_id` vem ausente: lista `/{waba_id}/phone_numbers`

> Execução real só ocorre quando:
> - `WHATSAPP_PROVIDER=meta`
> - `META_APP_ID`, `META_APP_SECRET`, `META_EMBEDDED_SIGNUP_CONFIG_ID` e `WHATSAPP_VERIFY_TOKEN` estão configurados

## Como testar agora (modo mock)

1. Autentique com uma conta `company_admin`.
2. Chame `POST /api/v1/whatsapp/connect/start`.
3. Chame `GET /api/v1/whatsapp/connect/callback` com:
   - `connectionId` retornado
   - `state` retornado
   - `code` (qualquer string no modo mock)
   - `phoneNumberId` (ex.: `pn-1`) para simular descoberta
4. Consulte `GET /api/v1/whatsapp/connections` ou `GET /api/v1/whatsapp/numbers`.

