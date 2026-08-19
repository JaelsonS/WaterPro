"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import {
  clearLocalStepUp,
  markStepUpVerifiedLocally,
  resolveClientSecurityLevel,
  type AdminSecurityLevel,
  type SecurityStatusResponse,
} from "@/lib/auth/securityLevel";
import { WaterProApiError } from "@/lib/backend/apiErrors";

export type MfaEnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function useAdminSecurity(sessionToken: string | null) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [status, setStatus] = useState<SecurityStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollState, setEnrollState] = useState<MfaEnrollState | null>(null);

  const securityLevel: AdminSecurityLevel = useMemo(
    () => resolveClientSecurityLevel(status),
    [status],
  );

  const refresh = useCallback(async () => {
    if (!sessionToken) {
      setStatus(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await waterproApiFetch<SecurityStatusResponse>("/api/v1/auth/security-status", {
        method: "GET",
        token: sessionToken,
      });
      setStatus(res);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? "Não foi possível carregar o estado de segurança.");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const startMfaSetup = useCallback(async () => {
    if (!supabase) throw new Error("Supabase não configurado");
    setError(null);

    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) throw listError;

    const verified = factors.totp.find((f) => f.status === "verified");
    if (verified) {
      setEnrollState(null);
      await refresh();
      return;
    }

    for (const factor of factors.totp.filter((f) => f.status !== "verified")) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Fluxora Admin",
    });
    if (enrollError || !data?.id || !data.totp) {
      throw enrollError ?? new Error("Não foi possível iniciar a configuração MFA.");
    }
    setEnrollState({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }, [supabase, refresh]);

  const confirmMfaSetup = useCallback(
    async (code: string) => {
      if (!supabase || !enrollState) throw new Error("Configuração MFA não iniciada.");
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollState.factorId,
      });
      if (challengeError || !challenge?.id) {
        throw challengeError ?? new Error("Não foi possível validar o código.");
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollState.factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;
      markStepUpVerifiedLocally();
      setEnrollState(null);
      await refresh();
    },
    [supabase, enrollState, refresh],
  );

  const verifyStepUp = useCallback(
    async (code: string) => {
      if (!supabase) throw new Error("Supabase não configurado");
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const totpFactor = factors.totp.find((f) => f.status === "verified");
      if (!totpFactor) throw new Error("MFA não configurado.");

      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });
      if (verifyError) throw verifyError;
      markStepUpVerifiedLocally();
      await refresh();
    },
    [supabase, refresh],
  );

  const signOutAfterMfaRemoval = useCallback(async () => {
    clearLocalStepUp();
    if (supabase) await supabase.auth.signOut();
  }, [supabase]);

  const isMfaApiError = useCallback((err: unknown) => {
    return (
      err instanceof WaterProApiError &&
      (err.code === "MFA_ENROLLMENT_REQUIRED" || err.code === "MFA_STEP_UP_REQUIRED")
    );
  }, []);

  return {
    status,
    securityLevel,
    loading,
    error,
    enrollState,
    refresh,
    startMfaSetup,
    confirmMfaSetup,
    verifyStepUp,
    signOutAfterMfaRemoval,
    isMfaApiError,
    enrollmentRequired: Boolean(status?.enrollmentRequired),
    stepUpRequired: Boolean(status?.stepUpRequired) && securityLevel === "STEP_UP_REQUIRED",
  };
}
