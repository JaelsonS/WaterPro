import { createSupabaseAdminClient } from "../config/supabase";
import type { IncomingWhatsAppDeps } from "../services/incoming/incomingWhatsAppService";

export function createSupabaseIncomingWhatsAppDeps(companyId: string): IncomingWhatsAppDeps {
  // Service role só no backend
  const supabase = createSupabaseAdminClient();

  return {
    companyId,
    async checkAndMarkWebhookEventProcessed({ provider, externalEventId, eventType, payloadHash }) {
      const { data: existing } = await supabase
        .from("webhook_events")
        .select("id,processed")
        .eq("company_id", companyId)
        .eq("provider", provider)
        .eq("external_event_id", externalEventId)
        .maybeSingle();

      if (existing) {
        return true;
      }

      await supabase.from("webhook_events").insert({
        company_id: companyId,
        provider,
        external_event_id: externalEventId,
        event_type: eventType,
        payload_hash: payloadHash,
        processed: false,
      });

      return false;
    },

    async getWhatsappNumberById({ whatsappNumberId }) {
      const { data, error } = await supabase
        .from("whatsapp_numbers")
        .select("seller_id")
        .eq("company_id", companyId)
        .eq("id", whatsappNumberId)
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) {
        // O serviço trata via exceção não tratada -> fase posterior com melhor error map.
        throw error ?? new Error("WhatsApp number not found");
      }

      return { sellerId: data.seller_id };
    },

    async findConversation({ whatsappNumberId, customerPhone }) {
      const { data } = await supabase
        .from("conversations")
        .select("id")
        .eq("company_id", companyId)
        .eq("whatsapp_number_id", whatsappNumberId)
        .eq("customer_phone", customerPhone)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return null;
      return { id: data[0].id };
    },

    async createConversation({ whatsappNumberId, sellerId, customerPhone, customerName }) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          company_id: companyId,
          seller_id: sellerId,
          whatsapp_number_id: whatsappNumberId,
          customer_phone: customerPhone,
          customer_name: customerName ?? null,
          channel: "whatsapp",
          status: "OPEN",
          ai_enabled: true,
        })
        .select("id")
        .maybeSingle();

      if (error || !data) throw error ?? new Error("Failed to create conversation");

      return { id: data.id, createdLead: true };
    },

    async createMessage({ conversationId, externalMessageId, messageText }) {
      const { data: msg, error } = await supabase
        .from("messages")
        .insert({
          company_id: companyId,
          conversation_id: conversationId,
          direction: "inbound",
          sender_type: "customer",
          content: messageText,
          external_message_id: externalMessageId ?? null,
          status: "received",
          metadata: {},
        })
        .select("id")
        .maybeSingle();

      if (error || !msg) throw error ?? new Error("Failed to create message");

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("company_id", companyId)
        .eq("id", conversationId);

      return { id: msg.id };
    },
  };
}

