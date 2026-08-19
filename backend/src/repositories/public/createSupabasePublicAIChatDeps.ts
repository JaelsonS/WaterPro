import { createSupabaseAdminClient } from "../../config/supabase";
import { MockAIProvider } from "../../ai/mockAIProvider";
import type {
  AISettingsReadRepository,
  AIProviderAdapter,
  CompanyBySiteKeyResolver,
  KnowledgeReadRepository,
} from "../../routes/public/publicAIChatDeps";

// Note: knowledge search já acontece no controller/route; aqui só buscamos candidatos.

export function createSupabasePublicAIChatDeps(): {
  companyResolver: CompanyBySiteKeyResolver;
  aiSettingsRepo: AISettingsReadRepository;
  knowledgeRepo: KnowledgeReadRepository;
  aiProvider: AIProviderAdapter;
} {
  const aiProviderImpl = new MockAIProvider();

  return {
    companyResolver: {
      async resolveCompanyIdBySiteKey(siteKey: string) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("public_site_keys")
          .select("company_id")
          .eq("site_key", siteKey)
          .eq("active", true)
          .maybeSingle();

        if (error || !data) return null;
        return data.company_id;
      },
    },
    aiSettingsRepo: {
      async getAISettingsByCompanyId(companyId: string) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("ai_settings")
          .select("system_prompt,welcome_message,handoff_enabled,handoff_message")
          .eq("company_id", companyId)
          .maybeSingle();

        if (error || !data) return null;

        return {
          systemPrompt: data.system_prompt ?? "",
          welcomeMessage: data.welcome_message ?? null,
          handoffEnabled: Boolean(data.handoff_enabled ?? true),
          handoffMessage: data.handoff_message ?? null,
        };
      },
    },
    knowledgeRepo: {
      async getActiveKnowledgeByCompanyId(companyId: string) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("knowledge_items")
          .select("title,content")
          .eq("company_id", companyId)
          .eq("active", true);

        if (error || !data) return [];
        return data.map((k) => ({ title: k.title, content: k.content }));
      },
    },
    aiProvider: {
      async generateReply(params) {
        const result = await aiProviderImpl.generateReply({
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
        return result;
      },
    },
  };
}

