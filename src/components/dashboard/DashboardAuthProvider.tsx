"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDashboardAuth, type DashboardAuthState } from "@/hooks/useDashboardAuth";

const DashboardAuthContext = createContext<DashboardAuthState | null>(null);

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const auth = useDashboardAuth();
  return <DashboardAuthContext.Provider value={auth}>{children}</DashboardAuthContext.Provider>;
}

export function useDashboardAuthContext() {
  const ctx = useContext(DashboardAuthContext);
  if (!ctx) throw new Error("useDashboardAuthContext must be used within DashboardAuthProvider");
  return ctx;
}
