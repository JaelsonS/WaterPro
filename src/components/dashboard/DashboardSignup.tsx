"use client";

import type { FormEvent } from "react";
import { Link } from "@/i18n/routing";
import { MagneticButton } from "@/components/ui/MagneticButton";

type DashboardSignupProps = {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  onCompanyNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function DashboardSignup({
  companyName,
  email,
  password,
  confirmPassword,
  loading,
  error,
  onCompanyNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: DashboardSignupProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-light text-ink">Criar conta Fluxora</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Registe a sua empresa. Depois do cadastro, configure a autenticação de dois fatores para continuar.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-company" className="mb-2 block text-sm text-ink-soft">
              Nome da empresa
            </label>
            <input
              id="signup-company"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              type="text"
              autoComplete="organization"
              required
              minLength={2}
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm text-ink-soft">
              Email
            </label>
            <input
              id="signup-email"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm text-ink-soft">
              Password
            </label>
            <input
              id="signup-password"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="mb-2 block text-sm text-ink-soft">
              Confirmar password
            </label>
            <input
              id="signup-confirm-password"
              className="w-full rounded-xl border border-slate-line bg-ice px-4 py-3 text-ink outline-none focus:border-azure"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <MagneticButton variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? "A criar conta…" : "Criar conta"}
          </MagneticButton>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Já tem conta?{" "}
          <Link href="/dashboard?entrar=1" className="font-medium text-azure hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
