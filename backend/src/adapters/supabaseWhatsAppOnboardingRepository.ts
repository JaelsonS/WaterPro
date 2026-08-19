import { createSupabaseAdminClient } from "../config/supabase";
import type {
  ConnectionRecord,
  WhatsAppConnectionRepository,
  StartConnectionParams,
} from "../whatsapp/onboarding/whatsappOnboardingRepository";
import type { WhatsAppConnectionStatus } from "../whatsapp/onboarding/providerTypes";

function toConnectionRecord(row: any): ConnectionRecord {
  return {
    id: row.id,
    companyId: row.company_id,
    status: row.status,
    provider: row.provider,
    providerAccountId: row.provider_account_id ?? null,
    metadata: (row.metadata as Record<string, unknown> | null) ?? {},
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    onboardingState: row.onboarding_state,
    onboardingNonce: row.onboarding_nonce,
    onboardingExpiresAt: row.onboarding_expires_at ? new Date(row.onboarding_expires_at) : null,
    onboardingCallbackConsumed: Boolean(row.onboarding_callback_consumed),
  };
}

export function createSupabaseWhatsAppOnboardingRepository(): WhatsAppConnectionRepository {
  const supabase = createSupabaseAdminClient();

  return {
    async createConnection(params: StartConnectionParams): Promise<ConnectionRecord> {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({
          company_id: params.companyId,
          provider: params.provider,
          status: "CONNECTING",
          created_by: params.userId,
          onboarding_state: params.onboardingState,
          onboarding_nonce: params.onboardingNonce,
          onboarding_expires_at: params.onboardingExpiresAt.toISOString(),
          onboarding_callback_consumed: false,
        })
        .select("*")
        .maybeSingle();

      if (error || !data) throw error ?? new Error("Failed to create whatsapp connection");
      return toConnectionRecord(data);
    },

    async findActiveOnboardingConnection(companyId: string) {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("company_id", companyId)
        .eq("status", "CONNECTING")
        .eq("onboarding_callback_consumed", false)
        .gt("onboarding_expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? toConnectionRecord(data) : null;
    },

    async findActiveConnectedConnection(companyId: string) {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("company_id", companyId)
        .in("status", ["CONNECTED", "REAUTH_REQUIRED"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? toConnectionRecord(data) : null;
    },

    async expireStaleConnectingConnections(companyId: string) {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({ status: "ERROR", metadata: { reason: "Onboarding expired" } })
        .eq("company_id", companyId)
        .eq("status", "CONNECTING")
        .eq("onboarding_callback_consumed", false)
        .lte("onboarding_expires_at", now);
      if (error) throw error;
    },

    async getConnectionByCompanyAndOnboardingState({ companyId, onboardingState }) {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("company_id", companyId)
        .eq("onboarding_state", onboardingState)
        .maybeSingle();

      if (error) throw error;
      return data ? toConnectionRecord(data) : null;
    },

    async getConnectionByIdAndCompany({ connectionId, companyId }) {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("company_id", companyId)
        .eq("id", connectionId)
        .maybeSingle();

      if (error) throw error;
      return data ? toConnectionRecord(data) : null;
    },

    async markCallbackConsumed(connectionId: string) {
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({
          onboarding_callback_consumed: true,
          onboarding_callback_consumed_at: new Date().toISOString(),
        })
        .eq("id", connectionId);
      if (error) throw error;
    },

    async tryMarkCallbackConsumed(connectionId: string) {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .update({
          onboarding_callback_consumed: true,
          onboarding_callback_consumed_at: new Date().toISOString(),
        })
        .eq("id", connectionId)
        .eq("onboarding_callback_consumed", false)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async setConnectionStatus(params: {
      connectionId: string;
      status: WhatsAppConnectionStatus;
      providerAccountId?: string | null;
      metadata?: Record<string, unknown>;
    }) {
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({
          status: params.status,
          provider_account_id: params.providerAccountId ?? null,
          metadata: params.metadata ?? {},
        })
        .eq("id", params.connectionId);
      if (error) throw error;
    },

    async upsertWhatsappNumber(params) {
      // Upsert por (company_id, phone_number_id)
      const { data: existing } = await supabase
        .from("whatsapp_numbers")
        .select("id")
        .eq("company_id", params.companyId)
        .eq("phone_number_id", params.phoneNumberId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("whatsapp_numbers").insert({
          company_id: params.companyId,
          connection_id: params.connectionId,
          seller_id: params.sellerId ?? null,
          phone_number_id: params.phoneNumberId,
          display_name: params.displayName ?? params.phoneNumberId,
          phone_number: params.phoneNumber ?? null,
          verified: params.verified,
          status: params.status,
          metadata: params.metadata ?? {},
        });
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("whatsapp_numbers").update({
        connection_id: params.connectionId,
        seller_id: params.sellerId ?? null,
        display_name: params.displayName ?? params.phoneNumberId,
        phone_number: params.phoneNumber ?? null,
        verified: params.verified,
        status: params.status,
        metadata: params.metadata ?? {},
      }).eq("id", existing.id);

      if (error) throw error;
    },

    async listConnections(companyId: string) {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toConnectionRecord);
    },

    async listNumbers(companyId: string) {
      const { data, error } = await supabase
        .from("whatsapp_numbers")
        .select(
          "id,connection_id,company_id,seller_id,phone_number_id,display_name,phone_number,status,verified",
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((n) => ({
        id: n.id,
        connectionId: n.connection_id,
        companyId: n.company_id,
        sellerId: n.seller_id,
        phoneNumberId: n.phone_number_id,
        displayName: n.display_name,
        phoneNumber: n.phone_number,
        status: n.status,
        verified: Boolean(n.verified),
      }));
    },

    async disconnectConnection(connectionId: string) {
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({ status: "DISCONNECTED", provider_account_id: null })
        .eq("id", connectionId);
      if (error) throw error;

      // Soft-disconnect numbers under this connection.
      await supabase
        .from("whatsapp_numbers")
        .update({ status: "inactive", verified: false })
        .eq("connection_id", connectionId);
    },
  };
}

