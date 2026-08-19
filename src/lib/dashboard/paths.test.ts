import { describe, expect, it } from "vitest";
import { isDashboardPath } from "@/lib/dashboard/paths";

describe("isDashboardPath", () => {
  it("identifica rotas do dashboard", () => {
    expect(isDashboardPath("/dashboard")).toBe(true);
    expect(isDashboardPath("/dashboard/whatsapp")).toBe(true);
    expect(isDashboardPath("/")).toBe(false);
    expect(isDashboardPath("/para-sua-casa")).toBe(false);
  });
});
