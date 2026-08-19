"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useDashboardAuthContext } from "./DashboardAuthProvider";
import { useAdminSecurity } from "@/hooks/useAdminSecurity";
import { MfaStepUpModal } from "./MfaStepUpModal";
import { WaterProApiError } from "@/lib/backend/apiErrors";

type AdminSecurityContextValue = ReturnType<typeof useAdminSecurity> & {
  runSensitiveAction: (action: () => Promise<void>) => Promise<void>;
};

const AdminSecurityContext = createContext<AdminSecurityContextValue | null>(null);

export function AdminSecurityProvider({ children }: { children: ReactNode }) {
  const auth = useDashboardAuthContext();
  const router = useRouter();
  const security = useAdminSecurity(auth.sessionToken);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [enrollmentMode, setEnrollmentMode] = useState(false);

  const runSensitiveAction = useCallback(
    async (action: () => Promise<void>) => {
      if (!security.status?.mfaRequired) {
        await action();
        return;
      }
      if (security.enrollmentRequired) {
        setEnrollmentMode(true);
        setModalError(null);
        setPendingAction(() => action);
        setModalOpen(true);
        return;
      }
      if (security.securityLevel === "MFA_VERIFIED") {
        await action();
        return;
      }
      setEnrollmentMode(false);
      setModalError(null);
      setPendingAction(() => action);
      setModalOpen(true);
    },
    [security.enrollmentRequired, security.securityLevel, security.status?.mfaRequired],
  );

  const handleVerify = useCallback(
    async (code: string) => {
      setModalError(null);
      try {
        await security.verifyStepUp(code);
        const action = pendingAction;
        setPendingAction(null);
        setModalOpen(false);
        if (action) await action();
      } catch (e: unknown) {
        const err = e as Error;
        setModalError(err.message ?? "Código inválido. Tente novamente.");
      }
    },
    [pendingAction, security],
  );

  const value = useMemo(
    () => ({
      ...security,
      runSensitiveAction,
    }),
    [security, runSensitiveAction],
  );

  return (
    <AdminSecurityContext.Provider value={value}>
      {children}
      <MfaStepUpModal
        open={modalOpen}
        error={modalError}
        enrollmentRequired={enrollmentMode}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        onVerify={handleVerify}
        onGoToSetup={() => {
          setModalOpen(false);
          router.push("/dashboard/definicoes");
        }}
      />
    </AdminSecurityContext.Provider>
  );
}

export function useAdminSecurityContext() {
  const ctx = useContext(AdminSecurityContext);
  if (!ctx) throw new Error("useAdminSecurityContext must be used within AdminSecurityProvider");
  return ctx;
}

export function isMfaBlockedError(error: unknown): boolean {
  return (
    error instanceof WaterProApiError &&
    (error.code === "MFA_ENROLLMENT_REQUIRED" || error.code === "MFA_STEP_UP_REQUIRED")
  );
}
