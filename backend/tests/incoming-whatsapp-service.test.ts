import { describe, expect, it } from "vitest";
import {
  createIncomingWhatsAppService,
  type IncomingWhatsAppDeps,
} from "../src/services/incoming/incomingWhatsAppService";

const companyIdA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyIdB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const whatsappNumberId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const customerPhone = "351900000000";

describe("FASE 2 - Incoming WhatsApp service (conversations/messages/leads)", () => {
  it("Idempotência: mesmo externalEventId não cria duplicados", async () => {
    const processedEvents = new Set<string>();
    const conversations: Array<{ id: string; companyId: string; whatsappNumberId: string; customerPhone: string }> = [];
    const messages: Array<{ id: string; companyId: string; conversationId: string; messageText: string }> = [];
    const leadsCreated: string[] = [];

    const deps: IncomingWhatsAppDeps = {
      companyId: companyIdA,
      async checkAndMarkWebhookEventProcessed({ provider, externalEventId }) {
        const key = `${companyIdA}|${provider}|${externalEventId}`;
        if (processedEvents.has(key)) return true;
        processedEvents.add(key);
        return false;
      },
      async getWhatsappNumberById() {
        return { sellerId: "seller-a-1" };
      },
      async findConversation() {
        return conversations.find((c) => c.whatsappNumberId === whatsappNumberId && c.customerPhone === customerPhone)
          ? { id: conversations[0].id }
          : null;
      },
      async createConversation() {
        const id = `conv-${conversations.length + 1}`;
        const conv = { id, companyId: companyIdA, whatsappNumberId, customerPhone };
        conversations.push(conv);
        leadsCreated.push(id);
        return { id, createdLead: true };
      },
      async createMessage({ conversationId, messageText }) {
        const id = `msg-${messages.length + 1}`;
        messages.push({ id, companyId: companyIdA, conversationId, messageText });
        return { id };
      },
    };

    const service = createIncomingWhatsAppService(deps);

    const payload = {
      provider: "meta" as const,
      externalEventId: "evt-1",
      eventType: "messages",
      payloadHash: "hash-evt-1",
      whatsappNumberId,
      customerPhone,
      customerName: "Ana",
      messageText: "Olá",
    };

    const r1 = await service.processIncoming(payload);
    const r2 = await service.processIncoming(payload);

    expect(r1.duplicated).toBe(false);
    expect(r2.duplicated).toBe(true);
    expect(conversations).toHaveLength(1);
    expect(messages).toHaveLength(1);
    expect(leadsCreated).toHaveLength(1);
  });

  it("Tenant isolation: eventos e conversas não cruzam entre company_id", async () => {
    const store = {
      processedEvents: new Set<string>(),
      conversations: [] as Array<{ id: string; companyId: string; whatsappNumberId: string; customerPhone: string }>,
    };

    function makeDeps(companyId: string): IncomingWhatsAppDeps {
      return {
        companyId,
        async checkAndMarkWebhookEventProcessed({ provider, externalEventId }) {
          const key = `${companyId}|${provider}|${externalEventId}`;
          if (store.processedEvents.has(key)) return true;
          store.processedEvents.add(key);
          return false;
        },
        async getWhatsappNumberById() {
          return { sellerId: `seller-${companyId}` };
        },
        async findConversation({ whatsappNumberId, customerPhone }) {
          const c = store.conversations.find(
            (x) => x.companyId === companyId && x.whatsappNumberId === whatsappNumberId && x.customerPhone === customerPhone,
          );
          return c ? { id: c.id } : null;
        },
        async createConversation({ whatsappNumberId, sellerId, customerPhone }) {
          const id = `conv-${companyId}-${store.conversations.length + 1}`;
          store.conversations.push({ id, companyId, whatsappNumberId, customerPhone });
          return { id, createdLead: true };
        },
        async createMessage() {
          return { id: `msg-${companyId}` };
        },
      };
    }

    const serviceA = createIncomingWhatsAppService(makeDeps(companyIdA));
    const serviceB = createIncomingWhatsAppService(makeDeps(companyIdB));

    const payload = {
      provider: "meta" as const,
      externalEventId: "evt-shared",
      eventType: "messages",
      payloadHash: "hash-evt-shared",
      whatsappNumberId,
      customerPhone,
      customerName: "Ana",
      messageText: "Olá",
    };

    const rA = await serviceA.processIncoming(payload);
    const rB = await serviceB.processIncoming(payload);

    expect(rA.duplicated).toBe(false);
    expect(rB.duplicated).toBe(false);
    expect(store.conversations.filter((c) => c.companyId === companyIdA)).toHaveLength(1);
    expect(store.conversations.filter((c) => c.companyId === companyIdB)).toHaveLength(1);
  });
});

