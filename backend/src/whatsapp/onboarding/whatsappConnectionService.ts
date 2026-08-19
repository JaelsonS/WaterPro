import crypto from "crypto";
import { HttpError } from "../../errors/httpError";
import type { AuditService } from "../../audit/auditService";
import { WHATSAPP_AUDIT_EVENTS } from "../../audit/auditEventTypes";
import type {
  WhatsAppOnboardingProvider,
  MetaEmbeddedSignupCallbackInput,
  WhatsAppConnectionStatus,
} from "./providerTypes";
import type { ConnectionRecord, WhatsAppConnectionRepository } from "./whatsappOnboardingRepository";
import { assertValidTransition } from "./connectionStateMachine";

function randomState() {
  return crypto.randomBytes(16).toString("hex");
}

const syncInFlight = new Set<string>();

export type StartConnectionResult = {
  connectionId: string;
  embeddedSignupConfigId: string;
  state: string;
  expiresAt: Date | null;
  reused: boolean;
};

export type HandleCallbackResult = {
  connectionId: string;
  status: WhatsAppConnectionStatus;
  providerAccountId: string | null;
  idempotent: boolean;
};

export class WhatsAppConnectionService {
  constructor(params: {
    repo: WhatsAppConnectionRepository;
    provider: WhatsAppOnboardingProvider;
    metaEmbeddedSignupConfigId: string;
    audit?: AuditService;
  }) {
    this.repo = params.repo;
    this.provider = params.provider;
    this.metaEmbeddedSignupConfigId = params.metaEmbeddedSignupConfigId;
    this.audit = params.audit;
  }

  private repo: WhatsAppConnectionRepository;
  private provider: WhatsAppOnboardingProvider;
  private metaEmbeddedSignupConfigId: string;
  private audit?: AuditService;

  async startConnection(params: { companyId: string; userId: string }): Promise<StartConnectionResult> {
    await this.repo.expireStaleConnectingConnections(params.companyId);

    const connected = await this.repo.findActiveConnectedConnection(params.companyId);
    if (connected) {
      throw new HttpError({
        statusCode: 409,
        code: "CONFLICT",
        message: "WhatsApp already connected for this company",
      });
    }

    const activeOnboarding = await this.repo.findActiveOnboardingConnection(params.companyId);
    if (activeOnboarding?.onboardingState) {
      void this.audit?.record({
        companyId: params.companyId,
        actorUserId: params.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_STARTED,
        resourceType: "whatsapp_connection",
        resourceId: activeOnboarding.id,
        metadata: { reused: true },
      });

      return {
        connectionId: activeOnboarding.id,
        embeddedSignupConfigId: this.metaEmbeddedSignupConfigId,
        state: activeOnboarding.onboardingState,
        expiresAt: activeOnboarding.onboardingExpiresAt,
        reused: true,
      };
    }

    const onboardingState = randomState();
    const onboardingNonce = randomState();
    const expiresAt = new Date(Date.now() + 30 * 60_000);

    const connection = await this.repo.createConnection({
      companyId: params.companyId,
      userId: params.userId,
      provider: "meta",
      onboardingState,
      onboardingNonce,
      onboardingExpiresAt: expiresAt,
    });

    void this.audit?.record({
      companyId: params.companyId,
      actorUserId: params.userId,
      eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_STARTED,
      resourceType: "whatsapp_connection",
      resourceId: connection.id,
      metadata: { reused: false },
    });

    return {
      connectionId: connection.id,
      embeddedSignupConfigId: this.metaEmbeddedSignupConfigId,
      state: onboardingState,
      expiresAt: connection.onboardingExpiresAt,
      reused: false,
    };
  }

  async handleCallback(params: {
    companyId: string;
    userId?: string;
    connectionId: string;
    onboardingState: string;
    embeddedCode: string;
    wabaId?: string;
    phoneNumberId?: string;
  }): Promise<HandleCallbackResult> {
    const connection = await this.repo.getConnectionByIdAndCompany({
      connectionId: params.connectionId,
      companyId: params.companyId,
    });

    if (!connection) {
      throw new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" });
    }

    if (connection.onboardingCallbackConsumed) {
      return this.buildIdempotentCallbackResult(connection);
    }

    if (!connection.onboardingState || connection.onboardingState !== params.onboardingState) {
      throw new HttpError({ statusCode: 400, code: "BAD_REQUEST", message: "Invalid connection callback" });
    }

    if (!connection.onboardingExpiresAt || connection.onboardingExpiresAt.getTime() < Date.now()) {
      throw new HttpError({ statusCode: 400, code: "BAD_REQUEST", message: "Onboarding session expired" });
    }

    const callback: MetaEmbeddedSignupCallbackInput = {
      embeddedCode: params.embeddedCode,
      wabaId: params.wabaId,
      phoneNumberId: params.phoneNumberId,
    };

    try {
      const result = await this.provider.onboardFromEmbeddedSignup({ callback });

      assertValidTransition(connection.status, "CONNECTED");

      await this.repo.setConnectionStatus({
        connectionId: connection.id,
        status: "CONNECTED",
        providerAccountId: result.providerAccountId ?? null,
        metadata: {
          wabaId: result.providerAccountId ?? null,
        },
      });

      if (result.phoneNumbers.length === 0) {
        assertValidTransition("CONNECTED", "ERROR");
        await this.repo.setConnectionStatus({
          connectionId: connection.id,
          status: "ERROR",
          metadata: { reason: "No phone numbers discovered by provider" },
        });
      } else {
        for (const pn of result.phoneNumbers) {
          await this.repo.upsertWhatsappNumber({
            companyId: params.companyId,
            connectionId: connection.id,
            sellerId: null,
            phoneNumberId: pn.phoneNumberId,
            displayName: pn.displayName ?? null,
            phoneNumber: pn.phoneNumber ?? null,
            verified: true,
            status: "active",
            metadata: {},
          });
        }
      }

      const marked = await this.repo.tryMarkCallbackConsumed(connection.id);
      if (!marked) {
        const latest = await this.repo.getConnectionByIdAndCompany({
          connectionId: params.connectionId,
          companyId: params.companyId,
        });
        if (!latest) {
          throw new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" });
        }
        return this.buildIdempotentCallbackResult(latest);
      }

      const finalStatus: WhatsAppConnectionStatus =
        result.phoneNumbers.length === 0 ? "ERROR" : "CONNECTED";

      if (finalStatus === "CONNECTED") {
        void this.audit?.record({
          companyId: params.companyId,
          actorUserId: params.userId,
          eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_COMPLETED,
          resourceType: "whatsapp_connection",
          resourceId: connection.id,
          metadata: {
            numbersDiscovered: result.phoneNumbers.length,
            providerAccountId: result.providerAccountId ?? null,
          },
        });
      } else {
        void this.audit?.record({
          companyId: params.companyId,
          actorUserId: params.userId,
          eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_FAILED,
          resourceType: "whatsapp_connection",
          resourceId: connection.id,
          metadata: { reason: "No phone numbers discovered by provider" },
        });
      }

      return {
        connectionId: connection.id,
        status: finalStatus,
        providerAccountId: result.providerAccountId ?? null,
        idempotent: false,
      };
    } catch (err) {
      void this.audit?.record({
        companyId: params.companyId,
        actorUserId: params.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.CONNECT_FAILED,
        resourceType: "whatsapp_connection",
        resourceId: connection.id,
        metadata: {
          reason: err instanceof Error ? err.message : "callback_failed",
        },
      });
      throw err;
    }
  }

  private buildIdempotentCallbackResult(connection: ConnectionRecord): HandleCallbackResult {
    if (connection.status === "CONNECTED" || connection.status === "ERROR") {
      return {
        connectionId: connection.id,
        status: connection.status,
        providerAccountId: connection.providerAccountId ?? null,
        idempotent: true,
      };
    }

    throw new HttpError({ statusCode: 409, code: "CONFLICT", message: "Callback already in progress" });
  }

  async disconnect(params: { companyId: string; userId?: string; connectionId: string }) {
    const connection = await this.repo.getConnectionByIdAndCompany({
      connectionId: params.connectionId,
      companyId: params.companyId,
    });
    if (!connection) {
      throw new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" });
    }

    if (connection.status === "DISCONNECTED") {
      return { connectionId: connection.id, idempotent: true as const };
    }

    assertValidTransition(connection.status, "DISCONNECTED");
    await this.repo.disconnectConnection(connection.id);

    void this.audit?.record({
      companyId: params.companyId,
      actorUserId: params.userId,
      eventType: WHATSAPP_AUDIT_EVENTS.DISCONNECTED,
      resourceType: "whatsapp_connection",
      resourceId: connection.id,
      metadata: { previousStatus: connection.status },
    });

    return { connectionId: connection.id, idempotent: false as const };
  }

  async sync(params: { companyId: string; userId?: string; connectionId: string }) {
    const lockKey = `${params.companyId}:${params.connectionId}`;
    if (syncInFlight.has(lockKey)) {
      throw new HttpError({
        statusCode: 409,
        code: "CONFLICT",
        message: "Sync already in progress for this connection",
      });
    }

    syncInFlight.add(lockKey);
    void this.audit?.record({
      companyId: params.companyId,
      actorUserId: params.userId,
      eventType: WHATSAPP_AUDIT_EVENTS.SYNC_STARTED,
      resourceType: "whatsapp_connection",
      resourceId: params.connectionId,
    });

    try {
      const connection = await this.repo.getConnectionByIdAndCompany({
        connectionId: params.connectionId,
        companyId: params.companyId,
      });
      if (!connection) {
        throw new HttpError({ statusCode: 404, code: "NOT_FOUND", message: "Connection not found" });
      }

      void this.audit?.record({
        companyId: params.companyId,
        actorUserId: params.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.SYNC_COMPLETED,
        resourceType: "whatsapp_connection",
        resourceId: connection.id,
        metadata: { status: connection.status, mock: true },
      });

      return { connection };
    } catch (err) {
      void this.audit?.record({
        companyId: params.companyId,
        actorUserId: params.userId,
        eventType: WHATSAPP_AUDIT_EVENTS.SYNC_FAILED,
        resourceType: "whatsapp_connection",
        resourceId: params.connectionId,
        metadata: { reason: err instanceof Error ? err.message : "sync_failed" },
      });
      throw err;
    } finally {
      syncInFlight.delete(lockKey);
    }
  }
}
