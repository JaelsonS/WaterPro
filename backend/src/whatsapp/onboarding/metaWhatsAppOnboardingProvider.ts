import type { WhatsAppOnboardingProvider, MetaEmbeddedSignupCallbackInput, WhatsAppNumberOnboardResult } from "./providerTypes";
import { getEnv, requireWhatsAppWebhookEnv } from "../../config/env";

type TokenExchangeResponse = {
  access_token: string;
};

function generateSixDigitPin() {
  // PIN exigido pelo endpoint de registration.
  // Não é token Meta; é usado apenas na etapa de registration.
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class MetaWhatsAppOnboardingProvider implements WhatsAppOnboardingProvider {
  async onboardFromEmbeddedSignup(params: { callback: MetaEmbeddedSignupCallbackInput }): Promise<{
    providerAccountId?: string | null;
    phoneNumbers: WhatsAppNumberOnboardResult[];
  }> {
    const env = getEnv();
    const { WHATSAPP_WEBHOOK_CALLBACK_URL } = env;
    const webhookEnv = requireWhatsAppWebhookEnv();

    const apiVersion = env.META_GRAPH_API_VERSION ?? "v25.0";
    const appId = env.META_APP_ID;
    const appSecret = env.META_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required when WHATSAPP_PROVIDER=meta");
    }

    const embeddedCode = params.callback.embeddedCode;
    if (!embeddedCode) throw new Error("Embedded signup code missing");

    const tokenResp = await fetch(`https://graph.facebook.com/${apiVersion}/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code: embeddedCode,
    }).toString()}`);

    const tokenJson = (await tokenResp.json()) as TokenExchangeResponse & { error?: any };
    if (!tokenResp.ok || !tokenJson.access_token) {
      throw new Error("Failed to exchange embedded signup code for business token");
    }
    const businessToken = tokenJson.access_token;

    // WABA ID: deve vir do callback quando possível
    const wabaId = params.callback.wabaId ?? null;
    let phoneNumberId = params.callback.phoneNumberId ?? null;

    // Se phone_number_id não veio, tentar descobrir via WABA (fallback).
    if (!phoneNumberId) {
      if (!wabaId) {
        return { providerAccountId: null, phoneNumbers: [] };
      }

      const phoneListResp = await fetch(
        `https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers?fields=phone_number_id,display_phone_number,verified_name`,
        { headers: { Authorization: `Bearer ${businessToken}` } },
      );
      const phoneListJson: any = await phoneListResp.json();
      if (!phoneListResp.ok || !Array.isArray(phoneListJson?.data)) {
        throw new Error("Failed to discover phone numbers for WABA");
      }

      const first = phoneListJson.data?.[0];
      if (!first?.phone_number_id) {
        return { providerAccountId: wabaId, phoneNumbers: [] };
      }
      phoneNumberId = first.phone_number_id;
    }

    if (!phoneNumberId || !wabaId) {
      // Sem WABA não conseguimos subscribed_apps.
      return { providerAccountId: wabaId, phoneNumbers: [] };
    }

    // Step: register phone number for Cloud API use
    const pin = generateSixDigitPin();
    const registerResp = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${businessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          pin,
        }),
      },
    );

    if (!registerResp.ok) {
      throw new Error("Failed to register phone number for Cloud API");
    }

    // Step: subscribe your app to webhooks on the customer's WABA
    const callbackUrl = WHATSAPP_WEBHOOK_CALLBACK_URL ?? "";
    const subscribeBody: Record<string, unknown> = {};
    if (callbackUrl) subscribeBody.override_callback_uri = callbackUrl;
    if (webhookEnv.WHATSAPP_VERIFY_TOKEN) subscribeBody.verify_token = webhookEnv.WHATSAPP_VERIFY_TOKEN;

    const subscribeResp = await fetch(
      `https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${businessToken}`,
        },
        body: JSON.stringify(subscribeBody),
      },
    );

    if (!subscribeResp.ok) {
      throw new Error("Failed to subscribe app to customer WABA webhooks");
    }

    const displayName = null;
    const phoneNumber = null;

    return {
      providerAccountId: wabaId,
      phoneNumbers: [
        {
          phoneNumberId,
          displayName,
          phoneNumber,
        },
      ],
    };
  }
}

