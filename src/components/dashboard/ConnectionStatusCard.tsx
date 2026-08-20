"use client";

import { Link } from "@/i18n/routing";
import { MetaEmbeddedSignup } from "@/components/meta/MetaEmbeddedSignup";
import { MetaEmbeddedSignupMock } from "@/components/meta/MetaEmbeddedSignupMock";
import { MagneticButton } from "@/components/ui/MagneticButton";
import type { ConnectionRecord, UiConnectionPhase } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

type ConnectionStatusCardProps = {
  phase: UiConnectionPhase;
  activeConnection: ConnectionRecord | null;
  wabaId: string | null;
  numbersCount: number;
  lastSyncAt: string | null;
  providerMode: string;
  pendingConnection: {
    connectionId: string;
    state: string;
    embeddedSignupConfigId: string;
  } | null;
  loading?: boolean;
  syncing?: boolean;
  disconnecting?: boolean;
  errorMessage?: string | null;
  onConnect: () => void;
  onReconnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onRetry: () => void;
  onSignupComplete: (payload: {
    embeddedCode: string;
    wabaId?: string;
    phoneNumberId?: string;
  }) => void;
  onSignupCancel: () => void | Promise<void>;
  onSignupError: (message: string) => void;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-PT");
}

const statusBadge: Record<UiConnectionPhase, { label: string; className: string }> = {
  NOT_CONNECTED: { label: "Não conectado", className: "bg-slate-100 text-slate-700" },
  CONNECTING: { label: "A conectar", className: "bg-sky-100 text-sky-800" },
  CONNECTED: { label: "Conectado", className: "bg-emerald-100 text-emerald-800" },
  REAUTH_REQUIRED: { label: "Reautorização necessária", className: "bg-amber-100 text-amber-800" },
  ERROR: { label: "Erro", className: "bg-red-100 text-red-800" },
};

export function ConnectionStatusCard({
  phase,
  activeConnection,
  wabaId,
  numbersCount,
  lastSyncAt,
  providerMode,
  pendingConnection,
  loading = false,
  syncing = false,
  disconnecting = false,
  errorMessage,
  onConnect,
  onReconnect,
  onSync,
  onDisconnect,
  onRetry,
  onSignupComplete,
  onSignupCancel,
  onSignupError,
}: ConnectionStatusCardProps) {
  const badge = statusBadge[phase];
  const actionsDisabled = loading || syncing || disconnecting;

  return (
    <section
      className="rounded-2xl border border-slate-line bg-white p-6 shadow-sm"
      aria-labelledby="connection-status-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="connection-status-title" className="text-lg font-medium text-ink">
              Conexão WhatsApp
            </h2>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", badge.className)}>
              {badge.label}
            </span>
          </div>

          {phase === "NOT_CONNECTED" ? (
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Vamos conectar seu WhatsApp Business para começar a utilizar a plataforma.
            </p>
          ) : null}

          {phase === "CONNECTING" ? (
            <div className="mt-3 flex items-start gap-3">
              <span
                className="mt-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-azure border-t-transparent"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm text-ink-soft">Estamos iniciando sua conexão com o WhatsApp.</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Complete o processo na janela do WhatsApp/Meta. Se a janela fechou ou falhou, cancele e
                  tente novamente.
                </p>
              </div>
            </div>
          ) : null}

          {phase === "CONNECTED" || phase === "REAUTH_REQUIRED" ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-muted">WABA ID</dt>
                <dd className="font-medium text-ink">{wabaId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Números</dt>
                <dd className="font-medium text-ink">{numbersCount}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Conectado em</dt>
                <dd className="font-medium text-ink">{formatDate(activeConnection?.created_at ?? null)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Última sincronização</dt>
                <dd className="font-medium text-ink">{formatDate(lastSyncAt)}</dd>
              </div>
            </dl>
          ) : null}

          {phase === "REAUTH_REQUIRED" ? (
            <p className="mt-3 text-sm text-amber-800">
              É necessária uma nova autorização para continuar utilizando o WhatsApp.
            </p>
          ) : null}

          {phase === "ERROR" ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {errorMessage ?? "Não foi possível concluir a operação."}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {phase === "NOT_CONNECTED" ? (
            <MagneticButton variant="primary" onClick={onConnect} disabled={actionsDisabled}>
              Conectar WhatsApp
            </MagneticButton>
          ) : null}

          {phase === "CONNECTING" ? (
            <>
              <MagneticButton
                variant="secondary"
                onClick={() => void Promise.resolve(onSignupCancel())}
                disabled={disconnecting}
              >
                Cancelar
              </MagneticButton>
              <MagneticButton
                variant="primary"
                onClick={() => {
                  void (async () => {
                    await Promise.resolve(onSignupCancel());
                    onRetry();
                  })();
                }}
                disabled={actionsDisabled}
              >
                Tentar novamente
              </MagneticButton>
            </>
          ) : null}

          {phase === "REAUTH_REQUIRED" ? (
            <MagneticButton variant="primary" onClick={onReconnect} disabled={actionsDisabled}>
              Reconectar WhatsApp
            </MagneticButton>
          ) : null}

          {phase === "CONNECTED" ? (
            <>
              <MagneticButton variant="secondary" onClick={onSync} disabled={actionsDisabled}>
                {syncing ? "A sincronizar…" : "Sincronizar"}
              </MagneticButton>
              <Link
                href="/dashboard/whatsapp"
                className="inline-flex items-center justify-center rounded-full border border-slate-line bg-white px-4 py-3 text-sm font-medium text-ink shadow-sm hover:border-azure/30"
              >
                Gerenciar números
              </Link>
              <MagneticButton variant="ghost" onClick={onDisconnect} disabled={actionsDisabled}>
                {disconnecting ? "A desconectar…" : "Desconectar"}
              </MagneticButton>
            </>
          ) : null}

          {phase === "ERROR" ? (
            <MagneticButton variant="primary" onClick={onRetry}>
              Tentar novamente
            </MagneticButton>
          ) : null}
        </div>
      </div>

      {pendingConnection ? (
        <div className="mt-6">
          {providerMode === "mock" ? (
            <MetaEmbeddedSignupMock
              configId={pendingConnection.embeddedSignupConfigId}
              onCancel={onSignupCancel}
              onError={onSignupError}
              onComplete={onSignupComplete}
            />
          ) : (
            <MetaEmbeddedSignup
              configId={pendingConnection.embeddedSignupConfigId}
              onCancel={onSignupCancel}
              onError={onSignupError}
              onComplete={onSignupComplete}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
