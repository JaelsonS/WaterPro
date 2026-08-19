import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "../src/audit/sanitizeAuditMetadata";

describe("sanitizeAuditMetadata MFA fields", () => {
  it("redacts otp and totp secrets from metadata", () => {
    const out = sanitizeAuditMetadata({
      otp: "123456",
      totp_secret: "ABCDEF",
      qr_code: "<svg>",
      gate: "step_up",
    });
    expect(out.otp).toBe("[REDACTED]");
    expect(out.totp_secret).toBe("[REDACTED]");
    expect(out.qr_code).toBe("[REDACTED]");
    expect(out.gate).toBe("step_up");
  });
});
