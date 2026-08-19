import type { AIProvider, AIProviderRequest, AIProviderResponse } from "./aiProvider";

export class MockAIProvider implements AIProvider {
  async generateReply(input: AIProviderRequest): Promise<AIProviderResponse> {
    const text = input.messageText.toLowerCase();
    const wantsHuman =
      text.includes("pessoa") ||
      text.includes("humano") ||
      text.includes("falar") ||
      text.includes("representante") ||
      text.includes("consultor");

    if (input.handoffEnabled && wantsHuman) {
      return { replyText: input.handoffMessage || "Vou encaminhar para um especialista.", handoff: true };
    }

    // Resposta determinística e "segura" (sem preços/prazos/disponibilidade).
    const knowledgeHint =
      input.knowledgeSnippets[0]?.title ? `\n\nReferência: ${input.knowledgeSnippets[0].title}` : "";

    return {
      replyText:
        (input.fallbackMessage || "Obrigado! Posso ajudar com informações sobre os nossos serviços.") +
        knowledgeHint +
        "\n\nPara eu orientar melhor, pode dizer qual é a sua necessidade (residencial ou empresarial)?",
      handoff: false,
    };
  }
}

