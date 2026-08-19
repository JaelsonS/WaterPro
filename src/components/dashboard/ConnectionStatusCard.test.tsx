import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionStatusCard } from "@/components/dashboard/ConnectionStatusCard";

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseProps = {
  activeConnection: null,
  wabaId: null,
  numbersCount: 0,
  lastSyncAt: null,
  providerMode: "mock",
  pendingConnection: null,
  onConnect: vi.fn(),
  onReconnect: vi.fn(),
  onSync: vi.fn(),
  onDisconnect: vi.fn(),
  onRetry: vi.fn(),
  onSignupComplete: vi.fn(),
  onSignupCancel: vi.fn(),
  onSignupError: vi.fn(),
};

describe("ConnectionStatusCard", () => {
  it("renderiza estado NOT_CONNECTED com CTA", () => {
    render(<ConnectionStatusCard phase="NOT_CONNECTED" {...baseProps} />);
    expect(screen.getByText(/Vamos conectar seu WhatsApp Business/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Conectar WhatsApp/i })).toBeInTheDocument();
  });

  it("renderiza estado CONNECTING com spinner", () => {
    render(<ConnectionStatusCard phase="CONNECTING" {...baseProps} />);
    expect(screen.getByText(/iniciando sua conexão/i)).toBeInTheDocument();
  });

  it("renderiza estado CONNECTED com ações", () => {
    render(
      <ConnectionStatusCard
        phase="CONNECTED"
        {...baseProps}
        activeConnection={{ id: "c1", status: "CONNECTED", created_at: "2026-08-19T12:00:00Z" }}
        wabaId="waba-1"
        numbersCount={2}
      />,
    );
    expect(screen.getByRole("button", { name: /Sincronizar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Desconectar/i })).toBeInTheDocument();
  });

  it("renderiza estado REAUTH_REQUIRED", () => {
    render(<ConnectionStatusCard phase="REAUTH_REQUIRED" {...baseProps} />);
    expect(screen.getByRole("button", { name: /Reconectar WhatsApp/i })).toBeInTheDocument();
  });

  it("renderiza estado ERROR com tentar novamente", () => {
    render(
      <ConnectionStatusCard
        phase="ERROR"
        {...baseProps}
        errorMessage="Falha ao conectar"
      />,
    );
    expect(screen.getByText(/Falha ao conectar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));
    expect(baseProps.onRetry).toHaveBeenCalled();
  });
});
