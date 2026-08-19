export type WizardStepId =
  | "start"
  | "authorize"
  | "processing"
  | "numbers"
  | "assign"
  | "complete"
  | "error";

export type WizardStep = {
  id: WizardStepId;
  label: string;
  description: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  { id: "start", label: "Iniciar", description: "Vamos conectar seu WhatsApp." },
  { id: "authorize", label: "Autorizar", description: "Autorize o WhatsApp na janela Meta." },
  { id: "processing", label: "Processar", description: "Conectando…" },
  { id: "numbers", label: "Números", description: "Encontramos números na sua conta." },
  { id: "assign", label: "Vendedores", description: "Associe cada número a um vendedor." },
  { id: "complete", label: "Concluído", description: "Tudo pronto." },
];

export function deriveWizardStep(params: {
  uiPhase: string;
  pendingConnection: boolean;
  isProcessing: boolean;
  numbersCount: number;
  unassignedCount: number;
  hasError: boolean;
}): WizardStepId {
  if (params.hasError) return "error";
  if (params.uiPhase === "NOT_CONNECTED" && !params.pendingConnection) return "start";
  if (params.pendingConnection || params.uiPhase === "CONNECTING") {
    return params.isProcessing ? "processing" : "authorize";
  }
  if (params.uiPhase === "REAUTH_REQUIRED") return "authorize";
  if (params.uiPhase === "CONNECTED") {
    if (params.numbersCount === 0) return "processing";
    if (params.unassignedCount > 0) return params.unassignedCount === params.numbersCount ? "numbers" : "assign";
    return "complete";
  }
  return "start";
}

export function wizardStepIndex(stepId: WizardStepId): number {
  const idx = WIZARD_STEPS.findIndex((s) => s.id === stepId);
  return idx >= 0 ? idx : 0;
}
