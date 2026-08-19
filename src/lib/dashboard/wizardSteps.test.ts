import { describe, expect, it } from "vitest";
import { deriveWizardStep, wizardStepIndex } from "@/lib/dashboard/wizardSteps";

describe("wizardSteps", () => {
  it("inicia em start quando desconectado", () => {
    expect(
      deriveWizardStep({
        uiPhase: "NOT_CONNECTED",
        pendingConnection: false,
        isProcessing: false,
        numbersCount: 0,
        unassignedCount: 0,
        hasError: false,
      }),
    ).toBe("start");
  });

  it("mostra authorize quando há pending connection", () => {
    expect(
      deriveWizardStep({
        uiPhase: "CONNECTING",
        pendingConnection: true,
        isProcessing: false,
        numbersCount: 0,
        unassignedCount: 0,
        hasError: false,
      }),
    ).toBe("authorize");
  });

  it("mostra processing durante callback", () => {
    expect(
      deriveWizardStep({
        uiPhase: "CONNECTING",
        pendingConnection: false,
        isProcessing: true,
        numbersCount: 0,
        unassignedCount: 0,
        hasError: false,
      }),
    ).toBe("processing");
  });

  it("mostra assign quando há números sem vendedor", () => {
    expect(
      deriveWizardStep({
        uiPhase: "CONNECTED",
        pendingConnection: false,
        isProcessing: false,
        numbersCount: 2,
        unassignedCount: 1,
        hasError: false,
      }),
    ).toBe("assign");
  });

  it("mostra complete quando tudo configurado", () => {
    expect(
      deriveWizardStep({
        uiPhase: "CONNECTED",
        pendingConnection: false,
        isProcessing: false,
        numbersCount: 2,
        unassignedCount: 0,
        hasError: false,
      }),
    ).toBe("complete");
  });

  it("wizardStepIndex encontra passos conhecidos", () => {
    expect(wizardStepIndex("start")).toBe(0);
    expect(wizardStepIndex("complete")).toBe(5);
  });
});
