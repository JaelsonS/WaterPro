import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsAppConnectWizard } from "@/components/dashboard/WhatsAppConnectWizard";

describe("WhatsAppConnectWizard", () => {
  it("renderiza passos do wizard", () => {
    render(
      <WhatsAppConnectWizard currentStepId="authorize" numbersCount={0} unassignedCount={0} />,
    );
    expect(screen.getByText("Iniciar")).toBeInTheDocument();
    expect(screen.getByText("Autorizar")).toBeInTheDocument();
    expect(screen.getByText(/Autorize o WhatsApp/i)).toBeInTheDocument();
  });

  it("mostra alerta de erro", () => {
    render(
      <WhatsAppConnectWizard currentStepId="error" numbersCount={0} unassignedCount={0} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Não conseguimos concluir/i);
  });
});
