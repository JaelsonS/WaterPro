## Backend da Water Pro (núcleo multiempresa)

### O que existe hoje no repositório (auditoria)

Este repositório atualmente contém **apenas um site demo** em `Next.js` (App Router).

**Principais achados:**

- `package.json` e `next.config.ts` indicam `Next.js 15` + `TypeScript`.
- `src/` contém páginas e componentes do site e um assistente de UX (`GuiAssistant`) que **abre links `wa.me` no frontend**.
- **Não existem rotas/API backend** no projeto (não há `src/app/api/**` e nem `src/pages/api/**`).
- **Não existe Supabase** configurado (não encontrei `@supabase/supabase-js`, `createClient`, nem pastas/configs de migrations).
- Não há chamadas para `OpenAI`/`meta`/`webhook` no código atual.
- Não há testes unitários/integrados configurados no repositório (apenas `next lint`).

**Arquitetura encontrada:**

- Framework: `Next.js (App Router)` + `next-intl` (i18n).
- Rotas: páginas React no `src/app/[locale]/...`.
- Autenticação: inexistente no frontend (sem `supabase auth`).
- Banco: inexistente.
- Deploy/documentação: README e instruções de Vercel; sem backend.

### Consequências para o backend novo

Como o projeto hoje não tem qualquer backend nem base de dados, a pasta `/backend` será um **novo serviço** independente, sem alterar destrutivamente o site.

### Tecnologia que vamos usar no backend (fase 1)

- Backend: `Node.js` + `TypeScript` + `Express`
- Banco: `Supabase PostgreSQL`
- Auth: `Supabase Auth` (JWT no header do backend)
- Integrações:
  - `OpenAI` via API oficial (chave apenas no backend)
  - WhatsApp via **Meta Cloud API** (provider abstraído; sem hacks)
- Validação: `zod`
- Segurança:
  - **Multi-tenant desde o 1º commit**
  - Isolamento por `company_id` (único padrão)
  - RLS no Supabase (nenhuma tabela sensível aberta)
  - Defesa contra IDOR/tenant hopping/privilges escalation via derivação de tenant no servidor

### O que será reaproveitado

Do código atual do site, a única parte diretamente relevante para o backend é a **experiência de “fluxo” do assistente**:

- `src/components/ui/GuiAssistant.tsx` (hoje abre `wa.me`).

Nesta fase inicial, a intenção é **não quebrar o site**: as alterações no frontend serão mínimas e só quando o endpoint público estiver pronto.

O restante (rotas, auth, banco, webhook) será criado do zero no `/backend`.

### O que será novo

No `/backend` vamos criar:

- Estrutura modular (controller/service/repository/middleware/provider)
- API versionada `/api/v1`
- Saúde: `GET /api/v1/health`
- Integração com Supabase + RLS
- Autenticação e autorização multiempresa

### Riscos identificados

1. **Assumir o modelo de “empresa do usuário”**: para derivar `company_id` a partir da sessão, precisamos de uma tabela de mapeamento (membership) no banco.
2. **Integração do WhatsApp**: a Meta Cloud API exige verificação de webhook e payloads específicos. Vamos implementar em uma fase posterior quando o provider e a persistência base estiverem prontos.
3. **Não existe base de testes no repo atual**: vamos começar a adicionar testes no backend para cobrir isolamento multi-tenant e idempotência de webhook.

### Dependências/credenciais necessárias (a definir por fase)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (somente no backend)
- `OPENAI_API_KEY` (somente no backend)
- Meta WhatsApp:
  - `WHATSAPP_ACCESS_TOKEN` (ou referência equivalente)
  - `WHATSAPP_VERIFY_TOKEN`
  - `WHATSAPP_APP_SECRET`
  - `WHATSAPP_PHONE_NUMBER_ID`

### Plano de implementação (alto nível)

#### Fase 0 — Setup e foundation (agora)
- Criar `/backend` com Express + TypeScript
- Criar `/api/v1/health`
- Criar configuração/env + logging + error handling
- Criar schema inicial no Supabase com RLS (multi-tenant por `company_id`)

#### Fase 1 — Auth + autorização + sellers/WhatsApp (próxima iteração)
- Derivar `company_id` do usuário autenticado
- Implementar:
  - sellers
  - whatsapp_numbers
  - endpoint público `public/sellers`

#### Fase 2 — AI + Knowledge + handoff
- Provider AI (OpenAI + mock)
- Conversas/mensagens com estado AI/handoff
- Persistência e anti-loop

#### Fase 3 — Webhook Meta WhatsApp + provider
- Verify webhook
- Idempotência e processamento assíncrono
- Provider de envio de mensagens pela Cloud API

