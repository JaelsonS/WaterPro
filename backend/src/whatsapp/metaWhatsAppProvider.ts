import type { WhatsAppProvider, WhatsAppSendMessageInput, WhatsAppSendMessageResult } from "./whatsappProvider";
import { createHash } from "crypto";

export type WhatsAppMetaCredentials = {
  accessToken: string;
  phoneNumberId: string; // WhatsApp business phone number id (Meta)
};

export type ResolveWhatsAppMetaCredentials = (params: {
  companyId: string;
  whatsappNumberId: string; // UUID da tabela whatsapp_numbers
}) => Promise<WhatsAppMetaCredentials>;

export type MetaWhatsAppProviderOptions = {
  apiVersion?: string; // default to v25.0 in Meta docs era
};

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private apiVersion: string;

  constructor(
    private readonly deps: {
      resolveCredentials: ResolveWhatsAppMetaCredentials;
      fetch?: typeof fetch;
    },
    options?: MetaWhatsAppProviderOptions,
  ) {
    this.apiVersion = options?.apiVersion ?? "v25.0";
  }

  async sendMessage(input: WhatsAppSendMessageInput): Promise<WhatsAppSendMessageResult> {
    const creds = await this.deps.resolveCredentials({
      companyId: input.companyId,
      whatsappNumberId: input.whatsappNumberId,
    });

    // Cloud API: POST /{version}/{phone-number-id}/messages
    const url = `https://graph.facebook.com/${this.apiVersion}/${creds.phoneNumberId}/messages`;

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.toPhone,
      type: "text",
      text: {
        body: input.text,
      },
    };

    const fetchImpl = this.deps.fetch ?? fetch;
    const res = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creds.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Evitar logar conteúdo sensível.
      throw new Error(
        `Meta WhatsApp send failed: status=${res.status}, trace=${createHash("sha256").update(JSON.stringify(json)).digest("hex").slice(0, 8)}`,
      );
    }

    const externalMessageId = json?.messages?.[0]?.id ?? json?.messages?.[0]?.message_id;
    if (!externalMessageId) throw new Error("Meta WhatsApp response missing message id");

    return { externalMessageId };
  }
}

