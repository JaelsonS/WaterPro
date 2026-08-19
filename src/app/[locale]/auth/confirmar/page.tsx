"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { readPendingRegistration, clearPendingRegistration } from "@/lib/auth/pendingRegistration";
import { provisionCompanyIfNeeded } from "@/lib/auth/provisionCompany";
import { consumeAuthHashSession } from "@/lib/auth/consumeAuthHash";
import { Link } from "@/i18n/routing";

export default function AuthConfirmarPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [message, setMessage] = useState("A confirmar a sua conta…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase não configurado.");
      setFailed(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        // Substitui qualquer sessão antiga pelos tokens do link de confirmação.
        await supabase.auth.signOut({ scope: "local" });

        const hashSession = await consumeAuthHashSession(supabase);
        const session = hashSession ?? (await supabase.auth.getSession()).data.session;

        if (cancelled) return;

        if (!session?.access_token || !session.user.email) {
          setFailed(true);
          setMessage("Link inválido ou expirado. Entre com email e password após confirmar o email.");
          return;
        }

        const email = session.user.email;
        const pending = readPendingRegistration(email);
        const companyName =
          pending?.companyName ??
          (typeof session.user.user_metadata?.company_name === "string"
            ? session.user.user_metadata.company_name
            : null);

        if (!companyName) {
          setFailed(true);
          setMessage("Conta confirmada, mas falta associar a empresa. Faça login e contacte o suporte.");
          return;
        }

        await provisionCompanyIfNeeded(session.access_token, companyName);
        clearPendingRegistration();
        router.replace("/dashboard");
      } catch (err: unknown) {
        if (cancelled) return;
        setFailed(true);
        setMessage(err instanceof Error ? err.message : "Não foi possível concluir o cadastro.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice p-4">
      <div className="max-w-md rounded-2xl border border-slate-line bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-ink-muted">{message}</p>
        {failed ? (
          <Link href="/dashboard?entrar=1" className="mt-4 inline-block text-sm font-medium text-azure hover:underline">
            Ir para entrar
          </Link>
        ) : null}
      </div>
    </div>
  );
}
