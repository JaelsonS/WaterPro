"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectionStatusCard } from "@/components/dashboard/ConnectionStatusCard";
import {
  WhatsAppConnectWizard,
  deriveWizardStep,
} from "@/components/dashboard/WhatsAppConnectWizard";
import { DashboardPermissionGate } from "@/components/dashboard/DashboardLayoutClient";
import { useDashboardAuthContext } from "@/components/dashboard/DashboardAuthProvider";
import { isMfaBlockedError, useAdminSecurityContext } from "@/components/dashboard/AdminSecurityProvider";
import { WhatsAppNumbersList } from "@/components/dashboard/WhatsAppNumbersList";
import { WhatsAppNumbersBySeller } from "@/components/dashboard/WhatsAppNumbersBySeller";
import { WhatsAppOperationalMetricsCard } from "@/components/dashboard/WhatsAppOperationalMetrics";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useWhatsAppDashboard } from "@/hooks/useWhatsAppDashboard";
import {
  computeWhatsAppMetrics,
  groupNumbersBySeller,
} from "@/lib/dashboard/whatsappMetrics";

type NumbersView = "list" | "bySeller";

export default function WhatsAppDashboardPage() {
  const auth = useDashboardAuthContext();
  const security = useAdminSecurityContext();
  const toast = useToast();
  const whatsapp = useWhatsAppDashboard(auth.sessionToken);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [numbersView, setNumbersView] = useState<NumbersView>("list");
  const [sellerFilter, setSellerFilter] = useState<string>("all");

  const metrics = useMemo(
    () => computeWhatsAppMetrics(whatsapp.whatsappNumbers),
    [whatsapp.whatsappNumbers],
  );

  const sellerGroups = useMemo(
    () => groupNumbersBySeller(whatsapp.whatsappNumbers, whatsapp.sellers),
    [whatsapp.whatsappNumbers, whatsapp.sellers],
  );

  useEffect(() => {
    if (!auth.sessionToken) return;
    void whatsapp.refresh().then(
      () => auth.setCanManage(true),
      (e: unknown) => {
        const err = e as Error & { status?: number };
        if (err.status === 403 || err.status === 401) auth.setCanManage(false);
      },
    );
  }, [auth.sessionToken]);

  const wizardStep = useMemo(
    () =>
      deriveWizardStep({
        uiPhase: whatsapp.uiPhase,
        pendingConnection: Boolean(whatsapp.pendingConnection),
        isProcessing: whatsapp.isProcessingCallback,
        numbersCount: whatsapp.connectedNumbersCount,
        unassignedCount: whatsapp.unassignedNumbers.length,
        hasError: whatsapp.uiPhase === "ERROR",
      }),
    [
      whatsapp.uiPhase,
      whatsapp.pendingConnection,
      whatsapp.isProcessingCallback,
      whatsapp.connectedNumbersCount,
      whatsapp.unassignedNumbers.length,
    ],
  );

  async function handleSync() {
    await security.runSensitiveAction(async () => {
      try {
        await whatsapp.syncConnection();
        toast.push("Sincronização concluída com base nos dados atuais.", "success");
      } catch (e) {
        if (isMfaBlockedError(e)) throw e;
        toast.push(whatsapp.actionError ?? "Não foi possível sincronizar o WhatsApp.", "error");
      }
    });
  }

  async function handleDisconnect() {
    await security.runSensitiveAction(async () => {
      try {
        await whatsapp.disconnectConnection();
        toast.push("WhatsApp desconectado.", "success");
        setConfirmDisconnect(false);
      } catch (e) {
        if (isMfaBlockedError(e)) throw e;
        toast.push(whatsapp.actionError ?? "Não foi possível desconectar o WhatsApp.", "error");
      }
    });
  }

  async function handleTest(numberId: string) {
    await security.runSensitiveAction(async () => {
      try {
        await whatsapp.testNumber(numberId);
        toast.push("Verificação executada com base no estado atual da conexão.", "info");
      } catch (e) {
        if (isMfaBlockedError(e)) throw e;
        toast.push(whatsapp.actionError ?? "Não foi possível testar o número.", "error");
      }
    });
  }

  async function handleAssign(numberId: string, sellerId: string) {
    await security.runSensitiveAction(async () => {
      try {
        await whatsapp.assignSeller(numberId, sellerId);
        toast.push("Vendedor associado ao número.", "success");
      } catch (e) {
        if (isMfaBlockedError(e)) throw e;
        toast.push(whatsapp.actionError ?? "Não foi possível associar o vendedor.", "error");
      }
    });
  }

  return (
    <DashboardPermissionGate>
      <div className="mx-auto max-w-5xl space-y-6">
        {whatsapp.loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            {whatsapp.loadError}
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => void whatsapp.refresh()}
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {whatsapp.actionError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
            {whatsapp.actionError}
            <button
              type="button"
              className="ml-3 underline"
              onClick={whatsapp.clearActionError}
            >
              Fechar
            </button>
          </div>
        ) : null}

        {security.enrollmentRequired ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Configure autenticação de dois fatores em{" "}
            <a href="/dashboard/definicoes" className="font-medium underline">
              Definições → Segurança
            </a>{" "}
            para conectar ou alterar integrações WhatsApp.
          </div>
        ) : null}

        <WhatsAppConnectWizard
          currentStepId={wizardStep}
          numbersCount={whatsapp.connectedNumbersCount}
          unassignedCount={whatsapp.unassignedNumbers.length}
        />

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
          onConnect={() => void security.runSensitiveAction(() => whatsapp.startConnection())}
          onReconnect={() => void security.runSensitiveAction(() => whatsapp.startConnection())}
          onSync={() => void handleSync()}
          onDisconnect={() => setConfirmDisconnect(true)}
          onRetry={() => {
            whatsapp.clearConnectionError();
            void security.runSensitiveAction(() => whatsapp.startConnection());
          }}
          onSignupComplete={async (payload) => {
            await security.runSensitiveAction(async () => {
              await whatsapp.submitCallback(payload);
              toast.push("Processando conexão WhatsApp…", "info");
            });
          }}
          onSignupCancel={whatsapp.cancelConnection}
          onSignupError={(message) =>
            toast.push(message || "Não foi possível concluir a conexão.", "error")
          }
        />

        {whatsapp.unassignedNumbers.length > 0 ? (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            role="alert"
          >
            {whatsapp.unassignedNumbers.length === 1
              ? "1 número ainda não possui vendedor associado."
              : `${whatsapp.unassignedNumbers.length} números ainda não possuem vendedor associado.`}{" "}
            Associe cada número abaixo para concluir a configuração.
          </div>
        ) : null}

        {!whatsapp.loading ? <WhatsAppOperationalMetricsCard metrics={metrics} /> : null}

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-ink">Números conectados</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={
                  numbersView === "list"
                    ? "rounded-full bg-azure px-3 py-1.5 text-xs text-white"
                    : "rounded-full border border-slate-line px-3 py-1.5 text-xs text-ink"
                }
                onClick={() => setNumbersView("list")}
              >
                Lista
              </button>
              <button
                type="button"
                className={
                  numbersView === "bySeller"
                    ? "rounded-full bg-azure px-3 py-1.5 text-xs text-white"
                    : "rounded-full border border-slate-line px-3 py-1.5 text-xs text-ink"
                }
                onClick={() => setNumbersView("bySeller")}
              >
                Por vendedor
              </button>
              {numbersView === "bySeller" ? (
                <select
                  aria-label="Filtrar vendedor"
                  className="rounded-full border border-slate-line bg-white px-3 py-1.5 text-xs text-ink"
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="unassigned">Sem vendedor</option>
                  {whatsapp.sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>
          {whatsapp.loading ? (
            <p className="text-sm text-ink-muted">A carregar números…</p>
          ) : numbersView === "list" ? (
            <WhatsAppNumbersList
              numbers={whatsapp.whatsappNumbers}
              sellers={whatsapp.sellers}
              testingNumberId={whatsapp.testingNumberId}
              assigningNumberId={whatsapp.assigningNumberId}
              onAssignSeller={(numberId, sellerId) => void handleAssign(numberId, sellerId)}
              onTestNumber={(numberId) => void handleTest(numberId)}
            />
          ) : (
            <WhatsAppNumbersBySeller
              groups={sellerGroups}
              filterSellerId={
                sellerFilter === "all"
                  ? undefined
                  : sellerFilter === "unassigned"
                    ? null
                    : sellerFilter
              }
            />
          )}
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
