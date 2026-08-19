import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/dashboard/whatsapp",
}));

describe("DashboardSidebar", () => {
  it("renderiza itens de navegação", () => {
    render(<DashboardSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Vendedores")).toBeInTheDocument();
    expect(screen.getByText("Definições")).toBeInTheDocument();
  });
});
