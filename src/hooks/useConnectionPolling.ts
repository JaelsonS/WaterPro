"use client";

import { useCallback, useEffect, useRef } from "react";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import { mapApiErrorToUserMessage } from "@/lib/backend/apiErrors";
import type { ConnectionRecord } from "@/lib/dashboard/types";

const INITIAL_INTERVAL_MS = 2_000;
const MAX_INTERVAL_MS = 10_000;
const MAX_ATTEMPTS = 30;
const BACKOFF_FACTOR = 1.5;

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

const TERMINAL_STATUSES = new Set(["CONNECTED", "ERROR", "DISCONNECTED", "REAUTH_REQUIRED"]);

type UseConnectionPollingOptions = {
  enabled: boolean;
  sessionToken: string | null;
  connectionId: string | null;
  onConnectionUpdate: (connection: ConnectionRecord) => void;
  onTerminal: (connection: ConnectionRecord) => void;
  onError: (message: string) => void;
};

export function useConnectionPolling({
  enabled,
  sessionToken,
  connectionId,
  onConnectionUpdate,
  onTerminal,
  onError,
}: UseConnectionPollingOptions) {
  const attemptRef = useRef(0);
  const intervalRef = useRef(INITIAL_INTERVAL_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const stoppedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const pollOnce = useCallback(async () => {
    if (!sessionToken || !connectionId || inFlightRef.current || stoppedRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;

    inFlightRef.current = true;
    try {
      const res = await waterproApiFetch<{ connection: Record<string, unknown> }>(
        `/api/v1/whatsapp/connections/${connectionId}`,
        { method: "GET", token: sessionToken },
      );
      const connection = normalizeConnection(res.connection);
      onConnectionUpdate(connection);

      if (TERMINAL_STATUSES.has(connection.status)) {
        stop();
        onTerminal(connection);
        return;
      }

      attemptRef.current += 1;
      if (attemptRef.current >= MAX_ATTEMPTS) {
        stop();
        onError("O processo de conexão demorou demais. Tente novamente.");
        return;
      }

      intervalRef.current = Math.min(
        Math.round(intervalRef.current * BACKOFF_FACTOR),
        MAX_INTERVAL_MS,
      );
    } catch (e: unknown) {
      attemptRef.current += 1;
      if (attemptRef.current >= MAX_ATTEMPTS) {
        stop();
        onError(mapApiErrorToUserMessage(e, "Não foi possível acompanhar a conexão."));
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [sessionToken, connectionId, onConnectionUpdate, onTerminal, onError, stop]);

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (stoppedRef.current || !enabled) return;
    timerRef.current = setTimeout(() => {
      void pollOnce().finally(() => scheduleNext());
    }, intervalRef.current);
  }, [clearTimer, enabled, pollOnce]);

  useEffect(() => {
    if (!enabled || !sessionToken || !connectionId) {
      stop();
      return;
    }

    stoppedRef.current = false;
    attemptRef.current = 0;
    intervalRef.current = INITIAL_INTERVAL_MS;

    void pollOnce().finally(() => scheduleNext());

    const onVisibility = () => {
      if (!document.hidden && enabled && !stoppedRef.current) {
        void pollOnce();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [enabled, sessionToken, connectionId, pollOnce, scheduleNext, stop]);

  return { stopPolling: stop };
}
