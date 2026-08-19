import { describe, expect, it } from "vitest";
import { decodeJwtPayload, getJwtAal } from "../src/utils/jwtClaims";

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

describe("jwtClaims", () => {
  it("decodes aal from jwt payload", () => {
    const token = makeJwt({ sub: "user-1", aal: "aal2" });
    expect(decodeJwtPayload(token)?.aal).toBe("aal2");
    expect(getJwtAal(token)).toBe("aal2");
  });

  it("defaults to aal1 when claim missing", () => {
    const token = makeJwt({ sub: "user-1" });
    expect(getJwtAal(token)).toBe("aal1");
  });

  it("returns null for malformed token", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });
});
