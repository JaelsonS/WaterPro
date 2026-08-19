import { describe, expect, it } from "vitest";
import {
  assertNoSensitiveConnectionFields,
  toPublicConnectionDTO,
} from "../src/whatsapp/onboarding/connectionDto";

const SENSITIVE_FIELDS = [
  "onboardingState",
  "onboardingNonce",
  "onboardingExpiresAt",
  "onboardingCallbackConsumed",
  "access_token",
  "nonce",
  "token",
];

describe("WhatsApp API response sanitization", () => {
  it("public connection DTO never exposes sensitive fields", () => {
    const dto = toPublicConnectionDTO({
      id: "11111111-1111-1111-1111-111111111111",
      companyId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      status: "CONNECTED",
      provider: "meta",
      providerAccountId: "waba-1",
      metadata: { wabaId: "waba-1" },
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingState: "secret",
      onboardingNonce: "secret",
      onboardingExpiresAt: new Date(),
      onboardingCallbackConsumed: true,
    });

    for (const field of SENSITIVE_FIELDS) {
      expect(dto).not.toHaveProperty(field);
    }
    assertNoSensitiveConnectionFields(dto);
  });

  it("simula payload JSON de GET /connections", () => {
    const responseBody = {
      connections: [
        toPublicConnectionDTO({
          id: "11111111-1111-1111-1111-111111111111",
          companyId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          status: "CONNECTING",
          provider: "meta",
          onboardingState: "must-not-leak",
          onboardingNonce: "must-not-leak",
          onboardingExpiresAt: new Date(),
          onboardingCallbackConsumed: false,
        }),
      ],
    };

    for (const conn of responseBody.connections) {
      expect(conn).not.toHaveProperty("nonce");
      expect(conn).not.toHaveProperty("onboardingState");
      assertNoSensitiveConnectionFields(conn);
    }
  });
});
