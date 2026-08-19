import OpenAI from "openai";
import type { AIProvider, AIProviderRequest, AIProviderResponse } from "./aiProvider";

export type OpenAIProviderOptions = {
  apiKey: string;
  model?: string;
  temperature?: number;
};

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly temperature: number | undefined;

  constructor(options: OpenAIProviderOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model ?? "gpt-4.1-mini";
    this.temperature = options.temperature;
  }

  async generateReply(input: AIProviderRequest): Promise<AIProviderResponse> {
    const knowledge = input.knowledgeSnippets
      .map((k, idx) => `Knowledge ${idx + 1}: ${k.title}\n${k.content}`)
      .join("\n\n");

    // Prompt injection mitigation:
    // - systemPrompt fica em "system" (não é alterado pelo cliente)
    // - knowledge entra como parte do contexto do system
    // - messageText fica como "user" (dados do cliente, não instrução confiável)
    const system = [
      input.systemPrompt,
      knowledge ? `\n\n=== Business Knowledge ===\n${knowledge}` : "",
      `\n\n=== Rules ===\n- Do not invent prices, availability, or promises.\n- If you don't know, ask to speak with a human when appropriate.`,
    ].join("");

    const resp = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: input.messageText },
      ],
    });

    const text = resp.choices?.[0]?.message?.content?.trim() ?? input.fallbackMessage;

    // Handoff decision:
    // No openai provider real, a validação final deve ser feita com base nas regras/estrutura.
    // Nesta fase, usamos heurística simples baseada no conteúdo final.
    const wantsHuman =
      input.handoffEnabled &&
      /pessoa|humano|representante|falar com/i.test(text);

    return {
      replyText: text,
      handoff: wantsHuman,
    };
  }
}

