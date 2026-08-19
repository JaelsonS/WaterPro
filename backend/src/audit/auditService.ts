import { logger } from "../utils/logger";
import { sanitizeAuditMetadata } from "./sanitizeAuditMetadata";
import type { AuditEventInput } from "./auditEventTypes";

export type AuditEventRecord = AuditEventInput & {
  id: string;
  createdAt: Date;
};

export interface AuditRepository {
  insertEvent(input: AuditEventInput & { metadata: Record<string, unknown> }): Promise<AuditEventRecord>;
  listEvents(params: { companyId: string; limit?: number }): Promise<AuditEventRecord[]>;
}

export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  /**
   * Best-effort audit write. Failures are logged but do not throw,
   * so WhatsApp operations are not rolled back due to audit issues.
   */
  async record(input: AuditEventInput): Promise<void> {
    try {
      if (!input.companyId) {
        logger.warn({ eventType: input.eventType }, "audit skipped: missing companyId");
        return;
      }

      const metadata = sanitizeAuditMetadata(input.metadata);
      await this.repo.insertEvent({
        ...input,
        metadata,
      });
    } catch (err) {
      logger.error(
        {
          err,
          eventType: input.eventType,
          companyId: input.companyId,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
        },
        "audit event persistence failed",
      );
    }
  }

  async listForCompany(params: { companyId: string; limit?: number }): Promise<AuditEventRecord[]> {
    return this.repo.listEvents(params);
  }
}
