import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function ToastProbe() {
  const { push } = useToast();
  return (
    <button type="button" onClick={() => push("Operação concluída.", "success")}>
      Disparar toast
    </button>
  );
}

describe("ToastProvider", () => {
  it("mostra toast de sucesso", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Disparar toast/i }));
    expect(screen.getByText("Operação concluída.")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    vi.useRealTimers();
  });
});
