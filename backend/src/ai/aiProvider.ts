export type AIMessageRole = "system" | "assistant" | "user";

export type AIProviderRequest = {
  companyId: string;
  conversationId: string;
  sellerName?: string;

  // Input normalizado
  messageText: string;
  customerPhone?: string;
  customerName?: string;

  // Contexto de negócio (já seguro/filtrado no backend)
  systemPrompt: string;
  knowledgeSnippets: Array<{ title: string; content: string }>;

  // Config por empresa
  handoffEnabled: boolean;
  handoffMessage: string;
  fallbackMessage: string;
};

export type AIProviderResponse = {
  replyText: string;
  handoff: boolean;
};

export interface AIProvider {
  generateReply(input: AIProviderRequest): Promise<AIProviderResponse>;
}

