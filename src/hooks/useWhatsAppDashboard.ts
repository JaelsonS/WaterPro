"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import { getAccessToken } from "@/lib/auth/accessToken";
import { mapApiErrorToUserMessage, WaterProApiError } from "@/lib/backend/apiErrors";
import { useConnectionPolling } from "@/hooks/useConnectionPolling";
import type {
  ConnectionRecord,
  SellerRecord,
  StartConnectionResponse,
  UiConnectionPhase,
  WhatsAppNumberRecord,
} from "@/lib/dashboard/types";

function getProviderMode() {
  return process.env.NEXT_PUBLIC_WHATSAPP_ONBOARDING_PROVIDER ?? "mock";
}

function normalizeConnection(raw: Record<string, unknown>): ConnectionRecord {
  return {
    id: String(raw.id),
    status: String(raw.status),
    companyId: raw.companyId ? String(raw.companyId) : undefined,
    provider: raw.provider ? String(raw.provider) : undefined,
    created_at: (raw.created_at ?? raw.createdAt) as string | undefined,
    updated_at: (raw.updated_at ?? raw.updatedAt) as string | undefined,
    metadata: (raw.metadata as Record<string, unknown> | undefined) ?? undefined,
  };
}

function deriveUiPhase(params: {
  connections: ConnectionRecord[];
  isConnecting: boolean;
  connectionError: string | null;
}): UiConnectionPhase {
  if (params.connectionError) return "ERROR";
  if (params.connections.some((c) => c.status === "REAUTH_REQUIRED")) return "REAUTH_REQUIRED";
  if (params.isConnecting || params.connections.some((c) => c.status === "CONNECTING")) {
    return "CONNECTING";
  }
  if (params.connections.some((c) => c.status === "CONNECTED")) return "CONNECTED";
  return "NOT_CONNECTED";
}

export function useWhatsAppDashboard(sessionToken: string | null) {
  const providerMode = useMemo(() => getProviderMode(), []);
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumberRecord[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [pollingConnectionId, setPollingConnectionId] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    connectionId: string;
    state: string;
    embeddedSignupConfigId: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [testingNumberId, setTestingNumberId] = useState<string | null>(null);
  const [assigningNumberId, setAssigningNumberId] = useState<string | null>(null);
  const connectInFlightRef = useRef(false);
  const syncInFlightRef = useRef(false);

  const activeConnection = useMemo(() => {
    return (
      connections.find((c) => c.status === "CONNECTED") ??
      connections.find((c) => c.status === "REAUTH_REQUIRED") ??
      connections.find((c) => c.status === "CONNECTING") ??
      connections[0] ??
      null
    );
  }, [connections]);

  const uiPhase = useMemo(
    () =>
      deriveUiPhase({
        connections,
        isConnecting: isConnecting || Boolean(pendingConnection) || isProcessingCallback,
        connectionError,
      }),
    [connections, isConnecting, pendingConnection, isProcessingCallback, connectionError],
  );

  const refresh = useCallback(async () => {
    if (!sessionToken) return;
    const token = (await getAccessToken()) ?? sessionToken;
    setLoading(true);
    setLoadError(null);
    try {
      const [connectionsRes, numbersRes, sellersRes] = await Promise.all([
        waterproApiFetch<{ connections: Record<string, unknown>[] }>("/api/v1/whatsapp/connections", {
          method: "GET",
          token,
        }),
        waterproApiFetch<{ whatsappNumbers: WhatsAppNumberRecord[] }>("/api/v1/whatsapp/numbers", {
          method: "GET",
          token,
        }),
        waterproApiFetch<{ sellers: SellerRecord[] }>("/api/v1/sellers", {
          method: "GET",
          token,
        }),
      ]);

      setConnections((connectionsRes.connections ?? []).map(normalizeConnection));
      setWhatsappNumbers(numbersRes.whatsappNumbers ?? []);
      setSellers(sellersRes.sellers ?? []);
    } catch (e: unknown) {
      const err = e as WaterProApiError;
      if (err.status === 403 || err.status === 401) {
        throw err;
      }
      setLoadError(mapApiErrorToUserMessage(e, "Não foi possível carregar os dados do WhatsApp."));
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) return;
    void refresh().catch(() => undefined);
  }, [sessionToken, refresh]);

  const handlePollingUpdate = useCallback((connection: ConnectionRecord) => {
    setConnections((prev) => {
      const idx = prev.findIndex((c) => c.id === connection.id);
      if (idx === -1) return [connection, ...prev];
      const next = [...prev];
      next[idx] = connection;
      return next;
    });
  }, []);

  const handlePollingTerminal = useCallback(
    async (connection: ConnectionRecord) => {
      setIsProcessingCallback(false);
      setPollingConnectionId(null);
      if (connection.status === "CONNECTED") {
        setIsConnecting(false);
        setConnectionError(null);
      } else if (connection.status === "ERROR") {
        setConnectionError("Não conseguimos concluir a conexão.");
        setIsConnecting(false);
      }
      await refresh();
    },
    [refresh],
  );

  const handlePollingError = useCallback((message: string) => {
    setConnectionError(message);
    setIsProcessingCallback(false);
    setPollingConnectionId(null);
    setIsConnecting(false);
  }, []);

  useConnectionPolling({
    enabled: Boolean(pollingConnectionId && sessionToken),
    sessionToken,
    connectionId: pollingConnectionId,
    onConnectionUpdate: handlePollingUpdate,
    onTerminal: (connection) => void handlePollingTerminal(connection),
    onError: handlePollingError,
  });

  const startConnection = useCallback(async () => {
    if (!sessionToken || connectInFlightRef.current) return;
    connectInFlightRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);
    setActionError(null);
    try {
      const start = await waterproApiFetch<StartConnectionResponse & { reused?: boolean }>(
        "/api/v1/whatsapp/connect/start",
        {
          method: "POST",
          token: sessionToken,
          body: {},
        },
      );
      setPendingConnection({
        connectionId: start.connectionId,
        state: start.state,
        embeddedSignupConfigId: start.embeddedSignupConfigId,
      });
    } catch (e: unknown) {
      setConnectionError(mapApiErrorToUserMessage(e, "Não foi possível iniciar a conexão."));
      setIsConnecting(false);
    } finally {
      connectInFlightRef.current = false;
    }
  }, [sessionToken]);

  const submitCallback = useCallback(
    async (payload: { embeddedCode: string; wabaId?: string; phoneNumberId?: string }) => {
      if (!sessionToken || !pendingConnection) return;
      setConnectionError(null);
      setIsProcessingCallback(true);
      try {
        const result = await waterproApiFetch<{
          connectionId: string;
          status: string;
          idempotent?: boolean;
        }>("/api/v1/whatsapp/connect/callback", {
          method: "GET",
          token: sessionToken,
          query: {
            connectionId: pendingConnection.connectionId,
            state: pendingConnection.state,
            code: payload.embeddedCode,
            wabaId: payload.wabaId,
            phoneNumberId: payload.phoneNumberId,
          },
        });

        setPendingConnection(null);

        if (result.status === "CONNECTED" || result.status === "ERROR") {
          setPollingConnectionId(result.connectionId);
          if (result.status === "ERROR") {
            setConnectionError("Não conseguimos concluir a conexão.");
            setIsProcessingCallback(false);
            setIsConnecting(false);
            await refresh();
          }
        } else {
          setPollingConnectionId(result.connectionId);
        }
      } catch (e: unknown) {
        setConnectionError(mapApiErrorToUserMessage(e, "Não conseguimos concluir a conexão."));
        setIsProcessingCallback(false);
        setIsConnecting(false);
      }
    },
    [sessionToken, pendingConnection, refresh],
  );

  const cancelConnection = useCallback(async () => {
    setPendingConnection(null);
    setIsConnecting(false);
    setIsProcessingCallback(false);
    setPollingConnectionId(null);
    setConnectionError(null);

    const connecting =
      connections.find((c) => c.status === "CONNECTING") ??
      (activeConnection?.status === "CONNECTING" ? activeConnection : null);

    if (sessionToken && connecting?.id) {
      try {
        await waterproApiFetch(`/api/v1/whatsapp/connections/${connecting.id}/disconnect`, {
          method: "POST",
          token: sessionToken,
          body: {},
        });
      } catch {
        // Local reset already applied; refresh will reconcile.
      }
      await refresh().catch(() => undefined);
    }
  }, [sessionToken, connections, activeConnection, refresh]);

  const syncConnection = useCallback(async () => {
    if (!sessionToken || !activeConnection?.id || syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    setSyncing(true);
    setActionError(null);
    try {
      await waterproApiFetch(`/api/v1/whatsapp/connections/${activeConnection.id}/sync`, {
        method: "POST",
        token: sessionToken,
        body: {},
      });
      await refresh();
    } catch (e: unknown) {
      setActionError(mapApiErrorToUserMessage(e, "Não foi possível sincronizar."));
      throw e;
    } finally {
      syncInFlightRef.current = false;
      setSyncing(false);
    }
  }, [sessionToken, activeConnection?.id, refresh]);

  const disconnectConnection = useCallback(async () => {
    if (!sessionToken || !activeConnection?.id) return;
    setDisconnecting(true);
    setActionError(null);
    try {
      await waterproApiFetch(`/api/v1/whatsapp/connections/${activeConnection.id}/disconnect`, {
        method: "POST",
        token: sessionToken,
        body: {},
      });
      setPollingConnectionId(null);
      await refresh();
    } catch (e: unknown) {
      setActionError(mapApiErrorToUserMessage(e, "Não foi possível desconectar."));
      throw e;
    } finally {
      setDisconnecting(false);
    }
  }, [sessionToken, activeConnection?.id, refresh]);

  const testNumber = useCallback(
    async (numberId: string) => {
      if (!sessionToken) return;
      setTestingNumberId(numberId);
      setActionError(null);
      try {
        const result = await waterproApiFetch<{
          ok: boolean;
          status: string;
          verified: boolean;
        }>(`/api/v1/whatsapp/numbers/${numberId}/test`, {
          method: "POST",
          token: sessionToken,
          body: {},
        });
        return result;
      } catch (e: unknown) {
        setActionError(mapApiErrorToUserMessage(e, "Não foi possível testar o número."));
        throw e;
      } finally {
        setTestingNumberId(null);
      }
    },
    [sessionToken],
  );

  const assignSeller = useCallback(
    async (numberId: string, sellerId: string) => {
      if (!sessionToken) return;
      setAssigningNumberId(numberId);
      setActionError(null);
      try {
        await waterproApiFetch(`/api/v1/whatsapp/numbers/${numberId}`, {
          method: "PATCH",
          token: sessionToken,
          body: { sellerId },
        });
        await refresh();
      } catch (e: unknown) {
        setActionError(mapApiErrorToUserMessage(e, "Não foi possível associar o vendedor."));
        throw e;
      } finally {
        setAssigningNumberId(null);
      }
    },
    [sessionToken, refresh],
  );

  const clearConnectionError = useCallback(() => setConnectionError(null), []);
  const clearActionError = useCallback(() => setActionError(null), []);

  const activeNumbers = whatsappNumbers.filter((n) => n.status === "active");
  const unassignedNumbers = activeNumbers.filter((n) => !n.seller_id);
  const connectedNumbersCount = activeNumbers.filter((n) => n.verified).length;

  const wabaId =
    (activeConnection?.metadata?.wabaId as string | undefined) ??
    whatsappNumbers.find((n) => n.business_account_id)?.business_account_id ??
    null;

  const lastSyncAt = activeConnection?.updated_at ?? null;

  return {
    providerMode,
    connections,
    whatsappNumbers,
    sellers,
    loading,
    loadError,
    actionError,
    connectionError,
    uiPhase,
    activeConnection,
    pendingConnection,
    isConnecting,
    isProcessingCallback,
    syncing,
    disconnecting,
    testingNumberId,
    assigningNumberId,
    connectedNumbersCount,
    unassignedNumbers,
    wabaId,
    lastSyncAt,
    refresh,
    startConnection,
    submitCallback,
    cancelConnection,
    syncConnection,
    disconnectConnection,
    testNumber,
    assignSeller,
    clearConnectionError,
    clearActionError,
  };
}
