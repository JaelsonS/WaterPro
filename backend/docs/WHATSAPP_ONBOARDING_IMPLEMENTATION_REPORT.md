# WhatsApp Onboarding - Implementation Report

## Objetivo
Implementar a infraestrutura multi-tenant e o estado explícito para onboarding do WhatsApp por empresa, com rotas versionadas e isolamento de tenant no backend.

## Arquitetura adicionada
- `WhatsAppConnectionService`: orquestra o estado do onboarding (start → callback → connect/disconnect).
- `WhatsAppOnboardingProvider`: abstração de provider.
  - `MockWhatsAppOnboardingProvider`: padrão atual (sem credenciais reais).
  - `MetaWhatsAppOnboardingProvider`: implementação técnica do fluxo Embedded Signup v4 (execution depende de env/credenciais).
- `whatsapp_connections`: registra conexão por empresa com estado explícito e proteção one-time callback.
- Evolução em `whatsapp_numbers`: adiciona `connection_id`, `verified` e permite `seller_id` ser `NULL`.

## Banco de dados (migrations)
- `0003_whatsapp_connections.sql`: cria `public.whatsapp_connections` + adiciona `connection_id` e campos de onboarding em `whatsapp_numbers`.
- `0004_whatsapp_connection_onboarding_state.sql`: adiciona colunas explícitas de state/nonce/one-time-use.
- `0005_whatsapp_numbers_seller_optional.sql`: torna `whatsapp_numbers.seller_id` nullable (necessário para conectar números antes de associar vendedor).

## APIs implementadas
- `POST /api/v1/whatsapp/connect/start`
- `GET /api/v1/whatsapp/connect/callback`
- `GET /api/v1/whatsapp/connections`
- `GET /api/v1/whatsapp/connections/:id`
- `POST /api/v1/whatsapp/connections/:id/sync`
- `POST /api/v1/whatsapp/connections/:id/disconnect`
- `POST /api/v1/whatsapp/numbers/:id/test` (administrativo, resposta segura)

## Endpoints existentes ajustados (segurança)
- `GET/POST/PATCH /api/v1/whatsapp/numbers` agora não retornam `access_token_reference` (evita vazamento de dados técnicos/credenciais).

## Multi-tenant + segurança
- O tenant é derivado de `authMiddleware` (`companyId` do usuário).
- Callback valida:
  - `connectionId` pertence à `companyId` autenticada;
  - `onboardingState` corresponde ao estado persistido;
  - callback é one-time use (`onboarding_callback_consumed`).
- Proteção contra replays e callbacks cross-tenant via validação no serviço.

## Provider (estado atual)
### Mock (default)
- Simula descoberta de `phone_number_id`.
- Não chama Meta.

### Meta
- Implementa exchange do `embeddedCode`, registration do phone number e subscription de webhooks usando endpoints oficiais do Graph API.
- Requer configuração de env (não executado no modo mock).

## Testes executados
- `npm test`
- `npm run typecheck`

Inclui testes unitários de onboarding:
- cross-tenant callback falha;
- state mismatch falha;
- callback reutilizado falha (one-time);
- onboarding expirado falha;
- número mock criado somente quando `phoneNumberId` é fornecido.

## Limitações / configurações manuais necessárias (quando usar Meta)
Quando `WHATSAPP_PROVIDER=meta`, será necessário configurar no backend:
- `META_APP_ID`
- `META_APP_SECRET`
- `META_EMBEDDED_SIGNUP_CONFIG_ID`
- `WHATSAPP_VERIFY_TOKEN` (já existe no projeto para webhooks)
- `WHATSAPP_WEBHOOK_CALLBACK_URL` (para override de callback em `subscribed_apps`)

## Próxima etapa sugerida
Integrar o frontend (portal/painel) para:
- chamar `/connect/start`;
- iniciar Embedded Signup com `FB.login` usando `config_id`;
- ao finalizar, coletar `code` + `phone_number_id` via SDK `postMessage` e chamar `/connect/callback`.

