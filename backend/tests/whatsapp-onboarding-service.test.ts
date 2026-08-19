import { describe, expect, it } from "vitest";
import { WhatsAppConnectionService } from "../src/whatsapp/onboarding/whatsappConnectionService";
import { MockWhatsAppOnboardingProvider } from "../src/whatsapp/onboarding/mockWhatsAppOnboardingProvider";
import type { ConnectionRecord, WhatsAppConnectionRepository } from "../src/whatsapp/onboarding/whatsappOnboardingRepository";
import { toPublicConnectionDTO, assertNoSensitiveConnectionFields } from "../src/whatsapp/onboarding/connectionDto";
import { canTransition } from "../src/whatsapp/onboarding/connectionStateMachine";

const companyIdA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyIdB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function makeInMemoryRepo() {
  const connections: ConnectionRecord[] = [];
  const numbers: Array<{
    companyId: string;
    connectionId: string;
    phoneNumberId: string;
    verified: boolean;
    status: "active" | "inactive";
  }> = [];

  const repo = {
    connections,
    numbers,
    async createConnection(params: any): Promise<ConnectionRecord> {
      const id = `conn-${connections.length + 1}`;
      const record: ConnectionRecord = {
        id,
        companyId: params.companyId,
        status: "CONNECTING",
        provider: "meta",
        providerAccountId: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        onboardingState: params.onboardingState,
        onboardingNonce: params.onboardingNonce,
        onboardingExpiresAt: params.onboardingExpiresAt,
        onboardingCallbackConsumed: false,
      };
      connections.push(record);
      return record;
    },
    async findActiveOnboardingConnection(companyId: string) {
      const now = Date.now();
      return (
        connections.find(
          (c) =>
            c.companyId === companyId &&
            c.status === "CONNECTING" &&
            !c.onboardingCallbackConsumed &&
            c.onboardingExpiresAt &&
            c.onboardingExpiresAt.getTime() > now,
        ) ?? null
      );
    },
    async findActiveConnectedConnection(companyId: string) {
      return (
        connections.find(
          (c) => c.companyId === companyId && (c.status === "CONNECTED" || c.status === "REAUTH_REQUIRED"),
        ) ?? null
      );
    },
    async expireStaleConnectingConnections(companyId: string) {
      const now = Date.now();
      for (const c of connections) {
        if (
          c.companyId === companyId &&
          c.status === "CONNECTING" &&
          !c.onboardingCallbackConsumed &&
          c.onboardingExpiresAt &&
          c.onboardingExpiresAt.getTime() <= now
        ) {
          c.status = "ERROR";
          c.metadata = { reason: "Onboarding expired" };
        }
      }
    },
    async getConnectionByCompanyAndOnboardingState({ companyId, onboardingState }) {
      return (
        connections.find((c) => c.companyId === companyId && c.onboardingState === onboardingState) ?? null
      );
    },
    async getConnectionByIdAndCompany({ connectionId, companyId }) {
      return connections.find((c) => c.id === connectionId && c.companyId === companyId) ?? null;
    },
    async markCallbackConsumed(connectionId: string) {
      const c = connections.find((x) => x.id === connectionId);
      if (!c) throw new Error("Connection not found");
      c.onboardingCallbackConsumed = true;
    },
    async tryMarkCallbackConsumed(connectionId: string) {
      const c = connections.find((x) => x.id === connectionId);
      if (!c || c.onboardingCallbackConsumed) return false;
      c.onboardingCallbackConsumed = true;
      return true;
    },
    async setConnectionStatus(params: any) {
      const c = connections.find((x) => x.id === params.connectionId);
      if (!c) throw new Error("Connection not found");
      c.status = params.status;
      if (params.providerAccountId !== undefined) c.providerAccountId = params.providerAccountId;
      if (params.metadata !== undefined) c.metadata = params.metadata;
      c.updatedAt = new Date();
    },
    async upsertWhatsappNumber(params: any) {
      numbers.push({
        companyId: params.companyId,
        connectionId: params.connectionId,
        phoneNumberId: params.phoneNumberId,
        verified: params.verified,
        status: params.status,
      });
    },
    async listConnections(companyId: string) {
      return connections.filter((c) => c.companyId === companyId);
    },
    async listNumbers(companyId: string) {
      return numbers
        .filter((n) => n.companyId === companyId)
        .map((n) => ({
          id: `num-${n.connectionId}-${n.phoneNumberId}`,
          connectionId: n.connectionId,
          companyId: n.companyId,
          sellerId: null,
          phoneNumberId: n.phoneNumberId,
          displayName: "Mock",
          phoneNumber: null,
          status: n.status,
          verified: n.verified,
        }));
    },
    async disconnectConnection(connectionId: string) {
      const c = connections.find((x) => x.id === connectionId);
      if (!c) throw new Error("Connection not found");
      c.status = "DISCONNECTED";
      c.providerAccountId = null;
    },
  } as unknown as WhatsAppConnectionRepository & { connections: ConnectionRecord[]; numbers: any[] };

  return repo;
}

function makeService(repo: WhatsAppConnectionRepository) {
  return new WhatsAppConnectionService({
    repo,
    provider: new MockWhatsAppOnboardingProvider(),
    metaEmbeddedSignupConfigId: "mock-config",
  });
}

describe("WhatsApp onboarding service - tenant isolation + state/nonce security", () => {
  it("Tenant A não pode processar callback com connectionId da Tenant B", async () => {
    const repo = makeInMemoryRepo();
    const serviceA = makeService(repo);
    const start = await serviceA.startConnection({ companyId: companyIdA, userId: "user-a" });
    const serviceB = makeService(repo);

    await expect(
      serviceB.handleCallback({
        companyId: companyIdB,
        connectionId: start.connectionId,
        onboardingState: start.state,
        embeddedCode: "code-1",
        phoneNumberId: "pn-1",
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("State mismatch falha", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    await expect(
      service.handleCallback({
        companyId: companyIdA,
        connectionId: start.connectionId,
        onboardingState: "wrong-state",
        embeddedCode: "code-1",
        phoneNumberId: "pn-1",
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: "BAD_REQUEST" });
  });

  it("Callback reuse retorna sucesso idempotente", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    const first = await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    const second = await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    expect(first.idempotent).toBe(false);
    expect(second.idempotent).toBe(true);
    expect(second.status).toBe("CONNECTED");
  });

  it("Onboarding state expirado falha", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    const conn = repo.connections.find((c) => c.id === start.connectionId);
    if (!conn) throw new Error("missing connection");
    conn.onboardingExpiresAt = new Date(Date.now() - 60_000);

    await expect(
      service.handleCallback({
        companyId: companyIdA,
        connectionId: start.connectionId,
        onboardingState: start.state,
        embeddedCode: "code-1",
        phoneNumberId: "pn-1",
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: "BAD_REQUEST" });
  });

  it("Cria número mock quando phoneNumberId é fornecido", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    expect(repo.numbers).toHaveLength(1);
    expect(repo.numbers[0].phoneNumberId).toBe("pn-1");
    expect(repo.numbers[0].verified).toBe(true);
  });

  it("Disconnect cross-tenant retorna NOT_FOUND (404) sem revelar tenant", async () => {
    const repo = makeInMemoryRepo();
    const serviceA = makeService(repo);
    const start = await serviceA.startConnection({ companyId: companyIdA, userId: "user-a" });
    const serviceB = makeService(repo);

    await expect(
      serviceB.disconnect({ companyId: companyIdB, connectionId: start.connectionId }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Connection not found",
    });
  });

  it("Segundo connect/start reutiliza sessão CONNECTING ativa", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const first = await service.startConnection({ companyId: companyIdA, userId: "user-a" });
    const second = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    expect(second.reused).toBe(true);
    expect(second.connectionId).toBe(first.connectionId);
    expect(second.state).toBe(first.state);
    expect(repo.connections.filter((c) => c.companyId === companyIdA)).toHaveLength(1);
  });

  it("Connect/start com WhatsApp já conectado retorna CONFLICT", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    await expect(service.startConnection({ companyId: companyIdA, userId: "user-a" })).rejects.toMatchObject({
      statusCode: 409,
      code: "CONFLICT",
    });
  });

  it("Disconnect idempotente quando já desconectado", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });

    await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    const first = await service.disconnect({ companyId: companyIdA, connectionId: start.connectionId });
    const second = await service.disconnect({ companyId: companyIdA, connectionId: start.connectionId });

    expect(first.idempotent).toBe(false);
    expect(second.idempotent).toBe(true);
  });

  it("Sync simultâneo retorna CONFLICT", async () => {
    const repo = makeInMemoryRepo();
    const service = makeService(repo);
    const start = await service.startConnection({ companyId: companyIdA, userId: "user-a" });
    await service.handleCallback({
      companyId: companyIdA,
      connectionId: start.connectionId,
      onboardingState: start.state,
      embeddedCode: "code-1",
      phoneNumberId: "pn-1",
      wabaId: "waba-1",
    });

    const first = service.sync({ companyId: companyIdA, connectionId: start.connectionId });
    await expect(service.sync({ companyId: companyIdA, connectionId: start.connectionId })).rejects.toMatchObject({
      statusCode: 409,
      code: "CONFLICT",
    });
    await first;
  });
});

describe("Connection DTO sanitization", () => {
  it("toPublicConnectionDTO não expõe campos sensíveis", () => {
    const dto = toPublicConnectionDTO({
      id: "conn-1",
      companyId: companyIdA,
      status: "CONNECTING",
      provider: "meta",
      providerAccountId: null,
      metadata: { wabaId: "waba-1" },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      onboardingState: "secret-state",
      onboardingNonce: "secret-nonce",
      onboardingExpiresAt: new Date(),
      onboardingCallbackConsumed: false,
    });

    expect(() => assertNoSensitiveConnectionFields(dto)).not.toThrow();
    expect(dto).not.toHaveProperty("onboardingState");
    expect(dto).not.toHaveProperty("onboardingNonce");
    expect(dto.metadata).toEqual({ wabaId: "waba-1" });
  });
});

describe("Connection state machine", () => {
  it("permite transições válidas", () => {
    expect(canTransition("PENDING", "CONNECTING")).toBe(true);
    expect(canTransition("CONNECTING", "CONNECTED")).toBe(true);
    expect(canTransition("CONNECTED", "REAUTH_REQUIRED")).toBe(true);
    expect(canTransition("CONNECTED", "DISCONNECTED")).toBe(true);
    expect(canTransition("ERROR", "CONNECTING")).toBe(true);
    expect(canTransition("CONNECTED", "PENDING")).toBe(false);
  });
});
