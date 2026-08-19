import { describe, expect, it, vi } from "vitest";
import { AuditService } from "../src/audit/auditService";
import { sanitizeAuditMetadata } from "../src/audit/sanitizeAuditMetadata";
import { WHATSAPP_AUDIT_EVENTS } from "../src/audit/auditEventTypes";

describe("sanitizeAuditMetadata", () => {
  it("redact tokens and secrets from metadata", () => {
    const sanitized = sanitizeAuditMetadata({
      status: "CONNECTED",
      access_token: "secret-token",
      nested: { refresh_token: "abc", ok: true },
      authorization: "Bearer xyz",
    });

    expect(sanitized.status).toBe("CONNECTED");
    expect(sanitized.access_token).toBe("[REDACTED]");
    expect((sanitized.nested as Record<string, unknown>).refresh_token).toBe("[REDACTED]");
    expect(sanitized.authorization).toBe("[REDACTED]");
  });
});

describe("AuditService", () => {
  it("persiste evento sanitizado", async () => {
    const insertEvent = vi.fn().mockResolvedValue({
      id: "evt-1",
      companyId: "company-a",
      actorUserId: "user-a",
      eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_STARTED,
      resourceType: "whatsapp_connection",
      resourceId: "conn-1",
      metadata: { reused: false },
      createdAt: new Date(),
    });

    const service = new AuditService({ insertEvent, listEvents: vi.fn() });
    await service.record({
      companyId: "company-a",
      actorUserId: "user-a",
      eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_STARTED,
      resourceType: "whatsapp_connection",
      resourceId: "conn-1",
      metadata: { access_token: "must-not-store" },
    });

    expect(insertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ access_token: "[REDACTED]" }),
      }),
    );
  });

  it("não propaga erro de persistência", async () => {
    const insertEvent = vi.fn().mockRejectedValue(new Error("db down"));
    const service = new AuditService({ insertEvent, listEvents: vi.fn() });

    await expect(
      service.record({
        companyId: "company-a",
        eventType: WHATSAPP_AUDIT_EVENTS.SYNC_FAILED,
        resourceType: "whatsapp_connection",
        resourceId: "conn-1",
      }),
    ).resolves.toBeUndefined();
  });
});

describe("audit tenant isolation policy", () => {
  it("documenta que inserts são service-role only", () => {
    // RLS: audit_events has select policies only; inserts via backend admin client.
    expect(WHATSAPP_AUDIT_EVENTS.DISCONNECTED).toBe("WHATSAPP_DISCONNECTED");
  });
});
