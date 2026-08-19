import { AuditService } from "../audit/auditService";
import { createSupabaseAuditRepository } from "../adapters/supabaseAuditRepository";

let cachedAuditService: AuditService | null = null;

export function createAuditService(): AuditService {
  if (!cachedAuditService) {
    cachedAuditService = new AuditService(createSupabaseAuditRepository());
  }
  return cachedAuditService;
}
