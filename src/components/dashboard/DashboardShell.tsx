"use client";

import { useState, type ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

type DashboardShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  userEmail?: string | null;
  onLogout?: () => void;
};

export function DashboardShell({
  children,
  title,
  description,
  userEmail,
  onLogout,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ice">
      <div className="hidden shrink-0 lg:block">
        <DashboardSidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-64 bg-white shadow-xl">
            <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title={title}
          description={description}
          userEmail={userEmail}
          onLogout={onLogout}
          showMenuButton
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main id="dashboard-main" className="flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
