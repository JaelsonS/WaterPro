export interface CompanyBySiteKeyResolver {
  resolveCompanyIdBySiteKey(siteKey: string): Promise<string | null>;
}

export type PublicAISettings = {
  systemPrompt: string;
  welcomeMessage: string | null;
  handoffEnabled: boolean;
  handoffMessage: string | null;
};

export type KnowledgeSnippet = { title: string; content: string };

export interface AISettingsReadRepository {
  getAISettingsByCompanyId(companyId: string): Promise<PublicAISettings | null>;
}

export interface KnowledgeReadRepository {
  getActiveKnowledgeByCompanyId(companyId: string): Promise<KnowledgeSnippet[]>;
}

export interface AIProviderAdapter {
  generateReply(params: {
    companyId: string;
    conversationId: string;
    sellerName?: string;
    messageText: string;
    systemPrompt: string;
    knowledgeSnippets: KnowledgeSnippet[];
    handoffEnabled: boolean;
    handoffMessage: string;
    fallbackMessage: string;
  }): Promise<{ replyText: string; handoff: boolean }>;
}

