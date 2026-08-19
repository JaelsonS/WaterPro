import { createSupabaseAdminClient } from "../config/supabase";
import type {
  PipelineAIContext,
  PipelineConversationContext,
  IncomingMessagePipelineDeps,
} from "../services/processing/incomingMessagePipeline";
import { findRelevantSnippets } from "../knowledge/simpleKeywordSearch";

export function createSupabaseIncomingPipelineDeps(): IncomingMessagePipelineDeps {
  const supabase = createSupabaseAdminClient();

  return {
    async getConversationContext(conversationId: string): Promise<PipelineConversationContext> {
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .select("id,company_id,seller_id,whatsapp_number_id,ai_enabled")
        .eq("id", conversationId)
        .maybeSingle();

      if (convErr || !conv) throw convErr ?? new Error("Conversation not found");

      const { data: seller } = await supabase
        .from("sellers")
        .select("name")
        .eq("id", conv.seller_id)
        .maybeSingle();

      const { data: aiSettings } = await supabase
        .from("ai_settings")
        .select("handoff_enabled,handoff_message")
        .eq("company_id", conv.company_id)
        .maybeSingle();

      return {
        id: conv.id,
        companyId: conv.company_id,
        sellerName: seller?.name ?? undefined,
        whatsappNumberId: conv.whatsapp_number_id,
        aiEnabled: Boolean(conv.ai_enabled),
        handoffEnabled: Boolean(aiSettings?.handoff_enabled ?? true),
        handoffMessage: aiSettings?.handoff_message ?? "Vou encaminhar para um especialista.",
      };
    },

    async getAIContext({ companyId, queryText }): Promise<PipelineAIContext> {
      const { data: aiSettings } = await supabase
        .from("ai_settings")
        .select("system_prompt,welcome_message")
        .eq("company_id", companyId)
        .maybeSingle();

      const systemPrompt = aiSettings?.system_prompt ?? "";
      const fallbackMessage = aiSettings?.welcome_message ?? "Obrigado! Vou ajudar com informações sobre nossos serviços.";

      const { data: knowledgeItems } = await supabase
        .from("knowledge_items")
        .select("title,content")
        .eq("company_id", companyId)
        .eq("active", true);

      const candidates =
        knowledgeItems?.map((k) => ({ title: k.title, content: k.content })) ?? [];

      const knowledgeSnippets = findRelevantSnippets({
        queryText,
        candidates,
        limit: 3,
      });

      return {
        systemPrompt,
        knowledgeSnippets,
        fallbackMessage,
      };
    },

    async persistAIOutboundMessage(params: {
      conversationId: string;
      replyText: string;
      handoff: boolean;
    }) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("company_id")
        .eq("id", params.conversationId)
        .maybeSingle();

      if (!conv) throw new Error("Conversation not found");

      const { data: message, error: msgErr } = await supabase
        .from("messages")
        .insert({
          company_id: conv.company_id,
          conversation_id: params.conversationId,
          direction: "outbound",
          sender_type: "ai",
          content: params.replyText,
          status: "sent",
          metadata: {},
        })
        .select("id")
        .maybeSingle();

      if (msgErr || !message) throw msgErr ?? new Error("Failed to persist outbound message");

      if (params.handoff) {
        await supabase
          .from("conversations")
          .update({ ai_enabled: false, status: "HUMAN_HANDOFF" })
          .eq("id", params.conversationId);
      }

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", params.conversationId);

      return { id: message.id };
    },
  };
}

