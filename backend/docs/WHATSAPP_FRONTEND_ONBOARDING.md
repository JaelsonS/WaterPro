# WhatsApp Onboarding - Frontend (Meta Embedded Signup)

## O que foi criado no frontend

Página:
- `src/app/[locale]/dashboard/whatsapp/page.tsx`

Componentes:
- `src/components/meta/MetaEmbeddedSignup.tsx`
  - carrega o Facebook JS SDK uma vez
  - abre o Embedded Signup com `FB.login({ config_id })`
  - captura o `code` via callback do `FB.login`
  - captura `waba_id` / `phone_number_id` via `postMessage` (com validação de `origin` e `type`)
  - envia os dados para o backend:
    - `GET /api/v1/whatsapp/connect/callback`
- `src/components/meta/MetaEmbeddedSignupMock.tsx`
  - simula o Embedded Signup para dev/test sem abrir Meta

## Como funciona o fluxo (resumo)

1. Usuário loga (Supabase Auth no frontend)
2. Admin clica `Conectar WhatsApp`
3. Frontend chama:
   - `POST /api/v1/whatsapp/connect/start`
   - backend retorna `connectionId`, `state` e `embeddedSignupConfigId`
4. Frontend abre Embedded Signup:
   - `FB.login` com `config_id = embeddedSignupConfigId`
5. Ao completar:
   - `code` vem no callback do `FB.login`
   - `waba_id`/`phone_number_id` vêm via `postMessage` (`type === "WA_EMBEDDED_SIGNUP"`)
6. Frontend chama:
   - `GET /api/v1/whatsapp/connect/callback?connectionId=...&state=...&code=...&wabaId=...&phoneNumberId=...`
7. UI atualiza:
   - `GET /api/v1/whatsapp/connections`
   - `GET /api/v1/whatsapp/numbers`
   - `GET /api/v1/sellers`

## Segurança do postMessage

O componente só aceita `message` quando:
- `event.origin` é uma das origens permitidas:
  - `https://www.facebook.com`
  - `https://web.facebook.com`
- payload tem `type === "WA_EMBEDDED_SIGNUP"`
- finaliza apenas quando:
  - já existe `code`, e
  - o `event` do payload parece ser um `FINISH...`

Mesmo assim, o frontend trata esses valores como inputs não confiáveis.
A fonte de verdade do ownership e state/tenant está no backend.

## Variáveis de ambiente (frontend)

Obrigatórias (real Meta):
- `NEXT_PUBLIC_META_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (o backend já usa `META_EMBEDDED_SIGNUP_CONFIG_ID` e valida `WHATSAPP_VERIFY_TOKEN`)

Controlo do modo de onboarding:
- `NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER`
  - default: `mock`
  - quando `mock`, não abre Meta real.

## Endpoint contract usado pelo frontend

- Start:
  - `POST /api/v1/whatsapp/connect/start`
- Callback:
  - `GET /api/v1/whatsapp/connect/callback`
- List/status:
  - `GET /api/v1/whatsapp/connections`
  - `GET /api/v1/whatsapp/numbers`
  - `GET /api/v1/sellers`
- Seller assignment:
  - `PATCH /api/v1/whatsapp/numbers/:id`

## Configuração manual necessária na Meta (itens externos)

O código está pronto, mas para fluxo real funcionar é necessário configurar no Meta App:
- Embedded Signup configuration (gerar `config_id` no App Dashboard)
- Permissions do WhatsApp Embedded Signup (conforme docs)
- Webhook endpoint e verify token
- Configurações de Allowed Domains / Valid OAuth Redirect URIs (Embedded Signup)

O que o backend já exige via env:
- `META_APP_ID` / `META_APP_SECRET`
- `META_EMBEDDED_SIGNUP_CONFIG_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_CALLBACK_URL`

## Próximo passo (E2E real)

1. Rodar com `NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER=mock` e validar fluxo UI/backend
2. Após OK, configurar staging real:
   - staging frontend
   - staging backend
   - staging Supabase
   - webhook staging no Meta

