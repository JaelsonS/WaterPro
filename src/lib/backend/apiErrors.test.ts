import { describe, expect, it } from "vitest";
import { mapApiErrorToUserMessage, WaterProApiError } from "@/lib/backend/apiErrors";

describe("apiErrors", () => {
  it("mapeia 401 para mensagem humana", () => {
    expect(mapApiErrorToUserMessage(new WaterProApiError("x", 401, "UNAUTHORIZED"))).toMatch(
      /acesso expirou/i,
    );
  });

  it("mapeia 409 CONFLICT", () => {
    expect(mapApiErrorToUserMessage(new WaterProApiError("x", 409, "CONFLICT"))).toMatch(
      /já está em andamento/i,
    );
  });

  it("mapeia erro de rede", () => {
    expect(mapApiErrorToUserMessage(new Error("Failed to fetch"))).toMatch(/contactar o servidor/i);
  });
});
