"use client";

import { usePathname } from "@/i18n/routing";
import { DashboardAuthProvider, useDashboardAuthContext } from "./DashboardAuthProvider";
import { AdminSecurityProvider } from "./AdminSecurityProvider";
import { MfaEnrollmentGate } from "./MfaEnrollmentGate";
import { DashboardLogin } from "./DashboardLogin";
import { DashboardShell } from "./DashboardShell";
import { ToastProvider } from "@/components/ui/Toast";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

function getPageMeta(pathname: string | null): { title: string; description?: string } {
  if (!pathname) return { title: "Dashboard" };
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      description: "Visão geral da sua operação WhatsApp.",
    };
  }
  if (pathname.startsWith("/dashboard/whatsapp")) {
    return {
      title: "WhatsApp",
      description: "Gerencie a conexão e os números da sua conta.",
    };
  }
  if (pathname.startsWith("/dashboard/vendedores")) {
    return {
      title: "Vendedores",
      description: "Cadastre e gerencie a equipa comercial.",
    };
  }
  if (pathname.startsWith("/dashboard/definicoes")) {
    return {
      title: "Definições",
      description: "Informações da empresa e da sua conta.",
    };
  }
  return { title: "Dashboard" };
}

function DashboardRouteGuard({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const auth = useDashboardAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-ink">
        Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).
      </div>
    );
  }

  if (!auth.authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice text-sm text-ink-muted">
        A carregar sessão…
      </div>
    );
  }

  if (!auth.sessionToken) {
    async function onSubmit(e: FormEvent) {
      e.preventDefault();
      try {
        await auth.signIn(email, password);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falha no login";
        auth.setAuthError(message);
      }
    }

    return (
      <DashboardLogin
        email={email}
        password={password}
        loading={auth.authLoading}
        error={auth.authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
      />
    );
  }

  return <>{children}</>;
}

function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const auth = useDashboardAuthContext();
  const meta = getPageMeta(pathname);

  return (
    <DashboardShell
      title={meta.title}
      description={meta.description}
      userEmail={auth.userEmail}
      onLogout={() => void auth.signOut()}
    >
      {children}
    </DashboardShell>
  );
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DashboardAuthProvider>
        <DashboardRouteGuard>
          <AdminSecurityProvider>
            <MfaEnrollmentGate>
              <DashboardChrome>{children}</DashboardChrome>
            </MfaEnrollmentGate>
          </AdminSecurityProvider>
        </DashboardRouteGuard>
      </DashboardAuthProvider>
    </ToastProvider>
  );
}

export function DashboardPermissionGate({ children }: { children: ReactNode }) {
  const auth = useDashboardAuthContext();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  if (auth.canManage === false) {
    return (
      <div className="rounded-2xl border border-slate-line bg-white p-8">
        <p className="text-ink">Sem permissão para aceder a esta área.</p>
      </div>
    );
  }

  if (!checked && auth.canManage === null) {
    return <p className="text-sm text-ink-muted">A verificar permissões…</p>;
  }

  return <>{children}</>;
}
