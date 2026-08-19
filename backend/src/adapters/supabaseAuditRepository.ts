import { createSupabaseAdminClient } from "../config/supabase";
import type { AuditEventInput, AuditResourceType } from "../audit/auditEventTypes";
import type { AuditEventRecord, AuditRepository } from "../audit/auditService";

function mapRow(row: Record<string, unknown>): AuditEventRecord {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : null,
    eventType: String(row.event_type),
    resourceType: String(row.resource_type) as AuditResourceType,
    resourceId: row.resource_id ? String(row.resource_id) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(row.created_at)),
  };
}

export function createSupabaseAuditRepository(): AuditRepository {
  const supabase = createSupabaseAdminClient();

  return {
    async insertEvent(input: AuditEventInput & { metadata: Record<string, unknown> }) {
      const { data, error } = await supabase
        .from("audit_events")
        .insert({
          company_id: input.companyId,
          actor_user_id: input.actorUserId ?? null,
          event_type: input.eventType,
          resource_type: input.resourceType,
          resource_id: input.resourceId ?? null,
          metadata: input.metadata,
        })
        .select("*")
        .single();

      if (error || !data) throw error ?? new Error("Failed to insert audit event");
      return mapRow(data);
    },

    async listEvents(params: { companyId: string; limit?: number }) {
      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("company_id", params.companyId)
        .order("created_at", { ascending: false })
        .limit(params.limit ?? 50);

      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  };
}
