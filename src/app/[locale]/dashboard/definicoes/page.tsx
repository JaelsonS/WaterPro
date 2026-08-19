"use client";

import { useEffect, useState } from "react";
import { DashboardPermissionGate } from "@/components/dashboard/DashboardLayoutClient";
import { useDashboardAuthContext } from "@/components/dashboard/DashboardAuthProvider";
import { useAdminSecurityContext } from "@/components/dashboard/AdminSecurityProvider";
import { MfaSetupPanel } from "@/components/dashboard/MfaSetupPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import type { CompanyRecord } from "@/lib/dashboard/types";

export default function DefinicoesPage() {
  const { sessionToken, setCanManage, userEmail, signOut } = useDashboardAuthContext();
  const security = useAdminSecurityContext();
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await waterproApiFetch<{ company: CompanyRecord }>("/api/v1/company", {
          method: "GET",
          token: sessionToken,
        });
        setCompany(res.company);
        setCanManage(true);
      } catch (e: unknown) {
        const err = e as Error & { status?: number };
        if (err.status === 403 || err.status === 401) {
          setCanManage(false);
          return;
        }
        setError(err.message ?? "Não foi possível carregar as definições.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionToken, setCanManage]);

  return (
    <DashboardPermissionGate>
      <div className="mx-auto max-w-3xl space-y-6">
        {loading ? <p className="text-sm text-ink-muted">A carregar definições…</p> : null}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-line bg-white p-6">
          <h2 className="text-lg font-medium text-ink">Segurança da conta</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Fluxora — plataforma AfDigital. Proteja o acesso administrativo com verificação em dois passos.
          </p>
          <div className="mt-4">
            <MfaSetupPanel
              enrolled={security.status?.mfaEnrolled}
              qrCode={security.enrollState?.qrCode}
              secret={security.enrollState?.secret}
              loading={security.loading}
              error={mfaError}
              onStart={async () => {
                setMfaError(null);
                try {
                  await security.startMfaSetup();
                } catch (e: unknown) {
                  setMfaError((e as Error).message ?? "Não foi possível iniciar o MFA.");
                }
              }}
              onConfirm={async (code) => {
                setMfaError(null);
                try {
                  await security.confirmMfaSetup(code);
                } catch (e: unknown) {
                  setMfaError((e as Error).message ?? "Código inválido.");
                  throw e;
                }
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-line bg-white p-6">
          <h2 className="text-lg font-medium text-ink">Empresa</h2>
          {company ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Nome</dt>
                <dd className="font-medium text-ink">{company.name}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Slug</dt>
                <dd className="font-medium text-ink">{company.slug ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Estado</dt>
                <dd className="font-medium text-ink">{company.status ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Fuso horário</dt>
                <dd className="font-medium text-ink">{company.timezone ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            !loading && <p className="mt-2 text-sm text-ink-muted">Sem dados da empresa.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-line bg-white p-6">
          <h2 className="text-lg font-medium text-ink">Conta</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-muted">Email</dt>
              <dd className="font-medium text-ink">{userEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Nível de segurança</dt>
              <dd className="font-medium text-ink">{security.securityLevel}</dd>
            </div>
          </dl>
          <MagneticButton
            variant="secondary"
            className="mt-4 !px-4 !py-2"
            onClick={() => void signOut()}
          >
            Terminar sessão
          </MagneticButton>
        </section>

        <section className="rounded-2xl border border-slate-line bg-white p-6">
          <h2 className="text-lg font-medium text-ink">Integrações WhatsApp</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Provider atual:{" "}
            <span className="font-medium text-ink">
              {process.env.NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER ?? "mock"}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            A integração Meta real será ativada em staging após validação completa do security gate.
          </p>
          {security.enrollmentRequired ? (
            <p className="mt-3 text-sm text-amber-800">
              Configure MFA para aceder a credenciais e ações de integração.
            </p>
          ) : null}
        </section>
      </div>
    </DashboardPermissionGate>
  );
}
