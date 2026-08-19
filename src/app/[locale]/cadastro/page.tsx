"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { DashboardSignup } from "@/components/dashboard/DashboardSignup";
import { savePendingRegistration, clearPendingRegistration } from "@/lib/auth/pendingRegistration";
import { provisionCompanyIfNeeded } from "@/lib/auth/provisionCompany";

function buildEmailRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/confirmar`;
}

export default function CadastroPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      // Remove sessão de teste/conta anterior para evitar login silencioso na conta errada.
      await supabase.auth.signOut({ scope: "local" });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: buildEmailRedirectUrl(),
          data: { company_name: companyName.trim() },
        },
      });

      if (signUpError) throw signUpError;

      savePendingRegistration({
        email: normalizedEmail,
        companyName: companyName.trim(),
        createdAt: Date.now(),
      });

      const session = data.session;
      if (session?.access_token) {
        await provisionCompanyIfNeeded(session.access_token, companyName.trim());
        clearPendingRegistration();
        await supabase.auth.signOut({ scope: "local" });
        router.replace(`/cadastro/verificar-email?email=${encodeURIComponent(normalizedEmail)}`);
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      router.replace(`/cadastro/verificar-email?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-ink">
        Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).
      </div>
    );
  }

  return (
    <DashboardSignup
      companyName={companyName}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      loading={loading}
      error={error}
      onCompanyNameChange={setCompanyName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={onSubmit}
    />
  );
}
