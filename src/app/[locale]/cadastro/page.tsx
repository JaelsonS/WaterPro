"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import { DashboardSignup } from "@/components/dashboard/DashboardSignup";

type RegisterResponse = {
  companyId: string;
  slug: string | null;
  alreadyRegistered: boolean;
};

export default function CadastroPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const session = data.session;
      if (!session?.access_token) {
        setInfo("Conta criada. Confirme o email enviado e depois entre em /dashboard.");
        return;
      }

      await waterproApiFetch<RegisterResponse>("/api/v1/auth/register", {
        method: "POST",
        token: session.access_token,
        body: { companyName },
      });

      router.replace("/dashboard");
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
      info={info}
      onCompanyNameChange={setCompanyName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={onSubmit}
    />
  );
}
