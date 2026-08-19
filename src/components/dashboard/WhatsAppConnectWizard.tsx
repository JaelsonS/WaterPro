"use client";

import { cn } from "@/lib/utils";
import {
  WIZARD_STEPS,
  deriveWizardStep,
  wizardStepIndex,
  type WizardStepId,
} from "@/lib/dashboard/wizardSteps";

type WhatsAppConnectWizardProps = {
  currentStepId: WizardStepId;
  numbersCount: number;
  unassignedCount: number;
  className?: string;
};

export function WhatsAppConnectWizard({
  currentStepId,
  numbersCount,
  unassignedCount,
  className,
}: WhatsAppConnectWizardProps) {
  const currentIndex =
    currentStepId === "error" ? wizardStepIndex("processing") : wizardStepIndex(currentStepId);

  return (
    <nav aria-label="Progresso da conexão WhatsApp" className={cn("mb-6", className)}>
      {currentStepId === "error" ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          Não conseguimos concluir a conexão. Revise os passos abaixo e tente novamente.
        </p>
      ) : null}
      <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {WIZARD_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStepId;
          const isUpcoming = index > currentIndex;

          let description = step.description;
          if (step.id === "numbers" && numbersCount > 0) {
            description = `Encontramos ${numbersCount} número${numbersCount === 1 ? "" : "s"}.`;
          }
          if (step.id === "assign" && unassignedCount > 0) {
            description = `Associe cada número a um vendedor (${unassignedCount} pendente${unassignedCount === 1 ? "" : "s"}).`;
          }
          if (step.id === "complete" && isCurrent) {
            description = "Tudo pronto.";
          }
          if (step.id === "error" && isCurrent) {
            description = "Não conseguimos concluir a conexão.";
          }

          return (
            <li
              key={step.id}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm",
                isCurrent && "border-azure bg-azure/5",
                isComplete && "border-emerald-200 bg-emerald-50/50",
                isUpcoming && "border-slate-line bg-white opacity-70",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <p className="font-medium text-ink">{step.label}</p>
              <p className="mt-1 text-xs text-ink-muted">{description}</p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { deriveWizardStep };
