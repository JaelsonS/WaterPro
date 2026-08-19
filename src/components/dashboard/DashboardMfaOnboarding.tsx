"use client";

import { useRouter } from "@/i18n/routing";
import { MfaSetupPanel } from "./MfaSetupPanel";
import { useAdminSecurityContext } from "./AdminSecurityProvider";

export function DashboardMfaOnboarding() {
  const router = useRouter();
  const security = useAdminSecurityContext();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-light text-ink">Ativar autenticação de dois fatores</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Por segurança, configure o MFA antes de aceder ao painel Fluxora.
        </p>

        <div className="mt-6">
          <MfaSetupPanel
            qrCode={security.enrollState?.qrCode}
            secret={security.enrollState?.secret}
            loading={security.loading}
            error={security.error}
            enrolled={!security.enrollmentRequired && security.status?.mfaEnrolled}
            onStart={security.startMfaSetup}
            onConfirm={async (code) => {
              await security.confirmMfaSetup(code);
              await security.refresh();
              router.replace("/dashboard");
            }}
          />
        </div>
      </div>
    </div>
  );
}
