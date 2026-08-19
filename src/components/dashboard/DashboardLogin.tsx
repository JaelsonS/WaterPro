"use client";

import { Link } from "@/i18n/routing";
import type { FormEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type DashboardLoginProps = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function DashboardLogin({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: DashboardLoginProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-light text-ink">Área da empresa</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Entre com a sua conta para aceder ao painel de gestão.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="dashboard-email" className="mb-2 block text-sm text-ink-soft">
              Email
            </label>
            <input
              id="dashboard-email"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="dashboard-password" className="mb-2 block text-sm text-ink-soft">
              Password
            </label>
            <input
              id="dashboard-password"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <MagneticButton variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? "A entrar…" : "Entrar"}
          </MagneticButton>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-azure hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
