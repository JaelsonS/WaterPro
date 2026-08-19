import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

describe("DashboardHeader", () => {
  it("renderiza título e logout", () => {
    const onLogout = vi.fn();
    render(
      <DashboardHeader
        title="Dashboard"
        description="Visão geral"
        userEmail="admin@test.local"
        onLogout={onLogout}
      />,
    );
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("admin@test.local")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sair/i }));
    expect(onLogout).toHaveBeenCalled();
  });
});
