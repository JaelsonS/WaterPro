import type {
  WhatsAppOnboardingProvider,
  MetaEmbeddedSignupCallbackInput,
  WhatsAppNumberOnboardResult,
} from "./providerTypes";

export class MockWhatsAppOnboardingProvider implements WhatsAppOnboardingProvider {
  async onboardFromEmbeddedSignup(params: {
    callback: MetaEmbeddedSignupCallbackInput;
  }): Promise<{
    providerAccountId?: string | null;
    phoneNumbers: WhatsAppNumberOnboardResult[];
  }> {
    const phoneNumberId = params.callback.phoneNumberId;
    const wabaId = params.callback.wabaId;

    if (!phoneNumberId) {
      return {
        providerAccountId: wabaId ?? null,
        phoneNumbers: [],
      };
    }

    // Mock: não envia mensagens reais; apenas simula descobertas.
    return {
      providerAccountId: wabaId ?? null,
      phoneNumbers: [
        {
          phoneNumberId,
          displayName: "Mock WhatsApp Number",
          phoneNumber: "351900000000",
        },
      ],
    };
  }
}

