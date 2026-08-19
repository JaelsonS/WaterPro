export type WhatsAppSendMessageInput = {
  companyId: string;
  whatsappNumberId: string;
  toPhone: string;
  text: string;
};

export type WhatsAppSendMessageResult = {
  externalMessageId: string;
};

export interface WhatsAppProvider {
  sendMessage(input: WhatsAppSendMessageInput): Promise<WhatsAppSendMessageResult>;
}

