export type IncomingWhatsAppPayload = {
  provider: "meta";
  externalEventId: string; // used for idempotency (webhook_events.external_event_id)
  eventType: string; // webhook_events.event_type
  payloadHash: string; // webhook_events.payload_hash
  externalMessageId?: string; // stored in messages.external_message_id
  whatsappNumberId: string;
  customerPhone: string;
  customerName?: string;
  messageText: string;
};

export type IncomingWhatsAppResult = {
  duplicated: boolean;
  conversationId: string;
  messageCreatedId: string;
};

export type IncomingWhatsAppDeps = {
  companyId: string;

  // Idempotency gate (true = already processed)
  checkAndMarkWebhookEventProcessed(params: {
    provider: "meta";
    externalEventId: string;
    eventType: string;
    payloadHash: string;
  }): Promise<boolean>;

  getWhatsappNumberById(params: {
    whatsappNumberId: string;
  }): Promise<{
    sellerId: string;
  }>;

  findConversation(params: {
    whatsappNumberId: string;
    customerPhone: string;
  }): Promise<{ id: string } | null>;

  createConversation(params: {
    whatsappNumberId: string;
    sellerId: string;
    customerPhone: string;
    customerName?: string;
  }): Promise<{ id: string; createdLead: boolean }>;

  createMessage(params: {
    conversationId: string;
    externalMessageId?: string;
    messageText: string;
  }): Promise<{ id: string }>;
};

export function createIncomingWhatsAppService(deps: IncomingWhatsAppDeps) {
  return {
    async processIncoming(payload: IncomingWhatsAppPayload): Promise<IncomingWhatsAppResult> {
      const duplicated = await deps.checkAndMarkWebhookEventProcessed({
        provider: payload.provider,
        externalEventId: payload.externalEventId,
        eventType: payload.eventType,
        payloadHash: payload.payloadHash,
      });

      if (duplicated) {
        // We return dummy IDs because the contract is "no duplicates".
        // The caller (webhook handler) can re-fetch if needed in later phases.
        return {
          duplicated: true,
          conversationId: "",
          messageCreatedId: "",
        };
      }

      const wa = await deps.getWhatsappNumberById({ whatsappNumberId: payload.whatsappNumberId });

      const existingConversation = await deps.findConversation({
        whatsappNumberId: payload.whatsappNumberId,
        customerPhone: payload.customerPhone,
      });

      const conversation = existingConversation
        ? { id: existingConversation.id, createdLead: false }
        : await deps.createConversation({
            whatsappNumberId: payload.whatsappNumberId,
            sellerId: wa.sellerId,
            customerPhone: payload.customerPhone,
            customerName: payload.customerName,
          });

      const message = await deps.createMessage({
        conversationId: conversation.id,
        externalMessageId: payload.externalMessageId,
        messageText: payload.messageText,
      });

      return {
        duplicated: false,
        conversationId: conversation.id,
        messageCreatedId: message.id,
      };
    },
  };
}

