import type { AIProviderRequest } from "../../ai/aiProvider";

export function buildAIProviderInput(params: {
  companyId: string;
  conversationId: string;
  sellerName?: string;
  messageText: string;
  customerPhone?: string;
  customerName?: string;
  systemPrompt: string;
  knowledgeSnippets: Array<{ title: string; content: string }>;
  handoffEnabled: boolean;
  handoffMessage: string;
  fallbackMessage: string;
}): AIProviderRequest {
  // Importante: customer input nunca substitui/alterar `systemPrompt`.
  // A separação entre:
  // - systemPrompt (controle do backend/empresa)
  // - messageText (dados do cliente)
  // impede prompt injection via "instruções" do usuário.
  return {
    companyId: params.companyId,
    conversationId: params.conversationId,
    sellerName: params.sellerName,
    messageText: params.messageText,
    customerPhone: params.customerPhone,
    customerName: params.customerName,
    systemPrompt: params.systemPrompt,
    knowledgeSnippets: params.knowledgeSnippets,
    handoffEnabled: params.handoffEnabled,
    handoffMessage: params.handoffMessage,
    fallbackMessage: params.fallbackMessage,
  };
}

