"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ConnectionStatusCard } from "@/components/dashboard/ConnectionStatusCard";
import { DashboardPermissionGate } from "@/components/dashboard/DashboardLayoutClient";
import { useDashboardAuthContext } from "@/components/dashboard/DashboardAuthProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useWhatsAppDashboard } from "@/hooks/useWhatsAppDashboard";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import type { SellerRecord } from "@/lib/dashboard/types";

function DashboardHomeContent() {
  const { sessionToken, setCanManage, setAuthError } = useDashboardAuthContext();
  const toast = useToast();
  const whatsapp = useWhatsAppDashboard(sessionToken);
  const { refresh: refreshWhatsApp } = whatsapp;
  const [sellersCount, setSellersCount] = useState<number | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  useEffect(() => {
    if (!sessionToken) return;
    void (async () => {
      try {
        await refreshWhatsApp();
        setCanManage(true);
      } catch (e: unknown) {
        const err = e as Error & { status?: number };
        if (err.status === 403 || err.status === 401) {
          setCanManage(false);
          return;
        }
        setAuthError(err.message ?? "Falha ao carregar painel");
      }
    })();
  }, [sessionToken, refreshWhatsApp, setCanManage, setAuthError]);

  useEffect(() => {
    if (!sessionToken) return;
    void waterproApiFetch<{ sellers: SellerRecord[] }>("/api/v1/sellers", {
      method: "GET",
      token: sessionToken,
    })
      .then((res) => setSellersCount(res.sellers?.length ?? 0))
      .catch(() => setSellersCount(null));
  }, [sessionToken]);

  async function handleSync() {
    try {
      await whatsapp.syncConnection();
      toast.push("Sincronização concluída.", "success");
    } catch {
      toast.push("Não foi possível sincronizar o WhatsApp.", "error");
    }
  }

  async function handleDisconnect() {
    try {
      await whatsapp.disconnectConnection();
      toast.push("WhatsApp desconectado.", "success");
      setConfirmDisconnect(false);
    } catch {
      toast.push("Não foi possível desconectar o WhatsApp.", "error");
    }
  }

  async function handleSignupComplete(payload: {
    embeddedCode: string;
    wabaId?: string;
    phoneNumberId?: string;
  }) {
    await whatsapp.submitCallback(payload);
    toast.push("WhatsApp conectado com sucesso.", "success");
  }

  return (
    <DashboardPermissionGate>
      <div className="mx-auto max-w-5xl space-y-6">
        <ConnectionStatusCard
          phase={whatsapp.uiPhase}
          activeConnection={whatsapp.activeConnection}
          wabaId={whatsapp.wabaId}
          numbersCount={whatsapp.connectedNumbersCount}
          lastSyncAt={whatsapp.lastSyncAt}
          providerMode={whatsapp.providerMode}
          pendingConnection={whatsapp.pendingConnection}
          loading={whatsapp.loading}
          syncing={whatsapp.syncing}
          disconnecting={whatsapp.disconnecting}
          errorMessage={whatsapp.connectionError}
          onConnect={() => void whatsapp.startConnection()}
          onReconnect={() => void whatsapp.startConnection()}
          onSync={() => void handleSync()}
          onDisconnect={() => setConfirmDisconnect(true)}
          onRetry={() => {
            whatsapp.clearConnectionError();
            void whatsapp.startConnection();
          }}
          onSignupComplete={(payload) => void handleSignupComplete(payload)}
          onSignupCancel={whatsapp.cancelConnection}
          onSignupError={() => toast.push("Não foi possível concluir a conexão.", "error")}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-muted">Números conectados</p>
            <p className="mt-2 text-3xl font-light text-ink">
              {whatsapp.loading ? "…" : whatsapp.connectedNumbersCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-muted">Vendedores</p>
            <p className="mt-2 text-3xl font-light text-ink">{sellersCount ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-muted">Última sincronização</p>
            <p className="mt-2 text-sm font-medium text-ink">
              {whatsapp.lastSyncAt
                ? new Date(whatsapp.lastSyncAt).toLocaleString("pt-PT")
                : "—"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-line bg-white p-6">
          <h2 className="text-lg font-medium text-ink">Atalhos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/whatsapp">
              <MagneticButton variant="secondary" className="!px-4 !py-2">
                Gerenciar WhatsApp
              </MagneticButton>
            </Link>
            <Link href="/dashboard/vendedores">
              <MagneticButton variant="secondary" className="!px-4 !py-2">
                Gerenciar vendedores
              </MagneticButton>
            </Link>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDisconnect}
        title="Desconectar este WhatsApp?"
        description="A conexão será marcada como desconectada e poderá exigir nova autorização para voltar a funcionar."
        confirmLabel="Desconectar"
        loading={whatsapp.disconnecting}
        onCancel={() => setConfirmDisconnect(false)}
        onConfirm={() => void handleDisconnect()}
      />
    </DashboardPermissionGate>
  );
}

export default function DashboardHomePage() {
  return <DashboardHomeContent />;
}
