import { describe, expect, it } from "vitest";
import { CredentialVaultService } from "../src/whatsapp/credentials/credentialVaultService";
import type { CredentialVaultRepository, CredentialReferenceRecord } from "../src/whatsapp/credentials/credentialVaultService";

class InMemoryVaultRepo implements CredentialVaultRepository {
  rows: CredentialReferenceRecord[] = [];

  async upsertReference(input) {
    const row: CredentialReferenceRecord = {
      id: `row-${this.rows.length + 1}`,
      companyId: input.companyId,
      connectionId: input.connectionId ?? null,
      provider: input.provider ?? "meta",
      secretReference: input.secretReference,
      status: input.status ?? "ACTIVE",
      expiresAt: input.expiresAt ?? null,
      revokedAt: null,
    };
    this.rows.push(row);
    return row;
  }

  async revokeByConnection(params) {
    for (const row of this.rows) {
      if (row.companyId === params.companyId && row.connectionId === params.connectionId) {
        row.status = "REVOKED";
        row.revokedAt = new Date();
      }
    }
  }

  async revokeById(params) {
    const row = this.rows.find((r) => r.id === params.id && r.companyId === params.companyId);
    if (row) {
      row.status = "REVOKED";
      row.revokedAt = new Date();
    }
  }

  async deleteById(params) {
    this.rows = this.rows.filter((r) => !(r.id === params.id && r.companyId === params.companyId));
  }

  async getActiveByConnection(params) {
    return (
      [...this.rows]
        .reverse()
        .find(
          (r) =>
            r.companyId === params.companyId &&
            r.connectionId === params.connectionId &&
            r.status === "ACTIVE",
        ) ?? null
    );
  }

  async getById(params) {
    return this.rows.find((r) => r.id === params.id && r.companyId === params.companyId) ?? null;
  }

  async rotateReference(params) {
    await this.revokeByConnection({ companyId: params.companyId, connectionId: params.connectionId });
    return this.upsertReference({
      companyId: params.companyId,
      connectionId: params.connectionId,
      secretReference: params.nextSecretReference,
      status: "ACTIVE",
      expiresAt: params.expiresAt ?? null,
    });
  }
}

describe("CredentialVaultService", () => {
  it("supports store/get/rotate/revoke/delete without exposing raw tokens", async () => {
    const repo = new InMemoryVaultRepo();
    const vault = new CredentialVaultService(repo);

    const stored = await vault.store({
      companyId: "c1",
      connectionId: "conn1",
      secretReference: "sm://fluxora/staging/ref-1",
    });
    expect(stored.secretReference).toBe("sm://fluxora/staging/ref-1");

    const active = await vault.getActiveForConnection({ companyId: "c1", connectionId: "conn1" });
    expect(active?.id).toBe(stored.id);

    const rotated = await vault.rotate({
      companyId: "c1",
      connectionId: "conn1",
      nextSecretReference: "sm://fluxora/staging/ref-2",
    });
    expect(rotated.secretReference).toBe("sm://fluxora/staging/ref-2");
    expect(repo.rows.filter((r) => r.status === "REVOKED").length).toBe(1);

    await vault.revoke({ companyId: "c1", connectionId: "conn1" });
    expect(await vault.getActiveForConnection({ companyId: "c1", connectionId: "conn1" })).toBeNull();

    await vault.delete({ companyId: "c1", id: rotated.id });
    expect(await vault.get({ companyId: "c1", id: rotated.id })).toBeNull();
  });
});
