import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isAdminMfaRequired, isSensitiveAdminRole } from "../src/auth/adminMfaPolicy";

describe("adminMfaPolicy flags", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("detects sensitive admin roles", () => {
    expect(isSensitiveAdminRole("company_admin")).toBe(true);
    expect(isSensitiveAdminRole("platform_admin")).toBe(true);
    expect(isSensitiveAdminRole("seller")).toBe(false);
  });

  it("can disable MFA via E2E_SKIP_MFA", () => {
    process.env.E2E_SKIP_MFA = "1";
    expect(isAdminMfaRequired()).toBe(false);
  });

  it("can disable MFA via ADMIN_MFA_REQUIRED=false", () => {
    process.env.ADMIN_MFA_REQUIRED = "false";
    expect(isAdminMfaRequired()).toBe(false);
  });
});
