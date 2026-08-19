import type { AIProvider, AIProviderResponse } from "../../ai/aiProvider";
import type { WhatsAppProvider } from "../../whatsapp/whatsappProvider";

export type PipelineConversationContext = {
  id: string;
  companyId: string;
  sellerName?: string;
  whatsappNumberId: string;
  aiEnabled: boolean;
  handoffEnabled: boolean;
  handoffMessage: string;
};

export type PipelineAIContext = {
  systemPrompt: string;
  knowledgeSnippets: Array<{ title: string; content: string }>;
  fallbackMessage: string;
};

export type IncomingMessagePipelineDeps = {
  getConversationContext(conversationId: string): Promise<PipelineConversationContext>;
  getAIContext(params: { companyId: string; queryText: string }): Promise<PipelineAIContext>;
  persistAIOutboundMessage(params: {
    conversationId: string;
    replyText: string;
    handoff: boolean;
  }): Promise<{ id: string; externalMessageId?: string }>;
};

export function createIncomingMessagePipeline(params: {
  aiProvider: AIProvider;
  whatsappProvider: WhatsAppProvider;
  deps: IncomingMessagePipelineDeps;
}) {
  return {
    async process(input: {
      conversationId: string;
      toPhone: string;
      customerMessageText: string;
    }) {
      const conversation = await params.deps.getConversationContext(input.conversationId);

      if (!conversation.aiEnabled) {
        // Handoff / cerrado: não chamar IA.
        return { skipped: true as const };
      }

      const aiContext = await params.deps.getAIContext({
        companyId: conversation.companyId,
        queryText: input.customerMessageText,
      });

      const aiResponse: AIProviderResponse = await params.aiProvider.generateReply({
        companyId: conversation.companyId,
        conversationId: conversation.id,
        sellerName: conversation.sellerName,
        messageText: input.customerMessageText,
        customerPhone: undefined,
        customerName: undefined,
        systemPrompt: aiContext.systemPrompt,
        knowledgeSnippets: aiContext.knowledgeSnippets,
        handoffEnabled: conversation.handoffEnabled,
        handoffMessage: conversation.handoffMessage,
        fallbackMessage: aiContext.fallbackMessage,
      });

      // Envia mensagem (mock provider nesta fase)
      const sendRes = await params.whatsappProvider.sendMessage({
        companyId: conversation.companyId,
        whatsappNumberId: conversation.whatsappNumberId,
        toPhone: input.toPhone,
        text: aiResponse.replyText,
      });

      // Persiste outbound e, se handoff, marca estado (persistência real será implementada na fase 5)
      const persisted = await params.deps.persistAIOutboundMessage({
        conversationId: conversation.id,
        replyText: aiResponse.replyText,
        handoff: aiResponse.handoff,
      });

      return {
        skipped: false as const,
        aiResponse,
        wa: { externalMessageId: sendRes.externalMessageId },
        messageId: persisted.id,
      };
    },
  };
}

