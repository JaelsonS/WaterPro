import { describe, expect, it } from "vitest";
import { toPublicConnectionDTO, assertNoSensitiveConnectionFields } from "../src/whatsapp/onboarding/connectionDto";

describe("connectionDto", () => {
  it("sanitizes internal onboarding fields from API payload", () => {
    const dto = toPublicConnectionDTO({
      id: "11111111-1111-1111-1111-111111111111",
      companyId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      status: "CONNECTED",
      provider: "meta",
      providerAccountId: "waba-123",
      metadata: { wabaId: "waba-123" },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      onboardingState: "must-not-leak",
      onboardingNonce: "must-not-leak",
      onboardingExpiresAt: new Date(),
      onboardingCallbackConsumed: true,
    });

    assertNoSensitiveConnectionFields(dto);
    expect(Object.keys(dto).sort()).toEqual(
      ["companyId", "createdAt", "id", "metadata", "provider", "providerAccountId", "status", "updatedAt"].sort(),
    );
  });
});
