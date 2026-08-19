import { createSupabaseAdminClient } from "../config/supabase";
import type {
  CredentialReferenceRecord,
  CredentialVaultRepository,
  CredentialVaultStatus,
  StoreCredentialReferenceInput,
} from "../whatsapp/credentials/credentialVaultService";
import { CredentialVaultService } from "../whatsapp/credentials/credentialVaultService";

function mapRow(row: Record<string, unknown>): CredentialReferenceRecord {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    connectionId: row.connection_id ? String(row.connection_id) : null,
    provider: String(row.provider),
    secretReference: String(row.secret_reference),
    status: String(row.status) as CredentialVaultStatus,
    expiresAt: row.expires_at ? new Date(String(row.expires_at)) : null,
    revokedAt: row.revoked_at ? new Date(String(row.revoked_at)) : null,
  };
}

export function createSupabaseCredentialVaultRepository(): CredentialVaultRepository {
  const supabase = createSupabaseAdminClient();

  return {
    async upsertReference(input: StoreCredentialReferenceInput) {
      const { data, error } = await supabase
        .from("whatsapp_credential_vault")
        .upsert(
          {
            company_id: input.companyId,
            connection_id: input.connectionId ?? null,
            provider: input.provider ?? "meta",
            secret_reference: input.secretReference,
            status: input.status ?? "ACTIVE",
            expires_at: input.expiresAt?.toISOString() ?? null,
          },
          { onConflict: "secret_reference" },
        )
        .select("*")
        .single();

      if (error || !data) throw error ?? new Error("Failed to store credential reference");
      return mapRow(data);
    },

    async revokeByConnection(params: { companyId: string; connectionId: string }) {
      const { error } = await supabase
        .from("whatsapp_credential_vault")
        .update({
          status: "REVOKED",
          revoked_at: new Date().toISOString(),
        })
        .eq("company_id", params.companyId)
        .eq("connection_id", params.connectionId)
        .neq("status", "REVOKED");

      if (error) throw error;
    },

    async revokeById(params: { companyId: string; id: string }) {
      const { error } = await supabase
        .from("whatsapp_credential_vault")
        .update({
          status: "REVOKED",
          revoked_at: new Date().toISOString(),
        })
        .eq("company_id", params.companyId)
        .eq("id", params.id);

      if (error) throw error;
    },

    async deleteById(params: { companyId: string; id: string }) {
      const { error } = await supabase
        .from("whatsapp_credential_vault")
        .delete()
        .eq("company_id", params.companyId)
        .eq("id", params.id);

      if (error) throw error;
    },

    async getActiveByConnection(params: { companyId: string; connectionId: string }) {
      const { data, error } = await supabase
        .from("whatsapp_credential_vault")
        .select("*")
        .eq("company_id", params.companyId)
        .eq("connection_id", params.connectionId)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRow(data) : null;
    },

    async getById(params: { companyId: string; id: string }) {
      const { data, error } = await supabase
        .from("whatsapp_credential_vault")
        .select("*")
        .eq("company_id", params.companyId)
        .eq("id", params.id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRow(data) : null;
    },

    async rotateReference(params: {
      companyId: string;
      connectionId: string;
      nextSecretReference: string;
      expiresAt?: Date | null;
    }) {
      await this.revokeByConnection({ companyId: params.companyId, connectionId: params.connectionId });
      return this.upsertReference({
        companyId: params.companyId,
        connectionId: params.connectionId,
        secretReference: params.nextSecretReference,
        status: "ACTIVE",
        expiresAt: params.expiresAt ?? null,
      });
    },
  };
}

export function createCredentialVaultService() {
  return new CredentialVaultService(createSupabaseCredentialVaultRepository());
}
