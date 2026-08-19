import { describe, expect, it } from "vitest";
import {
  isLocalStepUpFresh,
  markStepUpVerifiedLocally,
  clearLocalStepUp,
  resolveClientSecurityLevel,
} from "@/lib/auth/securityLevel";

describe("securityLevel", () => {
  it("requires step-up when admin has MFA but session is aal1", () => {
    const level = resolveClientSecurityLevel({
      product: "Fluxora",
      mfaRequired: true,
      mfaEnrolled: true,
      aal: "aal1",
      securityLevel: "STEP_UP_REQUIRED",
      enrollmentRequired: false,
      stepUpRequired: true,
    });
    expect(level).toBe("STEP_UP_REQUIRED");
  });

  it("treats local step-up marker as verified within TTL", () => {
    clearLocalStepUp();
    markStepUpVerifiedLocally();
    expect(isLocalStepUpFresh()).toBe(true);
    const level = resolveClientSecurityLevel({
      product: "Fluxora",
      mfaRequired: true,
      mfaEnrolled: true,
      aal: "aal1",
      securityLevel: "STEP_UP_REQUIRED",
      enrollmentRequired: false,
      stepUpRequired: true,
    });
    expect(level).toBe("MFA_VERIFIED");
    clearLocalStepUp();
  });
});
