"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { readPendingRegistration, clearPendingRegistration } from "@/lib/auth/pendingRegistration";
import { provisionCompanyIfNeeded } from "@/lib/auth/provisionCompany";

export type DashboardAuthState = {
  sessionToken: string | null;
  userEmail: string | null;
  authLoading: boolean;
  authReady: boolean;
  canManage: boolean | null;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCanManage: (value: boolean | null) => void;
  setAuthError: (message: string | null) => void;
};

export function useDashboardAuth(): DashboardAuthState {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [canManage, setCanManage] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token ?? null);
      setUserEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token ?? null);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error("Supabase não configurado");
      const normalizedEmail = email.trim().toLowerCase();

      setAuthLoading(true);
      setAuthError(null);
      try {
        await supabase.auth.signOut({ scope: "local" });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;

        const signedInEmail = data.user?.email?.trim().toLowerCase();
        if (!signedInEmail || signedInEmail !== normalizedEmail) {
          await supabase.auth.signOut({ scope: "local" });
          throw new Error("Não foi possível validar a sessão. Tente novamente.");
        }

        const token = data.session?.access_token;
        if (!token) {
          throw new Error("Sessão inválida. Confirme o email antes de entrar.");
        }

        const pending = readPendingRegistration(normalizedEmail);
        if (pending) {
          await provisionCompanyIfNeeded(token, pending.companyName);
          clearPendingRegistration();
        } else {
          const companyName =
            typeof data.user.user_metadata?.company_name === "string"
              ? data.user.user_metadata.company_name
              : null;
          if (companyName) {
            await provisionCompanyIfNeeded(token, companyName);
          }
        }
      } finally {
        setAuthLoading(false);
      }
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut({ scope: "local" });
    setCanManage(null);
    setSessionToken(null);
    setUserEmail(null);
  }, [supabase]);

  return {
    sessionToken,
    userEmail,
    authLoading,
    authReady,
    canManage,
    authError,
    signIn,
    signOut,
    setCanManage,
    setAuthError,
  };
}
