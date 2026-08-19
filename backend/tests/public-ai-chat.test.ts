import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler";
import { notFoundHandler } from "../src/middleware/notFound";
import { requestIdMiddleware } from "../src/middleware/requestId";
import { MockAIProvider } from "../src/ai/mockAIProvider";
import { createPublicAIChatRouter } from "../src/routes/public/publicAIChatRouter";
import type { AIProviderAdapter } from "../src/routes/public/publicAIChatDeps";

const siteKeyA = "site_key_tenant_a";
const siteKeyB = "site_key_tenant_b";
const companyIdA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyIdB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function buildTestApp(deps: any) {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/v1", createPublicAIChatRouter(deps));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("FASE 6 - public AI chat (multi-tenant)", () => {
  it("Unauthorized: sem x-site-key deve falhar", async () => {
    const app = buildTestApp({
      companyResolver: { resolveCompanyIdBySiteKey: async () => companyIdA },
      aiSettingsRepo: { getAISettingsByCompanyId: async () => null },
      knowledgeRepo: { getActiveKnowledgeByCompanyId: async () => [] },
      aiProvider: {} as AIProviderAdapter,
    });

    const res = await request(app).post("/api/v1/public/ai/chat").send({
      message: "Olá",
      source: "website",
    });

    expect(res.status).toBe(401);
  });

  it("Tenant isolation: resposta referencia knowledge do tenant correto", async () => {
    const aiProviderImpl = new MockAIProvider();
    const aiProvider: AIProviderAdapter = {
      async generateReply(params) {
        const r = await aiProviderImpl.generateReply({
          companyId: params.companyId,
          conversationId: params.conversationId,
          messageText: params.messageText,
          systemPrompt: params.systemPrompt,
          knowledgeSnippets: params.knowledgeSnippets,
          handoffEnabled: params.handoffEnabled,
          handoffMessage: params.handoffMessage,
          fallbackMessage: params.fallbackMessage,
          customerPhone: undefined,
          customerName: undefined,
        });
        return r;
      },
    };

    const app = buildTestApp({
      companyResolver: {
        async resolveCompanyIdBySiteKey(siteKey: string) {
          if (siteKey === siteKeyA) return companyIdA;
          if (siteKey === siteKeyB) return companyIdB;
          return null;
        },
      },
      aiSettingsRepo: {
        async getAISettingsByCompanyId(companyId: string) {
          if (companyId === companyIdA) {
            return {
              systemPrompt: "SYSTEM_A",
              welcomeMessage: "WELCOME_A",
              handoffEnabled: true,
              handoffMessage: "HANDOFF_A",
            };
          }
          return {
            systemPrompt: "SYSTEM_B",
            welcomeMessage: "WELCOME_B",
            handoffEnabled: true,
            handoffMessage: "HANDOFF_B",
          };
        },
      },
      knowledgeRepo: {
        async getActiveKnowledgeByCompanyId(companyId: string) {
          if (companyId === companyIdA) return [{ title: "K_A", content: "agua boa" }];
          return [{ title: "K_B", content: "agua extra" }];
        },
      },
      aiProvider,
    });

    const resA = await request(app)
      .post("/api/v1/public/ai/chat")
      .set("x-site-key", siteKeyA)
      .send({ message: "Quero saber agua", source: "website" });

    expect(resA.status).toBe(200);
    expect(resA.body.handoff).toBe(false);
    expect(resA.body.replyText).toContain("Referência: K_A");

    const resB = await request(app)
      .post("/api/v1/public/ai/chat")
      .set("x-site-key", siteKeyB)
      .send({ message: "Quero saber agua", source: "website" });

    expect(resB.status).toBe(200);
    expect(resB.body.handoff).toBe(false);
    expect(resB.body.replyText).toContain("Referência: K_B");
  });

  it("Handoff: mensagem com intenção 'humano' deve retornar handoff=true", async () => {
    const aiProviderImpl = new MockAIProvider();
    const aiProvider: AIProviderAdapter = {
      async generateReply(params) {
        const r = await aiProviderImpl.generateReply({
          companyId: params.companyId,
          conversationId: params.conversationId,
          messageText: params.messageText,
          systemPrompt: params.systemPrompt,
          knowledgeSnippets: params.knowledgeSnippets,
          handoffEnabled: params.handoffEnabled,
          handoffMessage: params.handoffMessage,
          fallbackMessage: params.fallbackMessage,
          customerPhone: undefined,
          customerName: undefined,
        });
        return r;
      },
    };

    const app = buildTestApp({
      companyResolver: { resolveCompanyIdBySiteKey: async () => companyIdA },
      aiSettingsRepo: {
        async getAISettingsByCompanyId() {
          return {
            systemPrompt: "SYSTEM_A",
            welcomeMessage: "WELCOME_A",
            handoffEnabled: true,
            handoffMessage: "HANDOFF_A",
          };
        },
      },
      knowledgeRepo: { getActiveKnowledgeByCompanyId: async () => [{ title: "K_A", content: "x" }] },
      aiProvider,
    });

    const res = await request(app)
      .post("/api/v1/public/ai/chat")
      .set("x-site-key", siteKeyA)
      .send({ message: "Quero falar com uma pessoa (humano)", source: "website" });

    expect(res.status).toBe(200);
    expect(res.body.handoff).toBe(true);
    expect(res.body.replyText).toContain("HANDOFF_A");
  });
});

