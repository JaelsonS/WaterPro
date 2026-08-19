export type WhatsAppConnectionStatus =
  | "PENDING"
  | "CONNECTING"
  | "CONNECTED"
  | "REAUTH_REQUIRED"
  | "DISCONNECTED"
  | "ERROR";

export type WhatsAppNumberOnboardResult = {
  phoneNumberId: string; // Meta business phone number id
  displayName?: string | null;
  phoneNumber?: string | null;
};

export type MetaEmbeddedSignupCallbackInput = {
  embeddedCode: string; // exchangeable code returned by FB.login callback
  wabaId?: string;
  phoneNumberId?: string;
};

export interface WhatsAppOnboardingProvider {
  // Execute the provider-specific onboarding finalization.
  onboardFromEmbeddedSignup(params: {
    callback: MetaEmbeddedSignupCallbackInput;
  }): Promise<{
    providerAccountId?: string | null; // e.g. waba_id
    phoneNumbers: WhatsAppNumberOnboardResult[];
  }>;
}

