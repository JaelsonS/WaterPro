export type CredentialVaultStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "REAUTH_REQUIRED";

export type StoreCredentialReferenceInput = {
  companyId: string;
  connectionId?: string | null;
  provider?: string;
  /** Opaque external secret manager key — never the raw token in mock phase. */
  secretReference: string;
  status?: CredentialVaultStatus;
  expiresAt?: Date | null;
};

export type CredentialReferenceRecord = {
  id: string;
  companyId: string;
  connectionId: string | null;
  provider: string;
  secretReference: string;
  status: CredentialVaultStatus;
  expiresAt: Date | null;
  revokedAt: Date | null;
};

export interface CredentialVaultRepository {
  upsertReference(input: StoreCredentialReferenceInput): Promise<CredentialReferenceRecord>;
  revokeByConnection(params: { companyId: string; connectionId: string }): Promise<void>;
  revokeById(params: { companyId: string; id: string }): Promise<void>;
  deleteById(params: { companyId: string; id: string }): Promise<void>;
  getActiveByConnection(params: {
    companyId: string;
    connectionId: string;
  }): Promise<CredentialReferenceRecord | null>;
  getById(params: { companyId: string; id: string }): Promise<CredentialReferenceRecord | null>;
  rotateReference(params: {
    companyId: string;
    connectionId: string;
    nextSecretReference: string;
    expiresAt?: Date | null;
  }): Promise<CredentialReferenceRecord>;
}

/**
 * Server-side credential reference manager.
 * Raw Meta tokens MUST be stored in an external secret manager in production.
 * This service tracks references only — never returns secrets to callers outside backend.
 */
export class CredentialVaultService {
  constructor(private readonly repo: CredentialVaultRepository) {}

  async store(input: StoreCredentialReferenceInput): Promise<CredentialReferenceRecord> {
    return this.repo.upsertReference({
      ...input,
      status: input.status ?? "ACTIVE",
    });
  }

  /** @deprecated use store() */
  async storeReference(input: StoreCredentialReferenceInput): Promise<CredentialReferenceRecord> {
    return this.store(input);
  }

  async get(params: { companyId: string; id: string }): Promise<CredentialReferenceRecord | null> {
    return this.repo.getById(params);
  }

  async getActiveForConnection(params: {
    companyId: string;
    connectionId: string;
  }): Promise<CredentialReferenceRecord | null> {
    return this.repo.getActiveByConnection(params);
  }

  /** @deprecated use getActiveForConnection() */
  async getActiveReference(params: {
    companyId: string;
    connectionId: string;
  }): Promise<CredentialReferenceRecord | null> {
    return this.getActiveForConnection(params);
  }

  async rotate(params: {
    companyId: string;
    connectionId: string;
    nextSecretReference: string;
    expiresAt?: Date | null;
  }): Promise<CredentialReferenceRecord> {
    return this.repo.rotateReference(params);
  }

  async revoke(params: { companyId: string; connectionId: string }): Promise<void> {
    await this.repo.revokeByConnection(params);
  }

  /** @deprecated use revoke() */
  async revokeConnectionCredentials(params: { companyId: string; connectionId: string }): Promise<void> {
    return this.revoke(params);
  }

  async delete(params: { companyId: string; id: string }): Promise<void> {
    await this.repo.deleteById(params);
  }
}
