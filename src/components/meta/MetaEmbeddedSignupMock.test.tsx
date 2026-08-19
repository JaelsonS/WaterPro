import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { MetaEmbeddedSignupMock } from "./MetaEmbeddedSignupMock";

describe("MetaEmbeddedSignupMock", () => {
  it("chama onComplete com payload esperado", async () => {
    const onComplete = vi.fn();
    render(
      <MetaEmbeddedSignupMock
        configId="mock-config"
        onComplete={onComplete}
        onCancel={() => {}}
        onError={() => {}}
      />,
    );

    // componente não tem botão; apenas agenda onComplete.
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });

    const payload = onComplete.mock.calls[0][0] as any;
    expect(typeof payload.embeddedCode).toBe("string");
    expect(payload.embeddedCode).toBe("mock-embedded-code");
    expect(typeof payload.wabaId).toBe("string");
    expect(payload.phoneNumberId).toBe("pn-mock-fluxora-staging");
  });
});

