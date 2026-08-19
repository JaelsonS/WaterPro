import type { ConnectionRecord } from "./whatsappOnboardingRepository";

/** Safe fields exposed to dashboard clients — never includes OAuth/onboarding secrets. */
export type PublicConnectionDTO = {
  id: string;
  companyId: string;
  status: string;
  provider: string;
  providerAccountId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
};

const SENSITIVE_KEYS = new Set([
  "onboardingState",
  "onboardingNonce",
  "onboardingExpiresAt",
  "onboardingCallbackConsumed",
  "onboarding_state",
  "onboarding_nonce",
  "onboarding_expires_at",
  "onboarding_callback_consumed",
]);

export function toPublicConnectionDTO(record: ConnectionRecord): PublicConnectionDTO {
  return {
    id: record.id,
    companyId: record.companyId,
    status: record.status,
    provider: record.provider,
    providerAccountId: record.providerAccountId ?? null,
    metadata: record.metadata ?? {},
    createdAt: record.createdAt?.toISOString() ?? null,
    updatedAt: record.updatedAt?.toISOString() ?? null,
  };
}

export function assertNoSensitiveConnectionFields(payload: unknown): void {
  if (!payload || typeof payload !== "object") return;
  for (const key of Object.keys(payload as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      throw new Error(`Sensitive field leaked in API response: ${key}`);
    }
  }
}
