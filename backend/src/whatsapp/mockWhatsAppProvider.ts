import type { WhatsAppProvider, WhatsAppSendMessageInput, WhatsAppSendMessageResult } from "./whatsappProvider";

export class MockWhatsAppProvider implements WhatsAppProvider {
  private counter = 0;

  async sendMessage(input: WhatsAppSendMessageInput): Promise<WhatsAppSendMessageResult> {
    this.counter += 1;
    // Não dispara mensagens reais em nenhum ambiente.
    return { externalMessageId: `mock-wa-msg-${this.counter}` };
  }
}

