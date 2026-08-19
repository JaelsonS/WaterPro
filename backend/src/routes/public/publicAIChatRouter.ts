import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../errors/httpError";
import type {
  AISettingsReadRepository,
  AIProviderAdapter,
  CompanyBySiteKeyResolver,
  KnowledgeReadRepository,
} from "./publicAIChatDeps";
import { findRelevantSnippets } from "../../knowledge/simpleKeywordSearch";

const siteKeyFromHeaderSchema = z
  .string()
  .min(1)
  .transform((s) => s.trim());

const payloadSchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    message: z.string().min(1).max(4000),
    source: z.literal("website"),
  })
  .strict();

export function createPublicAIChatRouter(deps: {
  companyResolver: CompanyBySiteKeyResolver;
  aiSettingsRepo: AISettingsReadRepository;
  knowledgeRepo: KnowledgeReadRepository;
  aiProvider: AIProviderAdapter;
}) {
  const router = Router();

  router.post("/public/ai/chat", async (req, res, next) => {
    try {
      const rawSiteKey = req.headers["x-site-key"];
      if (!rawSiteKey || Array.isArray(rawSiteKey)) {
        return next(new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing x-site-key" }));
      }

      const siteKey = siteKeyFromHeaderSchema.parse(rawSiteKey);
      const companyId = await deps.companyResolver.resolveCompanyIdBySiteKey(siteKey);
      if (!companyId) {
        return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Tenant not found" }));
      }

      const body = payloadSchema.parse(req.body);

      const aiSettings = await deps.aiSettingsRepo.getAISettingsByCompanyId(companyId);
      if (!aiSettings) {
        return next(new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "AI settings not found" }));
      }

      const candidates = await deps.knowledgeRepo.getActiveKnowledgeByCompanyId(companyId);
      const knowledgeSnippets = findRelevantSnippets({
        queryText: body.message,
        candidates,
        limit: 3,
      });

      const fallbackMessage =
        aiSettings.welcomeMessage ?? "Obrigado! Vou ajudar com informações sobre os nossos serviços.";

      const handoffMessage = aiSettings.handoffMessage ?? "Vou encaminhar para um especialista.";

      const result = await deps.aiProvider.generateReply({
        companyId,
        conversationId: body.sessionId ?? "public-ai-session",
        messageText: body.message,
        systemPrompt: aiSettings.systemPrompt,
        knowledgeSnippets,
        handoffEnabled: aiSettings.handoffEnabled,
        handoffMessage,
        fallbackMessage,
      });

      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

