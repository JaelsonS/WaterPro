"use client";

import { useAdminSecurityContext } from "./AdminSecurityProvider";
import { DashboardMfaOnboarding } from "./DashboardMfaOnboarding";
import type { ReactNode } from "react";

export function MfaEnrollmentGate({ children }: { children: ReactNode }) {
  const security = useAdminSecurityContext();

  if (security.error && !security.status && !security.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice p-4">
        <div className="max-w-md rounded-2xl border border-slate-line bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-ink">{security.error}</p>
          <p className="mt-2 text-sm text-ink-muted">
            Se acabou de criar conta, confirme o email ou conclua o cadastro em /cadastro.
          </p>
        </div>
      </div>
    );
  }

  if (!security.status && security.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice text-sm text-ink-muted">
        A verificar segurança da conta…
      </div>
    );
  }

  if (security.status?.mfaRequired && security.enrollmentRequired) {
    return <DashboardMfaOnboarding />;
  }

  return <>{children}</>;
}
